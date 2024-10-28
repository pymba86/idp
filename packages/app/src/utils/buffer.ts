import { Buffer } from 'buffer';

export const base64url = (data: string) => Buffer.from(data).toString('base64url');