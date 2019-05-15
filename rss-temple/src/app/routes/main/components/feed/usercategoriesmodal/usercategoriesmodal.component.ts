import { Component, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: 'usercategoriesmodal.component.html',
  styleUrls: ['usercategoriesmodal.component.scss'],
})
export class UserCategoriesModalComponent {
  newUserCategoryText = '';

  @Input()
  userCategories: string[] = [];

  userCategorySelections: {
    [name: string]: boolean;
  } = {};

  constructor(private activeModal: NgbActiveModal) {}

  static beforeDismiss() {
    return false;
  }

  addUserCategory() {
    const newUserCategoryText = this.newUserCategoryText.trim();
    if (newUserCategoryText !== '') {
      this.userCategories = this.userCategories.concat(
        this.newUserCategoryText,
      );

      this.newUserCategoryText = '';
    }
  }

  removeUserCategory(index: number) {
    this.userCategories = this.userCategories.filter(
      (_, index_) => index_ !== index,
    );
  }

  finish() {
    this.activeModal.close(this.userCategories);
  }
}
