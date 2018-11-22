import { Component, ViewChild, ElementRef } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    templateUrl: 'opmlmodal.component.html',
    styleUrls: ['opmlmodal.component.scss'],
})
export class OPMLModalComponent {
    @ViewChild('opmlFileInput')
    opmlFileInput: ElementRef<HTMLInputElement>;

    constructor(
        private activeModal: NgbActiveModal,
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
                // TODO
                console.log(reader.result);
                this.activeModal.close();
            };
            reader.onerror = () => {
                // TODO
                console.log('Error reading file');
            };
            reader.readAsText(file);
        } else {
            this.activeModal.close();
        }
    }
}
