import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class UserCategoryObservableService {
  userCategoriesChanged$ = new Subject<void>();
}
