import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { ConfigService } from '@app/services';

@Component({
  selector: 'app-mastodon-share-modal',
  templateUrl: './mastodon-share-modal.component.html',
  styleUrls: ['./mastodon-share-modal.component.scss'],
})
export class MastodonShareModalComponent implements OnDestroy {
  open = false;

  _title = '';
  _url = '';

  @Input()
  instance = '';

  @Output()
  instanceChange = new EventEmitter<string>();

  instanceSuggestions: string[];

  @ViewChild('shareForm', { static: true })
  shareForm?: NgForm;

  result = new Subject<string | null>();

  constructor(configService: ConfigService) {
    const instanceSuggestions = configService.get(
      'mastodonInstanceSuggestions',
    );
    this.instanceSuggestions = Array.isArray(instanceSuggestions)
      ? (instanceSuggestions as string[])
      : [];
  }

  ngOnDestroy() {
    this.result.complete();
  }

  _instanceChanged(searchText: string) {
    this.instance = searchText;
    this.instanceChange.emit(searchText);
  }

  reset() {
    if (this.shareForm === undefined) {
      throw new Error('shareForm undefined');
    }

    this.shareForm.reset({
      instance: '',
    });
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next(null);
    }

    this.open = open;
  }

  onSearch() {
    if (this.shareForm === undefined) {
      throw new Error('shareForm undefined');
    }

    if (this.shareForm.invalid) {
      return;
    }

    const finalUrl = `https://${this.instance}/share?text=${encodeURIComponent(
      this._title,
    )}%0A${encodeURIComponent(this._url)}`;

    this.result.next(finalUrl);

    this.open = false;
  }
}

export function openModal(
  title: string,
  url: string,
  modal: MastodonShareModalComponent,
) {
  modal._title = title;
  modal._url = url;
  modal.reset();
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
