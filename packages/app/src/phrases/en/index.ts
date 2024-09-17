import errors from "./errors.js";
import guard from "./guard.js";
import auth from "./auth.js";

const en = {
    ...errors,
    ...auth,
    ...guard
}

export default Object.freeze(en);