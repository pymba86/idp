import {Entity} from "../types/index.js";
import {InsertConfig, insertConfigGuard, Config, configGuard} from "@astoniq/idp-schemas";

export const configEntity: Entity<
    Config,
    InsertConfig
> = {
    table: 'configs',
    tableSingular: 'config',
    fields: {
        key: 'key',
        value: 'value'
    },
    guard: configGuard,
    insertGuard: insertConfigGuard
}