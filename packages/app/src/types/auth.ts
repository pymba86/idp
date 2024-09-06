
export interface AuthContext {
    id?: string;
    clientId?: string;
    redirectUri?: string;
    responseType?: string;
    responseMode?: string;
    scope?: string;
    userId?: string;
    authCompleted?: boolean;
}