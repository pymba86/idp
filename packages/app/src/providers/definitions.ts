import {ZodType} from "zod";

export enum ProviderType {
    Oidc = 'oidc'
}

export type Provider = {
    type: ProviderType;
    configGuard: ZodType;
}