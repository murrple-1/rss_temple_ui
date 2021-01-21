import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

export interface SubNavLink {
  text: string;
  routerLink: string;
}

@Injectable({
  providedIn: 'root',
})
export class SubNavLinksService {
  readonly subNavLinks$ = new BehaviorSubject<SubNavLink[]>([]);
}
