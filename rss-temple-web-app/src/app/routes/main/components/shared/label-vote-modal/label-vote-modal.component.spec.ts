import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { ShareButtonDirective } from 'ngx-sharebuttons';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClassifierLabelService } from '@app/services/data';

import { LabelVoteModalComponent } from './label-vote-modal.component';

describe('LabelVoteModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserModule,
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
