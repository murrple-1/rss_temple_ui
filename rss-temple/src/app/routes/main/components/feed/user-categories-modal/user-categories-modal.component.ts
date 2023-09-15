import { Component, Input, NgZone, OnDestroy } from '@angular/core';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { map, mergeMap, take, takeUntil, tap } from 'rxjs/operators';

import { UserCategory } from '@app/models';
import { HttpErrorService } from '@app/services';
import { UserCategoryService } from '@app/services/data';
import { Sort } from '@app/services/data/sort.interface';
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

  isLoading = false;

  newUserCategoryText = '';

  @Input()
  feedUuid = '';

  @Input()
  initialAssignedUserCategoryTexts?: Set<string>;

  private initialCategoryDescriptors: CategoryDescriptor[] = [];
  categoryDescriptors: CategoryDescriptor[] = [];
  assignedCategoryDescriptors: CategoryDescriptor[] = [];
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
    this.initialAssignedUserCategoryTexts = undefined;
    this.initialCategoryDescriptors =
      this.categoryDescriptors =
      this.assignedCategoryDescriptors =
        [];
  }

  load() {
    const initialAssignedUserCategoryTexts =
      this.initialAssignedUserCategoryTexts;
    if (initialAssignedUserCategoryTexts === undefined) {
      throw new Error();
    }

    this.isLoading = true;

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
          const categoryDescriptors = userCategories.map<CategoryDescriptor>(
            uc => ({
              _uuid: uc.uuid,
              text: uc.text,
            }),
          );

          const assignedCategoryDescriptors = categoryDescriptors.filter(cd =>
            initialAssignedUserCategoryTexts.has(cd.text),
          );

          this.zone.run(() => {
            this.categoryDescriptors = this.initialCategoryDescriptors =
              categoryDescriptors;
            this.assignedCategoryDescriptors = assignedCategoryDescriptors;
            this.isLoading = false;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);

          this.zone.run(() => {
            this.isLoading = false;
          });
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
      ];
    }

    if (
      this.assignedCategoryDescriptors.find(
        cd => cd.text === this.newUserCategoryText,
      ) === undefined
    ) {
      this.assignedCategoryDescriptors = [
        ...this.assignedCategoryDescriptors,
        categoryDescriptor,
      ];
    }

    this.newUserCategoryText = '';
  }

  removeUserCategories() {
    const uuids = new Set(
      this.selectedCategoryDescriptors.map(scd => scd._uuid),
    );

    this.assignedCategoryDescriptors = this.assignedCategoryDescriptors.filter(
      cd => !uuids.has(cd._uuid),
    );
  }

  finish() {
    if (this.initialAssignedUserCategoryTexts === undefined) {
      throw new Error();
    }

    const finalUserCategoryTexts = new Set(
      this.assignedCategoryDescriptors.map(acd => acd.text),
    );
    if (
      finalUserCategoryTexts.size ===
        this.initialAssignedUserCategoryTexts.size &&
      Array.from(this.initialAssignedUserCategoryTexts).every(t =>
        finalUserCategoryTexts.has(t),
      )
    ) {
      const result: Result = {
        categories: this.assignedCategoryDescriptors.map(cd => cd.text),
      };
      this.result.next(result);
      this.open = false;
      return;
    }

    const createObservables: Observable<unknown>[] = [];
    for (const assignedCategoryDescriptor of this.assignedCategoryDescriptors) {
      if (
        this.initialCategoryDescriptors.every(
          cd => cd.text !== assignedCategoryDescriptor.text,
        )
      ) {
        createObservables.push(
          this.userCategoryService
            .create(
              {
                text: assignedCategoryDescriptor.text,
              },
              {
                fields: ['uuid'],
              },
            )
            .pipe(
              map(response => response as UserCategoryImpl2),
              tap(uc => {
                assignedCategoryDescriptor._uuid = uc.uuid;
              }),
            ),
        );
      }
    }

    if (createObservables.length < 1) {
      createObservables.push(of(undefined));
    }

    this.isLoading = true;

    forkJoin(createObservables)
      .pipe(
        takeUntil(this.unsubscribe$),
        mergeMap(() => {
          const applyBody: IApply = {
            [this.feedUuid]: new Set<string>(
              this.assignedCategoryDescriptors.map(cd => cd._uuid),
            ),
          };

          return this.userCategoryService.apply(applyBody);
        }),
      )
      .subscribe({
        next: () => {
          const result: Result = {
            categories: this.assignedCategoryDescriptors.map(cd => cd.text),
          };
          this.result.next(result);

          this.zone.run(() => {
            this.open = false;
          });
        },
        error: error => {
          this.httpErrorService.handleError(error);

          this.zone.run(() => {
            this.isLoading = false;
          });
        },
      });
  }
}

export function openModal(
  feedUuid: string,
  initialAssignedUserCategories: Set<string>,
  modal: UserCategoriesModalComponent,
) {
  modal.reset();
  modal.feedUuid = feedUuid;
  modal.initialAssignedUserCategoryTexts = initialAssignedUserCategories;
  modal.open = true;
  modal.load();

  return modal.result.pipe(take(1)).toPromise();
}
