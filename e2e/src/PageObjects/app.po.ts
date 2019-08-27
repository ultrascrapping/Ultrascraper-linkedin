import { browser, by, element, protractor } from 'protractor';
import { async } from '@angular/core/testing';
import { start } from 'repl';


var EC = protractor.ExpectedConditions;

export class AppPage {
  
  navigateTo() {
    browser.manage().window().maximize();
    return browser.get('/') as Promise<any>;
   }


  closeBrowser(){
    browser.close();
  }
  
  getPageTitle() {
    return browser.baseUrl;
  }

  getActiveWindows() {
    return browser.getAllWindowHandles();
  }

  getTitleText() {
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }

  //Login Form elements
  getLoginFormHeader() {
    var loginFormHeader = element(by.xpath('//div[contains(@class,\'header\')]'));
    browser.wait(EC.presenceOf(loginFormHeader),5000,'Login form was not displayed');
    return loginFormHeader;
  }

  getLoginDescription() {
    return element(by.xpath('//div[contains(@class,\'description\')]')).getText();
  }

  getEmailTextBoxElement() {
    var emailTextBox = element(by.id('email'));
    browser.wait(EC.presenceOf(emailTextBox),5000, 'Email text box is not present in the login form');
    return emailTextBox;
  }

  getPassWordTextBoxElement() {
    var passWordTextBox = element(by.id('password'));
    browser.wait(EC.presenceOf(passWordTextBox), 5000, 'Password text box is not present in login form');
    return passWordTextBox;
  }

  getRegisterTag() {
    return element(by.xpath('//p[contains(@class, \'d-table-cell\')]//a'));
  }

  getLoginButton() {
    var logginButton = element(by.xpath('//div[contains(@class, \'d-table-cell\')]//button'));
    browser.wait(EC.presenceOf(logginButton), 5000, "Login button was not present in page");
    return logginButton;
  }

  getLoginButtonText() {
    return element(by.xpath('//div[contains(@class, \'d-table-cell\')]//button')).getText();
  }

  getNotificationMessage() {
    var notificationMessage = element(by.xpath('//div[contains(@style, \'color: red\')]'));
    browser.wait(EC.presenceOf(notificationMessage), 5000, "Notification message was not returned");
    return notificationMessage.getText();
  }

  
  performSignIn(email, password) {
    this.getEmailTextBoxElement().sendKeys(email);
    this.getPassWordTextBoxElement().sendKeys(password);
    this.getLoginButton().click();
  }


  //UI Control elements
  getNotificationsButton(){
    var notificationsButton = element(by.xpath('//button[contains(@id,\'boton-notificaciones\')]//i[contains(@class,\'bell icon\')]'));
    browser.wait(EC.presenceOf(notificationsButton), 5000, 'Notifications button is not present in app');
    return notificationsButton;
  }

  getReferralsButton() {
    var referralsbutton = element(by.xpath('//button[contains(@id,\'boton-referidos\')]//i[contains(@class,\'users icon\')]'));
    browser.wait(EC.presenceOf(referralsbutton), 5000, 'Referrals button is not present in page');
    return referralsbutton;
  }

  getMyProfileButton(){
    var myProfileButton = element(by.xpath('//button[contains(@id,\'boton-cuenta\')]//i[contains(@class,\'user icon\')]'));
    browser.wait(EC.presenceOf(myProfileButton),20000, 'My profile button is not present in App');
    return myProfileButton;
  }

  performSignOut() {
    this.getSignOutButton().click();
    this.getYesToSignOutButton().click();
  }

  getSignOutButton() {
    var exitButton = element(by.xpath('//button[contains(@id,\'boton-salir\')]//i[contains(@class,\'sign-out icon\')]'));
    browser.wait(EC.elementToBeClickable(exitButton), 5000, "Exit button is not present");
    return exitButton;
  }

  getNotoSignOutButton() {
    return element(by.xpath('//div[contains(@class, \'ui negative button\')]'));
  }

  getYesToSignOutButton() {
    return element(by.xpath('//div[contains(@class, \'ui positive right labeled icon button\')]'));
  }

  getActiveTabs() {
    return element(by.xpath('//div[contains(@class,\'chrome-tab-favicon\')]'));;
  }


//Sidebar balance elements
  getCurrentBalance() {
    var currentBalance = element(by.xpath('//td[contains(@id,\'currentBalance\')]'));
    browser.wait(EC.presenceOf(currentBalance), 5000, 'Current balance was not present in page');
    return currentBalance.getText();
  }

  getNavigatedProfiles() {
    var navigatedProfiles = element(by.xpath('//td[contains(@id,\'navigatedProfiles\')]'));
    browser.wait(EC.presenceOf(navigatedProfiles), 5000, 'Navigated profiles was not present in page');
    return navigatedProfiles.getText();
  }

  getReferralsUrl() {
    var referralsUrl = element(by.xpath('//input[contains(@id,\'referralsUrl\')]'));
    browser.wait(EC.presenceOf(referralsUrl), 5000, 'Referrals URL is not displayed in Side Panel');
    return referralsUrl;
  }

  //Objects in Referral view
  getReferralHeader() {
    var referralHeader = element(by.xpath('//div[contains(@class,\'ui modal transition active visible normal\')]//div[contains(@class, \'header\')]'));
    browser.wait(EC.presenceOf(referralHeader), 5000, 'Referral view was not loaded ');
    return referralHeader;
  }

  getReferredHeaderEmail() {
    return element(by.xpath('//th[contains(@id,\'referredEmail\')]')).getText();
  }

  getReferredHeaderSignup() {
    return element(by.xpath('//th[contains(@id,\'referredSignup\')]')).getText();
  }

  getReferredHeaderProgress() {
    return element(by.xpath('//th[contains(@id,\'referredProgress\')]')).getText();
  }

  getReferredHeaderIsActive() {
    return element(by.xpath('//th[contains(@id,\'referredActive\')]')).getText();
  }

  getOkButton() {
    return element(by.xpath('//div[contains(@class,\'actions\')]//button[contains(@class, \'ui green button\')]'));
  }

  getReferralsTable(){
    var referralsTable = element(by.xpath('//table[contains(@class, \'ui striped table\')]'));
    browser.wait(EC.visibilityOf(referralsTable), 5000, 'The referrals table was not loaded');
    return referralsTable;
  }

  getReferredUsers(){    
    return element(by.xpath('//tr[contains(@id,\'referredUser\')]'));
  }

  //Objects in Notifications view
  getNotificationsHeader(){
    var notificationsHeader = element(by.xpath('//div[contains(@class,\'header\')]'));
    browser.wait(EC.presenceOf(notificationsHeader), 5000, 'Notifications view does not contain header');
    return notificationsHeader;
  }

  getShowReadMessagesCheckBox(){
    var showReadMessagesCheckBox = element(by.xpath('//div[contains(@class,\'ui toggle checkbox f-left\')]//input[contains(@name, \'showUnread\')]'));
    browser.wait(EC.presenceOf(showReadMessagesCheckBox), 5000, 'Show Read messages is not present in Notifications view');
    return showReadMessagesCheckBox;
  }

  getMarkAllAsReadButton(){
    var markAllAsRead = element(by.xpath('//div[contains(@class,\'ui button positive\')]'));
    browser.wait(EC.elementToBeClickable(markAllAsRead), 5000, 'Mark all as read button is not present in app');
    return markAllAsRead;
  }

  getCloseNotificationsButton(){
    var closeButton = element(by.xpath('//div[contains(@class,\'ui button negative\')]'));
    browser.wait(EC.presenceOf(closeButton),5000, 'Close notifications button is not present in Notifications view');
    return closeButton;
  }

  getUnreadNotifications(){
    var unreadNotifications = element(by.xpath('//div[contains(@class,\'floating ui red label\')]'));
    return unreadNotifications;
  }

  getNotifications(){
    var notificationsList = element.all(by.xpath('//div[contains(@class,\'ui segment\')]'));
    return notificationsList;
  }

  getNotificationMessages(){
    var notificationMessages = element.all(by.xpath('//div[contains(@class,\'ui segment\')]//p[contains(@id,\'notificationContent\')]'));
    browser.wait(EC.presenceOf(notificationMessages.first()), 5000, 'There are no notification messages');
    return notificationMessages;
  }

  getNotificationsBox(){
    var notificationsBox = element(by.xpath('//div[contains(@class,\'scrolling content\')]//div[contains(@class,\'description\')]'));
    browser.wait(EC.visibilityOf(notificationsBox), 5000, 'Notifications are not displayed ');
    return notificationsBox;
  }

  //Elements in my account view

  getMyAccountViewHeader(){
    return element(by.xpath('//div[contains(@id, \'myAccount-header\')]'));
  }

  getMyAccountCancelButton(){
    var cancelButton = element(by.xpath('//div[contains(@class,\'actions\')]//button[contains(@class,\'ui red button\')]'));
    browser.wait(EC.visibilityOf(cancelButton), 10000, 'Cancel button is not present in my profile view');
    return cancelButton;
  }

  getMyAccountSaveButton(){
    var saveButton = element(by.xpath('//div[contains(@class,\'actions\')]//button[contains(@class,\'ui green button\')]'));
    browser.wait(EC.elementToBeClickable(saveButton), 5000, 'Cancel button is not present in my profile view');
    return saveButton;
  }

  getMyAccountEmail(email){
    var xpath = '//input[contains(@ng-reflect-model,\''+ email + '\')]';
     var myEmail = element(by.xpath(xpath));
    browser.wait(EC.presenceOf(myEmail), 5000,'Email is not being placed in My Account view');
    return myEmail;
  }

  getPayPalAccount(){
    var payPalAccount = element(by.xpath('//input[contains(@id,\'paypalAccount\')]'));
    browser.wait(EC.presenceOf(payPalAccount), 5000, 'Paypal account textbox is not present in My Account view');
    return payPalAccount;
  }

  getCurrentPasswordField(){
    var currentPassword = element(by.xpath('//input[contains(@id,\'userPassword\')]'));
    browser.wait(EC.presenceOf(currentPassword), 5000, 'Current password textbox is not present in My Account view');
    return currentPassword;
  }

  getChangePasswordToggle(){
    var changePassToggle = element(by.xpath('//input[contains(@type,\'checkbox\')]'));
    browser.wait(EC.presenceOf(changePassToggle), 5000, 'Change password toggle is not present in My Account view');
    return changePassToggle;
  }
  
  getNewPasswordDis(){
    var newPassword = element(by.xpath('//div[contains(@class,\'field disabled\')]//input[contains(@id, \'newPassword\')]'));
    browser.wait(EC.presenceOf(newPassword), 5000, 'New password textbox is not present in My Account view');
    return newPassword;
  }

  getConfirmNewPasswordDis(){
    var confirmNewPassword = element(by.xpath('//div[contains(@class,\'field disabled\')]//input[contains(@id, \'confirmPassword\')]'));
    browser.wait(EC.presenceOf(confirmNewPassword), 5000, 'Confirm new password textbox is not present in My Account view');
    return confirmNewPassword;
  }

  getNewPasswordEna(){
    var newPassword = element(by.xpath('//div[contains(@class,\'field\')]//input[contains(@id, \'newPassword\')]'));
    browser.wait(EC.presenceOf(newPassword), 5000, 'New password textbox is not present in My Account view');
    return newPassword;
  }

  getConfirmNewPasswordEna(){
    var confirmNewPassword = element(by.xpath('//div[contains(@class,\'field\')]//input[contains(@id, \'confirmPassword\')]'));
    browser.wait(EC.presenceOf(confirmNewPassword), 5000, 'Confirm new password textbox is not present in My Account view');
    return confirmNewPassword;
  }

  getPaypayErrorMessage(){
    var paypalErrorMessage = element(by.xpath('//div[contains(@class,\'ui pointing label red\')]'));
    browser.wait(EC.presenceOf(paypalErrorMessage), 5000, 'Paypal error message was not displayed');
    return paypalErrorMessage;
  }

  getInvalidPasswordMessage(){
    var invalidPasswordMessage = element(by.xpath('//label[contains(@class,\'ui red label l-align-center\')]'));
    browser.wait(EC.presenceOf(invalidPasswordMessage), 5000, 'Invalid password message was not displayed');
    return invalidPasswordMessage;
  }

  getChangePasswordErrorMessage(){
    var mismatchPwdErrorMessage = element(by.xpath('//div[contains(@class,\'ui pointing label red\')]'));
    browser.wait(EC.presenceOf(mismatchPwdErrorMessage), 5000, 'Error message was not present in my Account form');
    return mismatchPwdErrorMessage;
  }

  clearPaypalAccountField(){
    this.getPayPalAccount().clear();
  }

  clickMyProfileButton(){
    var myProfileButton = this.getMyProfileButton();
    browser.actions().mouseMove(myProfileButton).click().perform();
  }

  //LinkedIn Page elements
  getLinkedInEmailTextBox(){
    var iframe = element(by.tagName('iframe'));
    browser.wait(EC.presenceOf(iframe), 10000, 'Iframe is not present ');
    console.log('Iframe ' + iframe);
    browser.switchTo().frame(iframe).then(function(frame) {
      console.log('Just switch to frame ' + frame);
    })
    .catch(function (err){
      console.log('Error ocurred while changing frame ' + err);
    });
    var linkedInTextBox = element(by.deepCss('//input[contains(@id,\'login-email\')]'));
    console.log('LinkedIn Text box ' + linkedInTextBox);
    browser.wait(EC.presenceOf(linkedInTextBox), 10000, 'LinkedIn Email text box is not present ');
    return linkedInTextBox;
  }

  async getAddTabButton(){
    console.log('Get Add Tab method was called ');
    await browser.sleep(5000)
    .then( function () {
        console.log('Wating....');
    })
    .catch(function (err) {
        console.log('Something went wrong ', err);
    });
    var addTabButton = element(by.xpath('//div[contains(@class, \'chrome-tab add-tab\')]//div[contains(@class,\'chrome-tab-title\')]'));
    browser.wait(EC.elementToBeClickable(addTabButton), 15000, 'Add tab button was not present in Ultra App');
    return addTabButton;
  }

  async getStartExtractionButton(){
    console.log('Get Start extraction method was called ');
    await browser.sleep(5555000)
    .then( function () {
        console.log('Wating....');
    })
    .catch(function (err) {
        console.log('Something went wrong ', err);
    });
    var startExtractionButton = element(by.xpath('//button[contains(@class,\'positive ui right labeled icon button\')]/i[contains(@class,\'play icon\')]'));
    browser.wait(EC.elementToBeClickable(startExtractionButton), 15000, 'Start extraction button was not returned');
    return startExtractionButton;
  }

  async getExtShadowRoot() {
    let shadowHost;
    var webView = element(by.xpath('//webview[contains(@class,\'activeWebView\')]'));
    shadowHost = await browser.executeAsyncScript('return arguments[0].shadowRoot', webView);
    console.log('Shadow host result ' + shadowHost);
    return shadowHost;
  }

  async FindShadowDomElement() {
    let shadowRoot;
    let element;
    await (shadowRoot = this.getExtShadowRoot()
    .then(async function (result)  {
       console.log('Response from Shadow root ' + result);
       element = browser.executeScript('')
       element =  await result.findElement(by.xpath('//input[contains(@id,\'login-email\')]'));
       console.log('Element ' + element);
    })
    .catch(async function (err) {
       console.log('Error while obtaining element ', err);
    }));   
    return element;
  }
}
