import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ApiService } from './api.service'
import { AppData } from '../models/app-data';
import { XPath } from '../models/xpath';
import { UserAgent } from '../models/user-agent';
import { NumberSymbol } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AppDataService {
    public appDataInstance: ReplaySubject<AppData> = new ReplaySubject(1);

    /**
     * Constructor del servicio de AppData
     * @param apiService Servicio de API.
     */
    constructor(private apiService: ApiService) { }

    public load(): ReplaySubject<AppData> {
        this.apiService
            .call<any>(this.apiService.apiPaths.request, { path: '/app/getappdata', args: {} }, true)
            .subscribe(response => {
                let xpaths: XPath[] = [];
                let companyXpaths: XPath[] = [];
                let userAgents: UserAgent[] = [];
                let minWait: number, maxWait: number, minDistanceForExtraction: number, thresholdToReset: number;

                if (!response.hasOwnProperty('error') && response.XPaths && response.CompanyXPaths && response.UserAgents) {
                    //Valores por default
                    minWait = response.MinWait;
                    maxWait = response.MaxWait;
                    thresholdToReset = response.ThresholdToReset;
                    minDistanceForExtraction = response.MinDistanceForExtraction;
                    //User-agents
                    response.UserAgents.forEach(ua => {
                        let usAgent = new UserAgent(
                            ua.Name,
                            ua.AgentString,
                            ua.Usage
                        );
                        userAgents.push(usAgent);
                    });
                    //XPaths
                    response.XPaths.forEach(xp => {
                        let xpath = new XPath(
                            xp.Key,
                            xp.Value
                        );
                        xpaths.push(xpath);
                    });
                    //CompanyXPaths
                    response.CompanyXPaths.forEach(xp => {
                        let xpath = new XPath(
                            xp.Key,
                            xp.Value
                        );
                        companyXpaths.push(xpath);
                    });
                }
                let appData = new AppData(new Date(), xpaths, companyXpaths, minDistanceForExtraction, userAgents, minWait, maxWait, thresholdToReset)
                this.appDataInstance.next(appData);
            });

        return this.appDataInstance;
    }
}