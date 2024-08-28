import {createFieldNameTransformationInterceptor} from "./name-transform.js";
import {createQueryNormalizationInterceptor} from "./query-normalization.js";

export const createInterceptorsPreset = () => {
    return Object.freeze([
        createFieldNameTransformationInterceptor({
            format: 'CAMEL_CASE',
        }),
        createQueryNormalizationInterceptor(),
    ]);
};