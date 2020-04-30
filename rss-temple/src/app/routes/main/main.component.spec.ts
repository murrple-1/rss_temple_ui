import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';

import { routes } from '@app/app.routing';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [MainComponent],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/',
        },
      ],
    }).compileComponents();
  });
  it('should create the app', () => {
    const componentFixture = TestBed.createComponent(MainComponent);
    const component = componentFixture.debugElement
      .componentInstance as MainComponent;
    expect(component).toBeTruthy();
  });

  it('handles collapsed events', () => {
    const componentFixture = TestBed.createComponent(MainComponent);
    const component = componentFixture.debugElement
      .componentInstance as MainComponent;

    expect(component.collapedSideBar).toBeFalse();

    component.receiveCollapsed(false);
    expect(component.collapedSideBar).toBeFalse();

    component.receiveCollapsed(true);
    expect(component.collapedSideBar).toBeTrue();
  });
});
