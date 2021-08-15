import { Component, OnInit } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { QueryList } from '../../query-list';

@Component({
  selector: 'app-db-backup',
  templateUrl: './db-backup.component.html',
  styleUrls: ['./db-backup.component.css']
})
export class DbBackupComponent implements OnInit {

  cboxEnableDBBackup: boolean;
  backupPath: string = "C:/Users/Admin/weighbridge-backup";
  lastBackupTime: string;
  filename: string;

  constructor(
    private dbService: MyDbService,
    private ipcService: MyIpcService,
    private notifier: NotifierService
  ) { }

  ngOnInit() {
    this.filename = `${(new Date()).getTime()}.BAK`;

    this.ipcService.invokeIPC("loadEnvironmentVars").then(result => {
      console.log(result);
      if (result["dbBackup"]) {
        this.backupPath = result["dbBackup"]["path"];
        this.cboxEnableDBBackup = result['dbBackup']["enable_auto_backup"];
      }
    });
  }

  backup() {
    this.dbService.executeSyncDBStmt(
      "SELECT",
      QueryList.BACKUP.replace("{path}", `${this.backupPath}/${this.filename}`)
    ).then(result => {
      console.log(result);
    });
  }

  save() {
    this.ipcService.invokeIPC("saveSingleEnvVar",
      ["dbBackup", { "path": this.backupPath, "enable_auto_backup": this.cboxEnableDBBackup }]
    )
    .then(result => {
      if (result) {
        this.notifier.notify("success", "Backup path saved successfully");
      } else {
        this.notifier.notify("error", "Failed to save backup path");
      }
    });
  }
}
