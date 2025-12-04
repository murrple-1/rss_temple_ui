import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { ShareButtonDirective } from 'ngx-sharebuttons';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClassifierLabelService } from '@app/services/data';

import { LabelVoteModalComponent } from './label-vote-modal.component';

describe('LabelVoteModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        // TODO should be replacable when Clarity v18\+ is released/used
        BrowserAnimationsModule,
        ClarityModule,
        ShareButtonDirective,
        LabelVoteModalComponent,
      ],
      providers: [
        {
          provide: ClassifierLabelService,
          useValue: {
            getAll: vi.fn().mockName('ClassifierLabelService.getAll'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(LabelVoteModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });
});
