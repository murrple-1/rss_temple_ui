import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { Feed } from '@app/models';

interface FeedImpl extends Feed {
  uuid: string;
}

@Injectable()
export class FeedObservableService {
  feedAdded = new Subject<FeedImpl>();
  feedRemoved = new Subject<FeedImpl>();

  feedsChanged = new Subject<void>();
}
