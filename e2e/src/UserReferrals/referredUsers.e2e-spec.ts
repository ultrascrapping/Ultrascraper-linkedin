import { AppPage } from '../PageObjects/app.po';
import { DBUtils } from '../Utils/dbUtils';
import { by } from 'protractor';

let page: any;
let sqlCmd: DBUtils;
let referredUsers = [
    {"email": 'oscar.ferrel.46@gmail.com', "signUpDate" : '7 de agosto de 2018', 'progress': '100%', 'xpath': 'td[contains(@id,\'isActive\')]//i[contains(@class, \'large green checkmark icon\')]'},
    {"email": 'ramiro.pointis@bairesdev.com', "signUpDate" : '2 de agosto de 2018', 'progress': '54%', 'xpath': 'td[contains(@id,\'isActive\')]//i[contains(@class, \'large yellow info icon\')]'},
    {"email": 'contacto@lucasmz.com', "signUpDate" : '3 de diciembre de 2018', 'progress': '5%', 'xpath': 'td[contains(@id,\'isActive\')]//i[contains(@class, \'large yellow info icon\')]'},
];


describe('When the user is logged into ultraApp and it has no referrals ', () =>{
    beforeEach( async () =>{
        page = new AppPage();
        sqlCmd = new DBUtils();
        page.navigateTo();
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');    
        await sqlCmd.removeReferrals(['contacto@lucasmz.com', 'ramiro.pointis@bairesdev.com','oscar.ferrel.46@gmail.com', 'stephannie.boudjemai@gmail.com', 'carlosgalv@gmail.com']);
    });
    it('should display referrals page header properly ', () => {
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
        expect(referralsTable.all(by.tagName('tr')).count()).toBe(1);
        okButton.click();
        page.performSignOut();
    });
});


describe('When the user is logged into Ultra app and it has referrals', () => {
    beforeEach(async () =>{
        page = new AppPage();
        sqlCmd = new DBUtils();
        page.navigateTo();
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');    
        await sqlCmd.addReferrals('jennifer.gifford1995@gmail.com',['contacto@lucasmz.com', 'ramiro.pointis@bairesdev.com','oscar.ferrel.46@gmail.com']);
        await sqlCmd.editReferals('oscar.ferrel.46@gmail.com', '2018-08-07 12:43:39', '4000');
        await sqlCmd.editReferals('ramiro.pointis@bairesdev.com', '2018-08-02 18:23:04', '2153');
        await sqlCmd.editReferals('contacto@lucasmz.com', '2018-12-03 11:57:44', '193');
    });

    it('should display referrals page header properly', () =>{
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
        for (var x =0; x < 3; x++){
            var referredUser = tableRows.get(x);
            expect(referredUser.element(by.id('email')).getText()).toEqual(referredUsers[x].email);              
            expect(referredUser.element(by.id('signupDate')).getText()).toEqual(referredUsers[x].signUpDate);
            expect(referredUser.element(by.xpath('td[contains(@id,\'progressPerc\')]//div[contains(@class, \'bar\')]//div[contains(@class,\'progress\')]')).getText()).toEqual(referredUsers[x].progress);
            expect(referredUser.element(by.xpath(referredUsers[x].xpath))).toBeDefined();
        }
        page.getOkButton().click();
        page.performSignOut();
    });
});
