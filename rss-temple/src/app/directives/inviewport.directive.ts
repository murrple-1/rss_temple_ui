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
import { debounceTime, mapTo } from 'rxjs/operators';

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

type CheckEventType = 'resize' | 'scroll';

@Directive({
  selector: '[appInViewport]',
})
export class InViewportDirective implements OnInit, OnDestroy {
  @Input('appInViewportOffset')
  offset = 0;

  @Input('appInViewportRecognizedEventTypes')
  recognizedEventTypes = new Set<CheckEventType>(['resize', 'scroll']);

  @Output()
  appInViewportWatch = new EventEmitter<InViewportEvent>();

  _scrollParent: Element | null = null;

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
    this._scrollParent =
      getScrollParent(this.elementRef.nativeElement) ?? document.body;

    this.subscription = merge(
      fromEvent(window, 'resize').pipe(mapTo<Event, CheckEventType>('resize')),
      fromEvent(this._scrollParent, 'scroll').pipe(
        mapTo<Event, CheckEventType>('scroll'),
      ),
    )
      .pipe(debounceTime(100))
      .subscribe({
        next: checkEventType => {
          this.check(checkEventType);
        },
      });
  }

  ngOnDestroy() {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
  }

  private check(eventType: CheckEventType) {
    if (!this.recognizedEventTypes.has(eventType)) {
      return;
    }

    const nativeElement = this.elementRef.nativeElement;

    const viewportRect: ClientRect | DOMRect = {
      top: -this.offset,
      bottom: window.innerHeight + this.offset,
      left: 0,
      right: window.innerWidth,
      width: window.innerWidth,
      height: window.innerHeight + this.offset * 2,
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

function getScrollParent(node: (Node & ParentNode) | null): Element | null {
  if (node instanceof Element) {
    const overflowY = window.getComputedStyle(node).overflowY;

    if (overflowY !== 'visible' && overflowY !== 'hidden') {
      return node;
    } else {
      return getScrollParent(node.parentNode);
    }
  } else {
    return null;
  }
}
