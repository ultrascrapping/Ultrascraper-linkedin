import { LoginPage} from '../PageObjects/login.page';
import { SignOutModal} from '../PageObjects/signOutModal.page';
import { SidePanel}  from '../PageObjects/sidePanel.page';

export class Hooks{

    constructor(app) {
        this.loginPage = new LoginPage(app);
        this.signOutModal = new SignOutModal(app);
    }
    

    openApp(app){
        app.initializeSpectron();
        return  app.startApp();
        }

    async closeApp(app){
        if (app && app.isRunning()){
                return app.stopApp();
        }
    }    

    async logIn(app, user, password){
        if (app && app.isRunning()){
            if ( await app.isExisting(this.loginPage.passwordTextBox_loc)){
                await this.loginPage.logIn(user,password);
            }
            return await app.waitUntilElementDisapear(this.loginPage.loginDimer_loc).then(function(){
                return true;
           });
        }
    }

    async logOut(app){
        if (app && app.isRunning()){
            if (! await app.isExisting(this.loginPage.passwordTextBox_loc)){  
                await app.waitUntilElementDisapear(this.loginPage.loginDimer_loc);
                await this.signOutModal.logOut();
            }
            return await app.waitUntilElementExist(this.loginPage.passwordTextBox_loc).then(function(){
                return true;
           });
        }
    }

    async logOutAndClose(app){
        if (app && app.isRunning()){
            if (! await app.isExisting(this.loginPage.passwordTextBox_loc)){
                await this.signOutModal.logOut();
            }
           await app.waitUntilElementExist(this.loginPage.loginButton_loc).then(function(){
                return app.stopApp();
           })
        }
    }

}
