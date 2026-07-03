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
// Tracks how many directive instances are subscribed per container so the
// cached observable — which closes over the container element — can be evicted
// once the last subscriber detaches. Without eviction the Map grows unbounded
// and pins destroyed DOM nodes in memory across navigations.
const containerScrollSubscriberCounts = new Map<string, number>();

function containerHash(scrollParentNativeElement: HTMLElement) {
  let hash = scrollParentNativeElement.dataset['appInViewportHash'];
  if (hash === undefined) {
    hash = scrollParentNativeElement.dataset['appInViewportHash'] =
      `id-${appInViewportHashStepper++}`;
  }
  return hash;
}

function acquireContainerScrollObservable(
  scrollParentNativeElement: HTMLElement,
): [string, Observable<[CheckEventType, DOMRect]>] {
  const hash = containerHash(scrollParentNativeElement);

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

  containerScrollSubscriberCounts.set(
    hash,
    (containerScrollSubscriberCounts.get(hash) ?? 0) + 1,
  );

  return [hash, observable];
}

function releaseContainerScrollObservable(hash: string) {
  const count = (containerScrollSubscriberCounts.get(hash) ?? 0) - 1;
  if (count > 0) {
    containerScrollSubscriberCounts.set(hash, count);
  } else {
    containerScrollSubscriberCounts.delete(hash);
    containerScrollObservables.delete(hash);
  }
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

    if (this._disabled) {
      this.teardownSubscription();
    } else if (this.subscription === null) {
      this.initEventListeners();
    }
  }

  private _scrollParent: ElementRef<HTMLElement> | HTMLElement = document.body;

  @Input('appInViewportScrollParent')
  get scrollParent() {
    return this._scrollParent;
  }

  set scrollParent(value: ElementRef<HTMLElement> | HTMLElement) {
    this.teardownSubscription();

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
  private currentHash: string | null = null;

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
    this.teardownSubscription();
  }

  private teardownSubscription() {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.currentHash !== null) {
      releaseContainerScrollObservable(this.currentHash);
      this.currentHash = null;
    }
  }

  initEventListeners() {
    // Idempotent: release any existing subscription (and its container
    // ref-count) before creating a new one, so repeated calls can neither
    // double-subscribe nor leak a ref-count.
    this.teardownSubscription();

    const scrollParentNativeElement =
      this.scrollParent instanceof ElementRef
        ? this.scrollParent.nativeElement
        : this.scrollParent;

    const [hash, observable] = acquireContainerScrollObservable(
      scrollParentNativeElement,
    );
    this.currentHash = hash;
    this.subscription = observable.subscribe({
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
