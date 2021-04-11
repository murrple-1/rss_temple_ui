import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  ConfirmModalComponent,
  openModal as openConfirmModal,
} from '@app/components/shared/confirm-modal/confirm-modal.component';
import { SessionService } from '@app/services';

interface NavLink {
  name: string;
  routerLink: string;
}

interface NavAction {
  clrIconShape: string;
  onClick: () => void;
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit, OnDestroy {
  private readonly loginLink: NavLink = {
    name: 'Login',
    routerLink: '/login',
  };
  private readonly homeLink: NavLink = {
    name: 'Home',
    routerLink: '/main/feeds',
  };
  private readonly exploreLink: NavLink = {
    name: 'Explore',
    routerLink: '/main/explore',
  };
  private readonly profileLink: NavLink = {
    name: 'Profile',
    routerLink: '/main/profile',
  };
  private readonly logoutAction: NavAction = {
    clrIconShape: 'logout',
    onClick: () => this.logout(),
  };

  navLinks: NavLink[] = [];
  navActions: NavAction[] = [];

  @ViewChild('logoutConfirmDialog', { static: true })
  private logoutConfirmDialog?: ConfirmModalComponent;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private router: Router,
    private sessionService: SessionService,
  ) {}

  ngOnInit() {
    this.sessionService.isLoggedIn$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: isLoggedIn => {
          this.zone.run(() => {
            if (isLoggedIn) {
              this.navLinks = [
                this.homeLink,
                this.exploreLink,
                this.profileLink,
              ];
              this.navActions = [this.logoutAction];
            } else {
              this.navLinks = [this.loginLink];
              this.navActions = [];
            }
          });
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private async logout() {
    if (this.logoutConfirmDialog === undefined) {
      throw new Error();
    }

    const result = await openConfirmModal(
      'Logout?',
      'Are you sure you want to log-out?',
      this.logoutConfirmDialog,
    );

    if (result) {
      this.sessionService.sessionToken$.next(null);

      this.router.navigate(['/login']);
    }
  }
}
