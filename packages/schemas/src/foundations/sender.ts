import {z} from "zod";

export enum SenderProviderType {
    Console = 'console',
    Smtp = 'smtp'
}

export const consoleSenderProviderConfigGuard = z.object({
    provider: z.literal(SenderProviderType.Console)
})

export type ConsoleSenderProviderConfig = z.infer<typeof consoleSenderProviderConfigGuard>

export const smtpSenderProviderConfigGuard = z.object({
    provider: z.literal(SenderProviderType.Smtp),
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

export type SmtpSenderProviderConfig = z.infer<typeof smtpSenderProviderConfigGuard>

export const senderProviderConfigGuard = z.discriminatedUnion('provider', [
    consoleSenderProviderConfigGuard,
    smtpSenderProviderConfigGuard
])

export type SenderProviderConfig = z.infer<typeof senderProviderConfigGuard>;
