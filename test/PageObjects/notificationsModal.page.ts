import { Page } from './page';


export class NotificationsModal extends Page {
    constructor(app) {
        super(app)
    }
    get marcarTodasComoLeidasButton() {return this.app.getElement("//div[@class='actions']//div[@class='ui button positive']"); }
    get cancelarButton() {return this.app.getElement(".ui.button.negative"); }
    get mostrarLeidasToggle() {return this.app.getElement(".ui.toggle.checkbox.f-left"); }

    get notificationDatesVisible() {return this.app.getElements('[style*="display: block"] #notificationDate'); }
    get notificationContentsVisible() {return this.app.getElements('[style*="display: block"] #notificationContent'); }
    

    async getNotificationObject() {
        let notificationContents = await  this.notificationContentsVisible;
        let notificationDates = await  this.notificationDatesVisible;
        let response = [];

        let contents = await notificationContents.map( function (notificationContents) {
            return notificationContents.ELEMENT;
        })

        let dates = await notificationDates.map( function (notificationDates) {
            return notificationDates.ELEMENT;
        })

        for(var x =0; x < contents.length; ++x){
            let c_text = await this.app.elementIdText(contents[x]);
            let d_text = await this.app.elementIdText(dates[x]);
            response.push({
                "Message": c_text.value,
                "Date": d_text.value
            });
        }
        return(response);
    }
}
