export class OAuth2ServerError extends Error {
    constructor(readonly statusCode: number, readonly error: string, readonly errorDescription: string) {
        super(error);
    }
}

export class InvalidRequest extends OAuth2ServerError {
    constructor(errorDescription: string) {
        super(400, 'invalid_request', errorDescription);
    }
}

export class InvalidClient extends OAuth2ServerError {
    constructor(errorDescription: string) {
        super(401, 'invalid_client', errorDescription);
    }
}

export class AccessDenied extends OAuth2ServerError {
    constructor() {
        super(403, 'access_denied', 'the resource owner denied the request');
    }
}

export class InvalidScope extends OAuth2ServerError {
    constructor(scope: string) {
        super(400, 'invalid_scope', `the requested scope is invalid, unknown, or malformed '${scope}'`);
    }
}

export class InvalidGrant extends OAuth2ServerError {
    constructor(errorDescription: string) {
        super(400, 'invalid_grant', errorDescription);
    }
}

export class UnsupportedGrantType extends OAuth2ServerError {
    constructor(grantType: string) {
        super(
            400,
            'unsupported_grant_type',
            `the authorization grant type "${grantType}" is not supported by the authorization server`,
        );
    }
}

export class ServerError extends OAuth2ServerError {
    constructor() {
        super(
            500,
            'server_error',
            'the authorization server encountered an unexpected condition that prevented it from fulfilling the request',
        );
    }
}

