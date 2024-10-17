import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table user_registrations
            (
                id         varchar(21)                 not null,
                email      varchar(128)                not null,
                password   varchar(128)                not null,
                expires_at timestamp without time zone not null,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table user_registrations;
        `);
    }
}

export default migration