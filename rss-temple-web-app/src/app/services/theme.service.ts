import {
  DOCUMENT,
  Inject,
  Injectable,
  Renderer2,
  RendererFactory2,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  init() {
    const theme = localStorage.getItem('theme-service:theme');
    if (theme === 'dark') {
      this.setBodyTheme('dark');
    } else {
      this.setBodyTheme('light');
    }
  }

  enableLightMode() {
    localStorage.setItem('theme-service:theme', 'light');
    this.setBodyTheme('light');
  }

  enableDarkMode() {
    localStorage.setItem('theme-service:theme', 'dark');
    this.setBodyTheme('dark');
  }

  private setBodyTheme(theme: 'light' | 'dark') {
    this.renderer.setAttribute(this.document.body, 'cds-theme', theme);
  }
}
