import { Component } from '@angular/core';

import { InnerViewDirective } from '@app/routes/main/components/shared/feed-entry-view/inner-view/inner-view';

@Component({
  selector: 'app-compact-inner-view',
  templateUrl: './compact-inner-view.component.html',
  styleUrls: ['./compact-inner-view.component.scss'],
})
export class CompactInnerViewComponent extends InnerViewDirective {}
