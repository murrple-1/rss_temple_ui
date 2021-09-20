import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
})
export class AdvancedSearchComponent {
  constructor(private router: Router) {}

  goTo(feedUrl: string) {
    this.router.navigate(['/main/feed', feedUrl]);
  }
}
