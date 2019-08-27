import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    constructor() { }

    /**
      * Retorna un nuevo GUID.
      */
    newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Intenta parsear el string dado como un Date, devuelve null de no ser posible.
     * @param dateStr El string a parsear.
     */
    tryParseDate(dateStr: string) {
        let timestamp = Date.parse(dateStr);
        if (isNaN(timestamp) == false) {
            return new Date(dateStr);
        }
        return null;
    }

    /**
       * Promesa que espera hasta que pase la cantidad de milisegundos dados.
       * @param {number} ms - Milisegundos que espera la función.
       * @returns Promise<any>
       */
    async sleep(ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
       * Get the clean linkedInId from a url or string.
       * @param {string} url - The url to get the linkedIn Id.
       */
    cleanLinkedInIdFromUrl(url: string): string {
        try {
            // checks with regular expression and return the first ocurrence
            let arrayMatched = url.match("/(?:in|pub)\/([^\/?]+)");
            if (arrayMatched.length > 1) {
                return arrayMatched[1];
            }
            return "";
        } catch (e) {
            throw new Error("Error on getting the likedInId from the url.");
        }
    }

    /**
       * Check if its an encrypted profile. Every encrypted profile starts with ACoAA
       * @param {string} profile - The string with profile
       */
    IsEncryptedProfile(profile: string): boolean {
        try {
            // checks with regular expression and return if has match
            var regexp = /^ACoAA/;
            var arrayMatched = profile.match(regexp);
            if (arrayMatched && arrayMatched.length > 0) {
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }


    /**
       * Check if its an SalesNav profile. Every encrypted SalesNav profile starts with ACwAA
       * @param {string} profile - The string with profile
       */
    IsSalesNavProfile(profile: string): boolean {
        try {
            if (this.IsEncryptedProfile(profile))
                return false;

            if (profile.indexOf('A') == 0)
                return true;

            return false;
        } catch (e) {
            return false;
        }
    }

    /**
       * Gets a number with the conection level form the distance.value object of linkedInNetwork info.
       * @param {string} conectionLevel - The string with the conection level.
       */
    conectionLevelFromLinkedInNetwork(conectionLevel: string): number {
        try {
            if (conectionLevel === "SELF")
                return 1;
            if (conectionLevel === "OUT_OF_NETWORK")
                return 7;
            // check if has the string _ because the value is DISTANCE_ 
            let indexOfUnderscore = conectionLevel.indexOf("_");
            if (indexOfUnderscore > -1) {
                return Number(conectionLevel.substring(indexOfUnderscore + 1));
            } else {
                return 7;
            }
        } catch (e) {
            return 7;
        }
    }
}
