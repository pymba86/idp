import {SlonikError} from "slonik";
import {Entity, EntityLike, UpdateWhereData} from "../types/index.js";
import {OmitAutoSetFields} from "../utils/sql.js";

export class DeletionError extends SlonikError {
    public constructor(
        public readonly table?: string,
        public readonly id?: string
    ) {
        super('Resource not found');
    }
}

export class UpdateError<
    T extends EntityLike<T>,
    P extends Partial<T>,
    SetKey extends Partial<EntityLike<T>>,
    WhereKey extends Partial<EntityLike<T>>,
> extends SlonikError {
    public constructor(
        public readonly entity: Entity<T, P>,
        public readonly detail: Partial<UpdateWhereData<SetKey, WhereKey>>
    ) {
        super('Resource not found');
    }
}

export class InsertionError<
    T extends EntityLike<T>,
    P extends Partial<T>,
    CreateEntity extends Partial<EntityLike<T>>
> extends SlonikError {
    public constructor(
        public readonly entity: Entity<T, P>,
        public readonly detail?: OmitAutoSetFields<CreateEntity>
    ) {
        super('Create Error');
    }
}