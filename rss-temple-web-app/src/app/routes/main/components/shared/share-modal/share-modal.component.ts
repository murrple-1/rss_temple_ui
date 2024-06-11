import { Component, OnDestroy } from '@angular/core';
import {
  IShareButton,
  copyParams,
  emailParams,
  facebookParams,
  linkedInParams,
  pinterestParams,
  redditParams,
  smsParams,
  telegramParams,
  tumblrParams,
  whatsappParams,
  xParams,
} from 'ngx-sharebuttons';
import { Subject, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

export interface ShareButtonDescriptor {
  shareButton: IShareButton;
  title: string;
  iconName: string;
}

export const DefaultShareButtonDescriptors: ShareButtonDescriptor[] = [
  {
    shareButton: facebookParams,
    title: 'Facebook',
    iconName: 'brand-facebook',
  },
  {
    shareButton: xParams,
    title: 'Twitter/X',
    iconName: 'brand-twitter',
  },
  {
    shareButton: linkedInParams,
    title: 'LinkedIn',
    iconName: 'brand-linkedin',
  },
  {
    shareButton: pinterestParams,
    title: 'Pinterest',
    iconName: 'brand-pinterest',
  },
  {
    shareButton: redditParams,
    title: 'Reddit',
    iconName: 'brand-reddit',
  },
  {
    shareButton: tumblrParams,
    title: 'Tumblr',
    iconName: 'brand-tumblr',
  },
  {
    shareButton: telegramParams,
    title: 'Telegram',
    iconName: 'brand-telegram',
  },
  // TODO doesn't appear to work right now...
  // {
  //   shareButton: messengerParams,
  //   title: 'Facebook Messenger',
  //   iconName: 'brand-facebook-messenger',
  // },
  {
    shareButton: whatsappParams,
    title: 'WhatsApp',
    iconName: 'brand-whatsapp',
  },
  {
    shareButton: smsParams,
    title: 'SMS',
    iconName: 'talk-bubbles',
  },
  {
    shareButton: emailParams,
    title: 'Email',
    iconName: 'envelope',
  },
  {
    shareButton: copyParams,
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
