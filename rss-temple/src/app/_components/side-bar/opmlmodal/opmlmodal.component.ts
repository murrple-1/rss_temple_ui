import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { OPMLService } from '@app/_services/data/opml.service';
import { ProgressService } from '@app/_services/data/progress.service';
import { HttpErrorService } from '@app/_services/httperror.service';

interface ProgressStatus {
    totalCount: number;
    finishedCount: number;
}

@Component({
    templateUrl: 'opmlmodal.component.html',
    styleUrls: ['opmlmodal.component.scss'],
})
export class OPMLModalComponent {
    @ViewChild('opmlFileInput')
    opmlFileInput: ElementRef<HTMLInputElement>;

    uploading = false;

    progressUuid: string = null;
    progressStatus: ProgressStatus = null;

    errorString: string = null;

    private readonly progressCheckInterval = 2000;

    constructor(
        private opmlService: OPMLService,
        private progressService: ProgressService,
        private httpErrorService: HttpErrorService,
        private activeModal: NgbActiveModal,
        private zone: NgZone,
    ) { }

    dismiss() {
        this.activeModal.dismiss();
    }

    finish() {
        const nativeElement = this.opmlFileInput.nativeElement;
        if (nativeElement.files && nativeElement.files.length > 0) {
            const file = nativeElement.files[0];

            const reader = new FileReader();

            reader.onload = () => {
                this.opmlService.upload(reader.result).subscribe(response => {
                    if (response.status === 200) {
                        this.activeModal.close();
                    } else if (response.status === 202) {
                        const body = response.body;
                        if (typeof body === 'string') {
                            this.zone.run(() => {
                                this.progressUuid = body;
                                this.checkProgress();
                            })
                        } else {
                            this.zone.run(() => {
                                this.uploading = false;
                            });
                        }
                    } else {
                        this.activeModal.close();
                    }
                }, error => {
                    this.zone.run(() => {
                        this.uploading = false;
                    });
                    this.httpErrorService.handleError(error);
                });
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
            this.activeModal.dismiss();
        }
    }

    private checkProgress() {
        this.progressService.checkProgress(this.progressUuid, {

        }).subscribe(status => {
            switch(status.state) {
                case 'notstarted':
                case 'started':
                    this.zone.run(() => {
                        this.progressStatus = {
                            totalCount: status.totalCount,
                            finishedCount: status.finishedCount,
                        };
                    });
                    setTimeout(this.checkProgress.bind(this), this.progressCheckInterval);
                    break;
                case 'finished':
                    this.activeModal.close();
                    break;
            }
        }, error => {
            this.httpErrorService.handleError(error);
        });
    }
}
