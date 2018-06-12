import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { UserService } from '../_services/user.service';

@Component({templateUrl: 'home.component.html'})
export class HomeComponent implements OnInit {
    constructor(private userService: UserService) {}

    ngOnInit() {}
}
