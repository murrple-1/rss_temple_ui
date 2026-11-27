import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';

/**
 * Exposes the element's `clientHeight` to the template, and keeps it up to
 * date when the element is resized.
 *
 * The first value arrives from the `ResizeObserver` after the first layout,
 * not during change detection, so `height()` is `0` until then.
 */
@Directive({ selector: '[appClientHeight]', exportAs: 'appClientHeight' })
export class ClientHeightDirective implements OnInit, OnDestroy {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly height = signal(0);

  private resizeObserver: ResizeObserver | null = null;

  ngOnInit() {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.height.set(this.elementRef.nativeElement.clientHeight);
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    if (this.resizeObserver !== null) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}
