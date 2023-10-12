import { Component, OnDestroy } from '@angular/core';
import { shareButtonName } from 'ngx-sharebuttons';
import { Subject, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

export interface ShareButtonDescriptor {
  shareButtonName: shareButtonName;
  title: string;
  iconName: string;
}

export const DefaultShareButtonDescriptors: ShareButtonDescriptor[] = [
  {
    shareButtonName: 'facebook',
    title: 'Facebook',
    iconName: 'brand-facebook',
  },
  {
    shareButtonName: 'twitter',
    title: 'Twitter/X',
    iconName: 'brand-twitter',
  },
  {
    shareButtonName: 'linkedin',
    title: 'LinkedIn',
    iconName: 'brand-linkedin',
  },
  {
    shareButtonName: 'pinterest',
    title: 'Pinterest',
    iconName: 'brand-pinterest',
  },
  {
    shareButtonName: 'reddit',
    title: 'Reddit',
    iconName: 'brand-reddit',
  },
  {
    shareButtonName: 'tumblr',
    title: 'Tumblr',
    iconName: 'brand-tumblr',
  },
  {
    shareButtonName: 'telegram',
    title: 'Telegram',
    iconName: 'brand-telegram',
  },
  // TODO doesn't appear to work right now...
  // {
  //   shareButtonName: 'messenger',
  //   title: 'Facebook Messenger',
  //   iconName: 'brand-facebook-messenger',
  // },
  {
    shareButtonName: 'whatsapp',
    title: 'WhatsApp',
    iconName: 'brand-whatsapp',
  },
  {
    shareButtonName: 'sms',
    title: 'SMS',
    iconName: 'talk-bubbles',
  },
  {
    shareButtonName: 'email',
    title: 'Email',
    iconName: 'envelope',
  },
  {
    shareButtonName: 'copy',
    title: 'Copy to Clipboard',
    iconName: 'clipboard',
  },
];

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.scss'],
})
export class ShareModalComponent implements OnDestroy {
  open = false;

  url = '';
  title = '';
  shouldUseWebShareAPI = true;

  readonly isWebShareAPIAvailable = Boolean(navigator.share);

  shareButtonDescriptors: ShareButtonDescriptor[] =
    DefaultShareButtonDescriptors;

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

  async webShare() {
    if (!navigator.share) {
      return;
    }

    try {
      await navigator.share({
        url: this.url,
        title: this.title,
      });
    } catch (err: unknown) {
      console.error(err);
    }
  }

  close() {
    this.result.next();

    this.open = false;
  }
}

export function openModal(
  url: string,
  title: string,
  modal: ShareModalComponent,
  shareButtonDescriptors?: ShareButtonDescriptor[],
  shouldUseWebShareAPI = true,
) {
  modal.url = url;
  modal.title = title;
  modal.shareButtonDescriptors =
    shareButtonDescriptors ?? DefaultShareButtonDescriptors;
  modal.shouldUseWebShareAPI = shouldUseWebShareAPI;
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
