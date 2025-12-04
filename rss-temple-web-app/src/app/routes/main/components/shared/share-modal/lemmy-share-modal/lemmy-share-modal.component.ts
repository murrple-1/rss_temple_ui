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

import { FediverseInstanceValidatorDirective } from '@app/routes/main/directives/fediverse-instance-validator.directive';
import { ConfigService } from '@app/services';

@Component({
  selector: 'app-lemmy-share-modal',
  templateUrl: './lemmy-share-modal.component.html',
  styleUrls: ['./lemmy-share-modal.component.scss'],
  imports: [
    FormsModule,
    ClrCommonFormsModule,
    ClrModalModule,
    ClrDatalistModule,
    FediverseInstanceValidatorDirective,
  ],
})
export class LemmyShareModalComponent implements OnDestroy {
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
      'lemmyInstanceSuggestions',
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
        : ['lemmy.world', 'lemmy.ml', 'lemm.ee', 'lemmy.zip'];
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

    const finalUrl = `https://${
      this.instance
    }/create_post?title=${encodeURIComponent(
      this._title,
    )}&url=${encodeURIComponent(this._url)}`;

    this.result.next(finalUrl);

    this.open = false;
  }
}

export function openModal(
  title: string,
  url: string,
  modal: LemmyShareModalComponent,
) {
  modal._title = title;
  modal._url = url;
  modal.reset();
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
