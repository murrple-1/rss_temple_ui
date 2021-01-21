import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

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
  selector: 'app-user-categories-modal',
  templateUrl: './user-categories-modal.component.html',
  styleUrls: ['./user-categories-modal.component.scss'],
})
export class UserCategoriesModalComponent implements OnInit, OnDestroy {
  open = false;

  newUserCategoryText = '';

  initialUserCategories?: Set<string>;

  userCategorySelections: Selection[] = [];

  result = new Subject<ReturnData[]>();

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private userCategoryService: UserCategoryService,
    private httpErrorService: HttpErrorService,
  ) {}

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
            this.initialUserCategories ?? new Set<string>();

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

  reset() {
    this.newUserCategoryText = '';
    this.initialUserCategories = undefined;
    this.userCategorySelections = [];
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next();
    }

    this.open = open;
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
      .map<ReturnData>(_selection => ({
        uuid: _selection._uuid,
        text: _selection.text,
      }));
    this.result.next(returnData);
  }
}

export function openModal(
  initialUserCategories: Set<string>,
  modal: UserCategoriesModalComponent,
) {
  modal.reset();
  modal.initialUserCategories = initialUserCategories;
  modal.open = true;

  return modal.result.toPromise();
}
