
export interface AuthContext {
    clientId?: string;
    redirectUri?: string;
    responseType?: string;
    responseMode?: string;
    scope?: string;
    userId?: string;
    completed?: boolean;
}