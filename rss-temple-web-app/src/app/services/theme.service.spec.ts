import { Renderer2, RendererFactory2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    const renderer2 = {
      setAttribute: vi.fn().mockName('Renderer2.setAttribute'),
    };
    const rendererFactory2 = {
      createRenderer: vi.fn().mockName('RendererFactory2.createRenderer'),
    };
    rendererFactory2.createRenderer.mockReturnValue(renderer2);

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
