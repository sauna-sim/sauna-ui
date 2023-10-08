import axios from "axios";
import {
    getApiUrl, getNavigraphRefreshToken,
    setNavigraphRefreshToken
} from "./local_store_actions";
import pkce from "@navigraph/pkce";
import {
    getNavigraphFullToken,
    NAVIGRAPH_ACCESS_TOKEN,
    NAVIGRAPH_TOKEN_EXPIRATION,
    NAVIGRAPH_TOKEN_TYPE
} from "./session_storage_actions";
import qs from "qs";

const navigraphApiAuthUrl = "https://identity.api.navigraph.com";
const navigraphApiUrl = "https://api.navigraph.com/v1";

export async function hasNavigraphDataLoaded() {
    const url = `${getApiUrl()}/data/hasNavigraphDataLoaded`;
    return (await axios.get(url)).data;
}

/**
 * Get's Sauna's Navigraph credentials from API server.
 * If credentials are not available, throws 400 error.
 * @returns API Client ID and Secret
 */
async function getNavigraphCreds() {
    const url = `${getApiUrl()}/data/navigraphApiCreds`;

    return (await axios.get(url)).data;
}

export async function navigraphAuthFlow(onDeviceAuthResp){
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
    storeToken(tokenResponse);
}

export function storeToken(tokenResponse){
    // Session Storage
    sessionStorage.setItem(NAVIGRAPH_ACCESS_TOKEN, tokenResponse.access_token);
    sessionStorage.setItem(NAVIGRAPH_TOKEN_TYPE, tokenResponse.token_type);
    sessionStorage.setItem(NAVIGRAPH_TOKEN_EXPIRATION, tokenResponse.expires_in);

    // Electron Store
    setNavigraphRefreshToken(tokenResponse.refresh_token);
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
export async function pollNavigraphToken(navigraphCreds, pkceCodes, deviceCode, interval = 5){
    let authorized = false;
    const url = `${navigraphApiAuthUrl}/connect/token`;
    const params = {
        client_id: navigraphCreds.clientId,
        client_secret: navigraphCreds.clientSecret,
        code_verifier: pkceCodes.code_verifier,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: deviceCode,
        scope: "openid offline_access charts"
    };

    // Loop until we get the token or an error is thrown from Navigraph
    while (!authorized){
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
            if (e.response && e.response.status === 400 && e.response.data){
                if (e.response.data.error === "slow_down"){
                    interval += 5;
                    continue;
                } else if (e.response.data.error === "authorization_pending"){
                    continue;
                }
            }

            authorized = true;
            throw e;
        }
    }
}

export async function refreshNavigraphToken(){
    // Get Navigraph API Credentials
    const navigraphCreds = await getNavigraphCreds();

    const url = `${navigraphApiAuthUrl}/connect/token`;
    const params = {
        client_id: navigraphCreds.clientId,
        client_secret: navigraphCreds.clientSecret,
        grant_type: "refresh_token",
        refresh_token: getNavigraphRefreshToken()
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

    storeToken(tokenResp);
}

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
        return null;
    }
};


export async function getNavigraphPackages(){
    const url = `${navigraphApiUrl}/navdata/packages`;

    console.log(parseJwt(sessionStorage.getItem(NAVIGRAPH_ACCESS_TOKEN)));

    const response = await axios.get(
        url,
        {
            headers: {"Authorization": getNavigraphFullToken()}
        }
    );

    return response.data;
}