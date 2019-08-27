import { AppPage } from '../PageObjects/app.po';
import { TestRailsClient } from '../TestRails/TestRailsClient';
import { DBUtils } from '../Utils/dbUtils';
import { by, browser } from 'protractor';


let page: AppPage;
let TestRail: TestRailsClient;
let sqlCmd: DBUtils;
let TestRunId;
let testCases = [];
let testResult = 1;
let errorMessage = "";
let referredUsers = [
    { "email": 'alexarigo123@gmail.com', "signUpDate": '10 de agosto de 2018', 'progress': '100%', 'xpath': 'td[contains(@id,\'isActive\')]//i[contains(@class, \'large green checkmark icon\')]' },
    { "email": 'ramiro.pointis@bairesdev.com', "signUpDate": '2 de agosto de 2018', 'progress': '54%', 'xpath': 'td[contains(@id,\'isActive\')]//i[contains(@class, \'large yellow info icon\')]' },
    { "email": 'contacto@lucasmz.com', "signUpDate": '3 de diciembre de 2018', 'progress': '5%', 'xpath': 'td[contains(@id,\'isActive\')]//i[contains(@class, \'large yellow info icon\')]' },
];


beforeAll(async () => {
    TestRail = new TestRailsClient();
});


describe('When Smoke Tests are executed for the first time ', () => {
    beforeEach(async () => {
        TestRunId = await TestRail.GetTestRunId();
    });
    it('should create a new test run when TestRunId ==0 ', async () => {
        if (TestRunId === 0) {
            TestRunId = await TestRail.CreateTestRun();
            console.log('Test run id returned ' + TestRunId);
        }
        expect(TestRunId).toBeGreaterThan(0);
    });
});


describe('when Ultra App first opens, the login form should be displayed and ', () => {
    beforeEach(() => {
        page = new AppPage();
        page.navigateTo();
        testCases.push(7901);
    });
    it('should display login form properly', () => {
        expect(page.getTitleText()).toEqual('Estadísticas');
        expect(page.getLoginFormHeader().getText()).toEqual('Bienvenido a Ultra');
        expect(page.getEmailTextBoxElement()).not.toBeNull();
        expect(page.getPassWordTextBoxElement()).not.toBeNull();
        expect(page.getLoginButton()).not.toBeNull();
        expect(page.getRegisterTag()).not.toBeNull();
    });
    afterEach(async () => {
        await UpdateTestResults(testCases);
        testCases = [];
    });
});

describe('when a user tries to log into UltraApp ', () => {
    beforeEach(() => {
        page = new AppPage();
        page.navigateTo();
        testCases.push(7902);
        testCases.push(10094);
    });
    it('using a valid email and a valid password the user should be able to login', () => {
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');
        expect(page.getSignOutButton().isEnabled()).toBeTruthy();
        page.performSignOut();
    });
    afterEach(async () => {
        await UpdateTestResults(testCases);
        testCases = [];
    });
});

describe('When user is logged in UltraApp and it has transactions ', () => {

    beforeEach(async () => {
        page = new AppPage();
        sqlCmd = new DBUtils();
        page.navigateTo();
        var result = await sqlCmd.addTransactions('jennifer.gifford1995@gmail.com');
        testCases.push(10087);
        testCases.push(10088);
        testCases.push(10089);
    });

    it('the balance must be $1.27 and the profiles navigated must be 1270', () => {
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');
        expect(page.getCurrentBalance()).toEqual('$1.27');
        expect(page.getNavigatedProfiles()).toEqual('1270');
        expect(page.getReferralsUrl().getAttribute('value')).toEqual('http://ultra.com/?refid=4');
    });

    afterEach(async () => {
        page.performSignOut();
        await UpdateTestResults(testCases);
        testCases = [];
    });
});

describe('When the user is logged into Ultra app and it has referrals', () => {
    beforeEach(async () => {
        page = new AppPage();
        sqlCmd = new DBUtils();
        page.navigateTo();
        await sqlCmd.removeReferrals(['contacto@lucasmz.com', 'ramiro.pointis@bairesdev.com', 'stephannie.boudjemai@gmail.com', 'carlosgalv@gmail.com', 'alexarigo123@gmail.com']);
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');
        await sqlCmd.addReferrals('jennifer.gifford1995@gmail.com', ['contacto@lucasmz.com', 'ramiro.pointis@bairesdev.com', 'alexarigo123@gmail.com']);
        await sqlCmd.editReferals('alexarigo123@gmail.com', '2018-08-10 12:43:39', '4000');
        await sqlCmd.editReferals('ramiro.pointis@bairesdev.com', '2018-08-02 18:23:04', '2153');
        await sqlCmd.editReferals('contacto@lucasmz.com', '2018-12-03 11:57:44', '193');
        testCases.push(10090);
    });

    it('should display referrals page header properly', () => {
        var referralsButton = page.getReferralsButton();
        expect(referralsButton).toBeDefined('Referrals button was not present in UltraApp');
        referralsButton.click();
        expect(page.getReferralHeader().getText()).toEqual('Referidos');
        expect(page.getReferredHeaderEmail()).toEqual('E-mail');
        expect(page.getReferredHeaderSignup()).toEqual('Fecha de alta');
        expect(page.getReferredHeaderProgress()).toEqual('Progreso actual');
        expect(page.getReferredHeaderIsActive()).toEqual('Activo');
        var okButton = page.getOkButton();
        expect(okButton).toBeDefined('OK Button was not present in UltraApp');
        var referralsTable = page.getReferralsTable();
        var tableBody = referralsTable.all(by.tagName('tbody'));
        expect(tableBody.all(by.tagName('tr')).count()).toEqual(3);
        var tableRows = tableBody.all(by.tagName('tr'));
        for (var x = 0; x < 3; x++) {
            var referredUser = tableRows.get(x);
            expect(referredUser.element(by.id('email')).getText()).toEqual(referredUsers[x].email);
            expect(referredUser.element(by.id('signupDate')).getText()).toEqual(referredUsers[x].signUpDate);
            expect(referredUser.element(by.xpath('td[contains(@id,\'progressPerc\')]//div[contains(@class, \'bar\')]//div[contains(@class,\'progress\')]')).getText()).toEqual(referredUsers[x].progress);
            expect(referredUser.element(by.xpath(referredUsers[x].xpath))).toBeDefined();
        }
        page.getOkButton().click();
        page.performSignOut();
    });
    afterEach(async () => {
        await UpdateTestResults(testCases);
        testCases = [];
    });
});

describe('When the user is logged into Ultra APP My Account view ', () => {
    beforeAll(async () => {
        page = new AppPage();
        sqlCmd = new DBUtils();
        await sqlCmd.removeNotifications();
        await sqlCmd.updateUltraPaypalAccount('carlosgalv@gmail.com', 'jennifer.gifford1995@gmail.com');
        page.navigateTo();
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');
        testCases.push(10091);
    });

    it('My account button should be present ', () => {
        expect(page.getMyProfileButton()).toBeTruthy();
    });

    it('should cointain a \'Cancelar\' button', () => {
        page.clickMyProfileButton();
        expect(page.getMyAccountCancelButton()).toBeTruthy();
        expect(page.getMyAccountCancelButton().getText()).toEqual('Cancelar');
        page.getMyAccountCancelButton().click();
    });

    it('should contain the header \'Mi cuenta \'', () => {
        page.clickMyProfileButton();
        expect(page.getMyAccountViewHeader().getText()).toEqual('Mi cuenta');
        page.getMyAccountCancelButton().click();
    });

    it('should contain the email \'jennifer.gifford1995@gmail.com\' in the Email textbox', () => {
        page.clickMyProfileButton();

        expect(page.getMyAccountEmail('jennifer.gifford1995@gmail.com')).toBeTruthy();
        expect(page.getMyAccountEmail('jennifer.gifford1995@gmail.com').isEnabled()).toBeFalsy();
        page.getMyAccountCancelButton().click();
    });

    it('should contain the email \'carlosgalv@gmail.com\' in the Paypal account textbox', () => {
        page.clickMyProfileButton();

        expect(page.getPayPalAccount()).toBeTruthy();
        expect(page.getPayPalAccount().getAttribute('value')).toEqual('carlosgalv@gmail.com');
        page.getMyAccountCancelButton().click();
    });

    it('should contain a \'Change Password\' toggle ', () => {
        page.clickMyProfileButton();
        expect(page.getChangePasswordToggle()).toBeTruthy();
        page.getMyAccountCancelButton().click();
    });

    it('should contain a \'New Password\' field disabled ', () => {
        page.clickMyProfileButton();
        expect(page.getNewPasswordDis()).toBeTruthy();
        page.getMyAccountCancelButton().click();
    });


    it('should contain a \'Confirm New Password\' field disabled ', () => {
        page.clickMyProfileButton();
        expect(page.getConfirmNewPasswordDis()).toBeTruthy();
        page.getMyAccountCancelButton().click();
    });

    afterAll(async () => {
        page.performSignOut();
        await UpdateTestResults(testCases);
        testCases = [];
    });

});

describe('When the user changes the Paypal Email account in Ultra App ', () =>{
    beforeEach(async () => {
        page = new AppPage();
        sqlCmd = new DBUtils();
        await sqlCmd.removeNotifications();
        await sqlCmd.updateUltraPaypalAccount('carlosgalv@gmail.com', 'jennifer.gifford1995@gmail.com');
        page.navigateTo();
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');  
        testCases.push(10092);
    });
    it('using a valid email and a valid password the Paypal account must be updated in DataBase', ()=> {
        page.clickMyProfileButton();
        page.clearPaypalAccountField();
        page.getPayPalAccount().sendKeys('modifiedpaypal@gmail.com');
        page.getCurrentPasswordField().sendKeys('Jennifer123!');
        page.getMyAccountSaveButton().click();
        page.clickMyProfileButton();
        expect(page.getPayPalAccount().getAttribute('value')).toEqual('modifiedpaypal@gmail.com');
        page.getMyAccountCancelButton().click();
    });
    afterEach( async () => {
        var paypalEmail =  await sqlCmd.getUltraUserInfo('jennifer.gifford1995@gmail.com', 'PaypalEmail');
        expect(paypalEmail).toEqual('modifiedpaypal@gmail.com', 'Paypal email in database is not correct');
        await sqlCmd.updateUltraPaypalAccount('carlosgalv@gmail.com', 'jennifer.gifford1995@gmail.com');
        page.performSignOut();
        await UpdateTestResults(testCases);
        testCases = [];        
    });
});

describe('When the user changes the user password ', () =>{
    beforeEach(async () => {
        page = new AppPage();
        sqlCmd = new DBUtils();
        await sqlCmd.removeNotifications();
        await sqlCmd.updateUltraPassword('Jennifer123!','jennifer.gifford1995@gmail.com');
        page.navigateTo();
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!'); 
        testCases.push(10093); 
    });
    it('using a valid password and new password that match ', () => {
        page.clickMyProfileButton();
        page.getCurrentPasswordField().sendKeys('Jennifer123!');
        var changePasswordToggle = page.getChangePasswordToggle();
        browser.actions().mouseMove(changePasswordToggle).click().perform();
        page.getNewPasswordEna().sendKeys('BairesDev123!');
        page.getConfirmNewPasswordEna().sendKeys('BairesDev123!');
        page.getMyAccountSaveButton().click();
  
        page.performSignOut();
        page.performSignIn('jennifer.gifford1995@gmail.com', 'BairesDev123!');  
        expect(page.getMyProfileButton()).toBeTruthy();    
    });
    afterEach( async () => {
        var userPassword =  await sqlCmd.getUltraUserInfo('jennifer.gifford1995@gmail.com', 'Password');
        expect(userPassword).toEqual('BairesDev123!', 'User Passworrd in database is not correct');
        await sqlCmd.updateUltraPassword('Jennifer123!','jennifer.gifford1995@gmail.com');
        page.performSignOut();
        await UpdateTestResults(testCases);
        testCases = [];        
    });
});

afterAll(async () => {
    var result = await TestRail.GetTestResultsByRunId(TestRunId);
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

async function UpdateTestResults(testCases) {
    for (var x = 0; x < testCases.length; x++) {
        jasmine.getEnv().addReporter(new function () {
            this.specDone = async function (result) {
                if (result.failedExpectations.length > 0) {
                    testResult = 5;
                    errorMessage = result.failedExpectations;
                } else {
                    testResult = 1;
                    errorMessage = "Test executed successfully";
                }
            };
        });
        await TestRail.AddTestResults(TestRunId, testCases[x], testResult, errorMessage);
    }
}


