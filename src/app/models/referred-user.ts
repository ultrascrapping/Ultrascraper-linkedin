export class ReferredUser {
    constructor(
        public email: string,
        public creationDate: Date,
        public profilesExtracted: number
    ) { }
}