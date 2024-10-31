import {z} from "zod";

export enum SenderType {
    Console = 'console',
    Smtp = 'smtp'
}

export const consoleSenderConfigGuard = z.object({
    provider: z.literal(SenderType.Console)
})

export type ConsoleSenderConfig = z.infer<typeof consoleSenderConfigGuard>

export const smtpSenderConfigGuard = z.object({
    provider: z.literal(SenderType.Smtp),
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

export type SmtpSenderConfig = z.infer<typeof smtpSenderConfigGuard>

export const senderConfigGuard = z.discriminatedUnion('provider', [
    consoleSenderConfigGuard,
    smtpSenderConfigGuard
])

export type SenderConfig = z.infer<typeof senderConfigGuard>;
