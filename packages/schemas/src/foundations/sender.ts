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
    }),
    fromEmail: z.string(),
    replyTo: z.string().optional(),
    secure: z.boolean().default(false),
    tls: z
        .union([z.object({}).catchall(z.unknown()), z.object({})])
        .optional()
        .default({}),
    servername: z.string().optional(),
    ignoreTLS: z.boolean().optional(),
    requireTLS: z.boolean().optional(),
    connectionTimeout: z
        .number()
        .optional()
        .default(2 * 60 * 1000), // In ms, default is 2 mins.
    greetingTimeout: z
        .number()
        .optional()
        .default(30 * 1000), // In ms, default is 30 seconds.
    socketTimeout: z
        .number()
        .optional()
        .default(10 * 60 * 1000), // In ms, default is 10 mins.
    dnsTimeout: z
        .number()
        .optional()
        .default(30 * 1000), // In ms, default is 30 seconds.
    name: z.string().optional(),
    localAddress: z.string().optional(),
})

export const senderProviderConfigGuard = z.discriminatedUnion('provider', [
    consoleSenderProviderConfigGuard,
    smtpSenderProviderConfigGuard
])

export type SenderProviderConfig = z.input<typeof senderProviderConfigGuard>;
