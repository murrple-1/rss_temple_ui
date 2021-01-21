import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { Feed } from '@app/models';

@Injectable()
export class FeedObservableService {
  feedAdded = new Subject<Feed>();
  feedRemoved = new Subject<Feed>();

  feedsChanged = new Subject<void>();
}
