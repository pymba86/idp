import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table client_scopes
            (
                id        varchar(21) not null,
                client_id varchar(21) not null,
                scope_id  varchar(21) not null,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table client_scopes;
        `);
    }
}

export default migration