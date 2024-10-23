import {sql} from "slonik";
import {MigrationScript} from "../types/index.js";

const migration: MigrationScript = {
    up: async (pool) => {
        await pool.query(sql.unsafe`
            create table tasks
            (
                id           varchar(21)                 not null,
                name         text                        not null,
                data         jsonb,
                output       jsonb,
                unique_key   text                                 default null,
                state        smallint                    not null default (0),
                retry_limit  integer                     not null default (0),
                retry_count  integer                     not null default (0),
                retry_delay  integer                     not null default (0),
                start_after  timestamp without time zone not null default now(),
                started_on   timestamp without time zone,
                created_on   timestamp without time zone not null default now(),
                expire_in    integer                     not null default (0),
                completed_on timestamp without time zone,
                primary key (id)
            );
            
            -- 0: create, 1: retry, 2: active, 3 >= all completed/failed
            create index idx_get_tasks ON tasks (start_after) where state < 2;
            create unique index idx_unique_key_task ON tasks (unique_key) where state < 3;
        `)

        await pool.query(sql.unsafe`
            create function create_tasks(tasks jsonb) returns setof tasks AS
            $$
            begin
                insert into tasks (id,
                                   name,
                                   data,
                                   retry_limit,
                                   retry_delay,
                                   unique_key,
                                   start_after,
                                   expire_in)
                select "id" as "id",
                       "name" as "name",
                       "data" as "data",
                       "retryLimit" as "retry_limit",
                       "retryDelay" as "retry_delay",
                       "uniqueKey" as "unique_key",
                        to_timestamp("startAfter" / 1000) as "start_after",
                       "expireIn" as "expire_in"
                from jsonb_to_recordset(tasks) as x(
                                                    "id" varchar,
                                                    "name" text,
                                                    "data" jsonb,
                                                    "retryLimit" integer,
                                                    "retryDelay" integer,
                                                    "uniqueKey" text,
                                                    "startAfter" bigint,
                                                    "expireIn" integer
                    )
                on conflict
                    do nothing;
                return;
            end;
            $$ LANGUAGE 'plpgsql';
        `)

        await pool.query(sql.unsafe`
            create function get_tasks(amount integer)
                returns setof tasks AS
            $$
            BEGIN
                return query
                    with _tasks as (
                        select id
                        from tasks
                        where start_after < now()
                          and state < 2
                        order by created_on
                        limit amount for
                            update skip locked)
                        update tasks t
                            set state = 2::smallint,
                                started_on = now(),
                                retry_count = case
                                                  when state = 1
                                                      then retry_count + 1
                                                  else retry_count
                                    end
                            from _tasks
                            where t.id = _tasks.id
                            returning t.*;
            END
            $$ LANGUAGE 'plpgsql';
        `)

        await pool.query(sql.unsafe`
            create function resolve_tasks(tasks jsonb) returns setof tasks as
            $$
            begin
                return query
                with _in as (select x.id      as id,
                                    x.success as success,
                                    x.payload as payload
                             from jsonb_to_recordset(tasks) as x(
                                                                id varchar,
                                                                success boolean,
                                                                payload jsonb
                                 )),
                     _failed as (
                         update tasks t
                             set
                                 state = case
                                             when retry_count < retry_limit then 1::smallint
                                             else 6::smallint end,
                                 completed_on = case when retry_count < retry_limit then null else now() end,
                                 start_after = case
                                                   when retry_count = retry_limit then start_after
                                                   else now() + retry_delay * interval '1'
                                     end,
                                 output = _in.payload
                             from _in
                             where t.id = _in.id
                                 and _in.success = false
                                 and t.state < 3)
                update tasks t
                set state        = 3::smallint,
                    completed_on = now(),
                    output       = _in.payload
                from _in
                where t.id = _in.id
                  and _in.success = true
                  and t.state = 2
                returning t.*;
            end;
            $$ LANGUAGE 'plpgsql';
        `)
    },
    down: async (pool) => {
        await pool.query(sql.unsafe`
            drop function create_tasks;
            drop function get_tasks;
            drop function resolve_tasks;
            drop table tasks;
        `);
    }
}

export default migration