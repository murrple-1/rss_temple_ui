import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';

import { SnackbarModule } from 'ngx-snackbar';

import { routes } from '@app/app.routing';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SnackbarModule.forRoot(),

        RouterTestingModule.withRoutes(routes),
      ],
      declarations: [AppComponent],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/',
        },
      ],
    }).compileComponents();
  });
  it('should create the app', () => {
    const componentFixture = TestBed.createComponent(AppComponent);
    const component = componentFixture.debugElement
      .componentInstance as AppComponent;
    expect(component).toBeTruthy();
  });
});
