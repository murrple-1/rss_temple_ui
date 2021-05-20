import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import {
  ConfirmModalComponent,
  openModal as openConfirmModal,
} from '@app/components/shared/confirm-modal/confirm-modal.component';
import { ModalOpenService, SessionService } from '@app/services';

interface NavLink {
  name: string;
  routerLink: string;
  routerLinkActiveAlt$: Observable<boolean>;
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
    routerLinkActiveAlt$: of(false),
  };
  private readonly homeLink: NavLink = {
    name: 'Home',
    routerLink: '/main/feeds',
    routerLinkActiveAlt$: this.router.events.pipe(
      filter(navEvent => navEvent instanceof NavigationEnd),
      map(navEvent => /^\/main\/feed/.test((navEvent as NavigationEnd).url)),
    ),
  };
  private readonly exploreLink: NavLink = {
    name: 'Explore',
    routerLink: '/main/explore',
    routerLinkActiveAlt$: of(false),
  };
  private readonly profileLink: NavLink = {
    name: 'Profile',
    routerLink: '/main/profile',
    routerLinkActiveAlt$: of(false),
  };
  private readonly supportLink: NavLink = {
    name: 'Support',
    routerLink: '/main/support',
    routerLinkActiveAlt$: of(false),
  };
  private readonly logoutAction: NavAction = {
    clrIconShape: 'logout',
    onClick: () => this.logout(),
  };

  navLinks: NavLink[] = [];
  navActions: NavAction[] = [];

  @ViewChild('logoutConfirmModal', { static: true })
  private logoutConfirmModal?: ConfirmModalComponent;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private router: Router,
    private sessionService: SessionService,
    private modalOpenService: ModalOpenService,
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
                this.supportLink,
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
    if (this.logoutConfirmModal === undefined) {
      throw new Error();
    }

    this.modalOpenService.isModalOpen$.next(true);
    const result = await openConfirmModal(
      'Logout?',
      'Are you sure you want to log-out?',
      this.logoutConfirmModal,
    );
    this.modalOpenService.isModalOpen$.next(false);

    if (result) {
      this.sessionService.sessionToken$.next(null);

      this.router.navigate(['/login']);
    }
  }
}
