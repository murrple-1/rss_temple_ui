import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClarityModule } from '@clr/angular';

import { AppAlertsComponent } from '@app/components/app-alerts/app-alerts.component';
import { NavComponent } from '@app/components/nav/nav.component';
import { SubNavComponent } from '@app/components/subnav/subnav.component';
import { ConfirmModalComponent } from '@app/components/shared/confirm-modal/confirm-modal.component';

import { AppComponent } from './app.component';

function setup() {
  TestBed.configureTestingModule({
    imports: [
      BrowserAnimationsModule,
      ClarityModule,
      RouterTestingModule.withRoutes([]),
    ],
    declarations: [
      AppComponent,
      AppAlertsComponent,
      NavComponent,
      SubNavComponent,
      ConfirmModalComponent,
    ],
    providers: [
      {
        provide: APP_BASE_HREF,
        useValue: '/',
      },
    ],
  }).compileComponents();
}

describe('AppComponent', () => {
  it('should create the app', () => {
    setup();

    const componentFixture = TestBed.createComponent(AppComponent);
    const component = componentFixture.debugElement
      .componentInstance as AppComponent;
    expect(component).toBeTruthy();
  });
});
