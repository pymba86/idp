
export enum PasswordCharType {
    Lowercase = 'lowercase',
    Uppercase = 'uppercase',
    Digits = 'digits',
    Symbols = 'symbols',
    Unsupported = 'unsupported'
}

export type PasswordPolicy = {
    length: {
        min: number
        max: number
    },
    charTypes: PasswordCharType[],
}

export type PasswordRejectionCode =
    | 'too_short'
    | 'lowercase'
    | 'uppercase'
    | 'digits'
    | 'symbols'
    | 'unsupported'
    | 'too_long'
    | 'char_types'
    | 'unsupported_char'
    | 'repetition'
    | 'sequence'
    | 'words';

export const symbols = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ ';

export type PasswordIssue = {
    code: PasswordRejectionCode;
    interpolation?: Record<string, unknown>;
}

export const buildPasswordChecker = (policy: PasswordPolicy) => {

    const checkCharTypes = (password: string): Set<PasswordCharType> => {
        const charTypes = new Set<PasswordCharType>();

        for (const char of password) {
            if (char >= 'a' && char <= 'z') {
                charTypes.add(PasswordCharType.Lowercase);
            } else if (char >= 'A' && char <= 'Z') {
                charTypes.add(PasswordCharType.Uppercase);
            } else if (char >= '0' && char <= '9') {
                charTypes.add(PasswordCharType.Digits);
            } else if (symbols.includes(char)) {
                charTypes.add(PasswordCharType.Symbols);
            } else {
                charTypes.add(PasswordCharType.Unsupported);
            }
        }

        return charTypes
    }

    const check = (password: string): PasswordIssue[] => {
        const issues: PasswordIssue[] = []

        if (password.length < policy.length.min) {
            issues.push({
                code: 'too_short',
                interpolation: {min: policy.length.min}
            })
        }

        if (password.length > policy.length.max) {
            issues.push({
                code: 'too_long',
                interpolation: {max: policy.length.max}
            })
        }

        const charTypes = checkCharTypes(password)

        for (const charType of policy.charTypes) {
            if (!charTypes.has(charType)) {
                issues.push({
                    code: charType
                })
            }
        }

        return issues
    }

    return {
        check,
        checkCharTypes
    }
}
