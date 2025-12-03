import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import {
  type MockedObject,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { InViewportDirective, InViewportEvent } from './inviewport.directive';

describe('InViewportDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ElementRef,
          useValue: {
            nativeElement: {
              getBoundingClientRect: vi
                .fn()
                .mockName('HTMLElement.getBoundingClientRect'),
            },
          },
        },
        InViewportDirective,
      ],
    });
  });

  it('should init and destroy', () => {
    const inViewportDirective = TestBed.inject(InViewportDirective);

    inViewportDirective.ngOnInit();
    inViewportDirective.ngOnDestroy();
    // TODO: vitest-migration: expect().nothing() has been removed because it is redundant in Vitest. Tests without assertions pass by default.
    // expect().nothing();
  });

  it('should destroy', () => {
    const inViewportDirective = TestBed.inject(InViewportDirective);

    inViewportDirective.ngOnDestroy();
    // TODO: vitest-migration: expect().nothing() has been removed because it is redundant in Vitest. Tests without assertions pass by default.
    // expect().nothing();
  });

  it('should check inside', async () => {
    const elementRefSpy = TestBed.inject(ElementRef) as MockedObject<
      ElementRef<HTMLElement>
    >;
    const inViewportDirective = TestBed.inject(InViewportDirective);

    const elementSpy = elementRefSpy.nativeElement as MockedObject<HTMLElement>;

    inViewportDirective.ngOnInit();

    const scrollParentNativeElement =
      inViewportDirective.scrollParent instanceof ElementRef
        ? inViewportDirective.scrollParent.nativeElement
        : inViewportDirective.scrollParent;

    const scollParentRect = scrollParentNativeElement.getBoundingClientRect();

    elementSpy.getBoundingClientRect.mockReturnValue(scollParentRect);

    const emitPromise = new Promise<InViewportEvent>(resolve => {
      inViewportDirective.watch.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    scrollParentNativeElement.dispatchEvent(new Event('scroll'));

    await expect(emitPromise).resolves.toEqual(
      expect.objectContaining({
        isInViewport: true,
      }),
    );
  });

  it('should check outside', async () => {
    const elementRefSpy = TestBed.inject(ElementRef) as MockedObject<
      ElementRef<HTMLElement>
    >;
    const inViewportDirective = TestBed.inject(InViewportDirective);

    const elementSpy = elementRefSpy.nativeElement as MockedObject<HTMLElement>;

    inViewportDirective.ngOnInit();

    const scrollParentNativeElement =
      inViewportDirective.scrollParent instanceof ElementRef
        ? inViewportDirective.scrollParent.nativeElement
        : inViewportDirective.scrollParent;

    const scollParentRect = scrollParentNativeElement.getBoundingClientRect();

    const myRect: DOMRect = {
      top: scollParentRect.top - 2,
      bottom: scollParentRect.top - 1,
      left: scollParentRect.left - 2,
      right: scollParentRect.left - 1,
      width: 1,
      height: 1,
      x: -2,
      y: -2,
      toJSON: () => {},
    };

    elementSpy.getBoundingClientRect.mockReturnValue(myRect);

    const emitPromise = new Promise<InViewportEvent>(resolve => {
      inViewportDirective.watch.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    scrollParentNativeElement.dispatchEvent(new Event('scroll'));

    await expect(emitPromise).resolves.toEqual(
      expect.objectContaining({
        isInViewport: false,
      }),
    );
  });
});
