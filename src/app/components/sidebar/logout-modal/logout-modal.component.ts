import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig } from 'ng2-semantic-ui';
import { UserService } from '../../../services/user.service'
import { Modal } from 'ng2-semantic-ui/dist';

interface ILogoutModalContext { }

@Component({
    selector: 'app-logout-modal',
    templateUrl: './logout-modal.component.html',
    styleUrls: ['./logout-modal.component.css']
})
export class LogoutModalComponent implements OnInit {
    constructor(
        public modal: SuiModal<ILogoutModalContext, void, void>,
        private userService: UserService
    ) { }

    ngOnInit() {
    }

    logout() {
        this.userService.clearCurrentUser();
        this.modal.approve();
    }
}

export class LogoutModal extends ComponentModalConfig<ILogoutModalContext, void, void> {
    constructor() {
        super(LogoutModalComponent, {});
        this.isClosable = false;
    }
}