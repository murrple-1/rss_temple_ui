import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalOpenService {
  isModalOpen$ = new BehaviorSubject(false);
}
