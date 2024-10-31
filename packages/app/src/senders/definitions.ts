import {
    ConsoleSenderConfig,
    SenderType,
    UserRegisterEvent
} from "@astoniq/idp-schemas";

export const defaultSenderConfig: ConsoleSenderConfig = {
    provider: SenderType.Console
}

export interface Sender {
    sendUserRegisterMessage(event: UserRegisterEvent): Promise<void>
}