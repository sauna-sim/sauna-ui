export const SessionStorageKeys = {
    NAVIGRAPH_ACCESS_TOKEN: "NAVIGRAPH_ACCESS_TOKEN",
    NAVIGRAPH_TOKEN_TYPE: "NAVIGRAPH_TOKEN_TYPE",
    NAVIGRAPH_TOKEN_EXPIRATION: "NAVIGRAPH_TOKEN_EXPIRATION"
}

export function getNavigraphFullToken(){
    return `${sessionStorage.getItem(SessionStorageKeys.NAVIGRAPH_TOKEN_TYPE)} ${sessionStorage.getItem(SessionStorageKeys.NAVIGRAPH_ACCESS_TOKEN)}`;
}