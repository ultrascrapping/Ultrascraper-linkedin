import { Page } from './page';
import { SidePanel } from './sidePanel.page';
import { LoginPage } from './loginPanel.page';

export class SignOutModal extends Page {
    constructor(app) {
        super(app)
    }
    get header() {return this.app.getElement("//sui-modal//div[contains(@class,'header')]"); }
    get message() { return this.app.getElement("//sui-modal//div[contains(@class,'content')]//p"); }
    get siButton() { return this.app.getElement( "//sui-modal//div[contains(@class,'ui positive right labeled icon button')]"); }
    get noButton() { return this.app.getElement("//sui-modal//div[contains(@class,'ui negative button')]"); }

    async logOut(){
        let sidePanel:SidePanel = new SidePanel(this.app);
        await sidePanel.signOutButton.click();
        await this.siButton.click();
    }    
 
}
