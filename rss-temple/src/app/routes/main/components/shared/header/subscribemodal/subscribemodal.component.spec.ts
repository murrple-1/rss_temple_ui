import { TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SubscribeModalComponent } from './subscribemodal.component';

async function setup() {
  const mockActiveModal = jasmine.createSpyObj<NgbActiveModal>(
    'NgbActiveModal',
    ['dismiss', 'close'],
  );

  await TestBed.configureTestingModule({
    imports: [ReactiveFormsModule],
    declarations: [SubscribeModalComponent],
    providers: [
      {
        provide: NgbActiveModal,
        useValue: mockActiveModal,
      },
    ],
  }).compileComponents();

  return {};
}

describe('SubscribeModalComponent', () => {
  it(
    'should create the component',
    waitForAsync(async () => {
      await setup();

      const componentFixture = TestBed.createComponent(SubscribeModalComponent);
      const component = componentFixture.debugElement
        .componentInstance as SubscribeModalComponent;
      expect(component).toBeTruthy();
    }),
  );

  // TODO more tests
});
