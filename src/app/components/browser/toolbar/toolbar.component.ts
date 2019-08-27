import { Component, OnInit, Input } from '@angular/core';
import { LinkedInAccount } from '../../../models/linkedin-account';
import { Extractor } from '../../../models/extractor';
import { SuiModalService } from 'ng2-semantic-ui';
import { NavigationErrorsModal } from './navigation-errors-modal/navigation-errors-modal.component';
import { UserService } from '../../../services/user.service';
import { ApiService } from '../../../services/api.service';

export interface IContext {
    data: LinkedInAccount;
}

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
    @Input() extractor: Extractor;

    constructor(
        public modalService: SuiModalService,
        private userService: UserService,
        private apiService: ApiService
    ) { }

    ngOnInit() {
    }

    openModal(): void {
        this.modalService
            .open(new NavigationErrorsModal(this.extractor.linkedInAccount));
    }

    // US-64: Persistiendo maxDailyProfiles en la base
    async onDailyProfilesChanged(e) {
        this.userService.updateLinkedInAccount(this.extractor.linkedInAccount);

        let argsJson = {
            path: '/app/setconf',
            args: {
                identifier: this.extractor.linkedInAccount.encLinkedInId,
                maxdailyrequests: this.extractor.linkedInAccount.maxDailyProfiles,
                requestinterval: 20
            }
        };

        await this.apiService
            .call<any>(this.apiService.apiPaths.request, argsJson, true)
            .toPromise();
    }
}