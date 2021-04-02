import { Component, EventEmitter, Input, Output } from '@angular/core';

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
})
export class FeedsFooterComponent {
  @Input()
  state = State.Start;
  readonly State = State;

  @Output()
  loadMoreButtonClicked = new EventEmitter<void>();
}
