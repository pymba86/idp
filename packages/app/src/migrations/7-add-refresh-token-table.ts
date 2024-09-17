import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table refresh_tokens
            (
                id              varchar(21)  not null,
                user_session_id varchar(21)  null,
                scope           varchar(512) not null,
                type            varchar(512) not null,
                expires_at      timestamp without time zone,
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