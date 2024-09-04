import errors from "./errors.js";
import guard from "./guard.js";

const en = {
    ...errors,
    ...guard
}

export default Object.freeze(en);