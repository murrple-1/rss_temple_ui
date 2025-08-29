import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';

import { InViewportDirective, InViewportEvent } from './inviewport.directive';

describe('InViewportDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ElementRef,
          useValue: jasmine.createSpyObj<ElementRef<HTMLElement>>(
            'ElementRef',
            [],
            {
              nativeElement: jasmine.createSpyObj<HTMLElement>('HTMLElement', [
                'getBoundingClientRect',
              ]),
            },
          ),
        },
        InViewportDirective,
      ],
    });
  });

  it('should init and destroy', () => {
    const inViewportDirective = TestBed.inject(InViewportDirective);

    inViewportDirective.ngOnInit();
    inViewportDirective.ngOnDestroy();
    expect().nothing();
  });

  it('should destroy', () => {
    const inViewportDirective = TestBed.inject(InViewportDirective);

    inViewportDirective.ngOnDestroy();
    expect().nothing();
  });

  it('should check inside', async () => {
    const elementRefSpy = TestBed.inject(ElementRef) as jasmine.SpyObj<
      ElementRef<HTMLElement>
    >;
    const inViewportDirective = TestBed.inject(InViewportDirective);

    const elementSpy =
      elementRefSpy.nativeElement as jasmine.SpyObj<HTMLElement>;

    inViewportDirective.ngOnInit();

    const scrollParentNativeElement =
      inViewportDirective.scrollParent instanceof ElementRef
        ? inViewportDirective.scrollParent.nativeElement
        : inViewportDirective.scrollParent;

    const scollParentRect = scrollParentNativeElement.getBoundingClientRect();

    elementSpy.getBoundingClientRect.and.returnValue(scollParentRect);

    const emitPromise = new Promise<InViewportEvent>(resolve => {
      inViewportDirective.watch.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    scrollParentNativeElement.dispatchEvent(new Event('scroll'));

    await expectAsync(emitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        isInViewport: true,
      }),
    );
  });

  it('should check outside', async () => {
    const elementRefSpy = TestBed.inject(ElementRef) as jasmine.SpyObj<
      ElementRef<HTMLElement>
    >;
    const inViewportDirective = TestBed.inject(InViewportDirective);

    const elementSpy =
      elementRefSpy.nativeElement as jasmine.SpyObj<HTMLElement>;

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

    elementSpy.getBoundingClientRect.and.returnValue(myRect);

    const emitPromise = new Promise<InViewportEvent>(resolve => {
      inViewportDirective.watch.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    scrollParentNativeElement.dispatchEvent(new Event('scroll'));

    await expectAsync(emitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        isInViewport: false,
      }),
    );
  });
});
