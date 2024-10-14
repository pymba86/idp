import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table sessions
            (
                id         varchar(21) not null,
                http_only  boolean     not null,
                path       text        not null,
                domain     text,
                secure     boolean,
                same_site  text,
                data       jsonb,
                expires_at timestamp without time zone,
                max_age    integer,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table sessions;
        `);
    }
}

export default migration