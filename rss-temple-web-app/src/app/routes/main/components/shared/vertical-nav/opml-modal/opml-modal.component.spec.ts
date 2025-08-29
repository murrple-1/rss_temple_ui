import { TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';

import { OPMLService, ProgressService } from '@app/services/data';

import { OPMLModalComponent } from './opml-modal.component';

describe('OPMLModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([]),
      ],
      declarations: [OPMLModalComponent],
      providers: [
        {
          provide: OPMLService,
          useValue: jasmine.createSpyObj<OPMLService>('OPMLService', [
            'upload',
          ]),
        },
        {
          provide: ProgressService,
          useValue: jasmine.createSpyObj<ProgressService>('ProgressService', [
            'checkProgress',
          ]),
        },
      ],
    }).compileComponents();
  });

  it('should create the component', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(OPMLModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));

  // TODO more tests
});
