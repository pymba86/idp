import {ConsoleSenderProviderConfig, UserRegisterEvent} from "@astoniq/idp-schemas";
import {SenderProvider} from "./definitions.js";
import * as console from "console";

export const buildConsoleSenderProvider = (config: ConsoleSenderProviderConfig): SenderProvider => {

    const {} = config

    const sendUserRegisterMessage = async (event: UserRegisterEvent) => {
        console.log(event)
    }


    return {
        sendUserRegisterMessage
    }
}