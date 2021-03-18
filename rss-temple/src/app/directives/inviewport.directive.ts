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

export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

type CheckEventType = 'resize' | 'scroll';

@Directive({
  selector: '[appInViewport]',
})
export class InViewportDirective implements OnInit, OnDestroy {
  @Input('appInViewportOffset')
  offset: Partial<Rect> = {};

  @Input('appInViewportRecognizedEventTypes')
  recognizedEventTypes = new Set<CheckEventType>(['resize', 'scroll']);

  @Input('appInViewportDisabled')
  disabled = false;

  @Output()
  appInViewportWatch = new EventEmitter<InViewportEvent>();

  _scrollParent: Element | null = null;

  private subscription: Subscription | null = null;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  private static rectIntersects(r1: Rect, r2: Rect) {
    return !(
      r2.left > r1.right ||
      r2.right < r1.left ||
      r2.top > r1.bottom ||
      r2.bottom < r1.top
    );
  }

  ngOnInit() {
    const scrollParent =
      getScrollParent(this.elementRef.nativeElement) ?? document.body;
    this._scrollParent = scrollParent;

    this.subscription = merge(
      fromEvent(window, 'resize').pipe(mapTo<Event, CheckEventType>('resize')),
      fromEvent(this._scrollParent, 'scroll').pipe(
        mapTo<Event, CheckEventType>('scroll'),
      ),
    )
      .pipe(debounceTime(100))
      .subscribe({
        next: checkEventType => {
          this.check(checkEventType, scrollParent);
        },
      });
  }

  ngOnDestroy() {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
  }

  private check(eventType: CheckEventType, scrollParent: Element) {
    if (this.disabled || !this.recognizedEventTypes.has(eventType)) {
      return;
    }

    const nativeElement = this.elementRef.nativeElement;

    const scrollParentRect = scrollParent.getBoundingClientRect();
    const offset = this.offset;

    const viewportRect: Rect = {
      top: scrollParentRect.top + (offset.top ?? 0),
      bottom: scrollParentRect.bottom + (offset.bottom ?? 0),
      left: scrollParentRect.left + (offset.left ?? 0),
      right: scrollParentRect.right + (offset.right ?? 0),
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
