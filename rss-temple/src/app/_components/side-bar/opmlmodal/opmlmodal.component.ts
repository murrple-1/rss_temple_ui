import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { OPMLService } from '@app/_services/data/opml.service';
import { HttpErrorService } from '@app/_services/httperror.service';

@Component({
    templateUrl: 'opmlmodal.component.html',
    styleUrls: ['opmlmodal.component.scss'],
})
export class OPMLModalComponent {
    @ViewChild('opmlFileInput')
    opmlFileInput: ElementRef<HTMLInputElement>;

    uploading = false;

    constructor(
        private opmlService: OPMLService,
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
                    if (response.status !== 202) {
                        this.activeModal.close();
                    } else {
                        // TODO
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
}
