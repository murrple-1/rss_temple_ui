import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { sanitize as sanitizeHtml } from 'dompurify';

@Pipe({
  name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}

  transform(value: string | null | undefined) {
    if (typeof value === 'string') {
      return this.domSanitizer.bypassSecurityTrustHtml(sanitizeHtml(value));
    } else {
      return value;
    }
  }
}
