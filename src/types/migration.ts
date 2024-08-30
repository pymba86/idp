import {DatabaseTransactionConnection} from "slonik";

export type MigrationScript = {
    up: (connection: DatabaseTransactionConnection) => Promise<void>;
    down: (connection: DatabaseTransactionConnection) => Promise<void>
}

export type MigrationFile = {
    path: string;
    filename: string
}