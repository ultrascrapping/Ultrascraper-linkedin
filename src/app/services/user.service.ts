import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs'
import { UltraAccount } from '../models/ultra-account'
import { LinkedInAccount } from '../models/linkedin-account'

@Injectable({
    providedIn: 'root'
})
export class UserService {
    public logger = new BehaviorSubject<boolean>(!!this.getCurrentUser());

    /**
     * Constructor del servicio de usuarios.
     */
    constructor() { }

    /**
     * Observable para cuando se logea o deslogea un usuario.
     */
    isLoggedIn(): Observable<boolean> {
        return this.logger.asObservable();
    }

    /**
     * Guarda la información del usuario actual en el LocalStorage.
     * @param user Usuario actual.
     */
    setCurrentUser(user: UltraAccount) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.logger.next(true);
    }

    /**
     * Obtiene la información del usuario actual desde el LocalStorage.
     */
    getCurrentUser(): UltraAccount {
        return <UltraAccount>JSON.parse(localStorage.getItem('currentUser'));
    }

    /**
     * Actualiza la información del usuario actual en el LocalStorage.
     * @param user Usuario actual.
     */
    updateCurrentUser(user: UltraAccount) {
        //localStorage.removeItem('currentUser');
        this.setCurrentUser(user);
        this.logger.next(true);
    }

    /**
     * Borra la información del usuario actual del LocalStorage.
     */
    clearCurrentUser() {
        localStorage.removeItem('currentUser');
        this.logger.next(false);
        // Se eliminan también las cuentas de LinkedIn de localStorage ya que este método solo se llama al hacer logout.
        this.clearLinkedInAccounts();
    }

    /**
     * Guarda la información de la cuenta de LinkedIn dada en el LocalStorage.
     * @param linkedInAccount Cuenta de LinkedIn a guardar.
     */
    setLinkedInAccount(linkedInAccount: LinkedInAccount) {
        let linkedInAccounts: LinkedInAccount[] = JSON.parse(localStorage.getItem('linkedInAccounts'));
        if (!linkedInAccounts) {
            linkedInAccounts = [];
        }
        linkedInAccounts.push(linkedInAccount);
        localStorage.setItem('linkedInAccounts', JSON.stringify(linkedInAccounts));
    }

    /**
     * Obtiene la información de la cuenta de LinkedIn con el id del tab dado desde el LocalStorage.
     * @param tabId Id del tab.
     */
    getLinkedInAccount(tabId: string): LinkedInAccount {
        let linkedInAccounts: LinkedInAccount[] = JSON.parse(localStorage.getItem('linkedInAccounts'));
        let linkedInAccount: LinkedInAccount;
        if (linkedInAccounts) {
            linkedInAccount = linkedInAccounts.find(a => a.tabId == tabId);
        }

        return linkedInAccount;
    }

    /**
     * Obtiene la información de las cuentas de LinkedIn desde el LocalStorage.
     */
    getLinkedInAccounts(): LinkedInAccount[] {
        return <LinkedInAccount[]>JSON.parse(localStorage.getItem('linkedInAccounts'));;
    }

    /**
     * Actualiza la información de la cuenta de LinkedIn en el LocalStorage.
     * @param linkedInAccount Cuenta de LinkedIn a actualizar.
     */
    updateLinkedInAccount(linkedInAccount: LinkedInAccount) {
        let linkedInAccounts: LinkedInAccount[] = JSON.parse(localStorage.getItem('linkedInAccounts'));
        if (linkedInAccounts) {
            let foundLinkedInAccount: LinkedInAccount = linkedInAccounts.find(a => a.tabId === linkedInAccount.tabId);
            if (foundLinkedInAccount) {
                foundLinkedInAccount.maxDailyProfiles = linkedInAccount.maxDailyProfiles;
                foundLinkedInAccount.todayProfiles = linkedInAccount.todayProfiles;
                foundLinkedInAccount.distanceErrors = linkedInAccount.distanceErrors;
                foundLinkedInAccount.unavailableProfiles = linkedInAccount.unavailableProfiles;
                foundLinkedInAccount.otherErrors = linkedInAccount.otherErrors;
                foundLinkedInAccount.fullName = linkedInAccount.fullName;
                foundLinkedInAccount.inLinkedInId = linkedInAccount.inLinkedInId;
                foundLinkedInAccount.encLinkedInId = linkedInAccount.encLinkedInId;
                foundLinkedInAccount.timestamp = linkedInAccount.timestamp;
                foundLinkedInAccount.okProfiles = linkedInAccount.okProfiles;
                foundLinkedInAccount.maxRequestInterval = linkedInAccount.maxRequestInterval;
                foundLinkedInAccount.minRequestInterval = linkedInAccount.minRequestInterval;
                
                localStorage.removeItem('linkedInAccounts');
                localStorage.setItem('linkedInAccounts', JSON.stringify(linkedInAccounts));
            }
        }
    }

    /**
     * Borra la información de la cuenta de LinkedIn con el id del tab dado del LocalStorage.
     * @param tabId Id del tab.
     */
    clearLinkedInAccount(tabId: string) {
        let linkedInAccounts: LinkedInAccount[] = JSON.parse(localStorage.getItem('linkedInAccounts'));
        if (linkedInAccounts) {
            linkedInAccounts = linkedInAccounts.filter(a => a.tabId !== tabId);
            localStorage.removeItem('linkedInAccounts');
            localStorage.setItem('linkedInAccounts', JSON.stringify(linkedInAccounts));
        }
    }

    /**
     * Borra la información de las cuentas de LinkedIn del LocalStorage.
     */
    clearLinkedInAccounts() {
        localStorage.removeItem('linkedInAccounts');
    }
}
