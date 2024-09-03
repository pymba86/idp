import en from "./en/index.js";
import {z} from 'zod';

export const builtInLanguages = [
    'en',
] as const;

export const languages = Object.freeze({
    'en': 'English',
    'ru': 'Русский'
})

export type LanguageTag = keyof typeof languages;

export const builtInLanguageTagGuard = z.enum(builtInLanguages);

export const isLanguageTag = (value: unknown): value is LanguageTag =>
    typeof value === 'string' && value in languages;

export const languageTagGuard: z.ZodType<LanguageTag> = z
    .any()
    .refine((value: unknown) => isLanguageTag(value));

export const builtInLanguageOptions = builtInLanguages.map((languageTag) => ({
    value: languageTag,
    title: languages[languageTag],
}));

export type BuiltInLanguageTag = z.infer<typeof builtInLanguageTagGuard>;

export type LocalePhrase = typeof en;

export type PhraseCode = keyof LocalePhrase;

export type Dictionaries = Record<BuiltInLanguageTag, LocalePhrase>

export const dictionaries: Dictionaries = {
    en,
}