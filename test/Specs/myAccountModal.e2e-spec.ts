import { App } from '../Utils/app';
import { Hooks } from '../Utils/hooks';
import * as chai   from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as td  from './testData.json';
import { SidePanel}  from '../PageObjects/sidePanel.page';
import { MyAccountModal}  from '../PageObjects/myAccountModal.page';
import { DBUtils } from '../Utils/dbUtils';
import {expect} from 'chai';

chai.use(chaiAsPromised);
chai.should();

describe('MY ACCOUNT MODAL', () => {
    let app =  new App();
    let hooks = new Hooks(app);
    let sidePanel: SidePanel;
    let myAccountModal: MyAccountModal;
    let sqlCmd = new DBUtils();

    before(async () => {
        await hooks.openApp(app);
        sidePanel = new SidePanel(app);
        myAccountModal = new MyAccountModal(app);
    });
    
    after(async () => {
        await hooks.closeApp(app);
    });
    
    beforeEach(async () => {
        await hooks.logIn(app,td.USERS.RIGHT.USER,td.USERS.RIGHT.PASS);
        sidePanel.myAccountButton.click();
    }); 

    afterEach(async () =>{
       await hooks.logOut(app);
    });
  
    it('[C10091] should display My Account modal with the correct information', async () => {
    let user =  await sqlCmd.getUserInfo(td.USERS.RIGHT.USER);
    return Promise.all([
    myAccountModal.emailTextBox.getValue().should.eventually.equal(user.Email),
    myAccountModal.btcaccountTextBox.getValue().should.eventually.equal(user.BTCAddress),
    await myAccountModal.okButton.click()
    ]);
    });

    describe('', () => {
        beforeEach(async () => {
            await sqlCmd.updateUserBTCAdress(td.USERS.RIGHT.USER,td.BTCADDRESS.OLD);

            
        }); 
    
        afterEach(async () =>{
            await sqlCmd.updateUserBTCAdress(td.USERS.RIGHT.USER,td.BTCADDRESS.OLD);
        });
    
        it('[C10092] should allow to modify the BTC account in My account modal', async () => {
            await myAccountModal.btcaccountTextBox.setValue(td.BTCADDRESS.NEW);
            await myAccountModal.passwordTextBox.setValue(td.USERS.RIGHT.PASS);
            await myAccountModal.okButton.click(); 
            let user =  await sqlCmd.getUserInfo(td.USERS.RIGHT.USER);
            return Promise.all([
                expect(user.BTCAddress).equal(td.BTCADDRESS.NEW)
            ]);
        });
    });

    describe('', () => {
        beforeEach(async () => {
            await sqlCmd.updateUserPassword(td.USERS.RIGHT.USER,td.USERS.RIGHT.PASS);

            
        }); 

        afterEach(async () =>{
            await sqlCmd.updateUserPassword(td.USERS.RIGHT.USER,td.USERS.RIGHT.PASS);
        });
        
        it('[C10093] should allow to modify the password in My account modal', async () => {
        let user =  await sqlCmd.getUserInfo(td.USERS.RIGHT.USER);

        await myAccountModal.passwordTextBox.setValue(td.USERS.RIGHT.PASS);
        myAccountModal.changePasswordToggle.click();
        await myAccountModal.newPasswordTextBox.setValue(td.USERS.NEW.PASS);
        await myAccountModal.confirmPasswordTextBox.setValue(td.USERS.NEW.PASS);
        await myAccountModal.okButton.click(); 
        
        user =  await sqlCmd.getUserInfo(td.USERS.RIGHT.USER);

        return Promise.all([
            expect(user.Password).equal(td.USERS.NEW.PASS)
            ]);
        });
        });

});