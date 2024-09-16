import {z, ZodType} from "zod";

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

export enum BaseConfigKey {
    PrivateKeys = 'privateKeys'
}

export enum SupportedSigningKeyAlgorithm {
    RSA = 'RSA',
    EC = 'EC'
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
    | BaseConfigKey;

export type ConfigType =
    | MigrationConfigType
    | BaseConfigType;

export type ConfigGuard = typeof migrationConfigGuard & typeof baseConfigGuard

export const configKeys: ConfigKey[] = [
    ...Object.values(MigrationConfigKey),
    ...Object.values(BaseConfigKey)
]

export const configGuards: ConfigGuard = {
    ...migrationConfigGuard,
    ...baseConfigGuard
}