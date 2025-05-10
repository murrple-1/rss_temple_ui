import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: false,
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}

  transform(value: string | null | undefined) {
    if (typeof value === 'string') {
      return this.domSanitizer.bypassSecurityTrustHtml(value);
    } else {
      return value;
    }
  }
}
