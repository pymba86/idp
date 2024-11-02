export enum ProviderErrorCodes {
    General = 'general',
    InvalidMetadata = 'invalid_metadata',
    UnexpectedType = 'unexpected_type',
    InvalidConfigGuard = 'invalid_config_guard',
    InvalidRequestParameters = 'invalid_request_parameters',
    InsufficientRequestParameters = 'insufficient_request_parameters',
    InvalidConfig = 'invalid_config',
    InvalidCertificate = 'invalid_certificate',
    InvalidResponse = 'invalid_response',
    TemplateNotFound = 'template_not_found',
    TemplateNotSupported = 'template_not_supported',
    RateLimitExceeded = 'rate_limit_exceeded',
    NotImplemented = 'not_implemented',
    AuthCodeInvalid = 'auth_code_invalid',
    AccessTokenInvalid = 'invalid_access_token',
    IdTokenInvalid = 'invalid_id_token',
    AuthorizationFailed = 'authorization_failed',
}

export class ProviderError extends Error {
    public code: ProviderErrorCodes;
    public data: unknown;

    constructor(code: ProviderErrorCodes, data?: unknown) {
        const message = `ProviderError: ${data ? JSON.stringify(data) : code}`;
        super(message);
        this.code = code;
        this.data = typeof data === 'string' ? { message: data } : data;
    }
}