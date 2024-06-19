import { Component, OnDestroy, ViewChild } from '@angular/core';
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

import {
  LemmyShareModalComponent,
  openModal as openLemmyShareModal,
} from '@app/routes/main/components/shared/share-modal/lemmy-share-modal/lemmy-share-modal.component';
import {
  MastodonShareModalComponent,
  openModal as openMastodonShareModal,
} from '@app/routes/main/components/shared/share-modal/mastodon-share-modal/mastodon-share-modal.component';

interface _ShareButtonDescriptor {
  iconName: string;
}

interface _NgxShareButtonsShareButtonDescriptor extends _ShareButtonDescriptor {
  shareButton: IShareButton;
}

interface _CustomShareButtonDescriptor extends _ShareButtonDescriptor {
  customShareButton: {
    text: string;
    onClick: () => void;
  };
}

type ShareButtonDescriptor =
  | _NgxShareButtonsShareButtonDescriptor
  | _CustomShareButtonDescriptor;

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

  shareButtonDescriptors: ShareButtonDescriptor[] = [
    {
      shareButton: facebookParams,
      iconName: 'brand-facebook',
    },
    {
      shareButton: xParams,
      iconName: 'brand-twitter-x',
    },
    {
      shareButton: linkedInParams,
      iconName: 'brand-linkedin',
    },
    {
      shareButton: pinterestParams,
      iconName: 'brand-pinterest',
    },
    {
      shareButton: redditParams,
      iconName: 'brand-reddit',
    },
    {
      shareButton: tumblrParams,
      iconName: 'brand-tumblr',
    },
    {
      customShareButton: {
        text: 'Lemmy…',
        onClick: () => this.lemmyShare(),
      },
      iconName: 'brand-lemmy',
    },
    {
      customShareButton: {
        text: 'Mastodon…',
        onClick: () => this.mastodonShare(),
      },
      iconName: 'brand-mastodon',
    },
    {
      shareButton: telegramParams,
      iconName: 'brand-telegram',
    },
    // TODO to implement, see https://github.com/MurhafSousli/ngx-sharebuttons/wiki/Using-Messenger-on-Desktop
    // {
    //   kind: 'ngx-sharebuttons',
    //   shareButton: messengerParams,
    //   iconName: 'brand-facebook-messenger',
    // },
    {
      shareButton: whatsappParams,
      iconName: 'brand-whatsapp',
    },
    {
      shareButton: smsParams,
      iconName: 'talk-bubbles',
    },
    {
      shareButton: emailParams,
      iconName: 'envelope',
    },
    {
      shareButton: copyParams,
      iconName: 'clipboard',
    },
  ];

  @ViewChild(LemmyShareModalComponent, { static: true })
  lemmyShareModal?: LemmyShareModalComponent;

  @ViewChild(MastodonShareModalComponent, { static: true })
  mastodonShareModal?: MastodonShareModalComponent;

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

  async lemmyShare() {
    const lemmyShareModal = this.lemmyShareModal;
    if (lemmyShareModal === undefined) {
      throw new Error('lemmyShareModal undefined');
    }

    const url = await openLemmyShareModal(
      this.title,
      this.url,
      lemmyShareModal,
    );
    if (url !== null) {
      window.open(url, '_blank');
    }
  }

  async mastodonShare() {
    const mastodonShareModal = this.mastodonShareModal;
    if (mastodonShareModal === undefined) {
      throw new Error('mastodonShareModal undefined');
    }

    const url = await openMastodonShareModal(
      this.title,
      this.url,
      mastodonShareModal,
    );
    if (url !== null) {
      window.open(url, '_blank');
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
  shouldUseWebShareAPI = true,
) {
  modal.url = url;
  modal.title = title;
  modal.shouldUseWebShareAPI = shouldUseWebShareAPI;
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
