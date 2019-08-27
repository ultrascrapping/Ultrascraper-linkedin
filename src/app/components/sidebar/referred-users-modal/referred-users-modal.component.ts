import { Component, OnInit } from '@angular/core';
import { SuiModal, ComponentModalConfig } from 'ng2-semantic-ui';
import { ReferredUser } from '../../../models/referred-user';
import { ApiService } from '../../../services/api.service'
import { UtilsService } from '../../../services/utils.service'

interface IReferredUsersModalContext { }

@Component({
    selector: 'app-referred-users-modal',
    templateUrl: './referred-users-modal.component.html',
    styleUrls: ['./referred-users-modal.component.css']
})
export class ReferredUsersModalComponent implements OnInit {
    activeReferredRequestsXMonth: number = 4000;
    referredUsers: ReferredUser[] = [];
    showErrorMessage: boolean = false;
    errorMessage: string = '';
    isLoading: boolean = true;

    constructor(
        public modal: SuiModal<IReferredUsersModalContext, void, void>,
        private apiService: ApiService,
        private utils: UtilsService
    ) { }

    ngOnInit() {
        let param: any = { path: "/app/getreferralprogramdata", args: {} };
        this.apiService.call<any>(this.apiService.apiPaths.request, param).subscribe(
            response => {                
                if (!response.hasOwnProperty("error") && response.hasOwnProperty("ActiveReferredRequestsXMonth") && response.hasOwnProperty("ReferredDataList")) {
                    if (response.ActiveReferredRequestsXMonth && !isNaN(response.ActiveReferredRequestsXMonth) && response.ReferredDataList && response.ReferredDataList.constructor === Array) {
                        this.activeReferredRequestsXMonth = <number>+response.ActiveReferredRequestsXMonth;
                        this.referredUsers = [];
                        response.ReferredDataList.sort((a, b) => {
                            if (+a.ProfilesExtracted > +b.ProfilesExtracted)
                                return -1;
                            if (+a.ProfilesExtracted < +b.ProfilesExtracted)
                                return 1;
                            return 0;
                        }).forEach(r => {
                            this.referredUsers.push(new ReferredUser(r.Email, this.utils.tryParseDate(r.CreationDate), r.ProfilesExtracted));
                        });
                        this.isLoading = false;
                    }
                } else {
                    this.showError('No se pudo obtener la información.');
                }
            },
            () => this.showError('No se pudo obtener la información.')
        );
    }

    /**
     * Muestra un error.
     */
    showError(errorMessage: string) {
        this.errorMessage = errorMessage;
        this.showErrorMessage = true;
        this.isLoading = false;
    }

    private getPercentage(profiles: number): number {
        let percentage = Math.round(profiles * 100 / this.activeReferredRequestsXMonth);
        return percentage < 100
            ? percentage
            : 100;
    }

    private getFormattedDate(date: Date): string {
        if (date) {
            return date.toLocaleString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        return '';
    }

    private getFormattedProfilesNumber(profiles: number): string {
        return profiles > this.activeReferredRequestsXMonth
            ? '+' + (this.activeReferredRequestsXMonth).toLocaleString('es-AR')
            : profiles.toLocaleString('es-AR');
    }
}

export class ReferredUsersModal extends ComponentModalConfig<IReferredUsersModalContext, void, void> {
    constructor() {
        super(ReferredUsersModalComponent, {});
        this.isClosable = false;
    }
}