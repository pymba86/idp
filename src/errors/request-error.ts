import {PhraseCode} from "../phrases/index.js";

export type RequestErrorMetadata =  {
    code: PhraseCode;
    status?: number;
    slots?: Slots;
}

type Slots = Record<string, string | number>

export class RequestError extends Error {
    code: PhraseCode;
    status: number;
    data: unknown;
    slots: Slots;

    constructor(input: RequestErrorMetadata | PhraseCode, data?: unknown) {

        const {
            code,
            status = 400,
            slots = {}
        } = typeof input === 'string' ? {code: input} : input;

        super(code);

        this.name = 'RequestError';
        this.code = code;
        this.status = status;
        this.data = data;
        this.slots = slots;
    }
}