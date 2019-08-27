import { AppPage } from './PageObjects/app.po';
import { browser, logging, promise } from 'protractor';
import { DBUtils } from './Utils/dbUtils';
import {TestRailsClient} from  './TestRails/TestRailsClient';




describe('when Ultra App launches', () => {
  let page: any;
  let sqlCmd: DBUtils;
  let TestRail: TestRailsClient;



  beforeEach(() => {
    page = new AppPage();
    sqlCmd = new DBUtils();
    page.navigateTo();  
    TestRail = new TestRailsClient();
  });

  describe('when I have the proper configuration of database ', () => {
    var testCaseId = 7901;
    it('should call the ConnectDatabase Method', async () => { 

    });

    afterEach(async () => {
      var result = await TestRail.GetTestResultsByRunId(350);
      if (result.untested_count === 0 && result.failed_count === 0 ) 
      {
        console.log('Will close test run');
        await TestRail.CloseTestRunById(result.id);
      }
      else
      {
        console.log('Cannot close test run');
      }
    });
  });
});


afterEach(async () => {
  // Assert that there are no errors emitted from the browser
  const logs = await browser.manage().logs().get(logging.Type.BROWSER);
  expect(logs).not.toContain(jasmine.objectContaining({
    level: logging.Level.SEVERE,
  }));
});
