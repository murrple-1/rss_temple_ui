import { Component, OnInit } from '@angular/core';

import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Tour of Heroes';

  username: string = '';
  isLoggedIn: boolean = false;

  constructor(private sessionService: SessionService) {

  }

  ngOnInit() {
    this.isLoggedIn = this.sessionService.isLoggedIn();
  }

  logIn(username: string, password: string) {
    alert(username + ' ' + password);
  }
}
