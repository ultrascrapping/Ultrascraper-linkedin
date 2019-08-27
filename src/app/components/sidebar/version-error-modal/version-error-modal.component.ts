import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig } from 'ng2-semantic-ui';

interface IVersionErrorModalContext { }

@Component({
    selector: 'app-version-error-modal',
    templateUrl: './version-error-modal.component.html',
    styleUrls: ['./version-error-modal.component.css']
})
export class VersionErrorModalComponent implements OnInit {

    /**
     * Constructor del modal de error de versión.
     * @param modal Elemento SuiModal.
     */
    constructor(
        public modal: SuiModal<IVersionErrorModalContext, void, void>
    ) { }

    ngOnInit() {
    }
}

export class VersionErrorModal extends ComponentModalConfig<IVersionErrorModalContext, void, void> {
    constructor() {
        super(VersionErrorModalComponent, {});
        this.isClosable = false;
    }
}