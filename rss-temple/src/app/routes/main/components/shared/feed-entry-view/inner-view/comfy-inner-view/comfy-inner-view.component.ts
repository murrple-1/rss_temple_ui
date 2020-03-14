import { Component } from '@angular/core';

import { InnerViewDirective } from '@app/routes/main/components/shared/feed-entry-view/inner-view/inner-view';

@Component({
  selector: 'app-comfy-inner-view',
  templateUrl: './comfy-inner-view.component.html',
  styleUrls: ['./comfy-inner-view.component.scss'],
})
export class ComfyInnerViewComponent extends InnerViewDirective {}
