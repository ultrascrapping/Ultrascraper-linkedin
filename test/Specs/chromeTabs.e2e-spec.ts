import { App } from '../Utils/app';
import { Hooks } from '../Utils/hooks';
import * as chai   from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as td  from './testData.json';
import { SidePanel }  from '../PageObjects/sidePanel.page';
import { ChromeTabs }  from '../PageObjects/chromeTabs.page';
import { expect }  from 'chai';
import { DBUtils } from '../Utils/dbUtils';


chai.use(chaiAsPromised)
chai.should()

describe('CHROME TABS', () => {
    let app =  new App();
    let hooks = new Hooks(app);
    let sidePanel: SidePanel;
    let chromeTabs: ChromeTabs;


    before(async () => {
        await hooks.openApp(app);
        sidePanel = new SidePanel(app);
        chromeTabs = new ChromeTabs(app);
    });
    
    after(async () => {
       await hooks.closeApp(app);
    });
    
    beforeEach(async () => {
        await hooks.logIn(app,td.USERS.RIGHT.USER,td.USERS.RIGHT.PASS);
        await chromeTabs.closeTabs();
    }); 

    afterEach(async () =>{
        await chromeTabs.closeTabs();
        await hooks.logOut(app);
    });
  

      it('[C16287] should be able to create new tab using the button in the side panel', async () => {
        let tabs = await chromeTabs.chromeTabs;
        let startTabsNumber = tabs.length;

        await sidePanel.newTabButton.click()
        tabs = await chromeTabs.chromeTabs;
        return expect( startTabsNumber + 1 ).equals(tabs.length);
      });

      it("[C16333] should be able to create new tab using the '+'button", async () => {
        let tabs = await chromeTabs.chromeTabs;
        let startTabsNumber = tabs.length;

        await chromeTabs.newTabButton.click()
        tabs = await chromeTabs.chromeTabs;
        return expect( startTabsNumber + 1 ).equals(tabs.length);
      });

      it("[C16334] should be able to close tabs using the 'x' button", async () => {
        await sidePanel.newTabButton.click()
        let tabs = await chromeTabs.chromeTabs;
        let startTabsNumber = tabs.length;

        let closeTabs = await chromeTabs.closeTabButtons;
        app.click(closeTabs[1].ELEMENT);
        tabs = await chromeTabs.chromeTabs;
        return expect( startTabsNumber - 1 ).equals(tabs.length);
      });

      // it(" should be able to start extration", async () => {
      // TODO
      //   const delay = ms => new Promise(res => setTimeout(res, ms));
      //   for(var x =5; x > 0; x--){
      //     await delay(1000);
      //     console.log(x);
      //   }

      //   let startButtons = await chromeTabs.startEnabledButtons;
      //   console.log(startButtons)
      //   app.click(startButtons[0].ELEMENT);

      // });

});

