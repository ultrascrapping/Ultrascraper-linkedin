import { Component, OnInit } from '@angular/core';
import { SignalRService } from './services/signal-r.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'ultra';

    constructor(public signalRService: SignalRService) {}

    ngOnInit() {
        this.signalRService.initializeConnection();
    }
}