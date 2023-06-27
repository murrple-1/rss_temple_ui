import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { Observable, Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import {
  ConfirmModalComponent,
  openModal as openConfirmModal,
} from '@app/components/shared/confirm-modal/confirm-modal.component';
import { ModalOpenService, APISessionService } from '@app/services';

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
  private readonly navEnd$ = this.router.events.pipe(
    filter(navEvent => navEvent instanceof NavigationEnd),
    map(navEvent => navEvent as NavigationEnd),
    share(),
  );

  private readonly loginLink: NavLink = {
    name: 'Login',
    routerLink: '/login',
    routerLinkActiveAlt$: this.navEnd$.pipe(
      map(navEnd => /^\/login/.test(navEnd.urlAfterRedirects)),
    ),
  };
  private readonly homeLink: NavLink = {
    name: 'Home',
    routerLink: '/main/feeds',
    routerLinkActiveAlt$: this.navEnd$.pipe(
      map(navEnd => /^\/main\/feed/.test(navEnd.urlAfterRedirects)),
    ),
  };
  private readonly exploreLink: NavLink = {
    name: 'Explore',
    routerLink: '/main/explore',
    routerLinkActiveAlt$: this.navEnd$.pipe(
      map(navEnd => /^\/main\/explore/.test(navEnd.urlAfterRedirects)),
    ),
  };
  private readonly profileLink: NavLink = {
    name: 'Profile',
    routerLink: '/main/profile',
    routerLinkActiveAlt$: this.navEnd$.pipe(
      map(navEnd => /^\/main\/profile/.test(navEnd.urlAfterRedirects)),
    ),
  };
  private readonly supportLink: NavLink = {
    name: 'Support',
    routerLink: '/main/support',
    routerLinkActiveAlt$: this.navEnd$.pipe(
      map(navEnd => /^\/main\/support/.test(navEnd.urlAfterRedirects)),
    ),
  };
  private readonly logoutAction: NavAction = {
    clrIconShape: 'logout',
    onClick: () => this.logout(),
  };

  navLinks: NavLink[] = [];
  navActions: NavAction[] = [];

  isSearchVisible = false;
  searchText = '';

  @ViewChild('logoutConfirmModal', { static: true })
  private logoutConfirmModal?: ConfirmModalComponent;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private router: Router,
    private apiSessionService: APISessionService,
    private modalOpenService: ModalOpenService,
  ) {}

  ngOnInit() {
    this.apiSessionService.isLoggedIn$
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
              this.isSearchVisible = true;
            } else {
              this.navLinks = [this.loginLink];
              this.navActions = [];
              this.isSearchVisible = false;
            }
          });
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSearch() {
    const searchText = this.searchText.trim();
    if (searchText.length < 1) {
      return;
    }

    this.router.navigate(['/main/search', { searchText }]);
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
      this.apiSessionService.sessionId$.next(null);

      this.router.navigate(['/login']);
    }
  }
}
