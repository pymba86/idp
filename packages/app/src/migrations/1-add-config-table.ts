import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table configs
            (
                key   varchar(256) not null,
                value jsonb        not null default '{}'::jsonb,
                primary key (key)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table configs;
        `);
    }
}

export default migration