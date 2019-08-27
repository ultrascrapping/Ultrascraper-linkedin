import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig } from 'ng2-semantic-ui';
import { UltraAccount } from '../../../models/ultra-account'
import { ApiService } from '../../../services/api.service'
import { UserService } from '../../../services/user.service'
import { Notification } from '../../../models/notification'
import { NotificationService } from '../../../services/notification.service'
import { UtilsService } from '../../../services/utils.service'

interface ILoginModalContext { }

@Component({
    selector: 'app-login-modal',
    templateUrl: './login-modal.component.html',
    styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements OnInit {
    userEmail: string;
    userPassword: string;
    errorMessage: string;
    showErrorMessage: boolean = false;
    isLoading: boolean = false;

    /**
     * Constructor del modal de login.
     * @param modal Elemento SuiModal.
     * @param apiService Servicio de API.
     * @param userService Servicio de usuario.
     * @param notificationService Servicio de notificaciones.
     */
    constructor(
        public modal: SuiModal<ILoginModalContext, void, void>,
        private apiService: ApiService,
        private userService: UserService,
        public notificationService: NotificationService,
        public utils: UtilsService
    ) { }

    ngOnInit() {        
    }

    /**
     * Intenta realizar el login del usuario.
     */
    login() {
        if (this.validateEmail(this.userEmail)) {
            this.isLoading = true;
            let param: any = { path: 'default', args: { email: this.userEmail, password: this.userPassword } };
            this.apiService.call<any>(this.apiService.apiPaths.login, param, false).subscribe(
                response => {   
                    if (!response.hasOwnProperty('error') && response.hasOwnProperty('Token')) {
                        // Se guarda el token del usuario.
                        let ultraAccount: UltraAccount = new UltraAccount(this.userEmail, response.Token);
                        this.userService.setCurrentUser(ultraAccount);
                        // Se obtiene la información del usuario.
                        let param: any = { path: '/app/getdataapp', args: { identifier: '' } };
                        this.apiService.call<any>(this.apiService.apiPaths.request, param).subscribe(
                            response => {                                
                                if (!response.hasOwnProperty("error")) {
                                    ultraAccount.paypalEmail = response.PaypalEmail;
                                    ultraAccount.btcAddress = response.BTCAddress;
                                    ultraAccount.balance = response.Balance;
                                    ultraAccount.completed = response.Completed;
                                    ultraAccount.referralLink = response.ReferralLink;

                                    // US-116 Se actualiza usdx1000 desde la web api cuando recién se loggea el usuario.
                                    ultraAccount.usdx1000 = response.USDx1000;

                                    ultraAccount.lastUpdate = Date.now();

                                    ultraAccount.notifications = [];
                                    if (response.Notifications && response.Notifications.constructor === Array) {
                                        let readNotifications = this.notificationService.getReadNotifications();
                                        if (!readNotifications) {
                                            readNotifications = [];
                                        }
                                        response.Notifications.forEach(n => {
                                            let newNotification = new Notification(n.Id, n.Message, this.utils.tryParseDate(n.StartDate));
                                            newNotification.read = readNotifications.some(rn => rn === n.Id);
                                            ultraAccount.notifications.push(newNotification);
                                        });
                                    }
                                    this.userService.updateCurrentUser(ultraAccount);
                                    this.closeModal();
                                } 
                                this.isLoading = false;
                            },
                            error => {
                                this.isLoading = false;
                                this.showError(error);
                            }
                        );
                    } else {
                        this.showError(response);
                    }
                },
                error => {
                    // US-93 Cachamos el Forbidden para saber que estamos en la versión incorrecta.
                    if (error.hasOwnProperty('status') && error.status === 403) {
                        error.error = 'VERSION';
                    }
                    this.showError(error);
                }
            );
        } else {
            this.errorMessage = 'Por favor ingresa un correo válido';
            this.showErrorMessage = true;
            this.isLoading = false;
        }
    }

    /**
     * Muestra un error.
     * @param res Indica el error a mostrar.
     */
    showError(res: any) {
        this.errorMessage = 'No existe esa combinación de correo y contraseña.';
        if (res.error != null) {
            if (typeof res.error == 'string') {
                //Matcheamos solo los errores string
                if(res.error.toUpperCase() === 'INACTIVE') {
                    this.errorMessage = `Este usuario está DESACTIVADO, por favor contacte a <a href='mailto:ultra@bestdamnscripts.com?Subject=Blocked%20User:%20${this.userEmail}' title='ultra@bestdamnscripts.com'>soporte</a>.`;
                } 
            } else {
                this.errorMessage = 'Ocurrió un error en el proceso de Login';
            } 
        }
        // US-93 Mandamos el error de versión en la ventana de login.
        if (res.error.toUpperCase() === 'VERSION') {
            this.errorMessage = `Está utilizando la versión equivocada de Ultra.`;
        }
        this.showErrorMessage = true;
        this.isLoading = false;
    }

    /**
     * Valida el email dado.
     * @param email Email a validar.
     */
    validateEmail(email: string) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    /**
     * Cierra el modal.
     */
    private closeModal(): void {
        this.modal.approve();
    }
}

export class LoginModal extends ComponentModalConfig<ILoginModalContext, void, void> {
    constructor() {
        super(LoginModalComponent, { });
        this.isClosable = false;
    }
}