import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { isString } from 'util';
import { MyDbService } from '../my-db.service';
import { QueryList } from '../query-list';
import { SharedDataService } from '../shared-data.service';
import { Utils } from '../utils';
import { Weighment, WeighmentDetail } from './weighment';
import { WeighmentSummaryComponent } from './weighment-summary/weighment-summary.component';

@Component({
  selector: 'app-weighment',
  templateUrl: './weighment.component.html',
  styleUrls: ['./weighment.component.scss']
})
export class WeighmentComponent implements OnInit {

  weighment: Weighment = new Weighment();
  weighmentDetail: WeighmentDetail = new WeighmentDetail();
  weighmentDetails: Array<WeighmentDetail> = [];

  currDate = new Date();
  gatePassNo: string;
  poDetails: string;
  supplier: string;
  material: string;
  firstWeight: number;
  secondWeight: number;
  netWeight: number;
  remark: string;

  currWeight: number = 10000;
  isWeightStable: boolean = true;
  prevWeight: number;
  cnt: number = 0;
  
  constructor(
    private sharedDataService: SharedDataService,
    private notifier: NotifierService,
    private dbService: MyDbService,
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
    

    //Later remove this one line
    //setTimeout(() => { this.isWeightStable = true }, 2000);

    this.sharedDataService.currentData.subscribe((data) => {
      this.ngZone.run(() => {
        this.currWeight = data['currWeight'];
      });
      
      //if (this.prevWeight === data['currWeight']) {
      //  this.cnt++;
      //  if (this.cnt > 100) {
      //    this.isWeightStable = true;
      //  }
      //} else {
      //  this.cnt = 0;
      //  this.isWeightStable = false;
      //}
    });
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
    }
  }

  truckSelected(event){
    this.weighment.vehicleNo = event;
  }

  supplierSelected(event){
    this.weighmentDetail.supplier = event;
  }

  materialSelected(event){
    this.weighmentDetail.material = event;
  }

  save(status) {
    if (!this.isValid()) {
      return;
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
          "WB1",
          this.weighmentDetail.secondWeight,
          this.weighmentDetail.secondUnit,
          null
        );
      }
    }

    this.sharedDataService.updateData("WEIGHMENT_COMPLETED", true);

    //this.displayWeighmentSummary();
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
      .replace("{remark}", null);

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
      .replace("{scrollNo}", this.weighment.scrollNo ? this.weighment.scrollNo : null)
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
      
      console.log(this.weighment);
      this.insertFirstWeighment();
    }
    //this.reset();
  }

  async insertFirstWeighment() {
    var stmt = QueryList.INSERT_FIRST_WEIGHMENT_DETAIL
      .replace("{weighmentRstNo}", this.weighment.rstNo.toString())
      .replace("{material}", this.weighmentDetail.material ? this.weighmentDetail.material: null)
      .replace("{supplier}", this.weighmentDetail.supplier ? this.weighmentDetail.supplier:null)  
      .replace("{firstWeighBridge}", "WB1")
      .replace("{firstWeight}", this.weighmentDetail.firstWeight.toString())
      .replace("{firstUnit}", this.weighmentDetail.firstUnit)
      .replace("{firstWeightUser}", null)
      .replace("{remark}", this.weighmentDetail.remark ? this.weighmentDetail.remark : null);

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
      .replace("{secondWeighBridge}", "WB1")
      .replace("{secondWeight}", this.weighmentDetail.secondWeight.toString())
      .replace("{secondUnit}", this.weighmentDetail.secondUnit ? this.weighmentDetail.secondUnit: "Kg")
      .replace("{secondWeightUser}", null)
      .replace("{netWeight}", (this.weighmentDetail.firstWeight - this.currWeight).toString())
      .replace("{remark}", this.weighmentDetail.remark ? this.weighmentDetail.remark : null)
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
  }

  capture() {
    this.currWeight = Utils.randomNumberGenerator(5, 10000, 50000);

    if (this.weighmentDetail.firstWeight === undefined) {
      this.weighmentDetail.firstWeight = this.currWeight;
    } else {
      this.weighmentDetail.secondWeight = this.currWeight;
    }
  }

  async getWeighment(criteria) {
    var stmt = QueryList.GET_WEIGHMENTS + " WHERE ";
    var keys = Object.keys(criteria);
    for (let key of keys) {
      switch (key) {
        case "status":
          stmt = ` ${stmt} status='${criteria[key]}'`;
          break;
        case "rstNo":
          stmt = ` ${stmt} rstNo=${criteria[key]}`;
          break;
        case "vehicleNo":
          stmt = ` ${stmt} vehicleNo=${criteria[key]}`;
          break;
        case "reqId":
          stmt = ` ${stmt} reqId=${criteria[key]}`;
          break;
      }
    }
    var result = await this.dbService.executeSyncDBStmt("SELECT", stmt);
    this.weighment = result[0];
    this.weighment.weighmentDetails = await this.getWeighmentDetails(this.weighment.rstNo);
    if (this.weighment.weighmentDetails.length > 0) {
      this.weighmentDetail = this.weighment.weighmentDetails[this.weighment.weighmentDetails.length-1];
    }

    //This is temporary and will be removed. It is only for testing purpose
    this.displayWeighmentSummary();
  }

  async getWeighmentDetails(rstNo) {
    var result = new Array<WeighmentDetail>();
    if (rstNo) {
      console.log(QueryList.GET_WEIGHMENT_DETAILS.replace("{rstNo}", rstNo));
      result = await this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_WEIGHMENT_DETAILS.replace("{rstNo}", rstNo));
    }
    return result;
  }
}
