import { AppPage } from '../PageObjects/app.po';

let page: AppPage; 

describe('when Ultra App first opens, the login form should be displayed and ', () => {
    beforeAll(() => {
        page = new AppPage();
        page.navigateTo(); 
    }); 
    it('should display welcome message', () => {
        expect(page.getTitleText()).toEqual('Estadísticas');
    });

    it('should display \'Bienvenido a Ultra\' in the Login Form', () => {
        expect(page.getLoginFormHeader().getText()).toEqual('Bienvenido a Ultra');
    });

    it('should contain email text box', () => {
        expect(page.getEmailTextBoxElement()).not.toBeNull();
    });

    it('should contain password text box', () => {
        expect(page.getPassWordTextBoxElement()).not.toBeNull();
    });

    it('should contain a login button', () => {
        expect(page.getLoginButton()).not.toBeNull();
    });

    it('should contain a register tag', () => {
        expect(page.getRegisterTag()).not.toBeNull();
    });
});


