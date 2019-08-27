import { App } from '../Utils/app';
import { Hooks } from '../Utils/hooks';
import * as chai   from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as td  from './testData.json';
import { LoginPage } from '../PageObjects/login.page';
import { SignOutModal } from '../PageObjects/signOutModal.page';
import { SidePanel }  from '../PageObjects/sidePanel.page';
import { DBUtils } from '../Utils/dbUtils';

chai.use(chaiAsPromised);
chai.should();


describe('LOGIN FROM', () => {
    let app: App; 
    let hooks: Hooks; 
    let loginPage: LoginPage;

    before(async () => {
        app = new App();
        hooks = new Hooks(app);
        await hooks.openApp(app);  
        loginPage = new LoginPage(app);
    }); 

    after(async() =>{
        return hooks.logOutAndClose(app);
    });

    it('[C7901] should display all the elements in the Login Form correctly', () => {
        return Promise.all([
        loginPage.header.getText().should.eventually.equal('Bienvenido a Ultra'),
        loginPage.emailTextBox.should.eventually.not.to.equal(null),
        loginPage.passwordTextBox.should.eventually.not.to.equal(null),
        loginPage.loginButton.should.eventually.not.to.equal(null),
        loginPage.registerTag.should.eventually.not.to.equal(null),
        ]);
    });

});

describe('LOGIN', () => {
    let app: App; 
    let hooks: Hooks; 
    let loginPage: LoginPage;
    let sqlCmd = new DBUtils();

    beforeEach(async () => {
        app =  new App();
        hooks = new Hooks(app)
        await hooks.openApp(app)  
        loginPage = new LoginPage(app);
    }); 

    afterEach(async () => {
        await hooks.logOut(app);
        await hooks.closeApp(app);
        //await hooks.logOutAndClose(app);
    });

    it('using an ivalid email, a message error should be displayed', () => {
        loginPage.logIn(td.USERS.INVALID.USER,td.USERS.INVALID.PASS)
        return loginPage.notificationMessage.getText().should.eventually.equal('Por favor ingresa un correo válido');
    });

     it('using a valid not registered email, a message error should be displayed', () => {
        loginPage.logIn(td.USERS.WRONG.USER,td.USERS.WRONG.PASS);
        return loginPage.notificationMessage.getText().should.eventually.equal('No existe esa combinación de correo y contraseña.');
    }); 

    it('[C16234] using a valid username but worng password, a message error should be displayed', () => {
        loginPage.logIn(td.USERS.RIGHT.USER,td.USERS.WRONG.PASS);
        return loginPage.notificationMessage.getText().should.eventually.equal('No existe esa combinación de correo y contraseña.');
    }); 

    describe('', () => {
        beforeEach(async() => {
            await sqlCmd.updateUser(td.USERS.RIGHT.USER, "IsActive", 0);
        });

        it('[C16270] Using valid credentials of an inactive user, a message error should be displayed', () => {
            loginPage.logIn(td.USERS.RIGHT.USER,td.USERS.RIGHT.PASS);
            return loginPage.notificationMessage.getText().should.eventually.equal('Este usuario está DESACTIVADO, por favor contacte a soporte.');        
        });
        
        afterEach(async() => {
            await sqlCmd.updateUser(td.USERS.RIGHT.USER, "IsActive", 1);
        });
      }); 


    it('[C7902] using valid credentials user should be logued',async () => {
        await loginPage.logIn(td.USERS.RIGHT.USER,td.USERS.RIGHT.PASS);
        await app.waitUntilElementDisapear(loginPage.loginModal_loc);
        return app.isExisting(loginPage.loginModal_loc).should.eventually.equal(false);
    });

});


describe('LOGOUT', () => {
    let app =  new App();
    let hooks = new Hooks(app);
    let loginPage: LoginPage;
    let signOutModal: SignOutModal;
    let sidePanel: SidePanel;

    before(async () => {
        await hooks.openApp(app);
        loginPage = new LoginPage(app);
        signOutModal = new SignOutModal(app);
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
  
    it('[C10094] should logout if the user press the Si button after pressing the logout icon', async () => {
    await sidePanel.signOutButton.click();
    await signOutModal.siButton.click();
    return app.isExisting(loginPage.emailTextBox_loc).should.eventually.equal(true);
    });

    it('[C16235] should not logout if the user press the No button after pressing the logout icon]', async () => {
    await sidePanel.signOutButton.click();
    await signOutModal.noButton.click();
    return app.isExisting(loginPage.emailTextBox_loc).should.eventually.equal(false);
    });

});