import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
} from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { z } from 'zod';

import {
  SearchModalComponent,
  openModal as openSearchModal,
} from '@app/components/nav/search-modal/search-modal.component';
import {
  ConfirmModalComponent,
  openModal as openConfirmModal,
} from '@app/components/shared/confirm-modal/confirm-modal.component';
import {
  AuthStateService,
  ConfigService,
  ModalOpenService,
} from '@app/services';
import { AuthService } from '@app/services/data';

const ZExtraNavLink = z.object({
  title: z.string(),
  href: z.string().url(),
});

interface _NavLink {
  name: string;
}

interface _NavLinkHref extends _NavLink {
  href: string;
  target?: string;
}

interface _NavLinkRouterLink extends _NavLink {
  routerLink: string;
  routerLinkActiveAlt$: Observable<boolean>;
}

type NavLink = _NavLinkHref | _NavLinkRouterLink;

interface NavAction {
  clrIconShape: string;
  onClick: () => void;
  classes: string | string[] | Set<string> | { [klass: string]: unknown };
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
    shareReplay(1),
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
      map(navEnd => /^\/main\/feeds/.test(navEnd.urlAfterRedirects)),
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
    routerLink: '/support',
    routerLinkActiveAlt$: this.navEnd$.pipe(
      map(navEnd => /^\/support/.test(navEnd.urlAfterRedirects)),
    ),
  };
  private readonly searchAction: NavAction = {
    clrIconShape: 'search',
    onClick: () => this.showSearchModal(),
    classes: { 'app--search-action': true },
  };
  private readonly lightModeAction: NavAction = {
    clrIconShape: 'lightbulb',
    onClick: () => this.enableLightMode(),
    classes: { 'app--light-mode-action': true },
  };
  private readonly darkModeAction: NavAction = {
    clrIconShape: 'lightbulb',
    onClick: () => this.enableDarkMode(),
    classes: { 'app--dark-mode-action': true },
  };
  private readonly logoutAction: NavAction = {
    clrIconShape: 'logout',
    onClick: () => this.logout(),
    classes: {},
  };

  navLinks: NavLink[] = [];
  navActions: NavAction[] = [];

  isSearchVisible = false;
  searchText = '';

  @ViewChild(ConfirmModalComponent, { static: true })
  private logoutConfirmModal?: ConfirmModalComponent;

  @ViewChild(SearchModalComponent, { static: true })
  private searchModal?: SearchModalComponent;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private authStateService: AuthStateService,
    private modalOpenService: ModalOpenService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  ngOnInit() {
    const extraNavLinkSafeParse = z
      .array(ZExtraNavLink)
      .safeParse(this.configService.get('extraNavLinks'));

    let extraNavLinks: NavLink[];
    if (extraNavLinkSafeParse.success) {
      extraNavLinks = extraNavLinkSafeParse.data.map(enl => ({
        name: enl.title,
        href: enl.href,
        target: '_blank',
      }));
    } else {
      extraNavLinks = [];
    }

    this.authStateService.isLoggedIn$
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
                ...extraNavLinks,
              ];
              this.navActions = [
                this.searchAction,
                this.lightModeAction,
                this.darkModeAction,
                this.logoutAction,
              ];
              this.isSearchVisible = true;
            } else {
              this.navLinks = [
                this.loginLink,
                this.supportLink,
                ...extraNavLinks,
              ];
              this.navActions = [this.lightModeAction, this.darkModeAction];
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

  private async smartSearch(searchText: string) {
    let route: ActivatedRouteSnapshot | null = this.route.snapshot;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    if (route.routeConfig?.path === 'search/feeds') {
      await this.router.navigate(['/main/search/feeds', { searchText }]);
    } else {
      await this.router.navigate(['/main/search/entries', { searchText }]);
    }
  }

  async onSearch() {
    const searchText = this.searchText.trim();
    if (searchText.length < 1) {
      return;
    }

    await this.smartSearch(searchText);
  }

  private async showSearchModal() {
    const searchModal = this.searchModal;
    if (searchModal === undefined) {
      throw new Error('searchModal undefined');
    }

    this.modalOpenService.openModal(async () => {
      let searchText = await openSearchModal(searchModal);
      if (searchText !== null) {
        searchText = searchText.trim();
        if (searchText.length < 1) {
          return;
        }

        await this.smartSearch(searchText);
      }
    });
  }

  private async enableDarkMode() {
    this.renderer.setAttribute(this.document.body, 'cds-theme', 'dark');

    // TODO save this preference
  }

  private async enableLightMode() {
    this.renderer.setAttribute(this.document.body, 'cds-theme', 'light');

    // TODO save this preference
  }

  private async logout() {
    const logoutConfirmModal = this.logoutConfirmModal;
    if (logoutConfirmModal === undefined) {
      throw new Error();
    }

    this.modalOpenService.openModal(async () => {
      const result = await openConfirmModal(
        'Logout?',
        'Are you sure you want to log-out?',
        logoutConfirmModal,
      );

      if (result) {
        this.authService
          .logout()
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: () => {
              this.authStateService.removeLoggedInFlagFromCookieStorage();
              this.authStateService.removeLoggedInFlagFromLocalStorage();
              this.authStateService.isLoggedIn$.next(false);

              this.router.navigate(['/login']);
            },
            error: error => {
              console.error(error);
            },
          });
      }
    });
  }
}
