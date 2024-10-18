import {z, ZodType} from "zod";
import {SenderProviderConfig, senderProviderConfigGuard} from "../foundations/sender.js";

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
    PrivateKeys = 'privateKeys'
}

export const baseConfigKeysGuard = z.object({
    id: z.string(),
    value: z.string(),
    createdAt: z.number()
})

export type BaseConfigKeys = z.infer<typeof baseConfigKeysGuard>;

export type BaseConfigType = {
    [BaseConfigKey.PrivateKeys]: BaseConfigKeys[]
}

export const baseConfigGuard: {
    [key in BaseConfigKey]: ZodType<BaseConfigType[key]>;
} = {
    [BaseConfigKey.PrivateKeys]: baseConfigKeysGuard.array()
}

export type ConfigKey =
    | MigrationConfigKey
    | BaseConfigKey
    | SenderConfigKey;

export type ConfigType =
    | MigrationConfigType
    | BaseConfigType
    | SenderConfigType;

export type ConfigGuard = typeof migrationConfigGuard & typeof baseConfigGuard

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