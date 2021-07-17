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
    //Subscribe to database events from main process
    this._electronService.ipcRenderer.on('db-reply', (event, arg) => {
      if (!arg[0].includes("DONT_SAVE")) {
        this._sharedDataService.updateData(arg[0], arg[1]);
      }      
    });

    this._electronService.ipcRenderer.on('curr-weight-recieved', (event, arg) => {
      this._sharedDataService.updateData("currWeight", arg[0]);
    });
  }

  executeDBStmt(entity, query){    
    this._electronService.ipcRenderer.send("executeDBQuery", [entity, query]);
  }

  async executeSyncDBStmt(queryType, query) {
    var result = await this._electronService.ipcRenderer.invoke("executeSyncStmt", [queryType, query]);
    return result;
  }

  async executeInsertAutoId(tablename, primaryColumnName, query) {
    console.log("Making call");
    var result = await this._electronService.ipcRenderer.invoke(
      "executeSyncInsertAutoId", [tablename, primaryColumnName, query]
    );
    console.log("Call returned");
    return result;
  }
}
