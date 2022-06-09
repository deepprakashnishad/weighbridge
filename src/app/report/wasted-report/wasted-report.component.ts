import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MyDbService } from '../../my-db.service';
import { QueryList } from '../../query-list';
import { Weighment } from '../../weighment/weighment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReportService } from '../report.service';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-wasted-report',
  templateUrl: './wasted-report.component.html',
  styleUrls: ['./wasted-report.component.css']
})
export class WastedReportComponent implements OnInit {

  data: Array<Weighment> = [];
  
  displayedColumns: string[] = ['sNo', 'rstNo', 'vehicleNo', 'weighmentType', 'status', 'action'];

  dataSource: MatTableDataSource<any>;
  
  maxFieldLength: number = 25;

  
  constructor(
    private dbService: MyDbService,
    private reportService: ReportService,
    private dialog: MatDialog,
    private notifier: NotifierService
  ) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>();
    this.dbService.executeSyncDBStmt("SELECT", QueryList.SELECT_WEIGHMENT_WITHOUT_DETAILS)
      .then(results => {
        this.dataSource.data = results;
      });
  }

  statusUpdated(element, event) {
    console.log(element);
    console.log(event);
  }

  abort(row: any, index: number) {
    var isUpdated = this.dbService.executeSyncDBStmt("UPDATE",
      QueryList.UPDATE_WEIGHMENT_STATUS
        .replace("{status}", "abort")
        .replace("{rstNo}", row['rstNo'])
    );

    if (isUpdated) {
      var data = this.dataSource.data;
      data[index]['status'] = "abort";
      this.dataSource.data = data;
      this.notifier.notify("success", "Status successfully updated");
    } else {
      this.notifier.notify("error", "Failed to update status");
    }
  }

  abortAll() {
    var rstNos = this.dataSource.data.map(ele => ele.rstNo).join(", ");
    var stmt = `UPDATE weighment SET status='abort' WHERE rstNo IN (${rstNos}) `;
    console.log(stmt);
    var result = this.dbService.executeSyncDBStmt("UPDATE", stmt);
    if (result) {
      this.notifier.notify("success", "All records updated aborted successfully");
    }
    this.dbService.executeSyncDBStmt("SELECT", QueryList.SELECT_WEIGHMENT_WITHOUT_DETAILS)
      .then(results => {
        this.dataSource.data = results;
      });
  }
}
