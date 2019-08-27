import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig } from 'ng2-semantic-ui';

interface ISupportModalContext { }

@Component({
    selector: 'app-support-modal',
    templateUrl: './support-modal.component.html',
    styleUrls: ['./support-modal.component.css']
})
export class SupportModalComponent implements OnInit {
    constructor(public modal: SuiModal<ISupportModalContext, void, void>) { }

    ngOnInit() {
    }
}

export class SupportModal extends ComponentModalConfig<ISupportModalContext, void, void> {
    constructor() {
        super(SupportModalComponent, {});
        this.isClosable = false;
    }
}