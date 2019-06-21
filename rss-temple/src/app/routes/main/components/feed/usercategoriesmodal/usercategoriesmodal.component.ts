import { Component, Input, OnInit, OnDestroy, NgZone } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { UserCategoryService } from '@app/services/data';
import { HttpErrorService } from '@app/services';
import { Sort } from '@app/services/data/sort.interface';

interface UserCategoryImpl1 {
  uuid: string;
  text: string;
}

interface UserCategoryImpl2 {
  uuid: string;
}

interface Selection {
  _uuid: string;
  text: string;
  isSelected: boolean;
}

export interface ReturnData {
  uuid: string;
  text: string;
}

@Component({
  templateUrl: 'usercategoriesmodal.component.html',
  styleUrls: ['usercategoriesmodal.component.scss'],
})
export class UserCategoriesModalComponent implements OnInit, OnDestroy {
  newUserCategoryText = '';

  @Input()
  initialUserCategories?: Set<string>;

  userCategorySelections: Selection[] = [];

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private activeModal: NgbActiveModal,
    private userCategoryService: UserCategoryService,
    private httpErrorService: HttpErrorService,
  ) {}

  static beforeDismiss() {
    return false;
  }

  ngOnInit() {
    this.userCategoryService
      .queryAll({
        fields: ['uuid', 'text'],
        returnTotalCount: false,
        sort: new Sort([['text', 'ASC']]),
      })
      .pipe(
        takeUntil(this.unsubscribe$),
        map(userCategories => {
          if (userCategories.objects !== undefined) {
            return userCategories.objects as UserCategoryImpl1[];
          }
          throw new Error('malformed response');
        }),
      )
      .subscribe({
        next: userCategories => {
          const userCategorySelections: Selection[] = [];

          const initialUserCategories =
            this.initialUserCategories || new Set<string>();

          for (const userCategory of userCategories) {
            userCategorySelections.push({
              _uuid: userCategory.uuid,
              text: userCategory.text,
              isSelected: initialUserCategories.has(userCategory.text),
            });
          }

          this.zone.run(() => {
            this.userCategorySelections = userCategorySelections;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addUserCategory() {
    const newUserCategoryText = this.newUserCategoryText.trim();
    if (newUserCategoryText !== '') {
      if (
        this.userCategorySelections.some(
          _selection => _selection.text === newUserCategoryText,
        )
      ) {
        this.newUserCategoryText = '';
        return;
      }

      this.userCategoryService
        .create(
          {
            text: newUserCategoryText,
          },
          {
            fields: ['uuid'],
          },
        )
        .pipe(
          takeUntil(this.unsubscribe$),
          map(userCategory => userCategory as UserCategoryImpl2),
        )
        .subscribe({
          next: userCategory => {
            const userCategorySelection: Selection = {
              _uuid: userCategory.uuid,
              text: newUserCategoryText,
              isSelected: true,
            };

            this.zone.run(() => {
              this.userCategorySelections = this.userCategorySelections.concat(
                userCategorySelection,
              );
              this.newUserCategoryText = '';
            });
          },
          error: error => {
            this.httpErrorService.handleError(error);
          },
        });
    }
  }

  removeUserCategory(index: number) {
    const userCategorySelection = this.userCategorySelections[index];

    this.userCategoryService
      .delete(userCategorySelection._uuid)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.userCategorySelections = this.userCategorySelections.filter(
            (_, _index) => _index !== index,
          );
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  finish() {
    const returnData = this.userCategorySelections
      .filter(_selection => _selection.isSelected)
      .map<ReturnData>(_selection => {
        return {
          uuid: _selection._uuid,
          text: _selection.text,
        };
      });
    this.activeModal.close(returnData);
  }
}
