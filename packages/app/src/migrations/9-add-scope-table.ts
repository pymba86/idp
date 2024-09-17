import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table scopes
            (
                id          varchar(21)  not null,
                resource_id varchar(21)  not null
                    references resources (id) on update cascade on delete cascade,
                name        varchar(256) not null,
                description text,
                primary key (id),
                constraint scopes__resource_id_name
                    unique (resource_id, name)
            );
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop table scopes;
        `);
    }
}

export default migration