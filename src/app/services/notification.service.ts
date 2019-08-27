import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor() { }

    /**
     * Guarda la información de la notificación leída en el LocalStorage.
     * @param id Id de la notificación leída.
     */
    setReadNotification(id: number) {
        let readNotifications: number[] = JSON.parse(localStorage.getItem('readNotifications'));
        if (!readNotifications) {
            readNotifications = [];
        }
        if (!readNotifications.some(n => n === id)) {
            readNotifications.push(id);
            localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
        }
    }

    /**
     * Obtiene la información de las notificaciones leídas desde el LocalStorage.
     */
    getReadNotifications(): number[] {
        return <number[]>JSON.parse(localStorage.getItem('readNotifications'));;
    }

    /**
     * Borra la información de las notificaciones leídas del LocalStorage.
     */
    clearReadNotifications() {
        localStorage.removeItem('readNotifications');
    }
}
