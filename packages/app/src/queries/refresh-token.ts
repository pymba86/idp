import {CommonQueryMethods} from "slonik";
import {refreshTokenEntity} from "../entities/index.js";
import {buildInsertIntoWithPool} from "../database/insert-into.js";

export const createRefreshTokenQueries = (pool: CommonQueryMethods) => {

    const insertRefreshToken = buildInsertIntoWithPool(pool, refreshTokenEntity, {
        returning: true
    })

    return {
        insertRefreshToken
    }
}