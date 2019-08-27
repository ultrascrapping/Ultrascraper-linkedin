import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig } from 'ng2-semantic-ui';
import { UltraAccount } from '../../../models/ultra-account';
import { ApiService } from '../../../services/api.service'
import { UserService } from '../../../services/user.service'
import * as WAValidator from '../../../../../node_modules/wallet-address-validator/src/wallet_address_validator.js';

interface IMyAccountDataModalContext {
    usAccount: UltraAccount;
}

@Component({
    selector: 'app-my-account-data-modal',
    templateUrl: './my-account-data-modal.component.html',
    styleUrls: ['./my-account-data-modal.component.css']
})


export class MyAccountDataModalComponent implements OnInit {
    paypalEmail: string = '';
    btcAccount: string = '';
    isPaypalEmailValid: boolean = true;
    isBTCAddressValid: boolean = true;
    oldPassword: string = '';
    showNoPassWarning: boolean = false;
    changePassword: boolean = false;
    isLoading: boolean = false;
    newPassword: string = '';
    repeatPassword: string = '';
    hasChangedNewPassword: boolean = false;
    hasChangedRepeatPassword: boolean = false;
    errorMessage: string = '';

    /**
     * Constructor del modal de login.
     * @param modal Elemento SuiModal.
     * @param apiService Servicio de API.
     * @param userService Servicio de usuario.
     */
    constructor(
        public modal: SuiModal<IMyAccountDataModalContext, void, void>,
        private apiService: ApiService,
        private userService: UserService
        ) { 
            this.paypalEmail = this.modal.context.usAccount.paypalEmail;
            this.btcAccount = this.modal.context.usAccount.btcAddress;
        }

    ngOnInit() {
    }
    


    /**
     * Guarda los cambios en el LocalStorage, en las variables globales y envía los datos a la API
     */
    saveData() {

        //Primera comprobación para detectar si hubo cambios en el form.
        if (this.paypalEmail == this.modal.context.usAccount.paypalEmail && this.btcAccount == this.modal.context.usAccount.btcAddress && !this.changePassword) {
            this.closeModal();
            return;
        }
        //Comprobamos que se haya ingresado el pass para validar los cambios.
        if (this.oldPassword == '') {
            this.showNoPassWarning = true;
            return;
        }

        //Si vamos a cambiar el pass, necesitamos ingresarlo y que sean iguales en ambos campos.
        if (this.changePassword) {
            if (this.newPassword.length < 8) {
                this.hasChangedNewPassword = true;
                return;
            }

            if (this.newPassword != this.repeatPassword) {
                this.hasChangedRepeatPassword = true;
                return;
            }
        }
        //Verificamos la validez del correo de PayPal y la dirección de BTC
        if(!this.isPaypalEmailValid){
            return;
        }

        if(!this.isBTCAddressValid){
            return;
        }
          
        this.isLoading = true;
        // Se obtiene la información del usuario.
        let ultraAccount = this.userService.getCurrentUser();
        let newPass = this.changePassword ? this.newPassword : null;

        //Llamamos a la API con los datos.
        let param: any = { path: '/app/setaccountdata', args: { email: this.modal.context.usAccount.email, oldpassword: this.oldPassword, newpassword: this.changePassword ? this.newPassword : null, newpaypalemail: this.paypalEmail, newbtcaddress: this.btcAccount } };
        this.apiService.call<any>(this.apiService.apiPaths.request, param).subscribe(
            response => {
                if (!response.hasOwnProperty("error")) {
                    this.modal.context.usAccount.paypalEmail = response.PaypalEmail;
                    ultraAccount.paypalEmail = response.PaypalEmail;
                    ultraAccount.btcAddress = response.BTCAddress;
                    this.userService.updateCurrentUser(ultraAccount);
                    this.closeModal();
                } else {
                    this.showErrorMessage("Error");
                }
            },
            error => {
                this.showErrorMessage(error.error);
                this.isLoading = false
            },
            () => this.isLoading = false
        ); 
    }

    /**
     * Cierra el modal.
    */
    private closeModal(): void {
        this.modal.approve(void{});
    }


    /**
     * Muestra un mensaje de error de acuerdo a lo sucedido con la llamada a la API.
     * @param error Error de la llamada.
     */
    showErrorMessage(error : any) {
        if (error.hasOwnProperty("ErrorCode")) { 
            if (error.ErrorCode == 106) {
                this.errorMessage = "El password que ingresaste es incorrecto.";
            } else {
                this.errorMessage = error.Message;
            }
        } else {
            this.errorMessage = "Ocurrió un error al guardar los datos."
        }
    }

    /**
     * Cambia a true el booleano para indicar que se hicieron cambios en el campo de Nuevo Password.
     */
    changeNewPassword(){
        this.hasChangedNewPassword = true;
    }

    /**
     * Cambia a true el booleano para indicar que se hicieron cambios en el campo de Password duplicado.
     */
    changeRepeatPassword(){
        this.hasChangedRepeatPassword = true;
    }

    /**
     * Método para limpiar los campos para ingresar nuevo password
     */
    clickChangePasswordButton(){
        if (!this.changePassword){
            this.newPassword = '';
            this.repeatPassword = '';
            this.hasChangedNewPassword = false;
            this.hasChangedRepeatPassword = false;
        }
    }
 
    /**
     * Valida el email dado.
     * @param email Email a validar.
     */
    validateEmail(email: string) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    validateBTCAddress(btcAddress: string) {
        if (!btcAddress){
            return true;
        }
        return WAValidator.validate(btcAddress, 'BTC');
    }
}

export class MyAccountDataModal extends ComponentModalConfig<IMyAccountDataModalContext, void, void> {
    constructor(usAccount: UltraAccount) 
    {
        super(MyAccountDataModalComponent, { usAccount: usAccount });
        this.isClosable = false;
    }
}