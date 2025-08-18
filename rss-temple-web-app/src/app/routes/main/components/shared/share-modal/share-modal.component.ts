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
  type: 'ngx-sharebuttons';
}

interface _CustomShareButtonDescriptor extends _ShareButtonDescriptor {
  customShareButton: {
    text: string;
    onClick: () => void;
  };
  type: 'custom';
}

type ShareButtonDescriptor =
  | _NgxShareButtonsShareButtonDescriptor
  | _CustomShareButtonDescriptor;

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.scss'],
  standalone: false,
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
      type: 'ngx-sharebuttons',
    },
    {
      shareButton: xParams,
      iconName: 'brand-twitter-x',
      type: 'ngx-sharebuttons',
    },
    {
      shareButton: linkedInParams,
      iconName: 'brand-linkedin',
      type: 'ngx-sharebuttons',
    },
    {
      shareButton: pinterestParams,
      iconName: 'brand-pinterest',
      type: 'ngx-sharebuttons',
    },
    {
      shareButton: redditParams,
      iconName: 'brand-reddit',
      type: 'ngx-sharebuttons',
    },
    {
      shareButton: tumblrParams,
      iconName: 'brand-tumblr',
      type: 'ngx-sharebuttons',
    },
    {
      customShareButton: {
        text: 'Bluesky…',
        onClick: () => this.blueskyShare(),
      },
      iconName: 'brand-bluesky',
      type: 'custom',
    },
    {
      customShareButton: {
        text: 'Threads…',
        onClick: () => this.threadsShare(),
      },
      iconName: 'brand-threads',
      type: 'custom',
    },
    {
      customShareButton: {
        text: 'Lemmy…',
        onClick: () => this.lemmyShare(),
      },
      iconName: 'brand-lemmy',
      type: 'custom',
    },
    {
      customShareButton: {
        text: 'Mastodon…',
        onClick: () => this.mastodonShare(),
      },
      iconName: 'brand-mastodon',
      type: 'custom',
    },
    {
      shareButton: telegramParams,
      iconName: 'brand-telegram',
      type: 'ngx-sharebuttons',
    },
    // TODO to implement, see https://github.com/MurhafSousli/ngx-sharebuttons/wiki/Using-Messenger-on-Desktop
    // {
    //   shareButton: messengerParams,
    //   iconName: 'brand-facebook-messenger',
    //   type: 'ngx-sharebuttons',
    // },
    {
      shareButton: whatsappParams,
      iconName: 'brand-whatsapp',
      type: 'ngx-sharebuttons',
    },
    {
      shareButton: smsParams,
      iconName: 'talk-bubbles',
      type: 'ngx-sharebuttons',
    },
    {
      shareButton: emailParams,
      iconName: 'envelope',
      type: 'ngx-sharebuttons',
    },
    {
      shareButton: copyParams,
      iconName: 'clipboard',
      type: 'ngx-sharebuttons',
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

  async blueskyShare() {
    const url = `https://bsky.app/intent/compose?text=${encodeURIComponent(
      `${this.title} ${this.url}`,
    )}`;
    window.open(url, '_blank');
  }

  async threadsShare() {
    const url = `https://threads.net/intent/post?text=${encodeURIComponent(
      `${this.title}\n${this.url}`,
    )}`;
    window.open(url, '_blank');
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
