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

export interface InViewportEvent {
  target: HTMLElement;
  isInViewport: boolean;
  pixelsInside: number;
}

@Directive({
  selector: '[inViewport]',
})
export class InViewportDirective implements OnInit, OnDestroy {
  @Input()
  offset = 0;

  @Output()
  inViewport = new EventEmitter<InViewportEvent>();

  private subscription: Subscription;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.subscription = merge(
      fromEvent(window, 'scroll'),
      merge(fromEvent(window, 'resize')),
    )
      .pipe(debounceTime(100))
      .subscribe(() => this.check());
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private check() {
    const nativeElement = this.elementRef.nativeElement;

    let isInViewport = document.body.contains(nativeElement);
    let pixelsInside = 0;
    if (isInViewport) {
      pixelsInside =
        nativeElement.getBoundingClientRect().top -
        window.innerHeight +
        this.offset;
      isInViewport = isInViewport && pixelsInside < 0;

      pixelsInside = isInViewport ? pixelsInside : 0;
    }

    const event: InViewportEvent = {
      target: nativeElement,
      isInViewport: isInViewport,
      pixelsInside: pixelsInside,
    };

    this.inViewport.emit(event);
  }
}
