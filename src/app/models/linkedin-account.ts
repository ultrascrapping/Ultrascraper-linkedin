import { UserAgent } from './user-agent';

export class LinkedInAccount {
    constructor(
        public id: number,
        public maxDailyProfiles: number = 200,
        public todayProfiles: number = 0,
        public distanceErrors: number = 0,
        public unavailableProfiles: number = 0,
        public otherErrors: number = 0,
        public fullName: string = '',
        public inLinkedInId: string = '',
        public encLinkedInId: string = '',
        public tabId: string = '',
        public okProfiles = 0,
        public userAgent: UserAgent = null,
        public isLogged: boolean = false,
        public timestamp: number = 0,
        public minRequestInterval: number = 18000,
        public maxRequestInterval: number = 26000,
    ) { }
}