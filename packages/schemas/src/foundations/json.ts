import { z } from 'zod';
import {Json, JsonObject} from "@astoniq/idp-shared";

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const jsonGuard: z.ZodType<Json> = z.lazy(() =>
    z.union([literalSchema, z.array(jsonGuard), z.record(jsonGuard)])
);

export const jsonObjectGuard: z.ZodType<JsonObject> = z.record(jsonGuard);