import {
  DOCUMENT,
  Injectable,
  Renderer2,
  RendererFactory2,
  inject,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject<Document>(DOCUMENT);

  private renderer: Renderer2;

  constructor() {
    const rendererFactory = inject(RendererFactory2);

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
