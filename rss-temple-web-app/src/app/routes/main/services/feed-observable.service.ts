import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Feed } from '@app/models';

export type FeedImpl = Required<Pick<Feed, 'uuid'>> & Omit<Feed, 'uuid'>;

@Injectable()
export class FeedObservableService {
  readonly feedAdded = new Subject<FeedImpl>();
  readonly feedRemoved = new Subject<FeedImpl>();

  readonly feedsChanged = new Subject<void>();
}
