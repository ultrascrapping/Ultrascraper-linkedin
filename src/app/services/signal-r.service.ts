import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { GlobalsService } from './globals.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  constructor(private globalsService: GlobalsService) { }

  public hubConnection: signalR.HubConnection;

  public initializeConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://54.39.106.116:61765/ushub')
      .build();
    this.startConnection();
  }

  public startConnection = () => {
    this.hubConnection
      .start()
      .then(() => {
          if(this.globalsService._debug) { 
            console.log('Connection started');
          }
        })
      .catch(err => {
        if(this.globalsService._debug) { 
          console.log('Error while starting connection: ' + err); 
        }
        setTimeout(this.startConnection, 5000);
      });

    this.hubConnection
      .onclose(() => {
        if(this.globalsService._debug) { 
          console.log('Connection closed'); 
        }
        setTimeout(this.startConnection, 5000);
      });
  }
}
