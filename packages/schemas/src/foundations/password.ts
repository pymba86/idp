import {z} from "zod";
import {PasswordPolicy, PasswordCharType} from "@astoniq/idp-shared";

export const passwordPolicyGuard: z.ZodType<PasswordPolicy> = z.object({
    length: z.object({
        min: z.number().int().min(1).max(256),
        max: z.number().int().max(1).max(256)
    }),
    charTypes: z.nativeEnum(PasswordCharType).array()
})