import {
  Component,
  ViewChild,
  ElementRef,
  NgZone,
  OnDestroy,
} from '@angular/core';

import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { OPMLService, ProgressService } from '@app/services/data';
import { HttpErrorService } from '@app/services';

interface ProgressStatus {
  totalCount: number;
  finishedCount: number;
}

@Component({
  selector: 'app-opml-modal',
  templateUrl: './opml-modal.component.html',
  styleUrls: ['./opml-modal.component.scss'],
})
export class OPMLModalComponent implements OnDestroy {
  open = false;

  @ViewChild('opmlFileInput', { static: true })
  private opmlFileInput?: ElementRef<HTMLInputElement>;

  uploading = false;

  progressStatus: ProgressStatus | null = null;

  errorString: string | null = null;

  result = new Subject<void>();

  private readonly progressCheckInterval = 2000;

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private zone: NgZone,
    private opmlService: OPMLService,
    private progressService: ProgressService,
    private httpErrorService: HttpErrorService,
  ) {}

  ngOnDestroy() {
    this.result.complete();

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  reset() {
    this.uploading = false;
    this.progressStatus = null;
    this.errorString = null;
  }

  openChanged(open: boolean) {
    if (!open) {
      this.result.next();
    }

    this.open = open;
  }

  finish() {
    if (this.opmlFileInput !== undefined) {
      const nativeElement = this.opmlFileInput.nativeElement;
      if (nativeElement.files && nativeElement.files.length > 0) {
        const file = nativeElement.files[0];

        const reader = new FileReader();

        reader.onload = () => {
          if (reader.result !== null) {
            this.opmlService
              .upload(reader.result)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe({
                next: response => {
                  if (response.status === 200) {
                    this.result.next();
                    this.zone.run(() => {
                      this.open = false;
                    });
                  } else if (response.status === 202) {
                    const body = response.body;
                    if (typeof body === 'string') {
                      this.zone.run(() => {
                        this.checkProgress(body);
                      });
                    } else {
                      this.zone.run(() => {
                        this.uploading = false;
                      });
                    }
                  } else {
                    this.result.next();
                    this.zone.run(() => {
                      this.open = false;
                    });
                  }
                },
                error: error => {
                  this.zone.run(() => {
                    this.uploading = false;
                  });

                  this.httpErrorService.handleError(error);
                },
              });
          }
        };

        reader.onerror = () => {
          // TODO show error?
          this.zone.run(() => {
            this.uploading = false;
          });
        };

        this.uploading = true;
        reader.readAsText(file);
      } else {
        this.result.next();
        this.open = false;
      }
    }
  }

  private checkProgress(progressUuid: string) {
    this.progressService
      .checkProgress(progressUuid)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: status => {
          switch (status.state) {
            case 'notstarted':
            case 'started':
              this.zone.run(() => {
                this.progressStatus = {
                  totalCount: status.totalCount,
                  finishedCount: status.finishedCount,
                };
              });
              setTimeout(
                this.checkProgress.bind(this, progressUuid),
                this.progressCheckInterval,
              );
              break;
            case 'finished':
              // TODO close
              break;
          }
        },
        error: error => {
          this.httpErrorService.handleError(error);
        },
      });
  }
}

export function openModal(modal: OPMLModalComponent) {
  modal.reset();
  modal.open = true;

  return modal.result.pipe(take(1)).toPromise();
}