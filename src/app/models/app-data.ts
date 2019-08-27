import { XPath } from './xpath';
import { UserAgent } from './user-agent';

export class AppData {
    constructor(
        public lastLoad: Date,
        public xpaths: XPath[],
        public companyXpaths: XPath[],
        public minDistanceForExtraction: number = 3,
        public userAgents: UserAgent[],
        public minWait: number = 76000,
        public maxWait: number = 84000,
        public thersholdToReset = 86400000
    ) { }

    public urlsToStopExtraction = [
        ".*linkedin\.com\/.*logout.*",
        ".*linkedin\.com\/.*authwall.*",
        ".*linkedin\.com\/m\/login.*"
    ];
}