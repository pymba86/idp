import {Queries} from "../queries/index.js";
import {Client} from "@astoniq/idp-schemas";
import {InvalidScope} from "../auth/errors.js";

export const createClientLibrary = (options: {
    queries: Queries
}) => {

    const {
        queries: {
            clientScopes: {
                findScopesByClientId
            }
        }
    } = options

    const validateClientScopes = async (client: Client, scope: string) => {

        const scopes = scope.split(' ');

        const clientScopes = await findScopesByClientId(client.id);

        const supportedScopes = clientScopes.map(
            scope => scope.name)

        if (scopes.some((scope) => !supportedScopes.includes(scope))) {
            throw new InvalidScope(scope);
        }
    };

    return {
        validateClientScopes
    }
}