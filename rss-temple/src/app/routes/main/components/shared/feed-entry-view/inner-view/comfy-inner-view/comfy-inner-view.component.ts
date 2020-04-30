import { Component, Output, EventEmitter } from '@angular/core';

import { InnerViewDirective } from '@app/routes/main/components/shared/feed-entry-view/inner-view/inner-view';

@Component({
  selector: 'app-comfy-inner-view',
  templateUrl: './comfy-inner-view.component.html',
  styleUrls: ['./comfy-inner-view.component.scss'],
})
export class ComfyInnerViewComponent extends InnerViewDirective {
  @Output()
  didRead = new EventEmitter<void>();

  @Output()
  didUnread = new EventEmitter<void>();

  @Output()
  didFavorite = new EventEmitter<void>();

  @Output()
  didUnfavorite = new EventEmitter<void>();

  read() {
    this.didRead.emit();
  }

  unread() {
    this.didUnread.emit();
  }

  favorite() {
    this.didFavorite.emit();
  }

  unfavorite() {
    this.didUnfavorite.emit();
  }
}
