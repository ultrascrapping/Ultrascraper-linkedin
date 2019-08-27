import { app, BrowserWindow, dialog, crashReporter } from "electron";
import { autoUpdater } from "electron-updater";
import { timer} from 'rxjs';
import * as path from "path";
import * as url from "url";
import {stringify} from 'flatted';
import * as request from 'request';

let mainWindow: BrowserWindow;
let index = 0;
let ips = [
    '142.93.225.88',
    '134.209.81.237'
];


let debugParam = process.argv.find(param => param === "debugapp");
const _debug = debugParam !== undefined;

const crashUrl = 'http://54.39.106.116:61765/api/logs/crashreport'

//Activamos el envío de un dump si se produce un crash de la app.
crashReporter.start({
    productName: 'Ultra',
    companyName: 'Ultra',
    submitURL: crashUrl,
    uploadToServer: true,
  });

app.setAppUserModelId(process.execPath);
// Dehabilita la acceleración de hardware
app.disableHardwareAcceleration()

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 1024,
        icon: path.join(__dirname + `/../../dist/ultra/assets/img/icon128.png`),
        webPreferences: {
            webviewTag: true
        },
        transparent: false,
        minimizable: false
    });

    mainWindow.webContents.on('crashed', (ev, killed) => {
        if (_debug) {
            console.log(ev);
        }

        // envía el error al crashreport
        const evString = stringify(ev);
        let req = request({
            url: crashUrl,
            method: 'POST',
            formData: {
                'ver': process.version,
                'platform': process.platform,
                '_version': app.getVersion(),
                '_productName': app.getName(),
                'prod': 'Electron',
                '_companyName': 'ULTRA',
                'upload_file_minidump': evString,
                'file': {
                    value: evString,
                    options: {
                        filename: 'webContentCrashError.txt'
                    }
                }
            }
        }, function (err, resp, body) {
        });

        // Reinicia la app
        app.relaunch();
        app.quit();
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/../../angular_build/index.html`),
            protocol: "file:",
            slashes: true
        })
    );

    mainWindow.maximize();

    
    if(_debug){
        mainWindow.webContents.openDevTools();
    } 
    
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

autoUpdater.on('update-downloaded', (info) => {
    let timeOut = setTimeout(() => { autoUpdater.quitAndInstall(); }, 1000/*ms*/ * 30/*s*/);
    dialog.showMessageBox(mainWindow,
        {
            type: 'info',
            buttons: [],
            title: 'Actualización requerida.',
            message: 'Hay una nueva versión de UltraScrapper, en unos instantes se actualizará automáticamente.'
        }, () => {
            clearTimeout(timeOut);
            autoUpdater.quitAndInstall();
        });
});

autoUpdater.on('error', (err) => {    
    autoUpdater.setFeedURL('http://' + ips[index++]);
    if (index >= ips.length) {
        index = 0;
    }
});

app.on("ready", function () {
    createWindow();
    setTimeout(sendGlobals, 1300);
    timer(0, 1000/*ms*/ * 60/*s*/ * 60/*min*/ * 2/*hours*/)
        .subscribe(() => autoUpdater.checkForUpdates());
            
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
        setTimeout(sendGlobals, 1300);
    }
});

function sendGlobals(){
    mainWindow.webContents.send('setGlobal', { name: '_debug', value: _debug});
}
