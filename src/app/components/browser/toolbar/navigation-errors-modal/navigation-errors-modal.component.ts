import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig } from 'ng2-semantic-ui';
import { LinkedInAccount } from '../../../../models/linkedin-account';

interface INavigationErrorsModalContext {
    account: LinkedInAccount;
}

@Component({
    selector: 'app-navigation-errors-modal',
    templateUrl: './navigation-errors-modal.component.html',
    styleUrls: ['./navigation-errors-modal.component.css']
})
export class NavigationErrorsModalComponent implements OnInit {
    constructor(public modal: SuiModal<INavigationErrorsModalContext, void, void>) { }

    ngOnInit() {
    }
}

export class NavigationErrorsModal extends ComponentModalConfig<INavigationErrorsModalContext, void, void> {
    constructor(account: LinkedInAccount) {
        super(NavigationErrorsModalComponent, { account: account });
        this.isClosable = false;
    }
}