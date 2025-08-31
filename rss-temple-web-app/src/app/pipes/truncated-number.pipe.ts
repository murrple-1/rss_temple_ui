import { DecimalPipe } from '@angular/common';
import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';

@Pipe({ name: 'truncateNumber' })
export class TruncatedNumberPipe implements PipeTransform {
  private decimalPipe: DecimalPipe;

  constructor() {
    const locale = inject(LOCALE_ID);

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
