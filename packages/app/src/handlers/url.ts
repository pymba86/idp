import {Config} from "../config/index.js";


export function getBaseUrl(config: Config): string {

    const {
        baseUrl
    } = config

    try {
        new URL(baseUrl)
    } catch {
        throw new Error('Base url is not valid url. Check env variables')
    }

    return baseUrl
}