import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig } from 'ng2-semantic-ui';
import { Notification } from '../../../models/notification';

interface INotificationsModalContext {
    notifications: Notification[];
}

@Component({
    selector: 'app-notifications-modal',
    templateUrl: './notifications-modal.component.html',
    styleUrls: ['./notifications-modal.component.css']
})
export class NotificationsModalComponent implements OnInit {
    private showReadNotifications: boolean = false;
    constructor(
        public modal: SuiModal<INotificationsModalContext, void, void>
    ) { }

    ngOnInit() {
    }
}

export class NotificationsModal extends ComponentModalConfig<INotificationsModalContext, void, void> {
    constructor(notifications: Notification[]) {
        super(NotificationsModalComponent, { notifications: notifications });
        this.isClosable = false;
    }
}