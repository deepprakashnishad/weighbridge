import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { isString } from 'util';
import { AuthenticationService } from '../authentication/authentication.service';
import { MyDbService } from '../my-db.service';
import { MyIpcService } from '../my-ipc.service';
import { QueryList } from '../query-list';
import { SharedDataService } from '../shared-data.service';
import { TagSelectorComponent } from '../shared/tag-selector/tag-selector.component';
import { Utils } from '../utils';
import { Weighment, WeighmentDetail } from './weighment';
import { WeighmentSummaryComponent } from './weighment-summary/weighment-summary.component';

@Component({
  selector: 'app-weighment',
  templateUrl: './weighment.component.html',
  styleUrls: ['./weighment.component.scss']
})
export class WeighmentComponent implements OnInit, AfterViewInit {

  weighment: Weighment = new Weighment();
  weighmentDetail: WeighmentDetail = new WeighmentDetail();
  weighmentDetails: Array<WeighmentDetail> = [];

  @ViewChild('vehicleCntl') vehicleCntl: ElementRef;

  @ViewChild('transporterCntl') transporterCntl: TagSelectorComponent;

  currDate = new Date();
  gatePassNo: string;
  poDetails: string;
  supplier: string;
  material: string;
  firstWeight: number;
  secondWeight: number;
  netWeight: number;
  remark: string;

  currentWeight: any = 10000;
  currData: any;
  isWeightStable: boolean = true;
  prevWeight: number;
  cnt: number = 0;

  weighbridge: string = "";

  isComplete: boolean = false;

  transporter: string;

  selectedIndicator: any = { "stringType": "continuous" };
  
  constructor(
    private sharedDataService: SharedDataService,
    private authService: AuthenticationService,
    private notifier: NotifierService,
    private dbService: MyDbService,
    private ipcService: MyIpcService,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params['rstNo']) {
        this.getWeighment({ "rstNo": params['rstNo'] });
      }
    });

    if (this.selectedIndicator?.stringType === "continous") {
      setInterval(this.updateCurrentWeight.bind(this), 1000);
    }

    this.sharedDataService.currentData.subscribe((data) => {
      this.currData = data['currWeight'];
      if (this.selectedIndicator?.stringType === "polling") {
        this.updateCurrentWeight();
      }

      if (data["selectedWeighBridge"]) {
        this.selectedIndicator = data["selectedWeighBridge"];
      }
    });

    this.ipcService.invokeIPC("get-env-data").then(result => {
      this.weighbridge = result['weighbridge'];
    });
  }

  updateCurrentWeight() {
    if (!this.currData) {
      this.isWeightStable = false;
      this.currentWeight = "Err!";
      this.capture();
      return;
    }
    var currWeight = this.currData;
    if (this.selectedIndicator?.stringType === "polling") {
      this.currentWeight = currWeight['weight'];
      this.isWeightStable = true;
      this.capture();
    } else {
      if (currWeight['timestamp'] > (new Date().getTime()) - 1000) {
        this.currentWeight = currWeight['weight'];
        if (this.prevWeight === currWeight['weight']) {
          this.cnt++;
          if (this.cnt > 1) {
            this.isWeightStable = true;
          }
        } else {
          this.cnt = 0;
          this.prevWeight = this.currentWeight;
          this.isWeightStable = false;
        }
      } else {
        this.isWeightStable = false;
        this.currentWeight = "Err!";
        this.capture();
      }
    }
  }

  ngAfterViewInit() {
    this.vehicleCntl.nativeElement.focus();
  }

  parseQRString(inputStr) {
    if (isString(inputStr)) {
      var inputs = inputStr?.split(":");
    }
    
    if (inputs?.length === 5) {
      this.weighment.reqId = parseInt(inputs[0]);
      this.weighment.gatePassNo = parseInt(inputs[1]);
      this.weighment.vehicleNo = inputs[2];
      this.weighment.transporterCode = parseInt(inputs[3]); 
      this.weighment.transporterName = inputs[4];
      this.transporter = `${this.weighment.transporterCode}-${this.weighment.transporterName}`;
    }

    if (this.weighment.rstNo) {
      this.getWeighment({ rstNo: this.weighment.rstNo, status: "pending" });
    } else if (this.weighment.vehicleNo) {
      this.weighment.vehicleNo = Utils.removeWhiteSpaces(this.weighment.vehicleNo);
      console.log(this.weighment.vehicleNo);
      this.getWeighment({ vehicleNo: this.weighment.vehicleNo, status: "pending" });
    }
  }

  truckSelected(event){
    this.weighment.vehicleNo = event;
  }

  transporterSelected(event) {
    this.weighment.transporterCode = event.code;
    this.weighment.transporterName = event.mValue;
  }

  supplierSelected(event){
    this.weighmentDetail.supplier = `${event.code}-${event.mValue}`;
  }

  materialSelected(event) {
    console.log(event);
    this.weighmentDetail.material = `${event.code}-${event.mValue}`;
  }

  save() {
    if (!this.isValid()) {
      return;
    }
    var status = "pending";
    if (this.isComplete && this.weighmentDetail.secondWeight && this.weighmentDetail.firstWeight) {
      status = "complete";
    }
    //Initial weighment
    if (this.weighment.rstNo ===undefined) {
      this.createWeighment(status);
    }
    //First weight has been done and second has to be done
    else if (this.weighment.rstNo && this.weighmentDetail.firstWeight) {
      this.updateSecondWeighment();
      if (status === "complete") {
        //Update weighment transaction as complete
        this.updateWeighment(status);
      } else {
        //Create new Weighment detail record for first weight with data of second weighment
        // of prev record
        this.insertFirstWeighmentForPartial(
          this.weighbridge,
          this.weighmentDetail.secondWeight,
          this.weighmentDetail.secondUnit,
          this.authService.getTokenOrOtherStoredData("id")
        );
      }
    }

    this.sharedDataService.updateData("WEIGHMENT_COMPLETED", true);
    this.notifier.notify("success", "Weighment saved successfully");
    this.displayWeighmentSummary();
  }

  async insertFirstWeighmentForPartial(weighBridge, firstWeight, firstUnit, user) {
    var stmt = QueryList.INSERT_FIRST_WEIGHMENT_DETAIL
      .replace("{weighmentRstNo}", this.weighment.rstNo.toString())
      .replace("{supplier}", this.weighmentDetail.supplier)
      .replace("{material}", null)
      .replace("{firstWeighBridge}", weighBridge)
      .replace("{firstWeight}", firstWeight.toString())
      .replace("{firstUnit}", this.weighmentDetail.firstUnit)
      .replace("{firstWeightUser}", user)
      .replace("{remark}", this.weighmentDetail.remark != null ? this.weighmentDetail.remark: "");

    var result = await this.dbService.executeInsertAutoId("weighment_details", "id", stmt);
    if (result['newId']) {
      this.getWeighmentDetails(this.weighment.rstNo).then(result => {
        this.weighment.weighmentDetails = result;
        this.weighmentDetail = this.weighment.weighmentDetails[this.weighment.weighmentDetails.length - 1];
      });
    } else {
      this.notifier.notify("error", "Failed to create weighment");
    }
  }

  async updateWeighment(status) {
    var stmt = QueryList.UPDATE_WEIGHMENT
      .replace("{scrollNo}", this.weighment.scrollNo ? this.weighment.scrollNo : "")
      .replace("{reqId}", this.weighment.reqId ? this.weighment.reqId.toString() : null)
      .replace("{gatePassNo}", this.weighment.gatePassNo ? this.weighment.gatePassNo.toString() : null)
      .replace("{weighmentType}", this.weighment.weighmentType)
      .replace("{transporterCode}", this.weighment.transporterCode ? this.weighment.transporterCode.toString(): null)
      .replace("{transporterName}", this.weighment.transporterName)
      .replace("{status}", status)
      .replace("{rstNo}", this.weighment.rstNo.toString());

    var result = await this.dbService.executeSyncDBStmt("UPDATE", stmt);
    if (result > 0) {
      this.notifier.notify("success", "Weighment updated successfully");
    }
  }

  async createWeighment(status) {
    var stmt = QueryList.INSERT_WEIGHMENT
      .replace("{vehicleNo}", this.weighment.vehicleNo)
      .replace("{scrollNo}", this.weighment.scrollNo ? this.weighment.scrollNo : "")
      .replace("{reqId}", this.weighment.reqId ? this.weighment.reqId.toString():null)
      .replace("{gatePassNo}", this.weighment?.gatePassNo ? this.weighment.gatePassNo.toString() : null)
      .replace("{weighmentType}", this.weighment.weighmentType)
      .replace("{poDetails}", this.weighment?.poDetails ? this.weighment?.poDetails : null)
      .replace("{transporterCode}", this.weighment?.transporterCode ? this.weighment?.transporterCode.toString() : null)
      .replace("{transporterName}", this.weighment?.transporterName ? this.weighment?.transporterName : null)
      .replace("{status}", status);

    var result = await this.dbService.executeInsertAutoId("weighment", "rstNo", stmt);
    if (result['newId'] === undefined) {
      this.notifier.notify("error", "Failed to create weighment");
      return;
    } else {
      this.ngZone.run(() => {
        this.weighment.rstNo = result['newId'];
      });      
      this.insertFirstWeighment();
    }
    //this.reset();
  }

  async insertFirstWeighment() {
    var stmt = QueryList.INSERT_FIRST_WEIGHMENT_DETAIL
      .replace("{weighmentRstNo}", this.weighment.rstNo.toString())
      .replace("{material}", this.weighmentDetail.material ? this.weighmentDetail.material : null)
      .replace("{supplier}", this.weighmentDetail.supplier ? this.weighmentDetail.supplier : null)
      .replace("{firstWeighBridge}", this.weighbridge)
      .replace("{firstWeight}", this.weighmentDetail.firstWeight.toString())
      .replace("{firstUnit}", this.weighmentDetail.firstUnit)
      .replace("{firstWeightUser}", this.authService.getTokenOrOtherStoredData("id"))
      .replace("{remark}", this.weighmentDetail.remark != null ? this.weighmentDetail.remark : "");

    var result = await this.dbService.executeInsertAutoId("weighment_details", "id", stmt);
    if (result['newId']) {
      this.getWeighmentDetails(this.weighment.rstNo).then(result => {
        this.weighment.weighmentDetails = result;
        this.weighmentDetail = this.weighment.weighmentDetails[this.weighment.weighmentDetails.length-1];
      });
      this.notifier.notify("success", "Weighment created successfully");
    } else {
      this.notifier.notify("error", "Failed to create weighment");
    }
  }

  async updateSecondWeighment() {
    var stmt = QueryList.UPDATE_SECOND_WEIGHMENT_DETAIL
      .replace("{material}", this.weighmentDetail.material ? this.weighmentDetail.material: null)
      .replace("{supplier}", this.weighmentDetail.supplier)
      .replace("{secondWeighBridge}", this.weighbridge)
      .replace("{secondWeight}", this.weighmentDetail.secondWeight.toString())
      .replace("{secondUnit}", this.weighmentDetail.secondUnit ? this.weighmentDetail.secondUnit: "Kg")
      .replace("{secondWeightUser}", this.authService.getTokenOrOtherStoredData("id"))
      .replace("{netWeight}", this.weighmentDetail.netWeight ? this.weighmentDetail.netWeight?.toString() : null)
      .replace("{remark}", this.weighmentDetail.remark ? this.weighmentDetail.remark : "")
      .replace("{id}", this.weighment.weighmentDetails[this.weighment.weighmentDetails.length-1].id.toString());

    var result = await this.dbService.executeSyncDBStmt("UPDATE", stmt);
    if (result) {
      this.getWeighmentDetails(this.weighment.rstNo).then(result => {
        this.weighment.weighmentDetails = result;
      });
      this.notifier.notify("success", "Second weighment updated successfully");
    } else {
      this.notifier.notify("error", "Failed to update second weighment");
    }
  }

  displayWeighmentSummary() {
    const dialogRef = this.dialog.open(WeighmentSummaryComponent, {
      height: "800px",
      width: "1000px",
      data: {
        weighment: this.weighment
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.reset();
    });
  }

  isValid() {
    if (this.weighment.vehicleNo === undefined || this.weighment.vehicleNo.length < 0) {
      this.notifier.notify("error", "Vehicle number is required");
      return false;
    }

    if (this.weighment.weighmentType === undefined || this.weighment.weighmentType.length < 0) {
      this.notifier.notify("error", "Weightment type is required");
      return false;
    }

    if (this.weighmentDetail.firstWeight === undefined) {
      this.notifier.notify("error", "First weight is required");
      return false;
    }

    if (this.weighmentDetail.id && this.weighmentDetail.secondWeight === undefined) {
      this.notifier.notify("error", "Second weight is required");
      return false;
    }

    if (this.weighment.weighmentType === "inbound" && !this.weighment.scrollNo) {
      this.notifier.notify("error", "Scroll number is required for inbound");
      return false;
    }

    if (this.weighment.weighmentType === "inbound" &&
      this.weighmentDetail.secondWeight > this.weighmentDetail.firstWeight) {
      this.notifier.notify("error", "Second weight can't be greater than first weight for inbound");
      return false;
    }

    if (this.weighment.weighmentType.indexOf("outbound")>-1 &&
      this.weighmentDetail.secondWeight < this.weighmentDetail.firstWeight) {
      this.notifier.notify("error", "First weight can't be greater than second weight for inbound");
      return false;
    }

    if (this.weighment.weighmentType.indexOf("outbound") > -1) {
      if (!this.weighment.transporterCode) {
        this.notifier.notify("error", "Transporter code is required for outbound");
        return false;
      }
      if (!this.weighment.transporterName) {
        this.notifier.notify("error", "Transporter name is required for outbound");
        return false;
      }
      if (!this.weighment.reqId) {
        this.notifier.notify("error", "Request id is required for outbound");
        return false;
      }
      if (!this.weighment.gatePassNo) {
        this.notifier.notify("error", "Gate pass no is required for outbound");
        return false;
      }
    }

    //if (this.supplier === undefined || this.supplier.length < 0) {
    //  this.notifier.notify("error", "Supplier is required");
    //  return;
    //}

    //if (this.material === undefined || this.material.length < 0) {
    //  this.notifier.notify("error", "Material is required");
    //  return;
    //}

    return true;
  }

  reset() {
    this.weighment = new Weighment();
    this.weighmentDetail = new WeighmentDetail();
    this.transporter = "";
  }

  capture() {
    //this.currentWeight = Utils.randomNumberGenerator(5, 10000, 50000);
    if (this.weighment?.weighmentDetails[this.weighment?.weighmentDetails?.length - 1]?.firstWeight===undefined) {
      this.weighmentDetail.firstWeight = this.currentWeight;
    } else {
      this.weighmentDetail.firstWeight = this.weighment.weighmentDetails[this.weighment.weighmentDetails.length - 1].firstWeight;
      this.weighmentDetail.secondWeight = this.currentWeight;
      this.weighmentDetail.netWeight = Math.abs(this.weighmentDetail.secondWeight - this.weighmentDetail.firstWeight);
    }
  }

  getWeight() {
    this.ipcService.invokeIPC("write-to-port", [this.selectedIndicator['pollingCommand']]);
  }

  async getWeighment(criteria) {
    if (!criteria['status']) {
      criteria['status'] = "pending";
    }
    var stmt = `${QueryList.GET_WEIGHMENTS} WHERE status='${criteria["status"]}'`;
    var keys = Object.keys(criteria);
    for (let key of keys) {
      switch (key) {
        case "rstNo":
          stmt = ` ${stmt} AND rstNo=${criteria[key]}`;
          break;
        case "vehicleNo":
          stmt = ` ${stmt} AND vehicleNo='${criteria[key]}'`;
          break;
        case "reqId":
          stmt = ` ${stmt} AND reqId=${criteria[key]}`;
          break;
      }
    }
    var result = await this.dbService.executeSyncDBStmt("SELECT", stmt);
    if (result[0]) {
      this.ngZone.run(async () => {
        this.weighment = Weighment.fromJSON(result[0]);
        this.transporter = `${this.weighment.transporterCode}-${this.weighment.transporterName}`;
        this.weighment.weighmentDetails = WeighmentDetail.fromJSONList(await this.getWeighmentDetails(this.weighment.rstNo));
        if (this.weighment.weighmentDetails.length > 0) {
          this.weighmentDetail = this.weighment.weighmentDetails[this.weighment.weighmentDetails.length - 1];
        }
      });
    }
    
  }

  async getWeighmentDetails(rstNo) {
    var result = new Array<WeighmentDetail>();
    if (rstNo) {
      result = await this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_WEIGHMENT_DETAILS.replace("{rstNo}", rstNo));
      for (var i = 0; i < result.length; i++) {
        var temp = result[i];
        if (temp['firstWeightUser']!==null)
          result[i]['firstWeightUser'] = (await this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_USER_BY_ID.replace("{id}", temp['firstWeightUser'].toString())))[0];
        if (temp['secondWeightUser'] !== null)
          result[i]['secondWeightUser'] = (await this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_USER_BY_ID.replace("{id}", temp['secondWeightUser'].toString())))[0];
      }
    }
    return result;
  }
}
