export class ProfileExtractionInfo {
    constructor(
        public inProfile: string,
        public encProfile: string,
        public salesNavProfile: string,
        public pubProfile: string,
        public companyProfile: string,
        public companyIdentifier: string,
        public reference: number,
        public extractFullProfile: boolean,
        public requestType: string) {
    }
}