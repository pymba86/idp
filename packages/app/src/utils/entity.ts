import {Entity, EntityKeys, EntityLike} from "../types/index.js";

export const isKeyOf =
    <T extends EntityLike<T>,
        P extends Partial<T>,
        Keys extends EntityKeys<T>
    >({fields}: Entity<T, P>) =>
        (key: PropertyKey): key is Keys => key in fields;