import { App } from '../Utils/app';
import { Hooks } from '../Utils/hooks';
import * as chai   from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as td  from './testData.json';
import { SidePanel}  from '../PageObjects/sidePanel.page';
import { ReferalsModal}  from '../PageObjects/referalsModal.page';
import { DBUtils } from '../Utils/dbUtils';
import {expect} from 'chai';

chai.use(chaiAsPromised);
chai.should();

describe('REFERALS MODAL', () => {
    let app =  new App();
    let hooks = new Hooks(app);
    let sidePanel: SidePanel;
    let referalsModal: ReferalsModal;
    let sqlCmd = new DBUtils();

    before(async () => {
        await hooks.openApp(app);
        sidePanel = new SidePanel(app);
        referalsModal = new ReferalsModal(app);
    });
    
    after(async () => {
        await hooks.closeApp(app);
    });
    
    beforeEach(async () => {
        await hooks.logIn(app,td.USERS.RIGHT.USER,td.USERS.RIGHT.PASS);
        sidePanel.referralsButton.click();
        
    }); 

    afterEach(async () =>{
        await referalsModal.okButton.click(); 
        await hooks.logOut(app);
    });
  
      it('[C10090] should display the refered users with the correct information', async () => {
        let user =  await sqlCmd.getUserInfo(td.USERS.RIGHT.USER);
        let referals_DB = await sqlCmd.getReferrals(user.Id);
        let referals_App = await referalsModal.getReferalsTableObject();
        expect(referals_App.length).equal(referals_DB.length);
        for(var x =0; x < referals_DB.length; ++x){
            referals_App.find(e => e.Email == referals_DB[x].Email ).Email.should.equal(referals_DB[x].Email);
        }
      });

});