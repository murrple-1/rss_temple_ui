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
    inViewportDirective.appInViewportOffset = 0;
    inViewportDirective.ngOnInit();

    elementSpy.getBoundingClientRect.and.returnValue({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    } as DOMRect);

    const emitPromise = new Promise<InViewportEvent>(resolve => {
      inViewportDirective.appInViewportWatch.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    window.dispatchEvent(new Event('scroll'));

    await expectAsync(emitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        isInViewport: true,
      }),
    );
  });

  it('should check outside', async () => {
    const { elementSpy, inViewportDirective } = setup();
    inViewportDirective.appInViewportOffset = 0;
    inViewportDirective.ngOnInit();

    elementSpy.getBoundingClientRect.and.returnValue({
      top: window.innerHeight + 1,
      bottom: -1,
      left: window.innerWidth + 1,
      right: -1,
    } as DOMRect);

    const emitPromise = new Promise<InViewportEvent>(resolve => {
      inViewportDirective.appInViewportWatch.pipe(take(1)).subscribe({
        next: event => {
          resolve(event);
        },
      });
    });

    window.dispatchEvent(new Event('scroll'));

    await expectAsync(emitPromise).toBeResolvedTo(
      jasmine.objectContaining({
        isInViewport: false,
      }),
    );
  });
});
