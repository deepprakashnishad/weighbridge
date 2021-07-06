import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-db-backup',
  templateUrl: './db-backup.component.html',
  styleUrls: ['./db-backup.component.css']
})
export class DbBackupComponent implements OnInit {

  cboxEnableDBBackup: boolean;
  backupPath: string;
  lastBackupTime: string;

  constructor() { }

  ngOnInit() {
  }

  save(){}
}
