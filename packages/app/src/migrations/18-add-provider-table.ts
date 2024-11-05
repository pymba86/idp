import {MigrationScript} from "../types/index.js";
import {sql} from "slonik";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table providers
            (
                id      varchar(21)  not null,
                name    varchar(128) not null,
                type    varchar(128) not null,
                link    boolean      not null default false,
                sso     boolean      not null default false,
                domains jsonb        not null default '[]'::jsonb,
                config  jsonb        not null default '{}'::jsonb,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table providers;
        `);
    }
}

export default migration