import { AppPage } from '../PageObjects/app.po';
import { DBUtils } from '../Utils/dbUtils';
import { by } from 'protractor';

let page: AppPage;
let sqlCmd: DBUtils;
let notifications: any;

let expiredNotifications = [
    {"message": 'Test notification with expired date 1', "startDate": 'DATEADD(month, -2, GETDATE())', "endDate": 'DATEADD(month, -1, GETDATE())'},
    {"message": 'Test notification with expired date 2', "startDate": 'DATEADD(day, -20, GETDATE())', "endDate": 'DATEADD(day, -5, GETDATE())' }
];

let validNotifications =[
    {"message": 'Test notification with valid date 1', "startDate": 'DATEADD(month, -1, GETDATE())', "endDate": 'DATEADD(month, 1, GETDATE())'},
    {"message": 'Test notification with valid date 2', "startDate":'DATEADD(day, -18, GETDATE())', "endDate": 'DATEADD(day, 20, GETDATE())'},
    {"message": 'Test notification with valid date 3', "startDate": 'DATEADD(day, -10, GETDATE())', "endDate": 'DATEADD(day, 5, GETDATE())'}
];

let futureNotifications = [
    {"message": 'Test notification with future date 1', "startDate": 'DATEADD(month, 1, GETDATE())', "endDate": 'DATEADD(month, 2, GETDATE())'},
    {"message": 'Test notification with future date 2', "startDate": 'DATEADD(day, 2, GETDATE())', "endDate": 'DATEADD(day, 15, GETDATE())'}
];

let validatableNotifications = [
    {"message" : 'Test notification with valid date 3'},
    {"message" : 'Test notification with valid date 2'},
    {"message" : 'Test notification with valid date 1'}
];


describe('When the user is logged into UltraApp ', () => {
    beforeEach( async () => {
        page = new AppPage();
        sqlCmd = new DBUtils();
        page.navigateTo();
        await sqlCmd.removeNotifications();
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');    
    });

    it('notifications button should exist', () => {
        var notificationsButton = page.getNotificationsButton();
        expect(notificationsButton).toBeDefined();
        notificationsButton.click();
        expect(page.getNotificationsHeader().getText()).toEqual('Notificaciones');
        var showReadNotifications = page.getShowReadMessagesCheckBox();
        expect(showReadNotifications).toBeDefined();
        expect(showReadNotifications.isSelected()).toBeFalsy();
        var markAllAsReadButton = page.getMarkAllAsReadButton();
        expect(markAllAsReadButton).toBeDefined();
        expect(markAllAsReadButton.getText()).toEqual('Marcar todas como leídas');
        var closeButton = page.getCloseNotificationsButton();
        expect(closeButton).toBeDefined();
        expect(closeButton.getText()).toEqual('Cerrar');
        closeButton.click();
        page.performSignOut();
    });
});

describe('When the user is logged into Ultra and there are no new notifications ', () => {
    beforeEach( async () => {
        page = new AppPage();
        sqlCmd = new DBUtils();
        page.navigateTo();
        await sqlCmd.removeNotifications();  
        await sqlCmd.addNotifications(expiredNotifications);
        await sqlCmd.addNotifications(futureNotifications);
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');  
    });

    it('notifications button should not have unread messages flag ', () => {    
        var unreadNotifications = page.getUnreadNotifications();
        expect(unreadNotifications.isPresent()).toBeFalsy();
        var notificationsButton = page.getNotificationsButton();
        expect(notificationsButton).toBeDefined();
        notificationsButton.click();
        var notifications = page.getNotifications();
        expect(notifications.all(by.id('notificationDate')).isPresent()).toBeFalsy();
        page.getCloseNotificationsButton().click();
        page.performSignOut();
    });
});



describe('When the user is logged into Ultra App and there are new notifications', () =>{
    beforeEach( async () => {
        page = new AppPage();
        sqlCmd = new DBUtils();
        page.navigateTo();
        await sqlCmd.removeNotifications();
        await sqlCmd.addNotifications(expiredNotifications);
        await sqlCmd.addNotifications(validNotifications);
        await sqlCmd.addNotifications(futureNotifications);        
        page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');  
        notifications = await sqlCmd.getNotifications();
    });

    it('notifications button should have unread messages flag', () =>{
        var unreadNotifications = page.getUnreadNotifications();
        expect(unreadNotifications.getText()).toEqual('3');
        var notificationsButton = page.getNotificationsButton();
        expect(notificationsButton).toBeDefined();
        notificationsButton.click();

        var notificationsBox = page.getNotificationsBox();
        var notificationMessages = notificationsBox.all(by.xpath('//div[contains(@class,\'ui segment\')]//p[contains(@id,\'notificationContent\')]'));
        expect(notificationMessages.count()).toEqual(3);       
        for (var x =0; x< 3; x++){            
            var notificationObject = notificationMessages.get(x);
            expect(notificationObject.getText()).toEqual(validatableNotifications[x].message);
        }
        var closeNotificationsButton = page.getCloseNotificationsButton();
        expect(closeNotificationsButton).toBeDefined();
        closeNotificationsButton.click();
        page.performSignOut();
    });

    it('after pressing the \'Mark all as read\' button ', () => {
        page.getNotificationsButton().click();
        page.getMarkAllAsReadButton().click();

        var unreadNotifications = page.getUnreadNotifications();
        expect(unreadNotifications.isPresent()).toBeFalsy();
        page.getNotificationsButton().click();

        var notificationsBox = page.getNotificationsBox();
        var notificationMessages = notificationsBox.all(by.xpath('//div[contains(@class,\'ui segment\') and contains(@style,\'display: block;\')]'));
        expect(notificationMessages.all(by.id('notificationDate')).isPresent()).toBeFalsy();

        var closeNotificationsButton = page.getCloseNotificationsButton();
        expect(closeNotificationsButton).toBeDefined();
        closeNotificationsButton.click();
        page.performSignOut();

    });

    it('after pressing the \'Mostrar leídas\' button', () => {
        page.getNotificationsButton().click();
        page.getMarkAllAsReadButton().click();

        page.getNotificationsButton().click();
        page.getShowReadMessagesCheckBox().click();

        var notificationsBox = page.getNotificationsBox();
        var notificationMessages = notificationsBox.all(by.xpath('//div[contains(@class,\'ui segment\') and contains(@style,\'display: block;\')]'));
        expect(notificationMessages.all(by.id('notificationDate')).isPresent()).toBeTruthy();
        page.getCloseNotificationsButton().click();

        var unreadNotifications = page.getUnreadNotifications();
        expect(unreadNotifications.isPresent()).toBeFalsy();
        page.performSignOut();
    });
});
