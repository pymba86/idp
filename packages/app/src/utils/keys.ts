import {generateStandardId} from "@astoniq/idp-shared";
import {BaseConfigKeys} from "@astoniq/idp-schemas";
import {generateKeyPair} from 'node:crypto';
import {promisify} from 'node:util';

export const generatePrivateKey = async (): Promise<BaseConfigKeys> => {
    const {privateKey} = await promisify(generateKeyPair)('ec', {
        // https://security.stackexchange.com/questions/78621/which-elliptic-curve-should-i-use
        namedCurve: 'secp384r1',
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    });

    return buildKeyFromRawString(privateKey);
}

export const buildKeyFromRawString = (raw: string) => ({
    id: generateStandardId(),
    value: raw,
    createdAt: Math.floor(Date.now() / 1000),
});