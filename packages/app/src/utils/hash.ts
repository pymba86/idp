import {hash, verify} from 'argon2';

export function hashValue(value: string) {
    return hash(value);
}

export function verifyValue(value: string, hashed: string) {
    return verify(hashed, value);
}