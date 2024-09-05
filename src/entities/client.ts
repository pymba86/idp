import {Entity} from "../types/index.js";
import {InsertClient, Client, clientGuard, insertClientGuard} from "../schemas/index.js";

export const clientEntity: Entity<
    Client,
    InsertClient
> = {
    table: 'clients',
    tableSingular: 'client',
    fields: {
        id: 'id',
        name: 'name',
        secret: 'secret',
        description: 'description',
        metadata: 'metadata'
    },
    guard: clientGuard,
    insertGuard: insertClientGuard
}