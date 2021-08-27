import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { SharedDataService } from './shared-data.service';

@Injectable({
  providedIn: 'root'
})
export class MyIpcService {

  constructor(
    private _electronService: ElectronService,
    private _sharedDataService: SharedDataService
  ) {
    //Subscribe to database events from main process
    this._electronService.ipcRenderer.on('verification-weight-recieved', (event, arg) => {
      console.log(arg[0]);
      this._sharedDataService.updateData("verification_weight", arg[0]);
    });

    this._electronService.ipcRenderer.on('curr-weight-recieved', (event, arg) => {
      this._sharedDataService.updateData("currWeight", arg[0]);
    });
  }

  async invokeIPC(channelName, ...args) {
    var reply = await this._electronService.ipcRenderer.invoke(channelName, ...args);
    return reply;
  }
}
