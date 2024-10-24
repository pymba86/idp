import {
    ConsoleSenderProviderConfig,
    SenderProviderType,
    UserRegisterEvent
} from "@astoniq/idp-schemas";

export const defaultSenderProviderConfig: ConsoleSenderProviderConfig = {
    provider: SenderProviderType.Console
}

export interface SenderProvider {
    sendUserRegisterMessage(event: UserRegisterEvent): Promise<void>
}