import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { SnackbarModule } from 'ngx-snackbar';

import { routes } from '@app/app.routing';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SnackbarModule.forRoot(), RouterModule.forRoot(routes)],
      declarations: [AppComponent],
    }).compileComponents();
  });
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance as AppComponent;
    expect(app).toBeTruthy();
  });
});
