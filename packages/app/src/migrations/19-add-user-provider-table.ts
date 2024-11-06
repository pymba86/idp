import {MigrationScript} from "../types/index.js";
import {sql} from "slonik";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table user_providers
            (
                id          varchar(21) not null,
                user_id     varchar(21) not null,
                provider_id varchar(21) not null,
                identity_id varchar(128) not null,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table user_providers;
        `);
    }
}

export default migration