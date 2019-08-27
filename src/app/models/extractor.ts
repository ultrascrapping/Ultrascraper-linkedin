import { Observable, timer, Subscription, AsyncSubject, Subject, BehaviorSubject } from 'rxjs';
import { LinkedInAccount } from './linkedin-account';
import { Notification } from './notification';
import { AppData } from './app-data';
import { IPCCallback } from './ipc-callback';
import { UserService } from '../services/user.service';
import { AppDataService } from '../services/app-data.service';
import { ApiService } from '../services/api.service';
import { UtilsService } from '../services/utils.service';
import { webviewTag } from 'electron';
import { flattenStyles } from '@angular/platform-browser/src/dom/dom_renderer';
import { ProfileExtractionInfo } from '../models/profile-extraction-info';
import { LinkedInNetworkInfoSchema } from '../models/linkedin-network-info-schema';
import { clean } from 'semver';
import { OsNotificationService } from '../services/os-notification.service';
import { ExtractionStatus } from './extraction-status';
import { GlobalsService } from '../services/globals.service';

export class Extractor {
    public tabId: string;
    public isWebViewSet: boolean = false;
    public needsClosingConfirmation: boolean = false;
    private webview: any;
    private appData: AppData;
    private subscription: Subscription;
    public isExtracting: boolean = false;
    private isProcessing: boolean = false;
    private lastExtractionDate: number;
    private reloadedPage: boolean = false;
    private isWaitingForRequests: boolean = false;
    private isWebviewReady: boolean = false;
    private defaultPage: string = 'https://www.linkedin.com';
    private callbacks: IPCCallback[] = [];
    private currentExtractingProfile: string = null;
    private nextProfileDate: Date = new Date();
    private extractProfileTimeOutId: NodeJS.Timer;
    /**
     * Subject para manejar el timer de nextprofile
     */
    public nextProfileTimerSubject$: Subject<number> = new Subject<number>();

    /**
     * BehaviorSubject para manejar el status de isExtracting
     */
    public extractingStatusSubject$: BehaviorSubject<ExtractionStatus> = new BehaviorSubject<ExtractionStatus>(ExtractionStatus.Frenado);
    /**
     * BehaviorSubject para manejar el status de isExtracting
     */
    public urlToExtract$: BehaviorSubject<string> = new BehaviorSubject<string>(this.defaultPage);


    constructor(public linkedInAccount: LinkedInAccount, private userService: UserService, private appDataService: AppDataService, private apiService: ApiService, private utils: UtilsService, private osNotificationService: OsNotificationService, private globalsService: GlobalsService) {       

        this.tabId = linkedInAccount.tabId;
        this.osNotificationService.linkedInAccount = linkedInAccount;
        this.appDataService.appDataInstance
            .subscribe(appData => this.appData = appData);

        // US-62: Esto es lo que hace que se reinicie la extensión
        // US-136: Se aumenta el tiempo en 3 minutos para la cuentas que pueden extraer perfiles completos (por ahora solo se tiene en cuenta los skills).
        this.subscription = timer(0, 1000/*ms*/ * 60/*s*/ * 9/*min*/)
            .subscribe(async () => {
                if (this.linkedInAccount.isLogged) {
                    if (this.lastExtractionDate && (Date.now() - this.lastExtractionDate) > (1000/*ms*/ * 60/*s*/ * 9/*min*/)) {
                        if (this.isExtracting || this.isProcessing) {
                            await this.stopExtraction(true);
                        } else {
                            this.restartExtraction();
                        }
                    }
                }
            });
    }

    setWebView(webview: any): void {
        webview.src = this.defaultPage;

        webview.addEventListener('dom-ready', () => {
            if(this.globalsService._debug){
                webview.openDevTools();
            }
            webview.send('domReady', {});
        });

        webview.addEventListener('ipc-message', async (event: any) => {
            if (event.channel === 'domReady') {
                this.isWebviewReady = true;
            } else if (event.channel === 'unload')
                this.isWebviewReady = false;
            else {
                let callback = this.callbacks.filter(c => c.key === event.channel)[0];
                callback.subject.next(event.args);
                callback.subject.complete();
            }
        });

        // US-62: Esto es en lugar del chrome.tabs.onUpdated
        // Este listener del webview se da cuenta de cada que cambia la url y trae isTrusted, url y isMainFrame
        webview.addEventListener('did-navigate-in-page', async (details) => {
            if (!this.linkedInAccount.isLogged && !details.url.includes('linkedin.com/m/logout')) {
                await this.setLinkedInInfoFromAPIAsync();
            }

            if (this.appData && this.appData.urlsToStopExtraction.some(u => (new RegExp(u, 'gi')).test(details.url))) {
                this.clearLinkedInUser();
                if (this.isProcessing) {
                    this.isProcessing = false;
                    await this.stopByLinkedInLogout();
                }
            }

            if (this.isProcessing && details.url.indexOf(this.currentExtractingProfile) === -1) {
                this.sendErrorMessage('Extraction stopped, page changed while processing profile');
                // US-69 Ahora si reinicia cuando se detuvo la extracción por cambio en la página.
                await this.continueExtractingProfiles();
            }
        });

        this.webview = webview;
        this.isWebViewSet = true;
    }

    destroy(): void {
        this.subscription.unsubscribe();
    }

    reload(): void {
        this.webview.reload();
    }

    async queryWebView(action: string, data: any, extraTimeOut: number = 0): Promise<any> {
        while (!this.isWebviewReady) {
            await this.utils.sleep(200);
        }

        let key = this.utils.newGuid();
        let callback = new IPCCallback(key, new AsyncSubject<any>());
        this.callbacks.push(callback);

        this.webview.send('fromUS', { key: key, action: action, data: data });

        let result = await this.promiseTimeOut(callback.subject.toPromise(), (1000/*ms*/ * 60/*s*/ * 3/*min*/) + extraTimeOut);
        this.callbacks = this.callbacks.filter(c => c.key !== key);

        return result;
    }

    /**
     * Extrae un perfil de LinkedIn.
     * @param inProfile Perfil "in" de LinkedIn a extraer.
     * @param encProfile Perfil "enc" de LinkedIn a extraer.
     * @param salesNavProfile Perfil "salesnav" de LinkedIn a extraer.
     * @param pubProfile Perfil "pub" de LinkedIn a extraer.
     * @param reference Número de referencia del request.
     * @param extractFullProfile Indica si se debe extraer el perfil completo o no.
     */
    async extractProfile(inProfile: string, encProfile: string, salesNavProfile: string, pubProfile: string, reference: number, extractFullProfile: boolean) {
        // Se verifica si tenemos el perfil 'in'.
        let isInProfile = inProfile && inProfile.length > 0 ? true : false;

        let url = 'https://www.linkedin.com';
        // Se obtiene la información de 'network' desde la API de LinkedIn.
        let linkedInNetworkInfo: LinkedInNetworkInfoSchema;
        if (isInProfile) {
            linkedInNetworkInfo = await this.readNetWorkInfo(url, this.utils.cleanLinkedInIdFromUrl(inProfile));
            url += inProfile;
        } else if (encProfile && encProfile.length > 0) {
            url += encProfile;
        } else if (salesNavProfile && salesNavProfile.length > 0) {
            url += salesNavProfile;
        } else {
            url += pubProfile;
        }

        // US-71 Si no estoy loggeado detengo la extracción.
        if (linkedInNetworkInfo && linkedInNetworkInfo.status === 401) {
            await this.stopByLinkedInLogout();
        } else {
            // Si no se pudo obtener network info siendo 'in' se asume que no existe.
            if (isInProfile && !linkedInNetworkInfo) {
                await this.sendProfileHTML(this.linkedInAccount.encLinkedInId, reference, 'UNAVAILABLE', -1, inProfile, encProfile, pubProfile, '');

                this.continueExtractingProfiles();
            } else {
                // Se ejecuta la extracción del perfil.
                // US-69 Se reinicia la extracción (por timed out o empty html).
                try {
                    await this.htmlProfileExtraction(url, inProfile, encProfile, salesNavProfile, pubProfile, reference, linkedInNetworkInfo, extractFullProfile);
                    this.continueExtractingProfiles();
                } catch (err) {
                    // US-69 Se reinicia solo si obtenemos un error real.
                    if (err !== 'stopped' && !(err instanceof TypeError)) {
                        await this.sendErrorMessage(err);
                        await this.continueExtractingProfiles();
                    }
                }
            }
        }
    }

    /**
     * Extrae una compañía de LinkedIn.
     * @param companyProfile Perfil de LinkedIn de la compañía a extraer.
     * @param reference Número de referencia del request.
     * @param extractFullProfile Indica si se debe extraer el perfil de la compañía completo o no.
     */
    async extractCompany(companyProfile: string, reference: number, extractFullProfile: boolean) {
        let url = 'https://www.linkedin.com' + companyProfile;

        // Se ejecuta la extracción de la compañía.
        // US-69 Se reinicia la extracción (por timed out o empty html).
        try {
            await this.htmlCompanyExtraction(url, companyProfile, reference, extractFullProfile);
            await this.continueExtractingProfiles();
        } catch (err) {
            // US-69 Se reinicia solo si obtenemos un error real.
            if (err !== 'stopped' && !(err instanceof TypeError)) {
                await this.sendErrorMessage(err);
                await this.continueExtractingProfiles();
            }
        }
    }

    async extractProfiles() {
        this.isExtracting = true;
        // Setea el status como extrayendo
        this.emitExtractingStatusToSubject(ExtractionStatus.Extrayendo);
        this.needsClosingConfirmation = true;

        // US-216 Se debe respetar la espera entre perfiles incluso si extractProfiles fue llamado fuera de tiempo
        clearTimeout(this.extractProfileTimeOutId);
        let now = new Date();
        if (this.nextProfileDate >= now) {
            let sleepTime = this.nextProfileDate.valueOf() - now.valueOf();
            let sleepTimeSeconds = Math.round(sleepTime / 1000);
            if (sleepTimeSeconds > 0) {
                this.nextProfileTimerSubject$.next(sleepTimeSeconds);
                this.extractProfileTimeOutId = setTimeout(this.extractProfiles, sleepTime);
                return;
            }
        }

        let todayProfiles = this.linkedInAccount.todayProfiles;

        // US-62: Se verifica si el usuario de LinkedIn está loggeado
        if (this.linkedInAccount.isLogged) {
            // Esto parece un poco inútil
            if (!todayProfiles) {
                todayProfiles = 0;
                this.linkedInAccount.todayProfiles = 0;
                this.userService.updateLinkedInAccount(this.linkedInAccount);
            }

            // Se verifica si aún hay requests pendientes
            if (+todayProfiles < this.linkedInAccount.maxDailyProfiles) {
                this.isWaitingForRequests = false;

                // Se obtiene el perfil a extraer
                let profileExtractionInfo = await this.getNextProfileToExtract();

                if (!this.isWaitingForRequests) {
                    let requestType = profileExtractionInfo ? profileExtractionInfo.requestType.toUpperCase() : null;
                    if (this.globalsService._debug) {
                        console.log('RequestType: ' + requestType);
                    }
                    

                    let reference = profileExtractionInfo ? profileExtractionInfo.reference : null;

                    let extractFullProfile = profileExtractionInfo ? profileExtractionInfo.extractFullProfile : false;

                    this.linkedInAccount.todayProfiles += 1;
                    this.userService.updateLinkedInAccount(this.linkedInAccount);

                    // Si se obtuvo un perfil, se extrae.
                    if (reference !== null) {
                        if (requestType && requestType == 'COMPANY' && profileExtractionInfo.companyProfile) {
                            await this.extractCompany(profileExtractionInfo.companyProfile, reference, extractFullProfile);
                        } else if (profileExtractionInfo.inProfile || profileExtractionInfo.encProfile || profileExtractionInfo.salesNavProfile || profileExtractionInfo.pubProfile) {
                            await this.extractProfile(profileExtractionInfo.inProfile, profileExtractionInfo.encProfile, profileExtractionInfo.salesNavProfile, profileExtractionInfo.pubProfile, reference, extractFullProfile);
                        } else {
                            await this.stopExtraction();
                        }
                    } else {
                        await this.stopExtraction();
                    }
                } else {
                    // Llegamos a este sitio si localmente ya tenemos requests disponibles, pero en el server no (puede ocurrir si hay diferencia horaria)
                    this.continueExtractingProfiles();
                }
            } else {
                if (!this.isWaitingForRequests) {
                    this.isWaitingForRequests = true;
                    await this.sendErrorMessage('Max number of daily requests reached', false);
                }
                this.continueExtractingProfiles();
            }
        } else {
            await this.stopExtraction(false);
            await this.sendErrorMessage('No LinkedIn User logged in');
        }
    }

    private async getNextProfileToExtract(): Promise<ProfileExtractionInfo> {
        try {
            let response = await this.apiService
                .call<any>(this.apiService.apiPaths.request, { path: '/app/getnextapp', args: { identifier: this.linkedInAccount.encLinkedInId } }, true)
                .toPromise();

            if (response.RequestType && response.RequestType.length > 0 && response.hasOwnProperty('Reference') && typeof response.Reference === 'number') {
                let extractFullProfile = response.hasOwnProperty("ExtractFullProfile") && typeof response.ExtractFullProfile == "boolean" ? response.ExtractFullProfile : false;
                this.currentExtractingProfile = null;

                return new ProfileExtractionInfo(
                    response.InProfile,
                    response.EncProfile,
                    response.SalesNavProfile,
                    response.PubProfile,
                    response.CompanyProfile,
                    response.CompanyIdentifier,
                    response.Reference,
                    extractFullProfile,
                    response.RequestType);
            } else {
                throw '{ Message: "Error getting the next profile to extract" }';
            }
        } catch (err) {
            let errJson = JSON.parse(err);
            if (errJson.hasOwnProperty('ErrorCode')) {
                if (+errJson.ErrorCode === 3) {
                    if (!this.isWaitingForRequests) {
                        this.isWaitingForRequests = true;
                    }
                } else if (errJson.hasOwnProperty('Message')) {
                    await this.sendErrorMessage(errJson.Message);
                } else if (errJson.hasOwnProperty('message')) {
                    await this.sendErrorMessage(errJson.message);
                }
            } else {
                if (errJson.hasOwnProperty('Message')) {
                    await this.sendErrorMessage(errJson.Message);
                } else if (errJson.hasOwnProperty('message')) {
                    await this.sendErrorMessage(errJson.message);
                }
            }
            return null;
        }
    }

    private async stopByLinkedInLogout(): Promise<any> {
        // US-71 Si se detuvo por LinkedIn Logout no debemos reiniciar la extracción
        await this.stopExtraction(false);
        this.userService.clearLinkedInAccount(this.tabId);
        this.clearLinkedInUser();
        this.lastExtractionDate = null;
        await this.sendErrorMessage('Extraction stopped due to LinkedIn logout');
        await this.goToUrl(this.defaultPage);
    }

    private async readNetWorkInfo(url: string, profile: string): Promise<LinkedInNetworkInfoSchema> {
        try {
            let response = await this.queryWebView('readNetworkInfo', { profile: profile });
            let linkedInNetWorkInfo = response[0];

            // US-71 Si linkedInNetworkInfo trae error y status 401 es por que no estoy loggeado
            if (linkedInNetWorkInfo.hasOwnProperty('error')) {
                if (linkedInNetWorkInfo.hasOwnProperty('status') && linkedInNetWorkInfo.status === 401) {
                    return new LinkedInNetworkInfoSchema(0, 0, false, 0, '', linkedInNetWorkInfo.status);
                } else {
                    return null;
                }
            }

            let encryptedLinkedInId = '';
            let entityUrnArr = linkedInNetWorkInfo.entityUrn.split(':');
            encryptedLinkedInId = '/in/' + entityUrnArr[entityUrnArr.length - 1];

            return new LinkedInNetworkInfoSchema(
                this.utils.conectionLevelFromLinkedInNetwork(linkedInNetWorkInfo.distance.value),
                linkedInNetWorkInfo.followersCount,
                linkedInNetWorkInfo.following,
                linkedInNetWorkInfo.connectionsCount,
                encryptedLinkedInId,
                200
            );
        } catch (error) {
            return null;
        }
    }

    private async sendProfileHTML(identifier: string, reference: number, status: string, distance: number, inLinkedInId: string, encLinkedInId: string, pubLinkedInId: string, html: string) {
        let argsJson = {
            path: '/app/sethtml',
            args: {
                identifier: identifier,
                reference: reference,
                status: status,
                connectionlevel: distance,
                inlinkedinid: inLinkedInId,
                enclinkedinid: encLinkedInId,
                publinkedinid: pubLinkedInId,
                html: html
            }
        };
        await this.sendHTML(argsJson);
    }

    private async sendCompanyHTML(identifier: string, reference: number, status: string, companyProfile: string, html: string) {
        let argsJson = {
            path: '/app/setcompanyhtml',
            args: {
                identifier: identifier,
                reference: reference,
                status: status,
                companyprofile: companyProfile,
                html: html
            }
        };
        await this.sendHTML(argsJson);
    }

    private async sendHTML(argsJson: any) {
        try {
            await this.apiService
                .call<any>(this.apiService.apiPaths.request, argsJson, true)
                .toPromise();

            await this.updateTotalsFromUS();
        } catch (err) {
            let errJson = JSON.parse(err);
            // If the error code is 103 (blocked user) log the user out.
            if (errJson.hasOwnProperty('ErrorCode') && errJson.ErrorCode == '103') {
                this.userService.clearCurrentUser();
                this.lastExtractionDate = null;
            }
            // Stop extraction and send notification and alert to the user.
            await this.stopExtraction(false);
            if (errJson.hasOwnProperty('Message'))
                await this.sendErrorMessage(errJson.Message);
            else if (errJson.hasOwnProperty('message'))
                await this.sendErrorMessage(errJson.message);
        }
    }

    private async continueExtractingProfiles() {
        this.lastExtractionDate = Date.now();

        if (!this.isExtracting)
            return;

        let min: number = 18000;
        let max: number = 26000;

        if (this.isWaitingForRequests) {
            min = 60000;
            max = 60000;
        } else {
            min = this.linkedInAccount.minRequestInterval;
            max = this.linkedInAccount.maxRequestInterval;
        }

        // Se calcula el tiempo de espera
        let sleepTime = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!this.isWaitingForRequests) {
            const sleeptimeSeconds = Math.round(sleepTime / 1000);
            // US-216 Se guarda la hora (mínima) a la que debe comenzar la extracción del siguiente perfil          
            this.nextProfileDate = new Date(Date.now() + sleepTime);
            // Envía un nuevo timer al subject para reiniciar el contador.
            this.nextProfileTimerSubject$.next(sleeptimeSeconds);
        }
        await this.utils.sleep(sleepTime);
        // US-71 Si se detiene la extracción mientras está el countdown no llamamos a extractProfiles
        if (this.isExtracting)
            this.extractProfiles();
    }

    private async htmlProfileExtraction(url: string, inLinkedInId: string, encLinkedInId: string, salesNavLinkedInId: string, pubLinkedInId: string, reference: number, networkInfo: LinkedInNetworkInfoSchema, extractFullProfile: boolean): Promise<void> {
        let distance: number = -1;
        // Se verifica si tenemos el perfil 'in'.
        let isInProfile = inLinkedInId && inLinkedInId.length > 0 ? true : false;

        if (isInProfile) {
            encLinkedInId = networkInfo.encryptedLinkedInId;
            distance = isNaN(networkInfo.distanceValue) ? -1 : networkInfo.distanceValue;
        }

        try {
            let htmlExtracted = await this.goToUrlAndExtractProfileAsync(url, distance, extractFullProfile);
            if (htmlExtracted && htmlExtracted.error) {
                if (htmlExtracted.error.toLowerCase().indexOf('unavailable') > -1) {
                    await this.sendProfileHTML(this.linkedInAccount.encLinkedInId, reference, 'UNAVAILABLE', distance, inLinkedInId, encLinkedInId, pubLinkedInId, '');
                } else if (htmlExtracted.error.toLowerCase().indexOf('distance') > -1) {
                    await this.sendProfileHTML(this.linkedInAccount.encLinkedInId, reference, 'DISTANCE_ERROR', distance, inLinkedInId, encLinkedInId, pubLinkedInId, '');
                } else if (htmlExtracted.error.toLowerCase().indexOf('logout') > -1) {
                    if (this.isProcessing) {
                        //Evitamos que se propague el error, si ya estamos detenidos y proviene del content script
                        await this.stopByLinkedInLogout();
                    }
                    throw htmlExtracted.error;
                } else {
                    throw htmlExtracted.error;
                }
            } else if (htmlExtracted && htmlExtracted.html) {
                if (!isInProfile) {
                    inLinkedInId = htmlExtracted.inLinkedInId;
                    encLinkedInId = !encLinkedInId && htmlExtracted.encLinkedInId ? htmlExtracted.encLinkedInId : encLinkedInId;
                    distance = htmlExtracted.distance && !isNaN(htmlExtracted.distance) ? +htmlExtracted.distance : -1;
                    if (distance > this.appData.minDistanceForExtraction) {
                        await this.sendProfileHTML(this.linkedInAccount.encLinkedInId, reference, 'DISTANCE_ERROR', distance, inLinkedInId, encLinkedInId, pubLinkedInId, '');
                        return;
                    }
                }
                await this.sendProfileHTML(this.linkedInAccount.encLinkedInId, reference, 'OK', distance, inLinkedInId, encLinkedInId, pubLinkedInId, htmlExtracted.html);
            } else {
                throw 'Error';
            }
        } catch (err) {
            await this.sendProfileHTML(this.linkedInAccount.encLinkedInId, reference, 'ERROR', distance, inLinkedInId, encLinkedInId, pubLinkedInId, '');
            // US-69 Se arroja el error para poder hacer el try catch donde se manda llamar este método.
            throw err;
        }
    }

    private async htmlCompanyExtraction(url: string, companyProfileToExtract: string, reference: number, extractFullProfile: boolean): Promise<void> {
        try {
            this.currentExtractingProfile = companyProfileToExtract;
            let htmlExtracted = await this.goToUrlAndExtractCompanyAsync(url, extractFullProfile);
            if (this.globalsService._debug) {
                console.log('    htmlExtracted: ' + JSON.stringify(htmlExtracted));
            }
            
            if (htmlExtracted && htmlExtracted.error) {
                if (htmlExtracted.error.toLowerCase().indexOf('unavailable') > -1) {
                    await this.sendCompanyHTML(this.linkedInAccount.encLinkedInId, reference, 'UNAVAILABLE', companyProfileToExtract, '');
                } else if (htmlExtracted.error.toLowerCase().indexOf('logout') > -1) {
                    if (this.isProcessing) {
                        // Evitamos que se propague el error, si ya estamos detenidos y proviene del content script.
                        await this.stopByLinkedInLogout();
                    }
                    throw htmlExtracted.error;
                } else {
                    throw htmlExtracted.error;
                }
            } else if (htmlExtracted && htmlExtracted.html) {
                await this.sendCompanyHTML(this.linkedInAccount.encLinkedInId, reference, 'OK', companyProfileToExtract, htmlExtracted.html);

            } else {
                throw 'Error';
            }
        } catch (err) {
            await this.sendCompanyHTML(this.linkedInAccount.encLinkedInId, reference, 'ERROR', companyProfileToExtract, '');
            // US-69 Se arroja el error para poder hacer el try catch donde se manda llamar este método.
            throw err;
        }
    }

    public async stopExtraction(shouldRestart: boolean = true) {
        let error = false;
        this.isExtracting = false;
        // Setea el status como frenado al principio
        this.emitExtractingStatusToSubject(ExtractionStatus.Frenado);
        try {
            this.needsClosingConfirmation = false;
            if (this.isProcessing) {
                let response = await this.queryWebView('stopExtraction', {});
                let result = response[0];
            }
        } catch (e) {
            error = true;
            // Si llego a este punto es por que el injectedScript no está respondiendo
            this.isProcessing = false;
            this.webview.reload();
            if (shouldRestart)
                this.restartExtraction();
        }
        if (!error) {
            this.isProcessing = false;
            if (shouldRestart)
                this.restartExtraction();
        }
    }

    public restartExtraction() {
        this.isExtracting = true;
        // Setea el status como frenado al principio
        this.emitExtractingStatusToSubject(ExtractionStatus.Extrayendo);
        this.isWaitingForRequests = false;
        this.isProcessing = true;
        this.extractProfiles();
    }

    public async sendErrorMessage(message: string, shouldLog: boolean = true): Promise<any> {
        if (shouldLog) {
            await this.logError(message);
        }
        // Lo de abajo hay que cambiarlo por una notification de electron
        this.osNotificationService.display('Error: ' + message);
    }

    public async logError(message: string): Promise<any> {
        try {
            let user = this.userService.getCurrentUser();
            let argsJson = {
                path: '/app/log',
                args: {
                    user: user.email,
                    fullname: this.linkedInAccount.fullName,
                    inlinkedinid: this.linkedInAccount.inLinkedInId,
                    enclinkedinid: this.linkedInAccount.encLinkedInId,
                    message: message
                }
            };

            await this.apiService
                .call<any>(this.apiService.apiPaths.request, argsJson, true)
                .toPromise();
        } catch (error) {
        }
    }

    private async goToUrlAndExtractProfileAsync(url: string, distance: number, extractFullProfile: boolean): Promise<any> {
        try {
            this.needsClosingConfirmation = false;
            this.isProcessing = false;
            await this.goToUrl(url);
            let loopCount = 0;
            // Esperamos para obtener un perfil de tipo In y setearlo como currentExtractingProfile
            while (
                    (!this.currentExtractingProfile || 
                    this.utils.IsEncryptedProfile(this.currentExtractingProfile) || 
                    this.utils.IsSalesNavProfile(this.currentExtractingProfile) || 
                    this.currentExtractingProfile.indexOf('/pub/') > -1 ) 
                    && 
                    loopCount < 8) {
                // Esperamos un momento para que el InLinkedInId se setee como url
                await this.utils.sleep(2000);
                // Se obtiene la URL desde el injectedScript y se guarda el id de LinkedIn.
                let res = await this.queryWebView('getCurrentUrl', {});
                this.currentExtractingProfile = res[0].url.split('linkedin.com')[1];
                loopCount++;
            }
            // Informa la nueva URL
            this.urlToExtract$.next('https://www.linkedin.com' + this.currentExtractingProfile);

            // US-69 Tenemos que checar si en lo que cambiamos de página se presionó el botón para detener la extracción.
            if (this.isExtracting) {
                this.needsClosingConfirmation = true;
                this.isProcessing = true;
                //  US-136: Se aumenta el timeout en 3 minutos si se debe extraer el perfil completo (por ahora solo se tiene en cuenta los skills).
                let extraTimeOut = extractFullProfile ? (1000/*ms*/ * 60/*s*/ * 4/*min*/) : 0;
                let result = await this.queryWebView('extractProfile', { distance: distance, extractFullProfile: extractFullProfile, appData: this.appData }, extraTimeOut);
                return result[0];
            } else {
                return { error: 'stopped' };
            }
        } catch (err) {
            return { error: err };
        }
    }

    private async goToUrlAndExtractCompanyAsync(url: string, extractFullProfile: boolean): Promise<any> {
        try {
            this.needsClosingConfirmation = false;
            this.isProcessing = false;
            await this.goToUrl(url);
            let loopCount = 0;
            // Esperamos para obtener el identificador real de la company y setearlo como currentExtractingProfile
            while (this.currentExtractingProfile.match('/(company|showcase|school)/[0-9]+$') && loopCount < 8) {
                // Esperamos un momento para que la company se setee en la url
                await this.utils.sleep(2000);
                // Se obtiene la URL desde el injectedScript y se guarda el id de LinkedIn.
                let res = await this.queryWebView('getCurrentUrl', {});
                this.currentExtractingProfile = res[0].url.match('/(company|showcase|school)/[^/]+')[0];
                loopCount++;
            }
            // Informa la nueva URL
            this.urlToExtract$.next('https://www.linkedin.com' + this.currentExtractingProfile);

            // US-69 Tenemos que checar si en lo que cambiamos de página se presionó el botón para detener la extracción.
            if (this.isExtracting) {
                this.needsClosingConfirmation = true;
                this.isProcessing = true;
                //  US-136: Se aumenta el timeout en 2 minutos si se debe extraer el perfil de la compañía completo (por ahora solo se tiene en cuenta los insights).
                let extraTimeOut = extractFullProfile ? (1000/*ms*/ * 60/*s*/ * 2/*min*/) : 0;
                let result = await this.queryWebView('extractCompany', { extractFullProfile: extractFullProfile, appData: this.appData }, extraTimeOut);

                return result[0];
            } else {
                return { error: 'stopped' };
            }
        } catch (err) {
            return { error: err };
        }
    }

    private async goToUrl(url: string): Promise<any> {
        this.isWebviewReady = false;
        this.webview.loadURL(url);

        while (!this.isWebviewReady) {
            await this.utils.sleep(200);
        }
    }

    private promiseTimeOut(promise, ms) {
        // Create a promise that rejects in <ms> milliseconds.
        let timeout = new Promise((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                reject('Timed out')
            }, ms)
        })

        // Returns a race between our timeout and the passed in promise.
        return Promise.race([promise, timeout]);
    }

    // US-62: Esto ahora se manda llamar desde el Listener de did-navigate-in-page
    public async setLinkedInInfoFromAPIAsync(): Promise<boolean> {
        try {
            let response = await this.queryWebView('getMeInfo', {});
            let result = response[0];

            if (result.hasOwnProperty('miniProfile')) {
                let entityUrnArr = result.miniProfile.entityUrn.split(':');
                this.linkedInAccount.fullName = result.miniProfile.firstName + ' ' + result.miniProfile.lastName;
                this.linkedInAccount.inLinkedInId = '/in/' + result.miniProfile.publicIdentifier;
                this.linkedInAccount.encLinkedInId = '/in/' + entityUrnArr[entityUrnArr.length - 1];
                this.linkedInAccount.isLogged = true;

                // US-62: Cuando me loggeo hago un llamado a getdataapp para registrar la cuenta de linkedin si no existe.
                await this.updateTotalsFromUS();

                return true;
            } else {
                this.clearLinkedInUser();
            }

        } catch (error) {
            if (!this.reloadedPage) {
                this.webview.reload();
                this.reloadedPage = true;
            }
            return false;
        }
    }

    private clearLinkedInUser(): void {
        this.linkedInAccount.fullName = null;
        this.linkedInAccount.inLinkedInId = null;
        this.linkedInAccount.encLinkedInId = null;
        this.linkedInAccount.isLogged = false;
        this.linkedInAccount.userAgent = null;
        this.userService.updateLinkedInAccount(this.linkedInAccount);
    }

    private async updateTotalsFromUS(): Promise<any> {
        let dataFromAPI = await this.apiService
            .call<any>(this.apiService.apiPaths.request, { path: '/app/getdataapp', args: { identifier: this.linkedInAccount.encLinkedInId } }, true)
            .toPromise();

        // US-64: Actualizo los datos desde la WebAPI
        this.linkedInAccount.maxDailyProfiles = dataFromAPI.MaxDailyRequest;
        this.linkedInAccount.todayProfiles = dataFromAPI.RequestsToday;
        this.linkedInAccount.okProfiles = dataFromAPI.OkToday;
        this.linkedInAccount.distanceErrors = dataFromAPI.DistanceErrorsToday;
        this.linkedInAccount.unavailableProfiles = dataFromAPI.UnavailableErrorsToday;
        this.linkedInAccount.otherErrors = dataFromAPI.OtherErrorsToday;
        this.linkedInAccount.minRequestInterval = dataFromAPI.MinRequestInterval;
        this.linkedInAccount.maxRequestInterval = dataFromAPI.MaxRequestInterval;

        // US-107 Los requests que nunca regresaron se toman como otherErrors
        let difference = this.linkedInAccount.todayProfiles - (this.linkedInAccount.okProfiles + this.linkedInAccount.distanceErrors + this.linkedInAccount.unavailableProfiles + this.linkedInAccount.otherErrors) - 1;
        if (difference > 0) {
            this.linkedInAccount.otherErrors += difference;
        }

        this.userService.updateLinkedInAccount(this.linkedInAccount);

        let usAccount = this.userService.getCurrentUser();

        usAccount.balance = dataFromAPI.Balance;
        usAccount.completed = dataFromAPI.Completed;
        usAccount.paypalEmail = dataFromAPI.PaypalEmail;
        usAccount.btcAddress = dataFromAPI.BTCAddress;
        usAccount.referralLink = dataFromAPI.ReferralLink;
        usAccount.usdx1000 = dataFromAPI.USDx1000;

        usAccount.lastUpdate = Date.now();

        // US-104 Se actualizan las notificaciones al mismo tiempo que se actualiza el resto de la información del Sidebar.
        if (dataFromAPI.hasOwnProperty('Notifications') && dataFromAPI.Notifications.length > 0) {
            dataFromAPI.Notifications.forEach(n => {
                let foundNotification = usAccount.notifications.find(nc => nc.id === n.Id);
                if (!foundNotification)
                    usAccount.notifications.push(new Notification(n.Id, n.Message, n.StartDate, false));
            });
        }

        this.userService.updateCurrentUser(usAccount);
    }

    /**
     * Emit un status en el subject extractingStatusSubject
     * @param status Status a setear en el Subjec
     */
    private emitExtractingStatusToSubject(status: ExtractionStatus): void {
        this.extractingStatusSubject$.next(status);
    }
}
