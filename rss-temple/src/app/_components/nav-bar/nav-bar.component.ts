import { Component, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'nav[rsst-nav-bar]',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  private readonly _classes: string[] = [
    'navbar',
    'navbar-dark',
    'fixed-top',
    'bg-dark',
    'flex-md-nowrap',
    'p-0',
    'shadow',
  ];

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {
    const elem = this.elementRef.nativeElement;
    for (const _class of this._classes) {
      this.renderer.addClass(elem, _class);
    }
  }
}
