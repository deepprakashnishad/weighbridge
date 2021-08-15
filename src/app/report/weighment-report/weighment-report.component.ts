import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MyDbService } from '../../my-db.service';
import { QueryList } from '../../query-list';
import { Weighment } from '../../weighment/weighment';
import * as XLSX from 'xlsx';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-weighment-report',
  templateUrl: './weighment-report.component.html',
  styleUrls: ['./weighment-report.component.css']
})
export class WeighmentReportComponent implements OnInit {

  data: Array<Weighment> = [];
  reportType: string = "all";
  fromTime: string;
  toTime: string;
  fromRSTNo: string;
  toRSTNo: string;
  truckNumber: string;
  supplier: string;
  material: string;

  status: string;

  /*name of the excel-file which will be downloaded. */
  fileName = 'report.xlsx';

  columns: string[] = ['SNo', 'RSTNo', 'Truck No', 'Supplier','Material', 'Wbridge1', 'Wt1', 'DateTime1', 'Operator1', 'GatePassNo', 'PODetails', 'Wbridge2', 'Wt2', 'Datetime2', 'Operator2', 'NetWt', 'Status'];
  displayedColumns: string[] = ['SNo', 'RSTNo', 'Truck No', 'Supplier','Material', 'Wbridge1', 'Wt1', 'DateTime1', 'Operator1', 'GatePassNo', 'PODetails', 'Wbridge2', 'Wt2', 'Datetime2', 'Operator2', 'NetWt', 'Status'];

  dataSource: MatTableDataSource<any>;
  users: any = {};

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  
  constructor(
    private dbService: MyDbService
  ) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>();
    this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_ALL_USERS)
      .then(results => {
        for (var user of results) {
          this.users[user['id']] = user;
        }
      });
  }

  async fetchData() {
    var isCriteriaAdded = false;
    var stmt = QueryList.GET_WEIGHMENTS_WITH_LATEST_DETAIL + " WHERE ";

    if (this.reportType && this.reportType != 'all') {
      stmt = `${stmt} weighmentType LIKE '${this.reportType}%'`;
      isCriteriaAdded = true;
    } else {
      stmt = `${stmt} weighmentType LIKE '%%'`;
    }

    if (this.fromRSTNo) {
      stmt = `${stmt} AND rstNo >= ${this.fromRSTNo}`;
      isCriteriaAdded = true;
    }

    if (this.toRSTNo) {
      stmt = `${stmt} AND rstNo <= ${this.toRSTNo}`;
      isCriteriaAdded = true;
    }

    if (this.truckNumber) {
      stmt = `${stmt} AND vehicleNo LIKE '%${this.truckNumber}%'`;
      isCriteriaAdded = true;
    }

    if (this.supplier) {
      stmt = `${stmt} AND supplier = '${this.supplier}'`;
      isCriteriaAdded = true;
    }

    if (this.material) {
      stmt = `${stmt} AND material = '${this.material}'`;
      isCriteriaAdded = true;
    }

    if (this.status) {
      stmt = `${stmt} AND status = '${this.status}'`;
      isCriteriaAdded = true;
    }

    if (this.range.value.start && this.range.value.end) {
      var startDate = `${this.range.value.start.getMonth() + 1}/${this.range.value.start.getDate()}/${this.range.value.start.getFullYear()}`;
      if (this.fromTime) {
        startDate = `${startDate} ${this.fromTime}`;
      }
      var endDate = `${this.range.value.end.getMonth() + 1}/${this.range.value.end.getDate()}/${this.range.value.end.getFullYear()}`;
      if (this.toTime) {
        endDate = `${endDate} ${this.toTime}`;
      }
      stmt = `${stmt} AND firstWeightDatetime >= Convert(datetime, '${startDate}', 101) AND secondWeightDatetime <= Convert(datetime, '${endDate}', 101)`;
      isCriteriaAdded = true;
    }

    this.data = await this.dbService.executeSyncDBStmt("SELECT", stmt);
    this.replaceUsersWithId();
    this.dataSource.data = this.data;
  }

  replaceUsersWithId() {
    for (var i in this.data) {
      this.data[i]['firstWeightUser'] = this.users[this.data[i]['firstWeightUser']];
      this.data[i]['secondWeightUser'] = this.users[this.data[i]['secondWeightUser']];
    }
  }

  supplierSelected(event) {
    this.supplier = `${event.code}-${event.mValue}`;
  }

  materialSelected(event) {
    console.log(event);
    this.material = `${event.code}-${event.mValue}`;
  }

  search() {
    this.fetchData();
  }

  export() {
    /* table id is passed over here */
    let element = document.getElementById('reports-table');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }
}
