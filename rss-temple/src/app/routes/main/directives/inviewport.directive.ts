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
  @Input('appInViewport')
  disabled = false;

  private _scrollParent: ElementRef<HTMLElement> | HTMLElement = document.body;

  @Input('appInViewportScrollParent')
  get scrollParent() {
    return this._scrollParent;
  }

  set scrollParent(value: ElementRef<HTMLElement> | HTMLElement) {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }

    this._scrollParent = value;
    this.initEventListeners();
  }

  @Input('appInViewportOffset')
  offset: Partial<Rect> = {};

  @Input('appInViewportRecognizedEventTypes')
  recognizedEventTypes = new Set<CheckEventType>(['resize', 'scroll']);

  @Output('appInViewportWatch')
  watch = new EventEmitter<InViewportEvent>();

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
    this.initEventListeners();
  }

  ngOnDestroy() {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
  }

  initEventListeners() {
    const scrollParentNativeElement =
      this.scrollParent instanceof ElementRef
        ? this.scrollParent.nativeElement
        : this.scrollParent;
    this.subscription = merge(
      fromEvent(window, 'resize').pipe(mapTo<Event, CheckEventType>('resize')),
      fromEvent(scrollParentNativeElement, 'scroll').pipe(
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

  private check(eventType: CheckEventType) {
    if (this.disabled || !this.recognizedEventTypes.has(eventType)) {
      return;
    }

    const nativeElement = this.elementRef.nativeElement;
    const scrollParentNativeElement =
      this.scrollParent instanceof ElementRef
        ? this.scrollParent.nativeElement
        : this.scrollParent;

    const scrollParentRect = scrollParentNativeElement.getBoundingClientRect();
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

    this.watch.emit(event);
  }
}
