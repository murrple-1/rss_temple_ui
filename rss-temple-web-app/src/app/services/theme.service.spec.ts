import { Renderer2, RendererFactory2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    const renderer2 = jasmine.createSpyObj<Renderer2>('Renderer2', [
      'setAttribute',
    ]);
    const rendererFactory2 = jasmine.createSpyObj<RendererFactory2>(
      'RendererFactory2',
      ['createRenderer'],
    );
    rendererFactory2.createRenderer.and.returnValue(renderer2);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Renderer2,
          useValue: renderer2,
        },
        {
          provide: RendererFactory2,
          useValue: rendererFactory2,
        },
      ],
    });
  });

  it('should construct', () => {
    const themeService = TestBed.inject(ThemeService);
    expect(themeService).not.toBeNull();
  });
});
