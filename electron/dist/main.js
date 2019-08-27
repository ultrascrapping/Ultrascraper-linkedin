"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_updater_1 = require("electron-updater");
var rxjs_1 = require("rxjs");
var path = require("path");
var url = require("url");
var flatted_1 = require("flatted");
var request = require("request");
var mainWindow;
var index = 0;
var ips = [
    '142.93.225.88',
    '134.209.81.237'
];
var debugParam = process.argv.find(function (param) { return param === "debugapp"; });
var _debug = debugParam !== undefined;
var crashUrl = 'http://54.39.106.116:61765/api/logs/crashreport';
//Activamos el envío de un dump si se produce un crash de la app.
electron_1.crashReporter.start({
    productName: 'Ultra',
    companyName: 'Ultra',
    submitURL: crashUrl,
    uploadToServer: true,
});
electron_1.app.setAppUserModelId(process.execPath);
// Dehabilita la acceleración de hardware
electron_1.app.disableHardwareAcceleration();
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 1024,
        icon: path.join(__dirname + "/../../dist/ultra/assets/img/icon128.png"),
        webPreferences: {
            webviewTag: true
        },
        transparent: false,
        minimizable: false
    });
    mainWindow.webContents.on('crashed', function (ev, killed) {
        if (_debug) {
            console.log(ev);
        }
        // envía el error al crashreport
        var evString = flatted_1.stringify(ev);
        var req = request({
            url: crashUrl,
            method: 'POST',
            formData: {
                'ver': process.version,
                'platform': process.platform,
                '_version': electron_1.app.getVersion(),
                '_productName': electron_1.app.getName(),
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
        electron_1.app.relaunch();
        electron_1.app.quit();
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "/../../angular_build/index.html"),
        protocol: "file:",
        slashes: true
    }));
    mainWindow.maximize();
    if (_debug) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}
electron_updater_1.autoUpdater.on('update-downloaded', function (info) {
    var timeOut = setTimeout(function () { electron_updater_1.autoUpdater.quitAndInstall(); }, 1000 /*ms*/ * 30 /*s*/);
    electron_1.dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: [],
        title: 'Actualización requerida.',
        message: 'Hay una nueva versión de UltraScrapper, en unos instantes se actualizará automáticamente.'
    }, function () {
        clearTimeout(timeOut);
        electron_updater_1.autoUpdater.quitAndInstall();
    });
});
electron_updater_1.autoUpdater.on('error', function (err) {
    electron_updater_1.autoUpdater.setFeedURL('http://' + ips[index++]);
    if (index >= ips.length) {
        index = 0;
    }
});
electron_1.app.on("ready", function () {
    createWindow();
    setTimeout(sendGlobals, 1300);
    rxjs_1.timer(0, 1000 /*ms*/ * 60 /*s*/ * 60 /*min*/ * 2 /*hours*/)
        .subscribe(function () { return electron_updater_1.autoUpdater.checkForUpdates(); });
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", function () {
    if (mainWindow === null) {
        createWindow();
        setTimeout(sendGlobals, 1300);
    }
});
function sendGlobals() {
    mainWindow.webContents.send('setGlobal', { name: '_debug', value: _debug });
}
//# sourceMappingURL=main.js.map