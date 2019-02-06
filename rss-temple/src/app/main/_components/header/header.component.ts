import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'nav[rsst-header]',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private readonly pushRightClass = 'push-right';

  private readonly _classes: string[] = [
    'navbar',
    'navbar-expand-lg',
    'fixed-top',
  ];

  constructor(
    public router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) {
    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd && window.innerWidth <= 992 && this.isToggled()) {
        document.querySelector('body').classList.remove(this.pushRightClass);
      }
    });

    const elem = this.elementRef.nativeElement;
    for (const _class of this._classes) {
      this.renderer.addClass(elem, _class);
    }
  }

  private isToggled() {
    return document.querySelector('body').classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    document.querySelector('body').classList.toggle(this.pushRightClass);
  }
}
