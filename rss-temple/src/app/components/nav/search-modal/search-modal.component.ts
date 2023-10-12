import { Component, OnDestroy } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
})
export class SearchModalComponent implements OnDestroy {
  open = false;

  searchText = '';

  result = new Subject<string | null>();

  ngOnDestroy() {
    this.result.complete();
  }

  reset() {
    this.searchText = '';
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next(null);
    }

    this.open = open;
  }

  onSearch() {
    this.result.next(this.searchText);

    this.open = false;
  }
}

export function openModal(modal: SearchModalComponent) {
  modal.reset();
  modal.open = true;

  return firstValueFrom(modal.result.pipe(take(1)));
}
