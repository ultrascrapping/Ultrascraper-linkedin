import { Notification } from './notification'

export class UltraAccount {
    public lastUpdate: number;

    constructor(
        public email: string,
        public token: string,
        public paypalEmail: string = '',
        public btcAddress: string = '',
        public balance: number = 0,
        public completed: number = 0,
        public referralLink: string = '',
        public usdx1000: number = 0,
        public notifications: Notification[] = []        
    ) { }
}