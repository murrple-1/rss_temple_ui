import { CommonOptions } from '@app/services/data/common.interface';
import { Sort } from '@app/services/data/sort.interface';

export interface AllOptions<Field extends string, SortField extends string>
  extends CommonOptions {
  fields?: Field[];
  search?: string;
  sort?: Sort<SortField>;
  returnTotalCount?: boolean;
}
