import {ConsoleSenderConfig, UserRegisterEvent} from "@astoniq/idp-schemas";
import {Sender} from "./definitions.js";
import * as console from "console";

export const buildConsoleSender = (config: ConsoleSenderConfig): Sender => {

    const {

    } = config

    const sendUserRegisterMessage = async (event: UserRegisterEvent) => {
        console.log(event)
    }


    return {
        sendUserRegisterMessage
    }
}