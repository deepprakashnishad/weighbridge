import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { QueryList } from '../../query-list';
import { Weighment } from '../../weighment/weighment';
import * as XLSX from 'xlsx';
import { FormControl, FormGroup } from '@angular/forms';
import { PrinterService } from '../../admin/printer-setup/printer.service';
import { PreviewDialogComponent } from '../preview-dialog/preview-dialog.component';
import { PreviewDialogComponent as TicketPreviewComponent } from '../../admin/ticket-setup/preview-dialog/preview-dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReportService } from '../report.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { NotifierService } from 'angular-notifier';
import { StatusDialogComponent } from '../weighment-report/weighment-report.component';
import { Utils } from '../../utils';

@Component({
  selector: 'app-complete-weighment-report',
  templateUrl: './complete-weighment-report.component.html',
  styleUrls: ['./complete-weighment-report.component.css']
})
export class CompleteWeighmentReportComponent implements OnInit {

  data: Array<Weighment> = [];
  reportType: string = "all";
  fromTime: string;
  toTime: string;
  fromRSTNo: string;
  toRSTNo: string;
  truckNumber: string;
  supplier: string;
  material: string;
  searchDateType: string = 'secondWeightDatetime';
  reqId: string;
  scrollNo: string;
  transporter: string;
  transporterCode: string;
  syncStatus: number=-1;
  //customer: string;

  status: string;

  columns: string[] = ['sNo', 'rstNo', 'vehicleNo', 'weighmentType', 'supplier', 'material', 'transporterCode', 'transporterName', 'firstWeighBridge', 'firstWeight', 'firstWeightDatetime', 'firstWeightUser', 'gatePassNo', 'poDetails', 'secondWeighBridge', 'secondWeight', 'secondWeightDatetime', 'secondWeightUser', 'netWeight', 'scrollDate', 'reqIdDate', 'syncFlag', 'status', 'action'];
  displayedColumns: string[] = ['sNo', 'rstNo', 'vehicleNo', 'weighmentType', 'supplier', 'material', 'transporterName', 'firstWeighBridge', 'firstWeight', 'firstWeightDatetime', 'firstWeightUser', 'gatePassNo', 'poDetails', 'secondWeighBridge', 'secondWeight', 'secondWeightDatetime', 'secondWeightUser', 'netWeight', 'status', 'action'];

  dataSource: MatTableDataSource<any>;
  users: any = {};

  maxFieldLength: number = 25;

  printingType: string = "DOT-MATRIX";

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  @ViewChild("cntlMaterial", { static: false }) cntlMaterial;
  @ViewChild("cntlSupplier", { static: false }) cntlSupplier;

  searchFields: any = JSON.parse(sessionStorage.getItem("search_fields"));

  constructor(
    private dbService: MyDbService,
    private printerService: PrinterService,
    private reportService: ReportService,
    private ipcService: MyIpcService,
    private dialog: MatDialog,
    private clipboard: Clipboard,
    private notifier: NotifierService
  ) { }

  reset() {
    this.reportType = "all";
    this.fromTime = undefined;
    this.toTime = undefined;
    this.fromRSTNo = undefined;
    this.toRSTNo = undefined;
    this.truckNumber = undefined;
    this.supplier = undefined;
    this.material = undefined;
    this.status = undefined;
    this.scrollNo = undefined;
    this.reqId = undefined;
    this.range.get("start").setValue("");
    this.range.get("end").setValue("");
    this.cntlMaterial.clear();
    this.cntlSupplier.clear();
  }

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
    var isCriteriaAdded = true;
    var stmt = QueryList.GET_COMPLETED_RECORDS
      .replace(/{date_format_code}/gi,
        sessionStorage.getItem("date_format") != null ? sessionStorage.getItem("date_format") : "113");

    if (this.reportType && this.reportType != 'all') {
      stmt = `${stmt} AND weighmentType = '${this.reportType}'`;
      isCriteriaAdded = true;
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
      stmt = `${stmt} AND vehicleNo = '${this.truckNumber}'`;
      isCriteriaAdded = true;
    }

    if (this.supplier) {
      stmt = `${stmt} AND supplier = '${this.supplier}'`;
      isCriteriaAdded = true;
    }

    if (this.transporterCode) {
      stmt = `${stmt} AND transporterCode = '${this.transporterCode}'`;
      isCriteriaAdded = true;
    }

    //if (this.customer) {
    //  stmt = `${stmt} AND customer = '${this.customer}'`;
    //  isCriteriaAdded = true;
    //}

    if (this.material) {
      stmt = `${stmt} AND material = '${this.material}'`;
      isCriteriaAdded = true;
    }

    if (this.reqId) {
      stmt = `${stmt} AND reqId = '${this.reqId}'`;
      isCriteriaAdded = true;
    }

    if (this.scrollNo) {
      stmt = `${stmt} AND scrollNo = '${this.scrollNo}'`;
      isCriteriaAdded = true;
    }

    if (this.syncStatus!==-1) {
      stmt = `${stmt} AND syncFlag = ${this.syncStatus}`;
      isCriteriaAdded = true;
    }

    if (this.range.value.start && this.range.value.end) {
      var startDate = `${this.range.value.start.getMonth() + 1}/${this.range.value.start.getDate()}/${this.range.value.start.getFullYear()}`;
      if (this.fromTime) {
        startDate = `${startDate} ${this.fromTime}`;
      } else {
        startDate = `${startDate} 12:00:00 AM`;
      }
      var endDate = `${this.range.value.end.getMonth() + 1}/${this.range.value.end.getDate()}/${this.range.value.end.getFullYear()}`;
      if (this.toTime) {
        endDate = `${endDate} ${this.toTime}`;
      } else {
        endDate = `${endDate} 11:59:59 PM`;
      }
      stmt = `${stmt} AND ${this.searchDateType} >= Convert(datetime, '${startDate}', 101)\
              AND ${this.searchDateType} <= Convert(datetime, '${endDate}', 101)`;
      isCriteriaAdded = true;
    }

    stmt = `${stmt}  GROUP BY weighmentRstNo) ORDER BY wd.weighmentRstNo ASC, wd.secondWeightDatetime ASC`;
    console.log(stmt);
    this.data = await this.dbService.executeSyncDBStmt("SELECT", stmt);
    this.data = this.replaceUsersWithId(this.data);
    this.dataSource.data = this.data;
  }

  replaceUsersWithId(weighmentDetails) {
    for (var i in weighmentDetails) {
      weighmentDetails[i]['firstWeightUser'] = this.users[weighmentDetails[i]['firstWeightUser']];
      weighmentDetails[i]['secondWeightUser'] = this.users[weighmentDetails[i]['secondWeightUser']];
    }
    return weighmentDetails;
  }

  transporterSelected(event) {
    this.transporterCode = event.code;
    this.transporter = `${event.code}-${event.mValue}`;
  }

  customerSelected(event) {
    //this.customer = `${event.code}-${event.mValue}`;
  }

  supplierSelected(event) {
    if (event) {
      this.supplier = `${event.code}-${event.mValue}`;
    } else {
      this.supplier = undefined;
    }
  }

  materialSelected(event) {
    if (event) {
      this.material = `${event.code}-${event.mValue}`;
    } else {
      this.material = undefined;
    }
  }

  isSeachFieldEnabled(searchFieldName) {
    if (this.searchFields != null && this.searchFields !== undefined) {
      return Object.keys(this.searchFields).indexOf(searchFieldName) > -1;
    } else {
      return true;
    }
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
    XLSX.writeFile(wb, filename); ``
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
        .replace(/{date_format_code}/gi, sessionStorage.getItem("date_format") != null ? sessionStorage.getItem("date_format") : "113")
    );
    weighmentDetails = this.replaceUsersWithId(weighmentDetails);
    weighment['weighmentDetails'] = weighmentDetails;

    var data = await this.printerService.getPreviewDataWithTemplate(
      weighment,
      weighmentDetails[weighmentDetails.length - 1]
    );

    //var rawText = await this.printerService.rawTextPrint(weighment,
    //  weighmentDetails[weighmentDetails.length - 1]);
    //console.log(rawText);
    this.dialog.open(TicketPreviewComponent, {
      data: {
        title: "Ticket Preview",
        'htmlContent': data['content'],
        fontSize: 12,
        printingType: this.printingType,
        'weighment': weighment,
        'weighmentDetail': weighmentDetails[weighmentDetails.length - 1],
        'isDuplicate': true
      }
    });
  }

  printReport() {
    var content = this.reportService.getHtmlReportText(this.dataSource.data, this.displayedColumns, this.maxFieldLength);
    var rawTextArray = this.reportService.getRawTextForFilePrinting(this.dataSource.data, this.displayedColumns, this.maxFieldLength);
    console.log(rawTextArray);
    this.dialog.open(PreviewDialogComponent, {
      data: {
        title: "Weighment Report",
        htmlContent: content,
        "rawTextArray": rawTextArray,
        fontSize: 12,
        printingType: this.printingType
      }
    });
  }

  copyToClipboard(textToCopy, msg) {
    this.clipboard.copy(textToCopy);
    this.notifier.notify("success", msg);
  }

  statusUpdated(element, event) {
    console.log(element);
    console.log(event);
  }

  editStatus(row: any, index: number) {
    const dialogRef = this.dialog.open(StatusDialogComponent, {
      data: { rstNo: row.rstNo }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        var isUpdated = this.dbService.executeSyncDBStmt("UPDATE",
          QueryList.UPDATE_WEIGHMENT_STATUS
            .replace("{status}", result)
            .replace("{rstNo}", row['rstNo'])
        );

        if (isUpdated) {
          var data = this.dataSource.data;
          data[index]['status'] = result;
          this.dataSource.data = data;
          this.notifier.notify("success", "Status successfully updated");
        } else {
          this.notifier.notify("error", "Failed to update status");
        }
      }
    });
  }

  async syncSAPSingleRecord(rstNo){
    var sql = `SELECT w.*, wd.*, u1.username firstWeightUsername, u2.username secondWeightUserName, \
              convert(varchar, createdAt, 112) createdAtDate, convert(varchar, createdAt, 8) createdAtTime, \
              convert(varchar, firstWeightDatetime, 112) firstWeightDate, convert(varchar, firstWeightDatetime, 8) firstWeightTime, \
              convert(varchar, secondWeightDatetime, 112) secondWeightDate, convert(varchar, secondWeightDatetime, 8) secondWeightTime \
              FROM weighment w, weighment_details wd, app_user u1, app_user u2 \
              WHERE w.rstNo = wd.weighmentRstNo AND w.status = 'complete' AND w.syncFlag = 0 \
              AND u1.id = wd.firstWeightUser AND u2.id = wd.secondWeightUser AND w.rstNo=${rstNo} \
              ORDER BY w.rstNo, wd.id`;
    var dataRows = await this.dbService.executeSyncDBStmt("GET", sql);
    dataRows = this.reportService.processResultWithFinalWeight(dataRows);
    //this.ipcService.invokeIPC("sendDataToSAP", [dataRows]);
    this.ipcService.sendDataToSAP(dataRows);
  }

  async syncAllRecords(){
    var rstNos = this.data.map(ele => ele.rstNo);
    var rstNos = [...new Set(rstNos)];
    var rstNosStr = rstNos.join(",");
    var sql = `SELECT w.*, wd.*, u1.username firstWeightUsername, u2.username secondWeightUserName, \
              convert(varchar, createdAt, 112) createdAtDate, convert(varchar, createdAt, 8) createdAtTime, \
              convert(varchar, firstWeightDatetime, 112) firstWeightDate, convert(varchar, firstWeightDatetime, 8) firstWeightTime, \
              convert(varchar, secondWeightDatetime, 112) secondWeightDate, convert(varchar, secondWeightDatetime, 8) secondWeightTime \
              FROM weighment w, weighment_details wd, app_user u1, app_user u2 \
              WHERE w.rstNo = wd.weighmentRstNo AND w.status = 'complete' AND w.syncFlag = 0 \
              AND u1.id = wd.firstWeightUser AND u2.id = wd.secondWeightUser AND w.rstNo IN (${rstNosStr})\
              ORDER BY w.rstNo, wd.id`;
    console.log(sql)
    var dataRows = await this.dbService.executeSyncDBStmt("GET", sql);
    dataRows = this.reportService.processResultWithFinalWeight(dataRows);

    this.ipcService.sendDataToSAP(dataRows);
  }
}
