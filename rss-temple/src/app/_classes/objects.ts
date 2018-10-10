export class Objects<T> {
    totalCount?: number;
    objects: T[];
}

export function toObjects<T>(value: Record<string, any>, fn: (t: Record<string, any>) => T): Objects<T> {
    const objs = new Objects<T>();

    if ('totalCount' in value) {
        const totalCount = value['totalCount'];
        if (typeof totalCount === 'number') {
            objs.totalCount = totalCount;
        } else {
            throw new Error('\'totalCount\' must be number');
        }
    }

    if ('objects' in value) {
        const objects = value['objects'];
        if (Array.isArray(objects)) {
            const _objects: T[] = [];
            for(const obj of objects) {
                _objects.push(fn(obj));
            }
            objs.objects = objects;
        } else {
            throw new Error('\'objects\' must be number');
        }
    }

    return objs;
}