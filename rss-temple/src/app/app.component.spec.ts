import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';

import { SnackbarModule } from 'ngx-snackbar';

import { AppComponent } from './app.component';

function setup() {
  TestBed.configureTestingModule({
    imports: [SnackbarModule.forRoot(), RouterTestingModule.withRoutes([])],
    declarations: [AppComponent],
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
