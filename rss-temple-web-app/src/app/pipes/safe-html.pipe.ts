import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: false,
})
export class SafeHtmlPipe implements PipeTransform {
  private domSanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined) {
    if (typeof value === 'string') {
      return this.domSanitizer.bypassSecurityTrustHtml(value);
    } else {
      return value;
    }
  }
}
