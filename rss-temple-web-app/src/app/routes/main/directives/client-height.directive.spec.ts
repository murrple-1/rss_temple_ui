import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientHeightDirective } from './client-height.directive';

@Component({
  imports: [ClientHeightDirective],
  template:
    '<div appClientHeight #clientHeight="appClientHeight">{{ clientHeight.height() }}</div>',
})
class TestComponent {}

describe('ClientHeightDirective', () => {
  let resizeCallbacks: (() => void)[];
  let disconnect: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    resizeCallbacks = [];
    disconnect = vi.fn();

    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resizeCallbacks.push(callback);
        }
        observe() {
          // the test fires the callbacks by hand
        }
        disconnect = disconnect;
      },
    );

    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function setup() {
    const componentFixture = TestBed.createComponent(TestComponent);
    componentFixture.detectChanges();

    const element = (
      componentFixture.nativeElement as HTMLElement
    ).querySelector('div') as HTMLElement;
    let clientHeight = 0;
    Object.defineProperty(element, 'clientHeight', {
      get: () => clientHeight,
    });

    const resize = (height: number) => {
      clientHeight = height;
      resizeCallbacks.forEach(callback => callback());
      componentFixture.detectChanges();
    };

    return { componentFixture, element, resize };
  }

  it('should start at 0', () => {
    const { element } = setup();
    expect(element.textContent).toBe('0');
  });

  it('should follow the height of the element', () => {
    const { element, resize } = setup();
    resize(740);
    expect(element.textContent).toBe('740');
    resize(1240);
    expect(element.textContent).toBe('1240');
  });

  it('should stop observing when destroyed', () => {
    const { componentFixture } = setup();
    componentFixture.destroy();
    expect(disconnect).toHaveBeenCalled();
  });
});
