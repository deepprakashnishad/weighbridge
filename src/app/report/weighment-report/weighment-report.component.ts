import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MyDbService } from '../../my-db.service';
import { QueryList } from '../../query-list';
import { Weighment } from '../../weighment/weighment';
import * as XLSX from 'xlsx';

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

  columns: string[] = ['SNo', 'RSTNo', 'Truck No', 'Supplier','Material', 'Wbridge1', 'Wt1', 'DateTime1', 'Operator1', 'GatePassNo', 'PODetails', 'Wbridge2', 'Wt2', 'Datetime2', 'Operator2', 'NetWt', 'Duration'];
  displayedColumns: string[] = ['SNo', 'RSTNo', 'Truck No', 'Supplier','Material', 'Wbridge1', 'Wt1', 'DateTime1', 'Operator1', 'GatePassNo', 'PODetails', 'Wbridge2', 'Wt2', 'Datetime2', 'Operator2', 'NetWt', 'Duration'];

  dataSource: MatTableDataSource<any>;
  
  constructor(
    private dbService: MyDbService
  ) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>();
  }

  async fetchData() {
    var isCriteriaAdded = false;
    var stmt = QueryList.GET_WEIGHMENTS + " WHERE ";

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
    console.log(stmt);
    this.data = await this.dbService.executeSyncDBStmt("SELECT", stmt);
    console.log(this.data);
    this.dataSource.data = this.data;
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
