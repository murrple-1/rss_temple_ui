import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Observable, Subscription, fromEvent, interval, merge } from 'rxjs';
import { debounce, map, mapTo, share } from 'rxjs/operators';

const debouncer = interval(100);

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

const windowResizeObservable = fromEvent(window, 'resize').pipe(
  mapTo<Event, CheckEventType>('resize'),
);

let appInViewportHashStepper = 1;
const containerScrollObservables = new Map<
  string,
  Observable<[CheckEventType, DOMRect]>
>();
function getContainerScrollObservable(scrollParentNativeElement: HTMLElement) {
  let hash = scrollParentNativeElement.dataset['appInViewportHash'];
  if (hash === undefined) {
    hash = scrollParentNativeElement.dataset['appInViewportHash'] =
      `id-${appInViewportHashStepper++}`;
  }

  let observable = containerScrollObservables.get(hash);
  if (observable === undefined) {
    observable = merge(
      fromEvent(scrollParentNativeElement, 'scroll').pipe(
        mapTo<Event, CheckEventType>('scroll'),
      ),
      windowResizeObservable,
    ).pipe(
      debounce(() => debouncer),
      map(
        checkEventType =>
          [
            checkEventType,
            scrollParentNativeElement.getBoundingClientRect(),
          ] as [CheckEventType, DOMRect],
      ),
      share(),
    );

    containerScrollObservables.set(hash, observable);
  }

  return observable;
}

@Directive({ selector: '[appInViewport]' })
export class InViewportDirective implements OnInit, OnDestroy {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private _disabled = false;

  @Input('appInViewport')
  get disabled() {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;

    if (this._disabled && this.subscription !== null) {
      this.subscription.unsubscribe();
      this.subscription = null;
    } else if (!this._disabled && this.subscription === null) {
      this.initEventListeners();
    }
  }

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

    if (!this._disabled) {
      this.initEventListeners();
    }
  }

  @Input('appInViewportOffset')
  offset: Partial<Rect> = {};

  @Input('appInViewportRecognizedEventTypes')
  recognizedEventTypes = new Set<CheckEventType>(['resize', 'scroll']);

  @Output('appInViewportWatch')
  watch = new EventEmitter<InViewportEvent>();

  private subscription: Subscription | null = null;

  private static rectIntersects(r1: Rect, r2: Rect) {
    return !(
      r2.left > r1.right ||
      r2.right < r1.left ||
      r2.top > r1.bottom ||
      r2.bottom < r1.top
    );
  }

  ngOnInit() {
    if (!this._disabled) {
      this.initEventListeners();
    }
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
    this.subscription = getContainerScrollObservable(
      scrollParentNativeElement,
    ).subscribe({
      next: ([checkEventType, scrollParentBoundingRect]) => {
        this.check(checkEventType, scrollParentBoundingRect);
      },
    });
  }

  private check(eventType: CheckEventType, scrollParentRect: DOMRect) {
    if (this.disabled || !this.recognizedEventTypes.has(eventType)) {
      return;
    }

    const nativeElement = this.elementRef.nativeElement;

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
