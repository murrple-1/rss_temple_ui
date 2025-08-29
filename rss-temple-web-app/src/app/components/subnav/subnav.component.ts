import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { SubNavLinksService } from '@app/services';
import { SubNavLink } from '@app/services/subnav-links.service';

@Component({
  selector: 'app-subnav',
  templateUrl: './subnav.component.html',
  styleUrls: ['./subnav.component.scss'],
  standalone: false,
})
export class SubNavComponent {
  subNavLinks$: Observable<SubNavLink[]>;

  constructor() {
    const subNavLinksService = inject(SubNavLinksService);

    this.subNavLinks$ = subNavLinksService.subNavLinks$;
  }
}
