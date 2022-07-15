import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { ElectronService } from 'ngx-electron';
import { QueryList } from './query-list';
import { SharedDataService } from './shared-data.service';

@Injectable({
  providedIn: 'root'
})
export class MyDbService {

  constructor(
    private _electronService: ElectronService,
    private _sharedDataService: SharedDataService,
    private _notifier: NotifierService
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

  async executeSyncDBStmt(queryType, query, loglevel = "") {
    if (loglevel !== "") {
      var result = await this._electronService.ipcRenderer.invoke("executeSyncStmt", [queryType, query, loglevel]);
    } else {
      var result = await this._electronService.ipcRenderer.invoke("executeSyncStmt", [queryType, query]);
    }
    
    return result;
  }

  async updateAppSetting(fieldArr: Array<any>) {
    var successCnt = 0;
    var failedFields = [];
    for (var i = 0; i < fieldArr.length; i++) {
      var ele = fieldArr[i];
      var result = await this.executeSyncDBStmt("UPDATE",
        QueryList.UPDATE_APP_SETTING
          .replace("{mValue}", ele['mValue'])
          .replace("{field}", ele['field'])
      );

      if (result) {
        sessionStorage.setItem(ele['field'], ele['mValue']);
        successCnt++;
      } else {
        failedFields.push(ele['field']);
      }
    }
    if (successCnt === fieldArr.length) {
      this._notifier.notify("success", "App settings updated successfully");
    } else {
      if (failedFields.length >0) {
        this._notifier.notify("error", `App setting could not be updated for ${failedFields.join(", ")} fields`);
      } else {
        this._notifier.notify("error", "App settings could not be updated");
      }
    }
  }

  escapeString(str) {
    if (str === undefined || str === null) {
      return "";
    }
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
      switch (char) {
        case "\0":
          return "\\0";
        case "\x08":
          return "\\b";
        case "\x09":
          return "\\t";
        case "\x1a":
          return "\\z";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "'":
          return "'" + char; // prepends a backslash to backslash, percent,
        // and double/single quotes
        default:
          return char;
      }
    });
  }

  async executeInsertAutoId(tablename, primaryColumnName, query) {
    var result = await this._electronService.ipcRenderer.invoke(
      "executeSyncInsertAutoId", [tablename, primaryColumnName, query]
    );
    return result;
  }
}
