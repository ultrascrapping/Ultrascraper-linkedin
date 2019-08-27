
import { Application } from 'spectron';
import  * as path  from 'path';
import { chai } from 'chai';
import * as chaiAsPromised  from 'chai-as-promised';
const electronPath = require('electron')
//import * as electronPath  from 'electron';


export class App {

    private app;

    initializeSpectron() {
        const appPath = path.join(__dirname, '../..');
        this.app = new Application({
            path: electronPath,
            args: [appPath],
            env: {
                ELECTRON_ENABLE_LOGGING: true,
                ELECTRON_ENABLE_STACK_DUMPING: true,
                NODE_ENV: "development"
            },
            chromeDriverLogPath: '../chromedriverlog.txt'
        });
    }

    async startApp(){
        chaiAsPromised.transferPromiseness = this.app.transferPromiseness;
        return this.app.start().then( async () => {
            await this.app.browserWindow.focus();
            await this.app.browserWindow.setAlwaysOnTop(true);
          });
        }

    stopApp(){
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
    } improve 

    pause(ms){
        this.app.client.pause(ms);
    }


    isRunning(){
        return this.app.isRunning()
    }

    isExisting(element){
        return this.app.client.isExisting(element)
    }
    
    getElement(locator) {
        return this.app.client.waitUntil(async () => {
            return  this.app.client.isExisting(locator);
        }, 10000, undefined, 500 ).then(() => {
                return this.app.client.$(locator);
            })
    }

    getElements(locator) {
        return this.app.client.waitUntil(async () => {
            return  this.app.client.isExisting(locator);
        }, 10000, undefined, 500 ).then(() => {
                return this.app.client.$$(locator);
            })
       // return app.client.$$(locator);
    }

    waitUntil(condition, timeout, msg, interval) {
        console.log("WAITING")
        return this.app.client.waitUntil(condition,timeout, msg, interval);
    }

    async waitUntilElementExist(locator){
        await this.app.client.waitUntil(async () => {
            return await this.app.client.isExisting(locator);
        }, 10000, undefined, 500 ).then(() => {
            })
    }

    async waitUntilElementDisapear(locator){
        await this.app.client.waitUntil(async () => {
            return ! await this.app.client.isExisting(locator);
        }, 10000, undefined, 500 ).then(() => {
            })
    }

    async waitUntilElementVisible(locator){
        await this.app.client.waitUntil(async () => {
            console.log("Visible: ",await this.app.client.isVisible(locator));
            console.log("Enabled: ",await this.app.client.isEnabled(locator));
            return  await this.app.client.isVisible(locator);
        }, 10000, undefined, 500 ).then(() => {
            })
    }

    async elementIdText(element){
       let result = await this.app.client.elementIdText(element);
        return  result;

    }

    async setAtrtibute(locator, attribute, value){
        console.log('document.querySelector("'+locator+'").'+attribute+'='+value)
        return this.app.client.execute('document.querySelector("'+locator+'").'+attribute+'='+value);
    }

    async click(element){
        await this.app.client.elementIdClick(element);
    }
}