import { AppPage } from '../PageObjects/app.po';
import { DBUtils } from '../Utils/dbUtils';
import { browser } from 'protractor';

let page: any;
let sqlCmd: DBUtils;

describe('When the user is logged into Ultra APP My Account view ', () => {
    beforeAll(async () => {
        page = new AppPage();
        sqlCmd = new DBUtils();
        await sqlCmd.removeNotifications();
        await sqlCmd.updateUltraPaypalAccount('carlosgalv@gmail.com', 'jennifer.gifford1995@gmail.com');
        page.navigateTo();
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');  
    });

    it('My account button should be present ', () =>{
        expect(page.getMyProfileButton()).toBeTruthy();
    });

    it('should cointain a \'Cancelar\' button', ()=> {
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

    it('should contain the email \'jennifer.gifford1995@gmail.com\' in the Email textbox', () =>{
        page.clickMyProfileButton();
        
        expect(page.getMyAccountEmail('jennifer.gifford1995@gmail.com')).toBeTruthy();
        expect(page.getMyAccountEmail('jennifer.gifford1995@gmail.com').isEnabled()).toBeFalsy();
        page.getMyAccountCancelButton().click();
    });

    it('should contain the email \'carlosgalv@gmail.com\' in the Paypal account textbox', ()=>{
        page.clickMyProfileButton();

        expect(page.getPayPalAccount()).toBeTruthy();
        expect(page.getPayPalAccount().getAttribute('value')).toEqual('carlosgalv@gmail.com');
        page.getMyAccountCancelButton().click();
    });

    it('should contain a \'Change Password\' toggle ', ()=>{
        page.clickMyProfileButton();
        expect(page.getChangePasswordToggle()).toBeTruthy();
        page.getMyAccountCancelButton().click();
    });

    it('should contain a \'New Password\' field disabled ', ()=>{
        page.clickMyProfileButton();
        expect(page.getNewPasswordDis()).toBeTruthy();
        page.getMyAccountCancelButton().click();
    });

    
    it('should contain a \'Confirm New Password\' field disabled ', ()=>{
        page.clickMyProfileButton();
        expect(page.getConfirmNewPasswordDis()).toBeTruthy();
        page.getMyAccountCancelButton().click();
    });

    afterAll(() => {
        page.performSignOut();
        
    });

});

describe('When the user tries to change Paypal account ', () => {
    beforeAll(async () => {
        page = new AppPage();
        sqlCmd = new DBUtils();
        await sqlCmd.removeNotifications();
        page.navigateTo();
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');  
    });

    it('using an invalid email the message \'El correo ingresado es inválido\' should be displayed ', () =>{
        page.clickMyProfileButton();
        page.clearPaypalAccountField();
        page.getPayPalAccount().sendKeys('carlosgalv@gmail');
        expect(page.getPaypayErrorMessage().getText()).toEqual('El correo ingresado es inválido');
        page.clearPaypalAccountField();
        page.getPayPalAccount().sendKeys('carlosgalv@.com');
        expect(page.getPaypayErrorMessage().getText()).toEqual('El correo ingresado es inválido');
        page.clearPaypalAccountField();
        page.getPayPalAccount().sendKeys('@gmail.com');
        expect(page.getPaypayErrorMessage().getText()).toEqual('El correo ingresado es inválido');
        page.getMyAccountCancelButton().click();
    });

    it('using a valid email but invalid password the message \'El password que ingresaste es incorrecto.\' should be displayed ',() =>{
        page.clickMyProfileButton();
        page.clearPaypalAccountField();
        page.getPayPalAccount().sendKeys('carlosgavl2@gmail.com');
        page.getCurrentPasswordField().sendKeys('abc12345xyz');
        var saveButton = page.getMyAccountSaveButton();
        expect(saveButton).toBeTruthy();
        saveButton.click();
        expect(page.getInvalidPasswordMessage().getText()).toEqual('El password que ingresaste es incorrecto.');
        page.getMyAccountCancelButton().click();
    });
    afterAll(() => {
        page.performSignOut();
        
    });

});

describe('When the user tries to update the account password  ', () => {
    beforeAll( async () => {
        page = new AppPage();
        sqlCmd = new DBUtils();
        await sqlCmd.removeNotifications();
        page.navigateTo();
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');  
    });
    it('and click on \'Cambiar contraseña\' toggle the New password and Confirm new password should be enabled ', () => {
        page.clickMyProfileButton();
        var changePasswordToggle = page.getChangePasswordToggle();
        browser.actions().mouseMove(changePasswordToggle).click().perform();
        expect(page.getNewPasswordEna()).toBeTruthy();
        expect(page.getConfirmNewPasswordEna()).toBeTruthy();
        page.getMyAccountCancelButton().click();
    });

    it('using an invalid password the message \'El password que ingresaste es incorrecto.\' should be displayed', () => {
        page.clickMyProfileButton();
        page.getCurrentPasswordField().sendKeys('abc12345xyz');
        var changePasswordToggle = page.getChangePasswordToggle();
        browser.actions().mouseMove(changePasswordToggle).click().perform();
        page.getNewPasswordEna().sendKeys('BairesDev123!');
        page.getConfirmNewPasswordEna().sendKeys('BairesDev123!');
        page.getMyAccountSaveButton().click();
        expect(page.getInvalidPasswordMessage().getText()).toEqual('El password que ingresaste es incorrecto.');
        page.getMyAccountCancelButton().click();
    });

    it('using a valid password but the new passwords doesn\'t match, the message \'Las contraseñas no coinciden\' should be displayed', () =>{
        page.clickMyProfileButton();
        page.getCurrentPasswordField().sendKeys('Jennifer123!');
        var changePasswordToggle = page.getChangePasswordToggle();
        browser.actions().mouseMove(changePasswordToggle).click().perform();
        page.getNewPasswordEna().sendKeys('BairesDev123!');
        page.getConfirmNewPasswordEna().sendKeys('BairesDev123#');
        page.getMyAccountSaveButton().click();
        expect(page.getChangePasswordErrorMessage().getText()).toEqual('Las contraseñas no coinciden');
        page.getMyAccountCancelButton().click();
    });

    it('using a valid password but the new passwords is too short, the message \'La contraseña debe tener 8 caracteres como mínimo\' should be displayed', () =>{
        page.clickMyProfileButton();
        page.getCurrentPasswordField().sendKeys('Jennifer123!');
        var changePasswordToggle = page.getChangePasswordToggle();
        browser.actions().mouseMove(changePasswordToggle).click().perform();
        page.getNewPasswordEna().sendKeys('Baires');
        page.getMyAccountSaveButton().click();
        expect(page.getChangePasswordErrorMessage().getText()).toEqual('La contraseña debe tener 8 caracteres como mínimo');
        page.getMyAccountCancelButton().click();
    });

    afterAll(() => {
        page.performSignOut();
        
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
        
    });
});


