import { Page } from './page';

export class ChromeTabs extends Page {
    constructor(app) {
        super(app)
    }

    //UI Controls
    get chromeTabs() {return this.app.getElements("div.chrome-tab-drag-handle"); }
    get closeTabButtons() {return this.app.getElements(".chrome-tab-close"); }
    get newTabButton() {return this.app.getElement("//div[@class= 'chrome-tab-title' and contains(text(),'+')]"); }
    get startEnabledButtons() {return this.app.getElements(".positive.ui.right.labeled.icon.button"); }
    get startEnabledDisabled() {return this.app.getElements(".control-container.ui.buttons"); }
    

    async closeTabs(){
        this.newTabButton.click();
        let tabs = await this.chromeTabs;
        while( tabs.length > 1){
            let closeTabs = await this.closeTabButtons
            this.app.click(await closeTabs[1].ELEMENT);
            tabs = await this.chromeTabs;
            };
    }
}