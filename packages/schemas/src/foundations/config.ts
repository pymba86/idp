import {z, ZodType} from "zod";
import {SenderProviderConfig, senderProviderConfigGuard} from "./sender.js";
import {jwkGuard} from "./jwk.js";
import {passwordPolicyGuard} from "./password.js";

export enum ConfigKey {
    MigrationState = 'migrationState',
    SenderProvider = 'senderProvider',
    SignInExperience = 'signInExperience',
    Jwks = 'jwks'
}

export const migrationStateConfigGuard = z.object({
    timestamp: z.number()
})

export type MigrationStateConfig = z.infer<typeof migrationStateConfigGuard>

export const jwksConfigGuard = z.object({
    id: z.string(),
    key: jwkGuard,
    startAt: z.number()
}).array()

export type JWKSConfig = z.infer<typeof jwksConfigGuard>

export const signInExperienceConfigGuard = z.object({
    privacyPolicyUrl: z.string().optional(),
    termsOfUseUrl: z.string().optional(),
    passwordPolicy: passwordPolicyGuard
})

export type SignInExperienceConfig = z.infer<typeof signInExperienceConfigGuard>

export type ConfigType = {
    [ConfigKey.MigrationState]: MigrationStateConfig
    [ConfigKey.SenderProvider]: SenderProviderConfig
    [ConfigKey.SignInExperience]: SignInExperienceConfig
    [ConfigKey.Jwks]: JWKSConfig
}

export const configTypeGuard: {
    [key in ConfigKey]: ZodType<ConfigType[key]>;
} = {
    [ConfigKey.MigrationState]: migrationStateConfigGuard,
    [ConfigKey.SenderProvider]: senderProviderConfigGuard,
    [ConfigKey.Jwks]: jwksConfigGuard,
    [ConfigKey.SignInExperience]: signInExperienceConfigGuard
}

export type ConfigTypeGuard = typeof configTypeGuard