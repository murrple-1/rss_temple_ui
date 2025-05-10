import { DecimalPipe } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateNumber',
  standalone: false,
})
export class TruncatedNumberPipe implements PipeTransform {
  private decimalPipe: DecimalPipe;

  constructor(@Inject(LOCALE_ID) locale: string) {
    this.decimalPipe = new DecimalPipe(locale);
  }

  transform(
    value: string | number,
    max = 1000,
    digitsInfo?: string,
    locale?: string,
  ) {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      value = window.parseFloat(value);
    }

    if (value > max) {
      return `${this.decimalPipe.transform(max, digitsInfo, locale)}+`;
    } else {
      return this.decimalPipe.transform(value, digitsInfo, locale);
    }
  }
}
