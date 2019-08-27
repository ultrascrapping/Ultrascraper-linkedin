import { AppPage } from '../PageObjects/app.po';
import { DBUtils } from '../Utils/dbUtils';

let page: AppPage;
let sqlCmd: DBUtils;

describe('When user is logged in UltraApp and it has transactions ', () =>{
 
    beforeEach(async () => {
      page = new AppPage();
      sqlCmd = new DBUtils();
      page.navigateTo();
      var result = await sqlCmd.addTransactions('jennifer.gifford1995@gmail.com');
    });

    it('the balance must be $1.27 and the profiles navigated must be 1270', () => {
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');
        expect(page.getCurrentBalance()).toEqual('$1.27');
        expect(page.getNavigatedProfiles()).toEqual('1270');
    });

    afterEach(() => {
        page.performSignOut();
        
    });
});

describe('When the user is logged into Ultra app and it does not have any transactions', () =>{
  
    beforeEach(async () => {
      page = new AppPage();
      sqlCmd = new DBUtils();
      page.navigateTo();
      await sqlCmd.removeTransactions('jennifer.gifford1995@gmail.com');
    });

    it('the balance must be $0.00 and the profiles navigated must be 0', () => {
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');
        expect(page.getCurrentBalance()).toEqual('$0.00');
        expect(page.getNavigatedProfiles()).toEqual('0');
    });

    afterEach(() => {
        page.performSignOut();
        
    });
});
