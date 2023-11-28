import axios from "axios";
import {
    clearNavigraphRefreshToken, getApiUrl,
    getNavigraphPackageInfo,
    getNavigraphRefreshToken,
    setNavigraphPackageInfo,
    setNavigraphPackageIsCurrent,
    setNavigraphRefreshToken,
    storeSave
} from "./local_store_actions";
import pkce from "@navigraph/pkce";
import {
    getNavigraphFullToken,
    NAVIGRAPH_ACCESS_TOKEN,
    NAVIGRAPH_TOKEN_EXPIRATION,
    NAVIGRAPH_TOKEN_TYPE
} from "./session_storage_actions";
import qs from "qs";
import {loadDFDFile} from "./data_actions";
import {appDataDir, join} from "@tauri-apps/api/path";
import {downloadFileFromUrl, extractZipFile} from "./tauri_actions";
import {exists} from "@tauri-apps/api/fs";
import {axiosSaunaApi} from "./api_connection_handler";

const navigraphApiAuthUrl = "https://identity.api.navigraph.com";

// Configure Axios Navigraph Interceptors
const axiosNavigraphApi = axios.create({
    baseURL: "https://api.navigraph.com/v1"
});

axiosNavigraphApi.interceptors.request.use(
    config => {
        config.headers["Authorization"] = getNavigraphFullToken();
        return config;
    }
);

axiosNavigraphApi.interceptors.response.use(
    (response) => {
        return response
    }, async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Refresh Token
            try {
                console.log("Failed, refreshing Navigraph token.");
                await refreshNavigraphToken();
                axiosNavigraphApi.defaults.headers.common["Authorization"] = getNavigraphFullToken();

                return axiosNavigraphApi(originalRequest);
            } catch (_e) {
                // Clear out authentication since token doesn't work
                await clearNavigraphRefreshToken();
                //console.error(_e);
                return Promise.reject("NAVIGRAPH_AUTH_EXPIRED");
            }
        }

        return Promise.reject(error);
    }
);

export async function hasNavigraphDataLoaded() {
    const url = `${await getApiUrl()}/data/hasNavigraphDataLoaded`;
    return (await axiosSaunaApi.get(url)).data;
}

/**
 * Get's Sauna's Navigraph credentials from API server.
 * If credentials are not available, throws 400 error.
 * @returns API Client ID and Secret
 */
async function getNavigraphCreds() {
    const url = `${await getApiUrl()}/data/navigraphApiCreds`;

    return (await axiosSaunaApi.get(url)).data;
}

export async function navigraphAuthFlow(onDeviceAuthResp) {
    // Get Navigraph API Credentials
    const navigraphCreds = await getNavigraphCreds();

    // Get PKCE Codes
    const pkceCodes = pkce();

    // Do DeviceAuthorization
    const deviceAuthResp = await initNavigraphAuth(navigraphCreds, pkceCodes);

    // Handle URL display/redirect to allow user to authorize the app
    onDeviceAuthResp(deviceAuthResp);

    // Poll for token
    const tokenResponse = await pollNavigraphToken(navigraphCreds, pkceCodes, deviceAuthResp.device_code, deviceAuthResp.interval);

    // Store Token Info
    await storeToken(tokenResponse);
}

export async function storeToken(tokenResponse) {
    console.log(tokenResponse);
    // Session Storage
    sessionStorage.setItem(NAVIGRAPH_ACCESS_TOKEN, tokenResponse.access_token);
    sessionStorage.setItem(NAVIGRAPH_TOKEN_TYPE, tokenResponse.token_type);
    sessionStorage.setItem(NAVIGRAPH_TOKEN_EXPIRATION, tokenResponse.expires_in);

    // Electron Store
    await setNavigraphRefreshToken(tokenResponse.refresh_token);
    await storeSave();
}

/**
 * Starts Navigraph PKCE Device Authorization Flow.
 * https://developers.navigraph.com/docs/authentication/device-authorization#successful-deviceauthorization-response
 * @param navigraphCreds Navigraph API Credentials
 * @param pkceCodes PKCE Codes
 * @returns {Promise<any>} Device Authorization Response
 */
export async function initNavigraphAuth(navigraphCreds, pkceCodes) {
    // Start Auth Flow
    const url = `${navigraphApiAuthUrl}/connect/deviceauthorization`;

    const params = {
        client_id: navigraphCreds.clientId,
        client_secret: navigraphCreds.clientSecret,
        code_challenge: pkceCodes.code_challenge,
        code_challenge_method: "S256"
    };

    const initResponse = await axios.post(
        url,
        qs.stringify(params),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );

    return initResponse.data;
}

/**
 * Poll for navigraph token
 * @param navigraphCreds Navigraph API credentials
 * @param pkceCodes PKCE Codes
 * @param deviceCode Device Code returned from device auth response
 * @param interval Interval returned from device auth response
 * @returns {Promise<any>} Navigraph Token Response
 */
export async function pollNavigraphToken(navigraphCreds, pkceCodes, deviceCode, interval = 5) {
    let authorized = false;
    const url = `${navigraphApiAuthUrl}/connect/token`;
    const params = {
        client_id: navigraphCreds.clientId,
        client_secret: navigraphCreds.clientSecret,
        code_verifier: pkceCodes.code_verifier,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: deviceCode,
        scope: "openid offline_access fmsdata"
    };

    // Loop until we get the token or an error is thrown from Navigraph
    while (!authorized) {
        // Wait the specified interval
        await new Promise(resolve => setTimeout(resolve, interval * 1000));

        // Try the token endpoint
        try {
            const tokenResp = await axios.post(
                url,
                qs.stringify(params),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            // Return successful response
            authorized = true;
            return tokenResp.data;
        } catch (e) {
            if (e.response && e.response.status === 400 && e.response.data) {
                if (e.response.data.error === "slow_down") {
                    interval += 5;
                    continue;
                } else if (e.response.data.error === "authorization_pending") {
                    continue;
                }
            }

            authorized = true;
            throw e;
        }
    }
}

export async function refreshNavigraphToken() {
    // Get Navigraph API Credentials
    const navigraphCreds = await getNavigraphCreds();

    const url = `${navigraphApiAuthUrl}/connect/token`;
    const params = {
        client_id: navigraphCreds.clientId,
        client_secret: navigraphCreds.clientSecret,
        grant_type: "refresh_token",
        refresh_token: await getNavigraphRefreshToken()
    };

    const tokenResp = await axios.post(
        url,
        qs.stringify(params),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }
    );

    console.log("Token refreshed");

    await storeToken(tokenResp.data);
}

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
        return null;
    }
};

export async function updateApiNavigraphPackage() {
    // Check package on server
    const apiPackageInfo = await hasNavigraphDataLoaded();

    // Get Local Package Info
    const localPackage = await getNavigraphPackageInfo();

    if (!apiPackageInfo.loaded || apiPackageInfo.uuid !== localPackage.package_id) {
        // Push package to api server
        await loadDFDFile(localPackage.filename, localPackage.package_id);
    }
}

export async function checkNavigraphPackage() {
    // Get Local Package Info
    const localPackage = await getNavigraphPackageInfo();

    // Get Server Packages
    const serverPackages = await getNavigraphPackages();

    console.log("Local Package", localPackage);
    console.log("Server Packages", serverPackages);

    // Find current and latest outdated package
    let currentPackage;
    let outdatedPackage;
    let outdatedPackageCycle = 0;
    serverPackages.forEach((pckg) => {
        if (pckg.package_status === "current") {
            currentPackage = pckg;
        } else if (pckg.package_status === "outdated") {
            let cycle = pckg.cycle;
            if (pckg.revision) {
                cycle += `.${pckg.revision}`;
            }
            cycle = Number(cycle);
            if (!outdatedPackage || cycle > outdatedPackageCycle) {
                outdatedPackage = pckg;
                outdatedPackageCycle = cycle;
            }
        }
    });

    // Check if we have access to the current or an outdated package
    let latestServerPackage = currentPackage;
    let isCurrentPkg = true;
    if (!currentPackage) {
        latestServerPackage = outdatedPackage;
        isCurrentPkg = false;
    }

    await setNavigraphPackageIsCurrent(isCurrentPkg);

    console.log("Latest Server Package", latestServerPackage);
    console.log(await join(await appDataDir(), "navdata"));

    // Check if we have the latest package
    if (latestServerPackage && latestServerPackage.files && latestServerPackage.files.length > 0) {
        // If we don't, update the local package
        if (!localPackage.filename || !(await exists(localPackage.filename)) ||
            localPackage.cycle !== latestServerPackage.cycle ||
            localPackage.package_id !== latestServerPackage.package_id ||
            localPackage.revision !== latestServerPackage.revision) {
            // Download package
            const dir = await join(await appDataDir(), "navdata");
            const filename = await downloadFileFromUrl(latestServerPackage.files[0].signed_url, dir);
            console.log("File downloaded", filename);

            // Extract zip
            try {
                const filesInZip = await extractZipFile(filename, dir);
                console.log(filesInZip);
                if (filesInZip.length > 0) {
                    const newPackageInfo = {
                        package_id: latestServerPackage.package_id,
                        cycle: latestServerPackage.cycle,
                        revision: latestServerPackage.revision,
                        filename: await join(dir, filesInZip[0])
                    };

                    console.log("New Package", newPackageInfo);

                    // Update package
                    await setNavigraphPackageInfo(newPackageInfo);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    // Update API package if necessary
    await updateApiNavigraphPackage();
}


export async function getNavigraphPackages() {
    console.log(parseJwt(sessionStorage.getItem(NAVIGRAPH_ACCESS_TOKEN)));

    const params = {
        //format: "orbx_v1", // TODO: Change this to our actual format
        package_status: "current,outdated"
    }
    const response = await axiosNavigraphApi.get("/navdata/packages", {
        params: params
    });

    return response.data;
}