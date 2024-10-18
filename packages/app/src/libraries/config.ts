import {CommonQueryMethods} from "slonik";
import {baseConfigGuard, BaseConfigKey, BaseConfigType} from "@astoniq/idp-schemas";
import {getConfigRowsByKeys} from "../queries/config.js";
import {z, ZodError} from "zod";
import {logger} from "../utils/logger.js";

export const getBaseConfigs = async (pool: CommonQueryMethods): Promise<BaseConfigType> => {

    try {
        const {rows} = await getConfigRowsByKeys(pool, Object.values(BaseConfigKey));

        return z.object(baseConfigGuard)
            .parse(Object.fromEntries(rows.map(({key, value}) => [key, value])));
    } catch (error) {
        if (error instanceof ZodError) {
            logger.error(
                error.issues.map(({message, path}) => `${message} at ${path.join('.')}`)
                    .join('\n')
            )
        } else {
            logger.error(error)
        }

        logger.error('Failed to get base configs from database. Did you forget to migrate your database?')

        throw new Error('Failed to get base configs')
    }
}