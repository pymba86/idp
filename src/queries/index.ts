import {CommonQueryMethods} from "slonik";

export type Queries = ReturnType<typeof createQueries>

export const createQueries = (pool: CommonQueryMethods) => {

    return {
        pool
    }
}