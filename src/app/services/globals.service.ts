import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

/**
 * Guarda variables globales para que estén disponibles en toda la app
 */
export class GlobalsService {
  public _debug : boolean;
  
  constructor() { }
}
