export class LinkedInNetworkInfoSchema {
    constructor(
        public distanceValue: number, 
        public followersCount: number,
        public following: boolean,
        public connectionsCount: number,
        public encryptedLinkedInId: string,
        public status: number
        ) {
    }
}