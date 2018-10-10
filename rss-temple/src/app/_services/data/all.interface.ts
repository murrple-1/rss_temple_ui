export interface AllOptions<Field> {
    fields?: Field[];
    search?: string;
    sort?: string;
    sessionToken?: string;
}

export function toHeader<Field>(options: AllOptions<Field>, sessionTokenFn: () => string) {
    const headers: {
        [param: string]: string | string[]
    } = {
        'X-Session-Token': options.sessionToken || sessionTokenFn(),
    };

    return headers;
}

export function toParams<Field>(options: AllOptions<Field>, fieldsFn: () => Field[]) {
    const params: {
        [header: string]: string | string[]
    } = {
        'fields': (options.fields || fieldsFn()).join(','),
    };

    if (typeof options.search !== 'undefined') {
        params['search'] = options.search;
    }

    if (typeof options.sort !== 'undefined') {
        params['sort'] = options.sort;
    }

    return params;
}
