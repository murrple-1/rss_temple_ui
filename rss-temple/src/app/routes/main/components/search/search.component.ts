import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  searchText = '';

  constructor(private zone: NgZone, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe({
      next: paramMap => {
        const searchText = paramMap.get('searchText') ?? '';
        this.zone.run(() => {
          this.searchText = searchText;
        });
      },
    });
  }
}
