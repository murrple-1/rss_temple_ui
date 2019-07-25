import { Component } from '@angular/core';

import { Observable } from 'rxjs';

import { DisplayObservableService } from '@app/routes/main/services';
import { DisplayType } from '@app/routes/main/services/displayobservable.service';

@Component({
  selector: 'app-display-options',
  templateUrl: './display-options.component.html',
  styleUrls: ['./display-options.component.scss'],
})
export class DisplayOptionsViewComponent {
  readonly DisplayType = DisplayType;

  display: Observable<DisplayType>;

  constructor(private displayObservableService: DisplayObservableService) {
    this.display = displayObservableService.display;
  }

  lightMode() {
    this.displayObservableService.display.next(DisplayType.Compact);
  }

  heavyMode() {
    this.displayObservableService.display.next(DisplayType.Comfy);
  }
}
