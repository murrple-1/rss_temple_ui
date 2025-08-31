import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  ClrCommonFormsModule,
  ClrDatalistModule,
  ClrModalModule,
} from '@clr/angular';
import { Subject, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { ConfigService } from '@app/services';

import { FediverseInstanceValidatorDirective } from '../../../../directives/fediverse-instance-validator.directive';

@Component({
  selector: 'app-mastodon-share-modal',
  templateUrl: './mastodon-share-modal.component.html',
  styleUrls: ['./mastodon-share-modal.component.scss'],
  imports: [
    FormsModule,
    ClrCommonFormsModule,
    ClrModalModule,
    ClrDatalistModule,
    FediverseInstanceValidatorDirective,
  ],
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

  constructor() {
    const configService = inject(ConfigService);

    const configInstanceSuggestions = configService.get(
      'mastodonInstanceSuggestions',
    );
    let instanceSuggestions: string[] | null;
    if (Array.isArray(configInstanceSuggestions)) {
      if (
        configInstanceSuggestions.every(
          instanceSuggestion => typeof instanceSuggestion === 'string',
        )
      ) {
        instanceSuggestions = configInstanceSuggestions as string[];
      } else {
        instanceSuggestions = null;
      }
    } else {
      instanceSuggestions = null;
    }
    this.instanceSuggestions =
      instanceSuggestions !== null
        ? instanceSuggestions
        : ['mastodon.social', 'mastodon.online'];
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

    const shareText = `${this._title}\n\n${this._url}`;

    const finalUrl = `https://${this.instance}/share?text=${encodeURIComponent(
      shareText,
    )}`;

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
