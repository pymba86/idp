import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table user_consents
            (
                id        varchar(21) not null,
                user_id   varchar(21) not null,
                client_id varchar(21) not null,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table user_consents;
        `);
    }
}

export default migration