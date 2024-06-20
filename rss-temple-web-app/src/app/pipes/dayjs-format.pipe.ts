import { Pipe, PipeTransform } from '@angular/core';
import { FormatOptions, format } from 'date-fns';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(
    value: Date | null | undefined,
    format_ = 'yyyy-MM-dd HH:mm:ss',
    options?: FormatOptions,
  ) {
    if (value === null || value === undefined) {
      return null;
    }

    return format(value, format_, options);
  }
}
