import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from './user.service'
import { UltraAccount } from '../models/ultra-account'
import { AppData } from '../models/app-data';
import { SuiModalService } from 'ng2-semantic-ui';
import { VersionErrorModal } from '../components/sidebar/version-error-modal/version-error-modal.component';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private static currentlyInVersionError: boolean = false;
    private readonly url: string = 'http://54.39.106.116:61765/api';
    private readonly defaultHeaders: any = {
        'Content-Type': 'application/json',
        'Ultra-Version': '1.9.17'
    };

    public readonly apiPaths: any = {
        login: "/user/login",
        signup: "/user/signup",
        request: "/request/get"
    };

    /**
     * Constructor del servicio de API.
     * @param httpClient Cliente HTTP.
     * @param userService Servicio de usuario.
     * @param modalService Servicio de modals.
     */
    constructor(
        private httpClient: HttpClient,
        private userService: UserService,
        public modalService: SuiModalService
    ) { }

    /**
     * Envía una petición a la API.
     * @param path Path a donde se enviará la petición.
     * @param param Body de la petición.
     * @param setHeader Indica si se debe setear el token del usuario logeado.
     */
    call<T>(path: string, param: any, setHeader: boolean = true): Observable<T> {
        // Si ya se sabe que la app no tiene la versión correcta se lanza error.
        if (ApiService.currentlyInVersionError) {
            return throwError('VERSION-ERROR');
        }

        let headers: any = this.defaultHeaders;
        if (setHeader) {
            let user: UltraAccount = this.userService.getCurrentUser();
            if (user && user.token) {
                headers['Authorization'] = 'Bearer ' + user.token;
            } else {
                throwError('No user logged in');
            }
        }

        return this.httpClient.post<T>(this.url + path, param, { headers: new HttpHeaders(headers) })
            .pipe(
                catchError((error) => {
                    // Si el error es por versión, se guarda el error y se muestra el modal de error de versión.
                    if (error.hasOwnProperty('status') && error.status === 403) {
                        ApiService.currentlyInVersionError = true;
                        this.modalService.open(new VersionErrorModal());

                        return throwError('VERSION-ERROR');
                    }

                    return throwError(error);
                }));
    }
}
