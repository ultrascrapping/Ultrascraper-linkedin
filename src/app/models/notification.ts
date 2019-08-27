export class Notification {
    constructor(
        public id: number,
        public message: string,
        public startDate: Date,
        public read: boolean = false
    ) { }
}