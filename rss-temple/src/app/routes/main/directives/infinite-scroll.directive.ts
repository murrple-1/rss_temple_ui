import {
  Directive,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';

import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
      .pipe(debounceTime(100))
      .subscribe({
        next: () => {
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
