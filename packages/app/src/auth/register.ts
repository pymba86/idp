import {Queries} from "../queries/index.js";
import {Handlers} from "../handlers/index.js";
import {Middleware} from "koa";
import {IRouterParamContext} from "koa-router";
import {WithInertiaContext} from "../middlewares/koa-inertia.js";
import {InvalidRequest} from "./errors.js";
import {buildPasswordChecker, emailRegEx, generateStandardId} from "@astoniq/idp-shared";
import {hashValue} from "../utils/hash.js";
import {Tasks} from "../tasks/index.js";
import {Scheduler} from "../scheduler/index.js";
import {buildInsertIntoWithPool} from "../database/insert-into.js";
import {userRegistrationEntity} from "../entities/index.js";
import {AuthRouterContext} from "./types.js";

export const makeHandleRegisterGet = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    handlers: Handlers,
}): Middleware<StateT, WithInertiaContext<ContextT>> => {

    const {
        handlers: {
            getSession
        },
    } = options

    return async (ctx) => {

        const {
            data: {
                authContext
            }
        } = await getSession(ctx)


        if (!authContext) {
            ctx.redirect('/auth/bad')
            return;
        }

        return ctx.inertia.render('Register')
    }
}

export const makeHandleRegisterPost = <StateT, ContextT extends IRouterParamContext>(options: {
    queries: Queries,
    tasks: Tasks,
    scheduler: Scheduler,
    handlers: Handlers,
}): Middleware<StateT, AuthRouterContext<ContextT>> => {

    const {
        handlers: {
            getSession
        },
        scheduler,
        tasks: {
            sendUserRegisterTask
        },
        queries: {
            pool,
            users: {
                findUserByEmail
            },
        }
    } = options

    return async (ctx) => {

        const session = await getSession(ctx);

        const {authContext} = session.data;

        if (!authContext) {
            throw new InvalidRequest("auth context not found");
        }

        const {
            email,
            password
        } = ctx.request.body

        if (typeof email !== 'string') {
            return ctx.inertia.render('Register', {error: 'email required'})
        }

        if (email.length === 0) {
            return ctx.inertia.render('Register', {error: 'email is not empty', email})
        }

        if (typeof password !== 'string') {
            return ctx.inertia.render('Register', {error: 'password required', email})
        }

        if (password.length === 0) {
            return ctx.inertia.render('Register', {error: 'password is not empty', email})
        }

        // Проверка по email
        if (!emailRegEx.test(email)) {
            return ctx.inertia.render('Register', {error: 'email bad', email})
        }

        // Черный список доменов при регистрации
        const domain = email.split('@')[1];

        if (!domain) {
            return ctx.inertia.render('Register', {error: 'email bad', email})
        }

        const blocked = ctx.signInExperience
            .blockedDomains.includes(domain);

        if (blocked) {
            return ctx.inertia.render('Register', {error: 'email domain blocked', email})
        }

        // Поиск пользователя в существующих
        const user = await findUserByEmail(email);

        if (user) {
            return ctx.inertia.render('Register', {error: 'email already exists', email})
        }

        // Проверка политики пароля
        const passwordChecker = buildPasswordChecker(
            ctx.signInExperience.passwordPolicy)

        const issues = passwordChecker.check(password);

        if (issues.length > 0) {
            return ctx.inertia.render('Register', {error: JSON.stringify(issues), email})
        }

        const id = generateStandardId()

        const now = Date.now()

        const expiresAt = now + 60 * 15 * 1000 // 15 minute

        const hashPassword = await hashValue(password)

        await pool.transaction(async connection => {

            const insertUserRegistration = buildInsertIntoWithPool(
                connection, userRegistrationEntity)

            await insertUserRegistration({
                id,
                password: hashPassword,
                email,
                expiresAt
            })

            await scheduler.send(
                sendUserRegisterTask.from({
                    email,
                    code: id
                }),
                connection
            )
        })

        return ctx.inertia.render('RegisterActivation')
    }
}