import { App } from '../Utils/app';
import { Hooks } from '../Utils/hooks';
import * as chai   from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as td  from './testData.json';
import { SidePanel }  from '../PageObjects/sidePanel.page';
import { DBUtils } from '../Utils/dbUtils';
import { expect } from 'chai';

chai.use(chaiAsPromised)
chai.should()

describe('SIDE PANEL', () => {
    let app =  new App();
    let hooks = new Hooks(app);
    let sidePanel: SidePanel;
    let sqlCmd = new DBUtils();

    before(async () => {
        await hooks.openApp(app);
        sidePanel = new SidePanel(app);
    });
    
    after(async () => {
        await hooks.closeApp(app);
    });
    
    beforeEach(async () => {
        await hooks.logIn(app,td.USERS.RIGHT.USER,td.USERS.RIGHT.PASS);
    }); 

    afterEach(async () =>{
        await hooks.logOut(app);
    });
  
      it('[C10087] should display the correct balance', async () => {
        let user = await sqlCmd.getUserInfo(td.USERS.RIGHT.USER);
        let statistics= await  sqlCmd.getUserStatistics(user.Id);
        return sidePanel.currentBalance.getText().should.eventually.equal('$'+statistics.BALANCE.toFixed(2));
      });
  
      it('[C10088] should display the correct navigated profiles', async () => {
        let user = await sqlCmd.getUserInfo(td.USERS.RIGHT.USER);
        let statistics= await  sqlCmd.getUserStatistics(user.Id);
        return sidePanel.navigatedProfiles.getText().should.eventually.equal(statistics.EXTRACTED_PROFILES)
      });

      it('[C10089] should display the correct referal URL', async () => {
        let user = await sqlCmd.getUserInfo(td.USERS.RIGHT.USER)
        return sidePanel.referalUrl.getValue().should.eventually.equal('http://ultrascrapper.com/?refid='+user.Id)
      });

      it('[C16381] should display the correct referal price per 1000', async () => {
        let user = await sqlCmd.getUserInfo(td.USERS.RIGHT.USER)
        let statistics= await  sqlCmd.getUserStatistics(user.Id);
        return sidePanel.pricePer1000Label.getText().should.eventually.equal(`US$${statistics.PRICE_PER_THOUSAND.toFixed(2)}` );
      });
});


describe('SUPORT', () => {
  let app =  new App();
  let hooks = new Hooks(app);
  let sidePanel: SidePanel;

  before(async () => {
      await hooks.openApp(app);
      sidePanel = new SidePanel(app);
  });
  
  after(async () => {
      await hooks.closeApp(app);
  });
  
  beforeEach(async () => {
      await hooks.logIn(app,td.USERS.RIGHT.USER,td.USERS.RIGHT.PASS);
  }); 

  afterEach(async () =>{
      await sidePanel.supportOKButton.click();
      await hooks.logOut(app);
  });

    it('[C16271] Validate Support modal is displayed with the correct information', async () => {
      await sidePanel.supportButton.click();
      let supportDescription:string  = await sidePanel.supportDescription.getText()
      return expect(supportDescription).to.include("soporte@ultrascrapper.com");
    });

});