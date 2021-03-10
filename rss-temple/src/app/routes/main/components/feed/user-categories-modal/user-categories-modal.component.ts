import { Component, OnDestroy, NgZone, Input } from '@angular/core';

import { forkJoin, Observable, Subject } from 'rxjs';
import { takeUntil, map, take, tap } from 'rxjs/operators';

import { UserCategoryService } from '@app/services/data';
import { HttpErrorService } from '@app/services';
import { Sort } from '@app/services/data/sort.interface';
import { UserCategory } from '@app/models';
import { IApply } from '@app/services/data/usercategory.service';

type UserCategoryImpl1 = Required<Pick<UserCategory, 'uuid' | 'text'>>;
type UserCategoryImpl2 = Required<Pick<UserCategory, 'uuid'>>;

interface CategoryDescriptor {
  _uuid: string;
  text: string;
}

export interface Result {
  categories: string[];
}

@Component({
  selector: 'app-user-categories-modal',
  templateUrl: './user-categories-modal.component.html',
  styleUrls: ['./user-categories-modal.component.scss'],
})
export class UserCategoriesModalComponent implements OnDestroy {
  open = false;

  newUserCategoryText = '';

  @Input()
  feedUuid = '';

  @Input()
  initialSelectedUserCategories?: Set<string>;

  private initialCategoryDescriptors: CategoryDescriptor[] = [];
  categoryDescriptors: CategoryDescriptor[] = [];
  selectedCategoryDescriptors: CategoryDescriptor[] = [];

  result = new Subject<Result | undefined>();

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private userCategoryService: UserCategoryService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  reset() {
    this.feedUuid = '';
    this.newUserCategoryText = '';
    this.initialSelectedUserCategories = undefined;
    this.initialCategoryDescriptors = this.categoryDescriptors = this.selectedCategoryDescriptors = [];
  }

  load() {
    const initialUserCategories = this.initialSelectedUserCategories;
    if (initialUserCategories === undefined) {
      throw new Error();
    }

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
          const categoryDescriptors = userCategories
            .map<CategoryDescriptor>(uc => ({
              _uuid: uc.uuid,
              text: uc.text,
            }))
            .sort(sortCategoryDescriptor);

          const selectedCategoryDescriptors = categoryDescriptors.filter(cd =>
            initialUserCategories.has(cd.text),
          );

          this.zone.run(() => {
            this.initialCategoryDescriptors = this.categoryDescriptors = categoryDescriptors;
            this.selectedCategoryDescriptors = selectedCategoryDescriptors;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next();
    }

    this.open = open;
  }

  addUserCategory() {
    let categoryDescriptor = this.categoryDescriptors.find(
      cd => cd.text === this.newUserCategoryText,
    );
    if (categoryDescriptor === undefined) {
      categoryDescriptor = {
        _uuid: '',
        text: this.newUserCategoryText,
      };
      this.categoryDescriptors = [
        ...this.categoryDescriptors,
        categoryDescriptor,
      ].sort(sortCategoryDescriptor);
    }

    if (
      this.selectedCategoryDescriptors.find(
        cd => cd.text === this.newUserCategoryText,
      ) === undefined
    ) {
      this.selectedCategoryDescriptors = [
        ...this.selectedCategoryDescriptors,
        categoryDescriptor,
      ];
    }

    this.newUserCategoryText = '';
  }

  removeUserCategory(categoryDescriptor: CategoryDescriptor) {
    this.selectedCategoryDescriptors = this.selectedCategoryDescriptors.filter(
      cd => cd !== categoryDescriptor,
    );
  }

  finish() {
    const createObservables: Observable<unknown>[] = [];
    for (const selectedCategoryDescriptor of this.selectedCategoryDescriptors) {
      if (
        this.initialCategoryDescriptors.every(
          cd => cd.text !== selectedCategoryDescriptor.text,
        )
      ) {
        createObservables.push(
          this.userCategoryService
            .create(
              {
                text: selectedCategoryDescriptor.text,
              },
              {
                fields: ['uuid'],
              },
            )
            .pipe(
              map(response => response as UserCategoryImpl2),
              tap(uc => {
                selectedCategoryDescriptor._uuid = uc.uuid;
              }),
            ),
        );
      }
    }

    if (createObservables.length < 1) {
      createObservables.push(
        new Observable(subscriber => {
          subscriber.next();
          subscriber.complete();
        }),
      );
    }

    forkJoin(createObservables)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          const applyBody: IApply = {
            [this.feedUuid]: new Set<string>(
              this.selectedCategoryDescriptors.map(cd => cd._uuid),
            ),
          };

          this.userCategoryService
            .apply(applyBody)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: () => {
                const result: Result = {
                  categories: this.selectedCategoryDescriptors.map(
                    cd => cd.text,
                  ),
                };
                this.result.next(result);

                this.zone.run(() => {
                  this.open = false;
                });
              },
              error: error => {
                this.httpErrorService.handleError(error);
              },
            });
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }
}

export function openModal(
  feedUuid: string,
  initialUserCategories: Set<string>,
  modal: UserCategoriesModalComponent,
) {
  modal.reset();
  modal.feedUuid = feedUuid;
  modal.initialSelectedUserCategories = initialUserCategories;
  modal.open = true;
  modal.load();

  return modal.result.pipe(take(1)).toPromise();
}

function sortCategoryDescriptor(a: CategoryDescriptor, b: CategoryDescriptor) {
  return a.text.localeCompare(b.text);
}
