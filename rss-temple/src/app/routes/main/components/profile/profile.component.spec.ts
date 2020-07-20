import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { SnackbarModule } from 'ngx-snackbar';

import { FeedService, FeedEntryService, UserService } from '@app/services/data';

import { ProfileComponent } from './profile.component';

async function setup() {
  const mockFeedService = jasmine.createSpyObj<FeedService>('FeedService', [
    'query',
  ]);
  const mockFeedEntryService = jasmine.createSpyObj<FeedEntryService>(
    'FeedEntryService',
    ['query'],
  );
  const mockUserService = jasmine.createSpyObj<UserService>('UserService', [
    'get',
    'update',
  ]);

  await TestBed.configureTestingModule({
    imports: [
      ReactiveFormsModule,

      SnackbarModule.forRoot(),

      RouterTestingModule.withRoutes([]),
    ],
    declarations: [ProfileComponent],
    providers: [
      {
        provide: FeedService,
        useValue: mockFeedService,
      },
      {
        provide: FeedEntryService,
        useValue: mockFeedEntryService,
      },
      {
        provide: UserService,
        useValue: mockUserService,
      },
    ],
  }).compileComponents();

  return {
    mockFeedService,
    mockFeedEntryService,
    mockUserService,
  };
}

describe('ProfileComponent', () => {
  it('should create the component', async(async () => {
    await setup();

    const componentFixture = TestBed.createComponent(ProfileComponent);
    const component = componentFixture.debugElement
      .componentInstance as ProfileComponent;
    expect(component).toBeTruthy();
  }));

  // TODO more tests
});
