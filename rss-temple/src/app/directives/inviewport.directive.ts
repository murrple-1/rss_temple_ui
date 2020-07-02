import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export type InViewportEvent =
  | {
      target: HTMLElement;
      isInViewport: false;
    }
  | {
      target: HTMLElement;
      isInViewport: true;
      boundingRect: ClientRect | DOMRect;
    };

@Directive({
  selector: '[appInViewport]',
})
export class InViewportDirective implements OnInit, OnDestroy {
  @Input()
  appInViewportOffset = 0;

  @Output()
  appInViewportWatch = new EventEmitter<InViewportEvent>();

  private subscription: Subscription | null = null;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  private static rectIntersects(
    r1: ClientRect | DOMRect,
    r2: ClientRect | DOMRect,
  ) {
    return !(
      r2.left > r1.right ||
      r2.right < r1.left ||
      r2.top > r1.bottom ||
      r2.bottom < r1.top
    );
  }

  ngOnInit() {
    this.subscription = merge(
      fromEvent(window, 'scroll'),
      fromEvent(window, 'resize'),
    )
      .pipe(debounceTime(100))
      .subscribe(this.check.bind(this));
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private check() {
    const nativeElement = this.elementRef.nativeElement;

    const viewportRect: ClientRect | DOMRect = {
      top: -this.appInViewportOffset,
      bottom: window.innerHeight + this.appInViewportOffset,
      left: 0,
      right: window.innerWidth,
      width: window.innerWidth,
      height: window.innerHeight + this.appInViewportOffset * 2,
    };

    const boundingRect = nativeElement.getBoundingClientRect();

    let event: InViewportEvent;
    if (InViewportDirective.rectIntersects(boundingRect, viewportRect)) {
      event = {
        target: nativeElement,
        isInViewport: true,
        boundingRect,
      };
    } else {
      event = {
        target: nativeElement,
        isInViewport: false,
      };
    }

    this.appInViewportWatch.emit(event);
  }
}
