import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table codes
            (
                id              varchar(21)  not null,
                client_id       varchar(21)  not null,
                user_id         varchar(21)  not null,
                user_session_id varchar(21)  not null,
                scope           varchar(512) not null,
                redirect_uri    varchar(512) not null,
                expires_at      timestamp without time zone,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table codes;
        `);
    }
}

export default migration