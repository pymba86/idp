import {z} from "zod";

export enum SenderProvider {
    Console = 'console',
    Smtp = 'smtp'
}

export const consoleSenderProviderConfigGuard = z.object({
    provider: z.literal(SenderProvider.Console)
})

export const smtpSenderProviderConfigGuard = z.object({
    provider: z.literal(SenderProvider.Smtp),
    host: z.string(),
    port: z.number(),
    auth: z.object({
        user: z.string(),
        pass: z.string(),
    }).optional(),
    fromEmail: z.string(),
    replyTo: z.string().optional(),
    secure: z.boolean().optional(),
    servername: z.string().optional(),
    ignoreTLS: z.boolean().optional(),
    requireTLS: z.boolean().optional(),
    name: z.string().optional(),
    localAddress: z.string().optional(),
})

export const senderProviderConfigGuard = z.discriminatedUnion('provider', [
    consoleSenderProviderConfigGuard,
    smtpSenderProviderConfigGuard
])

export type SenderProviderConfig = z.infer<typeof senderProviderConfigGuard>;
