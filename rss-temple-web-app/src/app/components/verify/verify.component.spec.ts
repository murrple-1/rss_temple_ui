import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RegistrationService } from '@app/services/data';

import { VerifyComponent } from './verify.component';

describe('VerifyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), VerifyComponent],
      providers: [
        {
          provide: RegistrationService,
          useValue: {
            verifyEmail: vi.fn().mockName('RegistrationService.verifyEmail'),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the component', async () => {
    const componentFixture = TestBed.createComponent(VerifyComponent);
    const component = componentFixture.componentInstance;
    expect(component).toBeTruthy();
    componentFixture.detectChanges();
    await componentFixture.whenStable();
  });

  // TODO more tests
});
