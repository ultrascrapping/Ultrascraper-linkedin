import { Component, OnInit, ViewChildren, QueryList, NgZone, OnDestroy } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { SuiModalService } from 'ng2-semantic-ui';
import { LinkedInAccount } from '../../models/linkedin-account';
import { Extractor } from '../../models/extractor';
import { UserService } from '../../services/user.service';
import { AppDataService } from '../../services/app-data.service';
import { ExtractorFactoryService } from '../../services/extractor-factory.service';
import { UtilsService } from '../../services/utils.service';
import { TabClosingConfirmationModal } from './tab-closing-confirmation-modal/tab-closing-confirmation-modal.component';
import { UserAgent } from './../../models/user-agent';
import { AppData } from './../../models/app-data';
import { ngDevModeResetPerfCounters } from '@angular/core/src/render3/ng_dev_mode';
import { SignalRService } from '../../services/signal-r.service';
import { Subject, Observable, Subscription, BehaviorSubject } from 'rxjs';
import { switchMap, merge, tap, skip } from 'rxjs/operators';
import { ExtractionStatus } from './../../models/extraction-status';
import { GlobalsService } from './../../services/globals.service';

@Component({
    selector: 'app-browser',
    templateUrl: './browser.component.html',
    styleUrls: ['./browser.component.css']
})
export class BrowserComponent implements OnInit, OnDestroy {
 

    @ViewChildren('webViewFor') webViewFor: QueryList<any>;
    selectedTabId: string;
    selectedExtractor: Extractor;
    accounts: LinkedInAccount[] = [];
    extractors: Extractor[] = [];
    private appData: AppData;
    private lastThresholdMilisecondstoReset = 86400000; // Cantidad máxima de milisgendos entre 1 día    

    /**
     * Subject del array de extractores
     */
    private extractorSubject$ = new Subject<Extractor[]>();
    /**
     * Subscrición al subject de extracores
     */
    private extractorSubscription$: Subscription;

    
    constructor(
        public modalService: SuiModalService,
        private electronService: ElectronService,
        private userService: UserService,
        private appDataService: AppDataService,
        private extractorFactoryService: ExtractorFactoryService,
        private utils: UtilsService,
        private signalRService: SignalRService,
        private globalsService: GlobalsService
    ) {
        
        this.electronService.ipcRenderer.on('setGlobal', (event, arg) => {
            this.globalsService[arg.name] = arg.value;
        });

        this.appDataService.load();
        this.appDataService.appDataInstance.subscribe(a => 
            this.appData = a
        );
    }

    ngOnInit() {   
        this.signalRService.hubConnection.on('resetCounters', message => {
            this.resetCounters();
        });
    }

    ngOnDestroy(): void {
       this.extractorSubscription$.unsubscribe();
    }

    ngAfterViewInit() {
            this.webViewFor.changes.subscribe(webviews => {
                this.webviewRendered(webviews);
            });
            this.webviewRendered(this.webViewFor);
    }


    ngAfterContentInit() {
        this.userService.isLoggedIn().subscribe(loggedIn => {
            if (loggedIn) {
                let accounts = this.userService.getLinkedInAccounts();
                if (!accounts) {
                    accounts = [];
                }
                if (!this.accounts || this.accounts.length == 0) {
                    this.accounts = accounts;
                } else {
                    this.accounts.forEach(a => {
                        let foundAccount = accounts.find(ac => ac.tabId === a.tabId);
                        if (foundAccount) {
                            a.maxDailyProfiles = foundAccount.maxDailyProfiles;
                            a.todayProfiles = foundAccount.todayProfiles;
                            a.distanceErrors = foundAccount.distanceErrors;
                            a.unavailableProfiles = foundAccount.unavailableProfiles;
                            a.otherErrors = foundAccount.otherErrors;
                            a.fullName = foundAccount.fullName;
                            a.inLinkedInId = foundAccount.inLinkedInId;
                            a.encLinkedInId = foundAccount.encLinkedInId;
                            a.timestamp = foundAccount.timestamp;
                            a.okProfiles = foundAccount.okProfiles;
                            a.maxRequestInterval = foundAccount.maxRequestInterval;
                            a.minRequestInterval = foundAccount.minRequestInterval;
                            a.userAgent = foundAccount.userAgent;

                            // US-107 Los requests que nunca regresaron se toman como otherErrors
                            let difference = a.todayProfiles - (a.okProfiles + a.distanceErrors + a.unavailableProfiles + a.otherErrors) - 1;
                            if (difference > 0) {
                                a.otherErrors += difference;
                            }                            
                        }
                    });
                }                
            } else {
                this.accounts = [];
            }
            this.accounts.forEach(account => {
                const extractor = this.extractorFactoryService.createExtractor(account);
                this.extractors.push(extractor);
            });
            // agrega los extractors al subject para poder subscribir a sus observables
            this.extractorSubject$.next(this.extractors);
            this.selectedTabId = this.findNextSelectedTabId();
            this.selectedExtractor = this.findExtractorByTabId(this.selectedTabId);  
            this.appDataService.load();
            this.appDataService.appDataInstance.subscribe(a => this.appData = a);
        });

        // Reinicia los extractores
        this.restartExtractors();

        //Subscription al status de los extracores del array
        this.extractorSubscription$ = this.extractorSubject$.pipe(
            skip(1), // skip el primero para no levantar el swithMap en el arranque.
            switchMap((extractors) => {
                // hace merge d etodos los extractionstatus
                let mergedExtractor = new Observable<ExtractionStatus>();
                extractors.forEach((extractor) => {
                    mergedExtractor = mergedExtractor.pipe(
                        merge(extractor.extractingStatusSubject$)
                    );
                })
                return mergedExtractor;
            })
        ).subscribe((val) => { // Subscripción sobre el innerObservaable para persistir los extractores cada vez que cambia el extractingStatusSubject            
            // persiste en localstorage los extractores a extraer
            const extractorsToRestart = this.extractors
                .filter(ex => ex.isExtracting)
                .map(ex => ex.tabId)
                .reduce((result, nextItem) => result.includes(nextItem) ? result : result.concat(nextItem), []);

            localStorage.setItem('extractorsToRestart', JSON.stringify(extractorsToRestart));
        });

    }



    webviewRendered(webviews: any) {
        webviews.forEach(w => {
            let webview = w.nativeElement;
            let extractor = this.findExtractorByTabId(webview.id);
            // US-62: Si isWebViewSet == true pero no tenemos src es por que se deslogueó usuario de US y tenemos que recargar.
            if (!extractor.isWebViewSet || (extractor.isWebViewSet && webview.src.length < 1))
                extractor.setWebView(webview);
        });
    }

    /**
     * Obtiene un User-Agent aleatorio, teniendo en cuenta el nivel de uso de cada uno
     */
    getRandomUserAgent(): UserAgent {
        if (!this.appData || !this.appData.userAgents) { 
            return new UserAgent('Chrome 75.0 Win10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36', 0); 
        } else {
            //Lista de User-Agents disponibles
            let userAgents = this.appData.userAgents;

            //Sumatoria de las prioridades
            let sumUsage = userAgents.reduce(function(prev, cur) {
                return prev + cur.usage;
            }, 0);

            let choosenValue = Math.floor(Math.random() * (sumUsage + 1));

            //Tomamos el User-Agent de acuerdo al valor aleatorio
            for (let usAgent of userAgents.reverse()) {
                sumUsage = sumUsage - usAgent.usage;
                if(choosenValue >= sumUsage) {
                    return usAgent;
                }
            }
            return userAgents[0];
        } 
    }


    addTab() {
        let tabId = this.utils.newGuid();
        let userAgent = this.getRandomUserAgent();
        let newLinkedInAccount = new LinkedInAccount(0, 200, 0, 0, 0, 0, '', '', '', tabId, 0, userAgent);
        let extractor = this.extractorFactoryService.createExtractor(newLinkedInAccount);
        this.accounts.push(newLinkedInAccount);
        this.extractors.push(extractor);
        this.selectedTabId = tabId;
        this.selectedExtractor = extractor;
        this.userService.setLinkedInAccount(newLinkedInAccount);
        this.extractorSubject$.next(this.extractors);

    }

    removeTab(tabId: string): void {
        let removeFlag = true;
        let extractor = this.findExtractorByTabId(tabId);

        if (extractor.needsClosingConfirmation) {
            this.modalService
            .open(new TabClosingConfirmationModal())
            .onApprove(() => { this.actuallyRemoveTab(tabId) });
        } else {
            this.actuallyRemoveTab(tabId);
        }        
    }    

    changeSelectedTab(tabId: string): void {
        this.selectedTabId = tabId;
        this.selectedExtractor = this.extractors
            .filter(extractor => extractor.tabId === tabId)[0];
    }

    private actuallyRemoveTab(tabId: string): void {
        let extractor = this.findExtractorByTabId(tabId);
        this.removeExtractorAndAccountByTabId(tabId);
        this.selectedTabId = this.findNextSelectedTabId();
        this.selectedExtractor = this.findExtractorByTabId(this.selectedTabId);
        this.userService.clearLinkedInAccount(tabId);
    }

    private findExtractorByTabId(tabId: string): Extractor {
        return this.extractors.length > 0 
            ? this.extractors
                .filter(extractor => extractor.tabId === tabId)[0]
            : null;            
    }

    private removeExtractorByTabId(tabId: string): void {
        let extractor = this.findExtractorByTabId(tabId);
        extractor.destroy();
        this.extractors = this.extractors
            .filter(extractor => extractor.tabId !== tabId);
        // envía el nuevo arreglo de extractores al subject para subscription.
        this.extractorSubject$.next(this.extractors);
    }

    private removeAccountByTabId(tabId: string): void {
        this.accounts = this.accounts
            .filter(account => account.tabId !== tabId);
    }

    private removeExtractorAndAccountByTabId(tabId: string): void {
        this.removeExtractorByTabId(tabId);
        this.removeAccountByTabId(tabId);
    }

    private findNextSelectedTabId(): string {
        return this.accounts.length > 0 
            ? this.accounts[this.accounts.length - 1].tabId 
            : null;
    }

    /**
     * resetea a cero los contadores de errores y perfiles extraidos
     */
    private resetCounters() {
        // US-122 Se deben resetear los contadores desde la API.
        this.extractors.forEach(async extractor => {
            let account = extractor.linkedInAccount;
            account.todayProfiles = 0;
            account.okProfiles = 0;
            account.distanceErrors = 0;
            account.unavailableProfiles = 0;
            account.otherErrors = 0;
            this.userService.updateLinkedInAccount(account);
        });
    }

    /**
     * Reinicia los extractors que estuvieran persistidos en localstorage
     */
    private restartExtractors() {
        let delayTimes = 1;
        // Retorna los extractores a reiniciar
        const extractorsToRestart = JSON.parse(localStorage.getItem('extractorsToRestart'));
        if(extractorsToRestart) {
            extractorsToRestart.forEach(tabId => {
                setTimeout(() => {
                    const extractor = this.extractors.find(ex => ex.tabId === tabId);
                    if (extractor && !extractor.isExtracting) {
                        extractor.extractProfiles();
                    }
                }, 10000 * delayTimes++);
            });
        }
    }
}