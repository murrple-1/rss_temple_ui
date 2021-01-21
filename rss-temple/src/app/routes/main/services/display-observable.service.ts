import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

export enum DisplayType {
  Compact,
  Comfy,
}

@Injectable()
export class DisplayObservableService {
  display = new BehaviorSubject<DisplayType>(DisplayType.Comfy);
}
