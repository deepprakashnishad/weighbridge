import { Injectable } from '@angular/core';
import {ElectronService} from 'ngx-electron';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  availablePrinters: Array<any> = [];

constructor(
  private _electronService: ElectronService
) { }

  async getAvailablePrinters(){
    var availablePrinters = await this._electronService.ipcRenderer.invoke('sync-invokable-ipc', "getPrinters");
    console.log(availablePrinters);
    return availablePrinters;
  }
}
