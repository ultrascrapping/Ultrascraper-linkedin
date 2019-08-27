// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  allScriptsTimeout: 11000,
  suites: {
    homePage: './src/LoginForm/login.e2e-spec.ts',
    userLogin: './src/UserLogin/userLogin.e2e-spec.ts',
    userLogged: './src/UserLoggedIn/userLoggedIn.e2e-spec.ts',
    referrals: './src/UserReferrals/referredUsers.e2e-spec.ts',
    notifications: './src/UserNotifications/userNotifications.e2e-spec.ts',
    myAccount: './src/UserProfile/usersProfile.e2e-spec.ts',
    smokeTest: './src/ProdSmokeTest/smokeTest.e2e-spec.ts',
    extraction: './src/ProfilesExtraction/profilesExtraction.e2e-spec.ts',
    misc: './src/app.e2e-spec.ts',
    regression: ['./src/LoginForm/login.e2e-spec.ts','./src/UserLogin/userLogin.e2e-spec.ts','./src/UserLoggedIn/userLoggedIn.e2e-spec.ts',
    './src/UserReferrals/referredUsers.e2e-spec.ts','./src/UserNotifications/userNotifications.e2e-spec.ts','./src/UserProfile/usersProfile.e2e-spec.ts']
  },
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      //binary: "./node_modules/electron/dist/electron.exe",
      //args: ['--disable-web-security', 'auto-open-devtools-for-tabs','--test-type=webdriver','app=./src/main.ts']
      args: ['--disable-web-security']
    }
  },
  databaseValues:{
    server: 'xxxx',
    database: 'xxxx',
    user: 'xxxx',
    password: 'xxxx',
    portId: '36556'
  },
  testRails:{
    baseUrl: 'xxxx',
    userName: 'xxxx',
    passWord: 'xxxx',
    testRunId: 0,
    projectId: 8,
    suiteId: 277,
    sectionId: 1357,
    useTestRails: 'true'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  //seleniumAddress: 'http://localhost:4444/wd/hub/',
  connectionString: '',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () { }
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};