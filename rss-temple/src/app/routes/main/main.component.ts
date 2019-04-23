import { Component } from '@angular/core';

@Component({
  selector: 'main-layout',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  collapedSideBar = false;

  receiveCollapsed($event: boolean) {
    this.collapedSideBar = $event;
  }
}
