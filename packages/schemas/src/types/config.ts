import {z, ZodType} from "zod";
import {SenderProviderConfig, senderProviderConfigGuard} from "../foundations/sender.js";
import {JWK, jwkGuard} from "../foundations/index.js";

export enum MigrationConfigKey {
    MigrationState = 'migrationState'
}

export type MigrationState = {
    timestamp: number
}

export type MigrationConfigType = {
    [MigrationConfigKey.MigrationState]: MigrationState
}

export const migrationConfigGuard: {
    [key in MigrationConfigKey]: ZodType<MigrationConfigType[key]>;
} = {
    [MigrationConfigKey.MigrationState]: z.object({
        timestamp: z.number()
    })
}

export enum SenderConfigKey {
    SenderProvider = 'senderProvider'
}

export type SenderConfigType = {
    [SenderConfigKey.SenderProvider]: SenderProviderConfig
}

export const senderConfigGuard: {
    [key in SenderConfigKey]: ZodType<SenderConfigType[key]>;
} = {
    [SenderConfigKey.SenderProvider]: senderProviderConfigGuard
}

export enum BaseConfigKey {
    Jwks = 'jwks'
}

export type JWKConfig = {
    id: string;
    key: JWK;
    startAt: number;
}

export type BaseConfigType = {
    [BaseConfigKey.Jwks]: JWKConfig[]
}

export const baseConfigGuard: {
    [key in BaseConfigKey]: ZodType<BaseConfigType[key]>;
} = {
    [BaseConfigKey.Jwks]: z.object({
        id: z.string(),
        key: jwkGuard,
        startAt: z.number()
    }).array()
}

export type ConfigKey =
    | MigrationConfigKey
    | BaseConfigKey
    | SenderConfigKey;

export type ConfigType =
    | MigrationConfigType
    | BaseConfigType
    | SenderConfigType;

export type ConfigGuard =
    typeof migrationConfigGuard &
    typeof baseConfigGuard &
    typeof senderConfigGuard

export const configKeys: ConfigKey[] = [
    ...Object.values(MigrationConfigKey),
    ...Object.values(SenderConfigKey),
    ...Object.values(BaseConfigKey)
]

export const configGuards: ConfigGuard = {
    ...migrationConfigGuard,
    ...senderConfigGuard,
    ...baseConfigGuard
}