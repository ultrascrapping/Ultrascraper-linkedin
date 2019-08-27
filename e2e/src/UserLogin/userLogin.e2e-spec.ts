import { AppPage } from '../PageObjects/app.po';
import { DBUtils } from '../Utils/dbUtils';

let page: AppPage;
let sqlCmd: DBUtils;

describe('when Ultra App initialize ', () => {
  beforeEach(() => {
    page = new AppPage();
    sqlCmd = new DBUtils();
    page.navigateTo();
  });

  describe('when a user tries to log into UltraApp ', () => {

    it('using an invalid email an error message should be displayed', () => {
      page.performSignIn('fakeemail.com', 'fakepassword');
      expect(page.getNotificationMessage()).toEqual('Por favor ingresa un correo válido');
    });

    it('using an existing email but invalid password an error message should be displayed', () => {
      page.performSignIn('oscar.ferrel.46@gmail.com', 'fakepassword2');
      expect(page.getNotificationMessage()).toEqual('No existe esa combinación de correo y contraseña.');
    });

    it('using a non existing email and a valid password an error message should be displayed', () => {
      page.performSignIn('oscar.ferrel46@gmail.com', 'fakepassword3');
      expect(page.getNotificationMessage()).toEqual('No existe esa combinación de correo y contraseña.');
    });

    it('using a valid email and a valid password the user should be able to login', () => {
      page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');
      expect(page.getSignOutButton().isEnabled()).toBeTruthy();
      page.performSignOut();
    });
  });

  describe('when the user is logged into Ultra App', () => {
    beforeEach(() => {
      page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');
    });

    it('there should not be any tabs opened ', () => {
      expect(page.getActiveTabs().isPresent()).toBeFalsy();
      page.performSignOut();
    });

    it('should logout if the user press the Si button after pressing the logout icon', () => {
      page.getSignOutButton().click();
      expect(page.getYesToSignOutButton().isEnabled()).toBeTruthy();
      page.getYesToSignOutButton().click();
      expect(page.getLoginFormHeader().getText()).toEqual('Bienvenido a Ultra');
    });

    it('should not logout if the user press the No button after pressing the logout icon', () => {
      page.getSignOutButton().click();
      expect(page.getNotoSignOutButton().isEnabled()).toBeTruthy();
      page.getNotoSignOutButton().click();
      expect(page.getSignOutButton().isEnabled()).toBeTruthy();
      page.performSignOut();
    });
  });

  describe('and a user tries to log into UltraApp ', () => {
    beforeEach(async() => {
      await sqlCmd.ExecuteQuery(`update ultra.users set IsActive = 0 where email = \'jennifer.gifford1995@gmail.com\';`);
    });

    it('using an inactive account and a valid password an error message should be displayed ', () => {
      page.performSignIn('jennifer.gifford1995@gmail.com', 'Jennifer123!');
      expect(page.getNotificationMessage()).toContain('Este usuario está DESACTIVADO, por favor contacte a soporte.');
    });
    
    afterEach(async() => {
      await sqlCmd.ExecuteQuery(`update ultra.users set IsActive = 1 where email = \'jennifer.gifford1995@gmail.com\';`);
    });
  });
});

