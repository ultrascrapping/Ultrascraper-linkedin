import { Injectable } from '@angular/core';
import { LinkedInAccount } from '../models/linkedin-account'
@Injectable()
export class OsNotificationService {
    public linkedInAccount : LinkedInAccount;
    /**
     * Constructor del servicio de Notificaciones.
     */
    constructor(
    ) { }

    display(message : string) {
      let fullName : string = this.linkedInAccount ? ' - ' + this.linkedInAccount.fullName : '';
      let notificationShown = new Notification('Ultra' + fullName, {
          body: message,
          icon: './assets/img/icon48.png',
        });
    }
}
