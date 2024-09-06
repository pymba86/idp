import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table users
            (
                id       varchar(21)  not null,
                email    varchar(128) not null,
                password varchar(128) not null,
                primary key (id)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table users;
        `);
    }
}

export default migration