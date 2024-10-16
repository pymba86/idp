import {Queries} from "../queries/index.js";
import {Keys} from "../config/index.js";
import {createJwtLibrary} from "./jwt.js";
import {createTokenLibrary} from "./token.js";
import {createClientLibrary} from "./client.js";

export type Libraries = ReturnType<typeof createLibraries>

export const createLibraries = ({keys, queries}: {
    queries: Queries,
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

    return {
        client,
        token,
        jwt
    }
}