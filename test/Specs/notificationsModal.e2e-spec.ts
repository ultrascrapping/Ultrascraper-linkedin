import { App } from '../Utils/app';
import { Hooks } from '../Utils/hooks';
import * as chai   from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as td  from './testData.json';
import * as config  from '../config.json';
import { SidePanel}  from '../PageObjects/sidePanel.page';
import { NotificationsModal}  from '../PageObjects/notificationsModal.page';
import { DBUtils } from '../Utils/dbUtils';
import { WebAPI } from '../Utils/webAPI';
import {expect} from 'chai';


chai.use(chaiAsPromised);
chai.should();

describe('NOTIFICATIONS MODAL', () => {
    let app =  new App();
    let hooks = new Hooks(app);
    let sidePanel: SidePanel;
    let notificationsModal: NotificationsModal;
    let sqlCmd = new DBUtils();
    let webAPI = new WebAPI();

    before(async () => {
        await hooks.openApp(app);
        sidePanel = new SidePanel(app);
        notificationsModal = new NotificationsModal(app);
        
    });
    
    after(async () => {
        await hooks.closeApp(app);
    });
    
    beforeEach(async () => {
        await sqlCmd.removeNotifications();
        await hooks.logIn(app,td.USERS.RIGHT.USER,td.USERS.RIGHT.PASS);
        
    }); 

    afterEach(async () =>{
        await notificationsModal.marcarTodasComoLeidasButton.click(); 
        await hooks.logOut(app);
    });
  
    it('[C16367] should display the badge with the correct number of notifications ', async () => {
        await sqlCmd.addNotifications(td.NOTIFICATIONS);

        let notifications_API = await webAPI.pushNotifications();
        let notifications_DB = await sqlCmd.getNotifications();
        let badge = parseInt(await sidePanel.notificationsBadge.getText());
        sidePanel.notificationsButton.click();

        expect(badge).equal(notifications_API.length);
        expect(badge).equal(notifications_DB.length);


      });

    it('[C16380] should display the notifications correctly in the notification Modal', async () => {
        await sqlCmd.addNotifications(td.NOTIFICATIONS);
        let notifications_API = await webAPI.pushNotifications();
        let notifications_DB = await sqlCmd.getNotifications();
        sidePanel.notificationsButton.click();

        let notifications_APP =  await notificationsModal.getNotificationObject();

        expect(notifications_DB.length).equal(notifications_APP.length);
        for(var x =0; x < notifications_DB.length; ++x){
            notifications_APP.find(e => e.Message == notifications_DB[x].Message).Message.should.equal(notifications_DB[x].Message);
        }

    });
});