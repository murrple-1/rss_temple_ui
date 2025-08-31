import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClrSpinnerModule } from '@clr/angular';

export enum State {
  Start,
  IsNotLoading,
  IsLoading,
  IsEmpty,
  HasNoMoreToLoad,
}

@Component({
  selector: 'app-feeds-footer',
  templateUrl: './feeds-footer.component.html',
  styleUrls: ['./feeds-footer.component.scss'],
  imports: [ClrSpinnerModule],
})
export class FeedsFooterComponent {
  @Input()
  state = State.Start;
  readonly State = State;

  @Output()
  loadMoreButtonClicked = new EventEmitter<void>();

  @Output()
  reloadButtonClicked = new EventEmitter<void>();

  onLoadMoreClick() {
    this.loadMoreButtonClicked.emit();
  }

  onReloadClick() {
    this.reloadButtonClicked.emit();
  }
}
