import {Queries} from "../queries/index.js";
import {Keys} from "../config/index.js";
import {createJwtLibrary} from "./jwt.js";

export type Libraries = ReturnType<typeof createLibraries>

export const createLibraries = ({keys}: {
    queries: Queries,
    keys: Keys
}) => {

    const jwt = createJwtLibrary(keys)

    return {
        jwt
    }
}