import { Component, OnDestroy } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

export type InfoType = 'info' | 'success' | 'warning' | 'danger' | 'none';

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss'],
})
export class InfoModalComponent implements OnDestroy {
  open = false;

  title = '';
  text = '';
  infoType: InfoType = 'none';

  get isIconVisible() {
    return this.infoType !== 'none';
  }

  get iconShape() {
    switch (this.infoType) {
      case 'danger': {
        return 'exclamation-triangle';
      }
      case 'warning': {
        return 'exclamation-triangle';
      }
      case 'success': {
        return 'exclamation-circle';
      }
      case 'info': {
        return 'exclamation-circle';
      }
      default: {
        return undefined;
      }
    }
  }

  get iconStatus() {
    switch (this.infoType) {
      case 'danger': {
        return 'danger';
      }
      case 'warning': {
        return 'warning';
      }
      case 'success': {
        return 'success';
      }
      case 'info': {
        return 'info';
      }
      default: {
        return undefined;
      }
    }
  }

  result = new Subject<void>();

  ngOnDestroy() {
    this.result.complete();
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next();
    }

    this.open = open;
  }

  onOk() {
    this.result.next();

    this.open = false;
  }
}

export function openModal(
  title: string,
  text: string,
  type: InfoType,
  modal: InfoModalComponent,
) {
  modal.title = title;
  modal.text = text;
  modal.infoType = type;
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
