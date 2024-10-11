import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table scopes
            (
                id          varchar(21)  not null,
                name        varchar(256) not null,
                description text,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table scopes;
        `);
    }
}

export default migration