import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(
    value: Date | null | undefined,
    format_ = 'yyyy-MM-dd HH:mm:ss',
    options?: {
      locale?: Locale;
      weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      firstWeekContainsDate?: number;
      useAdditionalWeekYearTokens?: boolean;
      useAdditionalDayOfYearTokens?: boolean;
    },
  ) {
    if (value === null || value === undefined) {
      return '';
    }

    return format(value, format_, options);
  }
}
