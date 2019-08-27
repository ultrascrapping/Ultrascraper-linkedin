import * as request from "request-promise-native";
import * as config  from '../config.json';
import { BrowserWindowProxy } from "electron";



export interface WebAPIOptions {
    domain: string,
    port: number,
    username: string,
    password: string
}

export class WebAPI {
    private base: String;
    private options: WebAPIOptions;

    constructor() {
        // compute base url
        this.options = config.webAPI;
        this.base = `http://${this.options.domain}:${this.options.port}`; 
    }

    public async pushNotifications() {
        var opts = {
            uri:`${this.base}/api/hub/push`,
            header: {"content-type": "application/json"},
            auth:{
                user:this.options.username, 
                password: this.options.password
                },
            body: {
                action: "getNotifications",
                message:"x"
                },
            json: true
        };
        let result = await request.post(opts);
        return result

    }

}
