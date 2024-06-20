import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateNumber',
})
export class TruncatedNumberPipe implements PipeTransform {
  transform(value: number | null | undefined, max = 1000, radix = 10) {
    if (value === null || value === undefined) {
      return null;
    }

    if (value > max) {
      return `${max.toString(radix)}+`;
    } else {
      return value.toString(radix);
    }
  }
}
