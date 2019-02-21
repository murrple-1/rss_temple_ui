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
  selector: '[rsstInViewport]',
})
export class InViewportDirective implements OnInit, OnDestroy {
  @Input()
  rsstInViewportOffset = 0;

  @Output()
  rsstInViewportWatch = new EventEmitter<InViewportEvent>();

  private subscription: Subscription;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.subscription = merge(
      fromEvent(window, 'scroll'),
      fromEvent(window, 'resize'),
    )
      .pipe(debounceTime(100))
      .subscribe(this.check.bind(this));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

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

  private check() {
    const nativeElement = this.elementRef.nativeElement;

    const viewportRect: ClientRect | DOMRect = {
      top: -this.rsstInViewportOffset,
      bottom: window.innerHeight + this.rsstInViewportOffset,
      left: 0,
      right: window.innerWidth,
      width: window.innerWidth,
      height: window.innerHeight + 2 * this.rsstInViewportOffset,
    };

    const boundingRect = nativeElement.getBoundingClientRect();

    let event: InViewportEvent;
    if (InViewportDirective.rectIntersects(boundingRect, viewportRect)) {
      event = {
        target: nativeElement,
        isInViewport: true,
        boundingRect: boundingRect,
      };
    } else {
      event = {
        target: nativeElement,
        isInViewport: false,
      };
    }

    this.rsstInViewportWatch.emit(event);
  }
}
