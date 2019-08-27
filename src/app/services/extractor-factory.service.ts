import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { AppDataService } from './app-data.service';
import { ApiService } from './api.service';
import { UtilsService } from './utils.service';
import { Extractor } from '../models/extractor';
import { LinkedInAccount } from '../models/linkedin-account';
import { OsNotificationService } from './os-notification.service';
import { GlobalsService } from './globals.service';

@Injectable({
    providedIn: 'root'
})
export class ExtractorFactoryService {

    constructor(private userService: UserService, private appDataService: AppDataService, private apiService: ApiService, private utils: UtilsService, private osNotificationService : OsNotificationService, private globalsService: GlobalsService) { }

    public createExtractor(linkedInAccount: LinkedInAccount): Extractor {
        return new Extractor(linkedInAccount, this.userService, this.appDataService, this.apiService, this.utils, this.osNotificationService, this.globalsService);
    }
}
