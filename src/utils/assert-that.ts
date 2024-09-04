import {RequestError} from "../errors/index.js";
import {PhraseCode} from "../phrases/index.js";
import {assert} from "./assert.js";

type AssertThatFunction = {
    <E extends Error>(value: unknown, error: E): asserts value;
    (value: unknown, error: PhraseCode, status?: number): asserts value;
}

export const assertThat: AssertThatFunction = <E extends Error>(
    value: unknown,
    error: E | PhraseCode,
    status?: number
): asserts value => {
    assert(value, error instanceof Error ? error : new RequestError({code: error, status}));
}