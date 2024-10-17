import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table refresh_tokens
            (
                id                varchar(21) not null,
                client_id         varchar(21) not null,
                user_id           varchar(21) not null,
                user_session_id   varchar(21) not null,
                access_token_id   varchar(21) not null,
                scope             text        not null,
                access_expires_at timestamp without time zone,
                expires_at        timestamp without time zone,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table refresh_tokens;
        `);
    }
}

export default migration