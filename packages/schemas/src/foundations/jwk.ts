import {z} from "zod";

export type JWK =  {
    kty: string
    alg: string
    kid: string
    use: string
    crv?: string | undefined;
    d?: string | undefined;
    dp?: string | undefined;
    dq?: string | undefined;
    e?: string | undefined;
    k?: string | undefined;
    n?: string | undefined;
    p?: string | undefined;
    q?: string | undefined;
    qi?: string | undefined;
    x?: string | undefined;
    y?: string | undefined;
}

export const jwkGuard: z.ZodType<JWK> = z.object({
    kty: z.string(),
    alg: z.string(),
    use: z.string(),
    kid: z.string()
}).and(z.record(z.string(), z.string()))
