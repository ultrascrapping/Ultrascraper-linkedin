import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SuiModalService } from 'ng2-semantic-ui';
import { ElectronService } from 'ngx-electron';
import { Notification } from '../../models/notification';
import { XPath } from '../../models/xpath';
import { UltraAccount } from '../../models/ultra-account';
import { NotificationsModal } from './notifications-modal/notifications-modal.component';
import { ReferredUsersModal } from './referred-users-modal/referred-users-modal.component';
import { SupportModal } from './support-modal/support-modal.component';
import { MyAccountDataModal } from './my-account-data-modal/my-account-data-modal.component';
import { LoginModal } from './login-modal/login-modal.component';
import { LogoutModal } from './logout-modal/logout-modal.component';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { UtilsService } from '../../services/utils.service';
import { Observable, timer, Subscription, AsyncSubject } from 'rxjs';
import { SignalRService } from '../../services/signal-r.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
    usAccount: UltraAccount;
    private subscription: Subscription;
    @Output() customEvent = new EventEmitter();
    
    /**
     * Constructor del componente sidebar.
     * @param electronService Servicio de electron.
     * @param userService Servicio de usuarios.
     * @param apiService Servicio de API.
     * @param modalService Servicio de modals.
     * @param notificationService Servicio de notificaciones.     
     */
    constructor(
        private electronService: ElectronService,
        private userService: UserService,
        private apiService: ApiService,
        public modalService: SuiModalService,
        public notificationService: NotificationService,
        public utils: UtilsService,
        private signalRService: SignalRService
    ) { }

    ngOnInit() {
        this.signalRService.hubConnection.on('getNotifications', notifications => {
            notifications.forEach(n => {
                let foundNotification = this.usAccount.notifications.find(nc => nc.id === n.Id);
                if(!foundNotification)
                    this.usAccount.notifications.push(new Notification(n.Id, n.Message, n.StartDate, false));
            });
        });
        // US-58: Se actualiza la información del Sidebar desde la API cada 5 minutos.
        this.subscription = timer(0, 1000/*ms*/ * 60/*s*/ * 60/*min*/ * 1/*hours*/)
          .subscribe(async () => {
              if (!!this.usAccount) {
                let dataFromAPI = await this.apiService
                    .call<any>(this.apiService.apiPaths.request, { path: '/app/getdataapp', args: { } }, true)
                    .toPromise();
                    
                this.usAccount.balance = dataFromAPI.Balance;
                this.usAccount.completed = dataFromAPI.Completed;
                this.usAccount.paypalEmail = dataFromAPI.PaypalEmail;
                this.usAccount.btcAddress = dataFromAPI.BTCAddress;
                this.usAccount.referralLink = dataFromAPI.ReferralLink;
                this.usAccount.usdx1000 = dataFromAPI.USDx1000;

                this.usAccount.lastUpdate = Date.now();

                // US-104 Se actualizan las notificaciones al mismo tiempo que se actualiza el resto de la información del Sidebar.
                if (dataFromAPI.hasOwnProperty('Notifications') && dataFromAPI.Notifications.length > 0) {
                        dataFromAPI.Notifications.forEach(n => {
                            let foundNotification = this.usAccount.notifications.find(nc => nc.id === n.Id);
                            if(!foundNotification)
                                this.usAccount.notifications.push(new Notification(n.Id, n.Message, n.StartDate, false));
                        });
                }                
                
                this.userService.updateCurrentUser(this.usAccount);
              }              
          });
    }

    ngAfterContentInit() {
        this.userService.isLoggedIn().subscribe(loggedIn => {
            if (loggedIn) {
                let currentUser = this.userService.getCurrentUser();
                this.usAccount = currentUser;
                this.usAccount.notifications.forEach(n => {
                    n.startDate = this.utils.tryParseDate(n.startDate.toString());
                });                
            } else {
                this.usAccount = null;
                setTimeout(() => {
                    this.openLoginModal();
                });
            }
        });
    }

    get unreadNotifications(): Notification[] {
        if (this.usAccount && this.usAccount.notifications) {
            return this.usAccount.notifications.filter(n => n.read === false);
        }
        return [];
    }

    getNotifications(): Notification[] {
        if (this.usAccount && this.usAccount.notifications) {
            return this.usAccount.notifications.sort((a, b) => { return <any>b.startDate - <any>a.startDate })
        }
        return []
    }

    /**
     * Abre el modal de notificaciones.
     */
    openNotificationsModal(): void {
        this.modalService
            .open(new NotificationsModal(this.getNotifications()))
            .onApprove(() => {
                this.unreadNotifications.forEach(n => {
                    n.read = true;
                    this.notificationService.setReadNotification(n.id);
                });
                this.userService.updateCurrentUser(this.usAccount);
            });
    }

    /**
     * Abre el modal de referidos.
     */
    openReferredUsersModal(): void {
        this.modalService
            .open(new ReferredUsersModal());
    }

    /**
     * Abre el modal de soporte.
     */
    openSupportModal(): void {
        this.modalService
            .open(new SupportModal());
    }

    /**
     * Abre el modal de mi cuenta.
     */
    openMyAccountDataModal(): void {
        this.modalService
            .open(new MyAccountDataModal(this.usAccount));
    }

    /**
     * Abre el modal de login.
     */
    openLoginModal(): void {
        this.modalService
            .open((new LoginModal()));
    }

    /**
     * Abre el modal de logout.
     */
    openLogoutModal(): void {
        this.modalService
            .open((new LogoutModal()));
    }

    // US-58: Se crea el emitter para poder ejecutar desde acá el addTab de Browser
    addTab(): void {
        this.customEvent.emit(null);
    }

    // US-92 Se copia al clipboard el referral link si es que existe.
    copyReferralLinkToClipboard(): void {
        if (!!this.usAccount) {
            this.electronService.clipboard.writeText(this.usAccount.referralLink);
        }        
    }
}