import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table clients
            (
                id          varchar(21)  not null,
                name        varchar(256) not null,
                secret      varchar(64)  not null,
                consent     boolean      not null,
                description text,
                metadata    jsonb        not null,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table clients;
        `);
    }
}

export default migration