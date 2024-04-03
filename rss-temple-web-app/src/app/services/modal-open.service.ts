import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, skip, takeUntil, zip } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalOpenService implements OnDestroy {
  private modalQueue$ = new BehaviorSubject<(() => Promise<unknown>)[]>([]);
  private stepper$ = new Subject<void>();
  private _isModalOpen = false;

  private unsubscribe$ = new Subject<void>();

  get isModalOpen() {
    return this._isModalOpen;
  }

  constructor() {
    zip(this.modalQueue$.pipe(skip(1)), this.stepper$)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: async ([modalQueue]) => {
          if (modalQueue.length === 0) {
            this._isModalOpen = false;
          } else {
            this._isModalOpen = true;
            const first = modalQueue[0] as () => Promise<unknown>;
            await first();
            this.modalQueue$.next(modalQueue.slice(1));
          }
          this.stepper$.next();
        },
      });

    this.stepper$.next();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  openModal(openModalPromiseFn: () => Promise<unknown>) {
    this.modalQueue$.next([...this.modalQueue$.getValue(), openModalPromiseFn]);
  }
}
