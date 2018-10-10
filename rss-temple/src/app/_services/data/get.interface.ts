export interface GetOptions<Field> {
    fields?: Field[];
    sessionToken?: string;
}

export function toHeader<Field>(options: GetOptions<Field>, sessionTokenFn: () => string) {
    const headers: {
        [param: string]: string | string[]
    } = {
        'X-Session-Token': options.sessionToken || sessionTokenFn(),
    };

    return headers;
}

export function toParams<Field>(options: GetOptions<Field>, fieldsFn: () => Field[]) {
    const params: {
        [header: string]: string | string[]
    } = {
        'fields': (options.fields || fieldsFn()).join(','),
    };

    return params;
}
