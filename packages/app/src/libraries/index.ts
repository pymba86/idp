import {Queries} from "../queries/index.js";
import {Keys} from "../config/index.js";
import {createJwtLibrary} from "./jwt.js";
import {createTokenLibrary} from "./token.js";
import {createClientLibrary} from "./client.js";
import {createSenderLibrary} from "./sender.js";
import {Handlers} from "../handlers/index.js";

export type Libraries = ReturnType<typeof createLibraries>

export const createLibraries = ({keys, queries, handlers}: {
    queries: Queries,
    handlers: Handlers,
    keys: Keys
}) => {

    const jwt = createJwtLibrary(keys)

    const token = createTokenLibrary({
        jwt,
        queries
    })

    const client = createClientLibrary({
        queries
    })

    const sender = createSenderLibrary({
        queries,
        handlers
    })

    return {
        client,
        token,
        sender,
        jwt
    }
}