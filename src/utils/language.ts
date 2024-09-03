import {Optional} from "../types/index.js";
import type { IncomingHttpHeaders } from 'node:http';
import {ParameterizedContext} from "koa";
import {IRouterParamContext} from "koa-router";

/**
 * Resolve language and its q value from string.
 * @param languageString The language string in header, e.g. 'en-GB;q=0.8', 'zh-CN'
 * @returns `[language, q]`, e.g. `['en-GB', 0.8]`; `undefined` if no language is detected.
 */
const resolveLanguage = (languageString: string): Optional<[string, number]> => {
    const [language, ...rest] = languageString.split(';');

    if (!language) {
        return;
    }

    for (const item of rest) {
        const [key, value] = item.split('=');

        if (key === 'q' && !Number.isNaN(value)) {
            return [language, Number(value)];
        }
    }

    return [language, 1];
};

const detectLanguageFromHeaders = (headers: IncomingHttpHeaders): string[] =>
    headers['accept-language']
        ?.split(',')
        .map((string) => resolveLanguage(string))
        .filter((value): value is NonNullable<typeof value> => Boolean(value))
        .slice()
        .sort((lng1, lng2) => lng2[1] - lng1[1])
        .map(([locale]) => locale) ?? [];

export const detectLanguage = <StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
    ctx: ParameterizedContext<StateT, ContextT, ResponseBodyT>
): string[] => [
    ...detectLanguageFromHeaders(ctx.headers),
];
