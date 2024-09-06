import camelcase from 'camelcase';
import {Field, Interceptor} from "slonik";

type Configuration = {
    format: 'CAMEL_CASE',
};

const underscoreFieldRegex = /^[a-z0-9_]+$/u;

const underscoreFieldTest = (field: Field) => {
    return underscoreFieldRegex.test(field.name);
};

export const createFieldNameTransformationInterceptor = (configuration: Configuration): Interceptor => {
    if (configuration.format !== 'CAMEL_CASE') {
        throw new Error('Unsupported format.');
    }

    return {
        transformRow: (context: any, _, row, fields) => {
            if (!context.sandbox.formattedFields) {
                context.sandbox.formattedFields = [];

                for (const field of fields) {
                    context.sandbox.formattedFields.push({
                        formatted: underscoreFieldTest(field) ? camelcase(field.name) : field.name,
                        original: field.name,
                    });
                }
            }

            const {
                formattedFields,
            } = context.sandbox;

            const transformedRow: any = {};

            for (const field of formattedFields) {
                if (typeof field.formatted !== 'string') {
                    throw new TypeError('Unexpected field name type.');
                }

                transformedRow[field.formatted] = row[field.original];
            }

            return transformedRow;
        },
    };
};