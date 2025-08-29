import { TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { ShareButtonDirective } from 'ngx-sharebuttons';

import { ClassifierLabelService } from '@app/services/data';

import { LabelVoteModalComponent } from './label-vote-modal.component';

describe('LabelVoteModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ClarityModule, ShareButtonDirective],
      declarations: [LabelVoteModalComponent],
      providers: [
        {
          provide: ClassifierLabelService,
          useValue: jasmine.createSpyObj<ClassifierLabelService>(
            'ClassifierLabelService',
            ['getAll'],
          ),
        },
      ],
    }).compileComponents();
  });

  it('should create the component', waitForAsync(async () => {
    const componentFixture = TestBed.createComponent(LabelVoteModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  }));
});
