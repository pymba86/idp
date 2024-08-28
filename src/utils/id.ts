import { customAlphabet } from 'nanoid';

const lowercaseAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz' as const;
const alphabet = `${lowercaseAlphabet}ABCDEFGHIJKLMNOPQRSTUVWXYZ` as const;

type BuildIdGenerator = {

    (size: number): ReturnType<typeof customAlphabet>;

    (size: number, includingUppercase: false): ReturnType<typeof customAlphabet>;
};

const buildIdGenerator: BuildIdGenerator = (size: number, includingUppercase = true) =>
    customAlphabet(includingUppercase ? alphabet : lowercaseAlphabet, size);

export const generateStandardId = buildIdGenerator(21, false);

export const generateStandardShortId = buildIdGenerator(12, false);

export const generateStandardSecret = buildIdGenerator(32);