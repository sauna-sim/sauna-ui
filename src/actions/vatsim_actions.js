import axios from "axios";

export async function getSweatboxServers() {
    const response = await axios.get("https://data.vatsim.net/v3/sweatbox-servers.json");
    console.log(response);
    return response.data;
}