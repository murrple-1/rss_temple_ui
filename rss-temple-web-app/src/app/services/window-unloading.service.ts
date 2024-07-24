import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WindowUnloadingService implements OnDestroy {
  private windowBeforeUnloadListener: (() => void) | null = null;
  windowIsUnloading = false;

  constructor() {
    this.windowBeforeUnloadListener = () => {
      this.windowIsUnloading = true;
    };

    window.addEventListener('beforeunload', this.windowBeforeUnloadListener);
  }

  ngOnDestroy() {
    if (this.windowBeforeUnloadListener !== null) {
      window.removeEventListener(
        'beforeunload',
        this.windowBeforeUnloadListener,
      );
    }
  }
}
