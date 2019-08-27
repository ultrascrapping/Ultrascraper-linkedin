import { AsyncSubject } from 'rxjs';

export class IPCCallback {
    constructor(public key: string, public subject: AsyncSubject<any>) {
    }
}
