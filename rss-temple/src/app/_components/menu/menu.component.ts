import { Component } from '@angular/core';

@Component({
  selector: 'rsst-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  menuItems = [
    {
      name: 'Main',
      routerLink: ['/main'],
      active: true,
    },
  ];
}
