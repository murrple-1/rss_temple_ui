import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import {
  ConfirmModalComponent,
  openModal as openConfirmModal,
} from '@app/components/shared/confirm-modal/confirm-modal.component';
import { deleteSessionToken } from '@app/libs/session.lib';

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
export class NavComponent implements OnInit {
  private readonly loginLink: NavLink = {
    name: 'Login',
    routerLink: '/login',
  };
  private readonly homeLink: NavLink = {
    name: 'Home',
    routerLink: '/home',
  };
  private readonly logoutAction: NavAction = {
    clrIconShape: 'logout',
    onClick: this.logout.bind(this),
  };

  navLinks: NavLink[] = [];
  navActions: NavAction[] = [];

  @ViewChild('logoutConfirmDialog', { static: true })
  private logoutConfirmDialog?: ConfirmModalComponent;

  constructor(private router: Router) {}

  ngOnInit() {
    // TODO implement nav changes
  }

  private async logout() {
    if (this.logoutConfirmDialog === undefined) {
      throw new Error('logoutConfirmDialog undefined');
    }

    await openConfirmModal(
      'Logout?',
      'Are you sure you want to log-out?',
      this.logoutConfirmDialog,
    );
  }

  onLogoutConfirmClose(result: boolean) {
    if (result) {
      deleteSessionToken();

      this.router.navigate(['/login'], {
        replaceUrl: true,
      });
    }
  }
}
