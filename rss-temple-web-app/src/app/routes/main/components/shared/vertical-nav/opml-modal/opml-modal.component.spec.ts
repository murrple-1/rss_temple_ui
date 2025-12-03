import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OPMLService, ProgressService } from '@app/services/data';

import { OPMLModalComponent } from './opml-modal.component';

describe('OPMLModalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ClarityModule,
        BrowserModule,
        RouterModule.forRoot([]),
        OPMLModalComponent,
      ],
      providers: [
        {
          provide: OPMLService,
          useValue: {
            upload: vi.fn().mockName('OPMLService.upload'),
          },
        },
        {
          provide: ProgressService,
          useValue: {
            checkProgress: vi.fn().mockName('ProgressService.checkProgress'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(OPMLModalComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
