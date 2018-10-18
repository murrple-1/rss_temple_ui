import { CommonOptions } from '@app/_services/data/common.interface';

export interface AllOptions<Field> extends CommonOptions {
    fields?: Field[];
    search?: string;
    sort?: string;
    returnTotalCount?: boolean;
}
