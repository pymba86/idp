import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table user_sessions
            (
                id         varchar(21) not null,
                user_id    varchar(21) not null,
                session_id varchar(21) not null,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table user_sessions;
        `);
    }
}

export default migration