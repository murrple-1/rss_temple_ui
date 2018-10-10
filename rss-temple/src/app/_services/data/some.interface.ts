export interface SomeOptions<Field> {
    count?: number;
    skip?: number;
    fields?: Field[];
    search?: string;
    sort?: string;
    returnObjects?: boolean;
    returnTotalCount?: boolean;
    sessionToken?: string;
}

export function toHeader<Field>(options: SomeOptions<Field>, sessionTokenFn: () => string) {
    const headers: {
        [param: string]: string | string[]
    } = {
        'X-Session-Token': options.sessionToken || sessionTokenFn(),
    };

    return headers;
}

export function toParams<Field>(options: SomeOptions<Field>, fieldsFn: () => Field[]) {
    const params: {
        [header: string]: string | string[]
    } = {
        'fields': (options.fields || fieldsFn()).join(','),
    };

    if (typeof options.count !== 'undefined') {
        params['count'] = options.count.toString();
    }

    if (typeof options.search !== 'undefined') {
        params['search'] = options.search;
    }

    if (typeof options.sort !== 'undefined') {
        params['sort'] = options.sort;
    }

    return params;
}
