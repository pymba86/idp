import {Entity} from "../types/index.js";
import {InsertResource, insertResourceGuard, Resource, resourceGuard} from "@astoniq/idp-schemas";

export const resourceEntity: Entity<
    Resource,
    InsertResource
> = {
    table: 'resources',
    tableSingular: 'resource',
    fields: {
        id: 'id',
        name: 'name',
        description: 'description'
    },
    guard: resourceGuard,
    insertGuard: insertResourceGuard
}