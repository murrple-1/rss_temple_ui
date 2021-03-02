import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { Feed } from '@app/models';

type FeedImpl = Required<Pick<Feed, 'uuid'>> & Omit<Feed, 'uuid'>;

@Injectable()
export class FeedObservableService {
  feedAdded = new Subject<FeedImpl>();
  feedRemoved = new Subject<FeedImpl>();

  feedsChanged = new Subject<void>();
}
