import {z, ZodType} from "zod";
import {SenderProviderConfig, senderProviderConfigGuard} from "../foundations/sender.js";
import {JWK, jwkGuard} from "../foundations/index.js";

export enum ConfigKey {
    MigrationState = 'migrationState',
    SenderProvider = 'senderProvider',
    Jwks = 'jwks'
}

export type MigrationStateConfig = {
    timestamp: number
}

export type JWKSConfig = {
    id: string;
    key: JWK;
    startAt: number;
}

export type ConfigType = {
    [ConfigKey.MigrationState]: MigrationStateConfig
    [ConfigKey.SenderProvider]: SenderProviderConfig
    [ConfigKey.Jwks]: JWKSConfig[]
}

export const configTypeGuard: {
    [key in ConfigKey]: ZodType<ConfigType[key]>;
} = {
    [ConfigKey.MigrationState]: z.object({
        timestamp: z.number()
    }),
    [ConfigKey.SenderProvider]: senderProviderConfigGuard,
    [ConfigKey.Jwks]: z.object({
        id: z.string(),
        key: jwkGuard,
        startAt: z.number()
    }).array()
}

export type ConfigTypeGuard = typeof configTypeGuard