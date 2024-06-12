import { Renderer2, RendererFactory2 } from '@angular/core';

import { ThemeService } from './theme.service';

function setup() {
  const renderer2 = jasmine.createSpyObj<Renderer2>('Renderer2', [
    'setAttribute',
  ]);
  const rendererFactory2 = jasmine.createSpyObj<RendererFactory2>(
    'RendererFactory2',
    ['createRenderer'],
  );
  rendererFactory2.createRenderer.and.returnValue(renderer2);

  const themeService = new ThemeService(document, rendererFactory2);

  return {
    themeService,
  };
}

describe('ThemeService', () => {
  it('should construct', () => {
    const { themeService } = setup();

    expect(themeService).not.toBeNull();
  });
});
