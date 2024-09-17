import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table resources
            (
                id          varchar(21)  not null,
                name        varchar(128) not null,
                description varchar(256) not null,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table resources;
        `);
    }
}

export default migration