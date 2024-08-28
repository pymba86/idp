import {Interceptor} from "slonik";

type Configuration = {
    stripComments?: boolean,
};

const inlineCommentRule = /(.*?)--.*/gu;
const multilineCommentRule = /\/\*[\S\s]*?\*\//gmu;
const whiteSpaceRule = /\s+/gu;

export const stripComments = (input: string): string => {
    return input
        .replaceAll(inlineCommentRule, (_, p1) => {
            return p1;
        })
        .replaceAll(multilineCommentRule, '')
        .replaceAll(whiteSpaceRule, ' ')
        .trim();
};

export const createQueryNormalizationInterceptor = (configuration?: Configuration): Interceptor => {
    return {
        transformQuery: (_, query) => {
            let sql = query.sql;

            if (!configuration || configuration.stripComments !== false) {
                sql = stripComments(query.sql);
            }

            return {
                ...query,
                sql,
            };
        },
    };
};