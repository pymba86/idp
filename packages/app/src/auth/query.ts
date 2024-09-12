
export const parseParam = (param: string | string[] | undefined) => {
    return typeof param === 'string' ? param : undefined
}
