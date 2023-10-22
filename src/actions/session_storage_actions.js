export const NAVIGRAPH_ACCESS_TOKEN = "NAVIGRAPH_ACCESS_TOKEN";
export const NAVIGRAPH_TOKEN_TYPE = "NAVIGRAPH_TOKEN_TYPE";
export const NAVIGRAPH_TOKEN_EXPIRATION = "NAVIGRAPH_TOKEN_EXPIRATION";

export function getNavigraphFullToken(){
    return `${sessionStorage.getItem(NAVIGRAPH_TOKEN_TYPE)} ${sessionStorage.getItem(NAVIGRAPH_ACCESS_TOKEN)}`;
}