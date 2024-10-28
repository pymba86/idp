import {Queries} from "../queries/index.js";
import {createJwtLibrary} from "./jwt.js";
import {createTokenLibrary} from "./token.js";
import {createClientLibrary} from "./client.js";
import {Handlers} from "../handlers/index.js";

export type Libraries = ReturnType<typeof createLibraries>

export const createLibraries = (options: {
    queries: Queries,
    handlers: Handlers,
}) => {

    const {
        queries,
    } = options

    const jwt = createJwtLibrary({
        queries
    })

    const token = createTokenLibrary({
        jwt,
        queries
    })

    const client = createClientLibrary({
        queries
    })
    return {
        client,
        token,
        jwt
    }
}