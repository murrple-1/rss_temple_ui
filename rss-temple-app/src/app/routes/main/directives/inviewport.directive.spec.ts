import { ElementRef } from '@angular/core';
import { take } from 'rxjs/operators';

import { InViewportDirective, InViewportEvent } from './inviewport.directive';

function setup() {
  const elementSpy = jasmine.createSpyObj<HTMLElement>('HTMLElement', [
    'getBoundingClientRect',
  ]);

  const elementRefSpy = jasmine.createSpyObj<ElementRef<HTMLElement>>(
    'ElementRef',
    [],
    {
      nativeElement: elementSpy,
    },
  );

  const inViewportDirective = new InViewportDirective(elementRefSpy);

  return {
    elementSpy,
    elementRefSpy,

    inViewportDirective,
  };
}

describe('InViewportDirective', () => {
  it('should init and destroy', () => {
    const { inViewportDirective } = setup();
    inViewportDirective.ngOnInit();
    inViewportDirective.ngOnDestroy();
    expect().nothing();
  });

  it('should destroy', () => {
    const { inViewportDirective } = setup();
    inViewportDirective.ngOnDestroy();
    expect().nothing();
  });

  it('should check inside', async () => {
    const { elementSpy, inViewportDirective } = setup();
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
    const { elementSpy, inViewportDirective } = setup();
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
