import {
  Directive,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';

import { fromEvent, interval, Subscription } from 'rxjs';
import { debounce } from 'rxjs/operators';

const debouncer = interval(100);

@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  @Input('appInfiniteScroll')
  disabled = false;

  @Input('appInfiniteScrollOffset')
  offset = 0;

  @Output('appInfiniteScrollApproachingBottom')
  approachingBottom = new EventEmitter<void>();

  private subscription: Subscription | null = null;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.subscription = fromEvent(this.elementRef.nativeElement, 'scroll')
      .pipe(debounce(() => debouncer))
      .subscribe({
        next: () => {
          if (this.disabled) {
            return;
          }

          const nativeElement = this.elementRef.nativeElement;

          if (
            nativeElement.scrollHeight - this.offset <=
            nativeElement.scrollTop + nativeElement.clientHeight
          ) {
            this.approachingBottom.emit();
          }
        },
      });
  }

  ngOnDestroy() {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
  }
}
