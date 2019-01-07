import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'nav[rsst-nav-bar]',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  @HostBinding('class')
  _classes = 'navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow';
}
