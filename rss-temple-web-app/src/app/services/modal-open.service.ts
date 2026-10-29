import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalOpenService {
  private modalQueue: (() => Promise<unknown>)[] = [];
  private isDraining = false;
  private _isModalOpen = false;

  get isModalOpen() {
    return this._isModalOpen;
  }

  openModal(openModalPromiseFn: () => Promise<unknown>) {
    this.modalQueue.push(openModalPromiseFn);
    void this.drainQueue();
  }

  private async drainQueue() {
    if (this.isDraining) {
      return;
    }
    this.isDraining = true;
    try {
      let openModalPromiseFn: (() => Promise<unknown>) | undefined;
      while ((openModalPromiseFn = this.modalQueue.shift()) !== undefined) {
        this._isModalOpen = true;
        try {
          await openModalPromiseFn();
        } catch (error: unknown) {
          // a failed modal must not stall the queue for every later modal
          console.error('modal open function failed', error);
        }
      }
    } finally {
      this._isModalOpen = false;
      this.isDraining = false;
    }
  }
}
