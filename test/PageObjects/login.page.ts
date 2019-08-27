import { Page } from './page';

export class LoginPage extends Page {
    constructor(app) {
        super(app)
    }

    get header() {return this.app.getElement("//div[contains(@class,'header')]"); }
    get description() { return this.app.getElement("//div[contains(@class,'description')]"); }
    get emailTextBox() { return this.app.getElement( "#email"); }
    get passwordTextBox() { return this.app.getElement("#password"); }
    get registerTag() { return this.app.getElement("//p[contains(@class, 'd-table-cell')]//a"); }
    get loginButton() { return this.app.getElement("//div[contains(@class, 'd-table-cell')]//button"); }
    get notificationMessage() { return this.app.getElement("//div[contains(@style, \'color: red\')]"); }
    get loadingImg() { return this.app.getElementWait("img"); }
    get loginModal() { return this.app.getElement("sui-modal"); }
    get loginDimer() { return this.app.getElement("sui-dimmer"); }

    get loginModal_loc(){ return "sui-modal" }
    get loginDimer_loc(){ return "sui-dimmer" }
    get loginButton_loc(){ return "//div[contains(@class, 'd-table-cell')]//button" }
    get emailTextBox_loc(){ return "#email" }
    get passwordTextBox_loc(){ return "#password" }

    async logIn(username,password) {
        await this.emailTextBox.setValue(username);
        await this.passwordTextBox.setValue(password);
        await this.loginButton.click();
    }

}

