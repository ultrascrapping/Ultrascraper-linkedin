import { Page } from './page';

export class SidePanel extends Page {
    constructor(app) {
        super(app)
    }

    //UI Controls
    get notificationsButton() {return this.app.getElement("#boton-notificaciones"); }
    get notificationsBadge() {return this.app.getElement(".floating.ui.red.label"); }
    get referralsButton() { return this.app.getElement("#boton-referidos"); }
    get myAccountButton() { return this.app.getElement( "#boton-cuenta"); }
    get signOutButton() { return this.app.getElement("#boton-salir"); }
    get supportButton(){ return this.app.getElement("#boton-soporte"); }
    get supportDescription(){ return this.app.getElement(".description"); }
    get supportOKButton(){ return this.app.getElement(".green.ui.button"); }
    get pricePer1000Label(){ return this.app.getElement(".ui.green.segment.referralBox strong"); }
    
    

    //Balance Table
    get currentBalance() {return this.app.getElement("#currentBalance"); }
    get navigatedProfiles() {return this.app.getElement("#navigatedProfiles"); }

    get referalUrl() {return this.app.getElement("#referralsUrl"); }

    //new tab buttons
    get newTabButton() {return this.app.getElement(".large.primary.ui.labeled.icon.button"); }
}
