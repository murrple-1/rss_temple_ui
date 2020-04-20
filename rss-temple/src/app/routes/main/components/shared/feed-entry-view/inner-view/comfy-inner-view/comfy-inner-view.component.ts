import { Component } from '@angular/core';

import { InnerViewDirective } from '@app/routes/main/components/shared/feed-entry-view/inner-view/inner-view';

@Component({
  selector: 'app-comfy-inner-view',
  templateUrl: './comfy-inner-view.component.html',
  styleUrls: ['./comfy-inner-view.component.scss'],
})
export class ComfyInnerViewComponent extends InnerViewDirective {
  read() {
    throw new Error('Method not implemented.');
  }

  unread() {
    throw new Error('Method not implemented.');
  }

  favorite() {
    throw new Error('Method not implemented.');
  }

  unfavorite() {
    throw new Error('Method not implemented.');
  }
}
