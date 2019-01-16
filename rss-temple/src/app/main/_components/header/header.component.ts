import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'nav[rsst-header]',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    public pushRightClass = 'push-right';

    private readonly _classes: string[] = [
        'navbar',
        'navbar-expand-lg',
        'fixed-top',
    ];

    constructor(
        public router: Router,
        private elementRef: ElementRef,
        private renderer: Renderer2
    ) {
        this.router.events.subscribe(val => {
            if (
                val instanceof NavigationEnd &&
                window.innerWidth <= 992 &&
                this.isToggled()
            ) {
                this.toggleSidebar();
            }
        });

        const elem = this.elementRef.nativeElement;
        for (const _class of this._classes) {
            this.renderer.addClass(elem, _class);
        }
    }

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    onLoggedout() {
        localStorage.removeItem('isLoggedin');
    }
}
