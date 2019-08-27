import { Page } from './page';


export class MyAccountModal extends Page {
    constructor(app) {
        super(app)
    }
    get okButton() {return this.app.getElement(".ui.right.floated.green.button"); }
    get btcaccountTextBox() {return this.app.getElement("#btcaccount"); }
    get emailTextBox() {return this.app.getElement("//sui-modal//input[@name='email']"); }
    get passwordTextBox() {return this.app.getElement("#userPassword"); }
    get newPasswordTextBox() {return this.app.getElement("#newPassword"); }
    get confirmPasswordTextBox() {return this.app.getElement("#confirmPassword"); }
    get changePasswordToggle() {return this.app.getElement("#cambiarPassword"); }

}
