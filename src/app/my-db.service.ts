import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { SharedDataService } from './shared-data.service';

@Injectable({
  providedIn: 'root'
})
export class MyDbService {

  constructor(
    private _electronService: ElectronService,
    private _sharedDataService: SharedDataService
  ) { 
    this._electronService.ipcRenderer.on('db-reply', (event, arg) => {
      if(arg[0] === "weighbridges"){
        this._sharedDataService.updateData("weighbridges", arg[1]);
      }
    })
  }

  fetchData(entity, query){    
    this._electronService.ipcRenderer.send("executeDBQuery", [entity, query]);
  }
}
