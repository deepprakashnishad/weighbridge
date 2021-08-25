import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MyDbService } from '../../my-db.service';
import { QueryList } from '../../query-list';
import { Weighment } from '../../weighment/weighment';
import * as XLSX from 'xlsx';
import { FormControl, FormGroup } from '@angular/forms';
import { PrinterService } from '../../admin/printer-setup/printer.service';
import { PreviewDialogComponent } from '../preview-dialog/preview-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ReportService } from '../report.service';

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
  searchDateType: string ='firstWeightDatetime';

  status: string;

  columns: string[] = ['sNo', 'rstNo', 'vehicleNo', 'supplier', 'material', 'firstWeighBridge', 'firstWeight', 'firstWeightDatetime', 'firstWeightUser', 'gatePassNo', 'poDetails', 'secondWeighBridge', 'secondWeight', 'secondWeightDatetime', 'secondWeightUser', 'netWeight', 'status', 'action'];
  displayedColumns: string[] = ['sNo', 'rstNo', 'vehicleNo', 'supplier', 'material', 'firstWeighBridge', 'firstWeight', 'firstWeightDatetime', 'firstWeightUser', 'gatePassNo', 'poDetails', 'secondWeighBridge', 'secondWeight', 'secondWeightDatetime', 'secondWeightUser', 'netWeight', 'status', 'action'];

  dataSource: MatTableDataSource<any>;
  users: any = {};

  maxFieldLength: number=40;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  
  constructor(
    private dbService: MyDbService,
    private printerService: PrinterService,
    private reportService: ReportService,
    private dialog: MatDialog
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
      stmt = `${stmt} AND ${this.searchDateType} >= Convert(datetime, '${startDate}', 101)\
              AND ${this.searchDateType} <= Convert(datetime, '${endDate}', 101)`;
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
    var timestamp = new Date().getTime();
    var filename = `weighment_report_${timestamp}.xlsx`;
    XLSX.writeFile(wb, filename);``
  }

  getTotalWeight(weightType) {
    var totalWeight = 0;
    this.data.forEach(ele => {
      totalWeight = totalWeight + ele[weightType];
    })
    return totalWeight;
  }

  async previewTicket(element) {
    var weighment = (await this.dbService.executeSyncDBStmt(
      "SELECT",
      QueryList.GET_WEIGHMENTS + `WHERE rstNo=${element.rstNo}`
    ))[0];

    var weighmentDetails = await this.dbService.executeSyncDBStmt(
      "SELECT",
      QueryList.GET_WEIGHMENT_DETAILS.replace("{rstNo}", weighment.rstNo)
    );
    weighment['weighmentDetails'] = weighmentDetails;

    var data = await this.printerService.getPreviewDataWithTemplate(
      weighment,
      weighmentDetails[weighmentDetails.length-1]
    );

    this.dialog.open(PreviewDialogComponent, {
      data: {
        'htmlContent': data['content'],
        fontSize: 12,
        fields: data['ticketFields'],
        ticketTemplate: data['template'],
        'weighment': weighment,
        'weighmentDetail': weighmentDetails[weighmentDetails.length - 1]
      }
    });
  }

  printReport() {
    var content = this.reportService.getHtmlReportText(this.dataSource.data, this.displayedColumns, this.maxFieldLength);
    var rawText = this.reportService.getRawReportText(this.dataSource.data, this.displayedColumns, this.maxFieldLength);
    console.log(rawText);
    this.dialog.open(PreviewDialogComponent, {
      data: {
        htmlContent: content,
        rawText: rawText,
        fontSize: 12,
      }
    });
  }
}
