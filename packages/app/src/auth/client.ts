import {Client} from "@astoniq/idp-schemas";
import {InvalidClient} from "./errors.js";
import {Queries} from "../queries/index.js";

export interface ClientAuthenticationRequest {
    clientId?: string;
    clientSecret?: string;
}

export type HandleClientAuthentication = (request: ClientAuthenticationRequest) => Promise<Client>

export const makeHandleClientAuthentication = (options: {
    queries: Queries
}): HandleClientAuthentication => {

    const {
        queries: {
            clients: {
                findClientById
            }
        }
    } = options

    return async (request) => {

        if (!request.clientId) {
            throw new InvalidClient('Missing required client_id parameter.')
        }

        if (!request.clientSecret) {
            throw new InvalidClient('Missing required client_secret parameter.')
        }

        const client = await findClientById(request.clientId);

        if (!client) {
            throw new InvalidClient('Client does not exist.')
        }

        return client
    }
}