import { AfterViewInit, Component, ElementRef, NgZone, OnInit, Query, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { PrinterService } from '../admin/printer-setup/printer.service';
import { PreviewDialogComponent } from '../admin/ticket-setup/preview-dialog/preview-dialog.component';
import { AuthenticationService } from '../authentication/authentication.service';
import { MyDbService } from '../my-db.service';
import { MyIpcService } from '../my-ipc.service';
import { QueryList } from '../query-list';
import { SharedDataService } from '../shared-data.service';
import { TagSelectorComponent } from '../shared/tag-selector/tag-selector.component';
import { Weighment, WeighmentDetail } from './weighment';
import { WeighmentSearchDialog } from './weighment-search-dialog/weighment-search-dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { ReportService } from '../report/report.service';
import { AdditionalField } from '../admin/data-setup/additional-fields/additional-field';
import { LicenseService } from '../license.service';

@Component({
  selector: 'app-weighment',
  templateUrl: './weighment.component.html',
  styleUrls: ['./weighment.component.scss']
})
export class WeighmentComponent implements OnInit, AfterViewInit {

  weighment: Weighment = new Weighment();
  weighmentDetail: WeighmentDetail = new WeighmentDetail();
  weighmentDetails: Array<WeighmentDetail> = [];
  enableWhiteSpacesInVehicle: boolean = true;

  @ViewChild('vehicleCntl') vehicleCntl: ElementRef;

  @ViewChild('transporterCntl') transporterCntl: TagSelectorComponent;

  currDate = new Date();
  gatePassNo: string="";
  poDetails: string="";
  supplier: string = "";
  material: string = "";
  customer: string = "";
  firstWeight: number;
  secondWeight: number;
  netWeight: number;
  remark: string;

  currentWeight: any = 10000;
  currData: any;
  isWeightStable: boolean = true;
  stableWeightCheckEnabled: boolean = JSON.parse(sessionStorage.getItem("enable_stable_weight"));
  prevWeight: number;
  cnt: number = 0;
  minReadingCountForStableWeight = 3;

  weighbridge: string = "";

  isComplete: boolean = true;

  transporter: string;

  selectedIndicator: any = { "stringType": "continuous" };

  zeroResetDone: boolean;

  enableInbound: boolean;
  enableOutbound: boolean;
  enableOutboundExport: boolean;
  enableOutboundDomestic: boolean;
  enableOutboundSubcontract: boolean;
  enableOthers: boolean;
  enableInternal: boolean;

  searchFields: any = JSON.parse(sessionStorage.getItem("search_fields"));
  enableWeightEditing: boolean = JSON.parse(sessionStorage.getItem("enableWeightEditing"));
  enterFirstWeightManually: boolean = JSON.parse(sessionStorage.getItem("enterFirstWeightManually"));

  presetVehicles: Array<any> = [];

  isPresetVehicle: boolean = false;
  presetVehicle: any;
  enableWeighmentTypes: string;
  additionalFields: Array<AdditionalField> = [];
  
  constructor(
    private sharedDataService: SharedDataService,
    private authService: AuthenticationService,
    private notifier: NotifierService,
    private dbService: MyDbService,
    private ipcService: MyIpcService,
    private printerService: PrinterService,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private clipboard: Clipboard,
    private reportService: ReportService,
    private licenseService: LicenseService,
    private router: Router,
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['rstNo']) {
        this.getWeighment({ "rstNo": params['rstNo'] });
      }
    });
  }

  ngOnInit() {

    this.enableWhiteSpacesInVehicle = sessionStorage.getItem("enableWhiteSpacesInVehicle") == "true";

    this.enableInbound = sessionStorage.getItem("enableInbound") == "true";
    this.enableOutbound = sessionStorage.getItem("enableOutbound") == "true";
    this.enableOutboundDomestic = sessionStorage.getItem("enableOutboundDomestic") == "true";
    this.enableOutboundExport = sessionStorage.getItem("enableOutboundExport") == "true";
    this.enableOutboundSubcontract = sessionStorage.getItem("enableOutboundSubcontract") == "true";
    this.enableOthers = sessionStorage.getItem("enableOthers") == "true";
    this.enableInternal = sessionStorage.getItem("enableInternal") == "true";

    this.additionalFields = JSON.parse(sessionStorage.getItem("additionalFields"));
    this.enableWeighmentTypes = sessionStorage.getItem("enableWeighmentTypes") ?
      sessionStorage.getItem("enableWeighmentTypes") : "yes";

    if (this.enableWeighmentTypes !== "yes") {
      this.weighment.weighmentType = "others";
    }

    if (this.selectedIndicator?.stringType === "continuous") {
      setInterval(this.updateCurrentWeight.bind(this), 1000);
    }

    this.sharedDataService.currentData.subscribe((data) => {
      this.currData = data['currWeight'];
      if (this.selectedIndicator?.stringType === "polling") {
        this.updateCurrentWeight();
      }

      if (data["selectedWeighBridge"]) {
        this.selectedIndicator = data["selectedWeighBridge"];
        this.weighbridge = this.selectedIndicator.wiName;
      }
    });

    setInterval(() => {
      this.currDate = new Date();
    }, 1000 * 60);

    this.fetchPresetVehicles();
  }

  async fetchPresetVehicles() {
    this.presetVehicles = await this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_VEHICLE_TARE_WEIGHT);
  }

  isSeachFieldEnabled(searchFieldName) {
    if (this.searchFields) {
      return Object.keys(this.searchFields).indexOf(searchFieldName) > -1 &&
        (this.searchFields[searchFieldName]["inOutMode"] === "GENERIC" ||
          this.weighment.weighmentType.toLowerCase().indexOf(this.searchFields[searchFieldName]["inOutMode"].toLowerCase()) > -1);
    }
  }

  updateCurrentWeight() {
    //this.currData = { weight: 10000, timestamp: (new Date()).getTime() };
    if (!this.currData) {
      this.isWeightStable = false;
      this.currentWeight = "Err!";
      // this.capture();
      return;
    }
    var currWeight = this.currData;
    if (this.selectedIndicator?.stringType === "polling") {
      this.currentWeight = currWeight['weight'];
      this.isWeightStable = true;
      // this.capture();
    } else {
      if (currWeight['timestamp'] > (new Date().getTime()) - 3000) {
        this.currentWeight = currWeight['weight'];

        if (Math.abs(parseFloat(this.currentWeight)) <= parseInt(sessionStorage.getItem("zero_tolerance"))) {
          this.zeroResetDone = true;
        }
        if (this.stableWeightCheckEnabled) {
          if (parseInt(sessionStorage.getItem("allowed_variation")) >=
            Math.abs(this.prevWeight - currWeight['weight'])) {
            this.cnt++;
            if (this.cnt >= this.minReadingCountForStableWeight) {
              this.isWeightStable = true;
            }
          } else {
            this.cnt = 0;
            this.prevWeight = this.currentWeight;
            this.isWeightStable = false;
          }
        } else {
          this.isWeightStable = true;
        }
      } else {
        this.isWeightStable = false;
        this.currentWeight = "Err!";
        if (!this.enterFirstWeightManually) {
          // this.capture();
        }        
      }
    }
  }

  ngAfterViewInit() {
    this.vehicleCntl.nativeElement.focus();
  }

  parseQRString(inputStr: string) {
    //if (isString(inputStr) && (inputStr.match(/#/g) || []).length === 2) {
    //  var inputs = inputStr?.split("#");
    //  this.weighment.vehicleNo = inputs[1];
    //  this.weighment.scrollDate = inputs[0];
    //  this.weighment.scrollNo = inputs[2];
    //  this.weighment.weighmentType = "inbound";
    //}
    //if (isString(inputStr) && (inputStr.match(/:/g) || []).length === 5) {
    //  var inputs = inputStr?.split(":");
    //  this.weighment.reqId = parseInt(inputs[0]);
    //  this.weighment.reqIdDate = inputs[1];
    //  this.weighment.gatePassNo = parseInt(inputs[2]);
    //  this.weighment.vehicleNo = inputs[3];
    //  this.weighment.transporterCode = parseInt(inputs[4]);
    //  this.weighment.transporterName = inputs[5];
    //  this.transporter = `${this.weighment.transporterCode}-${this.weighment.transporterName}`;
    //  this.weighment.weighmentType = "outbound_domestic";
    //}

    if (this.weighment.vehicleNo) {
      this.getWeighment({ vehicleNo: this.weighment.vehicleNo, status: "pending" });
    } else if (this.weighment.rstNo) {
      this.getWeighment({ rstNo: this.weighment.rstNo, status: "pending" });
    }
  }

  truckSelected(event){
    this.weighment.vehicleNo = event;
  }

  transporterSelected(event) {
    this.weighment.transporterCode = event.code;
    this.weighment.transporterName = event.mValue;
    this.transporter = `${event.code}-${event.mValue}`;
  }

  supplierSelected(event){
    this.weighmentDetail.supplier = `${event.code}-${event.mValue}`;
  }

  materialSelected(event) {
    this.weighmentDetail.material = `${event.code}-${event.mValue}`;
  }

  customerSelected(event) {
    console.log("Printing customer");
    console.log(event);
    this.weighmentDetail.customer = `${event.code}-${event.mValue}`;
  }

  async save() {
    if (!this.isValid()) {
      return;
    }
    var status = "pending";
    if ((this.isComplete && this.weighmentDetail.secondWeight && /^\d+$/.test(this.weighmentDetail.secondWeight.toString())
      && this.weighmentDetail.firstWeight && /^\d+$/.test(this.weighmentDetail.firstWeight.toString())) || this.enterFirstWeightManually) {
      status = "complete";
    }
    //Initial weighment
    if (this.weighment.rstNo === undefined) {
      await this.createWeighment(status);      
    }
    //First weight has been done and second has to be done
    else if (this.weighment.rstNo && typeof(this.weighmentDetail.firstWeight)==="number") {
      await this.updateSecondWeighment();
      if (status !== "complete") {
        //Create new Weighment detail record for first weight with data of second weighment
        // of prev record
        await this.insertFirstWeighmentForPartial(
          this.weighbridge,
          this.weighmentDetail.secondWeight,
          this.weighmentDetail.secondUnit,
          this.weighmentDetail.secondWeightImage,
          this.authService.getTokenOrOtherStoredData("id")
        );
      }
      await this.updateWeighment(status);
    }
  }

  captureImage() {
    this.ipcService.invokeIPC("loadEnvironmentVars", ["camera"]).then(result => {
      if(result && result['enableCamera']){
        var currDate = new Date();
        result['sub-folder'] = `${currDate.getUTCDate()}-${currDate.getUTCMonth()+1}-${currDate.getUTCFullYear()}`;
        result['filename'] = `${this.weighbridge}_${currDate.valueOf()}.jpg`;
        this.ipcService.invokeIPC("captureImage", result).then(camResult=>{
          if(camResult['success']===false){
            this.notifier.notify("error", "Failed to capture image");
          }else{
            if (this.weighment.rstNo === undefined) {
              this.weighmentDetail.firstWeightImage = camResult['path'];
            }
            else if (this.weighment.rstNo && typeof(this.weighmentDetail.firstWeight)==="number") {
              this.weighmentDetail.secondWeightImage = camResult['path'];
            }
          }
        });
      }
    });
  }

  postWeighmentProcess() {
    this.sharedDataService.updateData("WEIGHMENT_COMPLETED", true);
    this.notifier.notify("success", "Weighment saved successfully");
    if (sessionStorage.getItem("enable_zero_check")) {
      this.zeroResetDone = false;
    }
    this.displayWeighmentSummary();
  }

  async sendDataToSAP() {
    var sql = `SELECT w.*, wd.*, u1.username firstWeightUsername, u2.username secondWeightUserName, \
              convert(varchar, createdAt, 112) createdAtDate, convert(varchar, createdAt, 8) createdAtTime, \
              convert(varchar, firstWeightDatetime, 112) firstWeightDate, convert(varchar, firstWeightDatetime, 8) firstWeightTime, \
              convert(varchar, secondWeightDatetime, 112) secondWeightDate, convert(varchar, secondWeightDatetime, 8) secondWeightTime \
              FROM weighment w, weighment_details wd, app_user u1, app_user u2 \
              WHERE w.rstNo = wd.weighmentRstNo AND w.status = 'complete' AND w.syncFlag = 0 \
              AND u1.id = wd.firstWeightUser AND u2.id = wd.secondWeightUser AND w.rstNo=${this.weighment.rstNo} \
              ORDER BY w.rstNo, wd.id`;
    var dataRows = await this.dbService.executeSyncDBStmt("GET", sql);
    dataRows = this.reportService.processResultWithFinalWeight(dataRows);
    //this.ipcService.invokeIPC("sendDataToSAP", [dataRows]);
    this.ipcService.sendDataToSAP(dataRows);
  }

  async insertFirstWeighmentForPartial(weighBridge, firstWeight, firstUnit, firstWeightImage, user) {
    var stmt = QueryList.INSERT_FIRST_WEIGHMENT_DETAIL
      .replace("{weighmentRstNo}", this.weighment.rstNo.toString())
      .replace("{supplier}", this.dbService.escapeString(this.weighmentDetail.supplier)?this.dbService.escapeString(this.weighmentDetail.supplier):"")
      .replace("{customer}", this.dbService.escapeString(this.weighmentDetail.customer)?this.dbService.escapeString(this.weighmentDetail.customer): "")
      .replace("{material}", null)
      .replace("{firstWeighBridge}", this.dbService.escapeString(weighBridge))
      .replace("{firstWeight}", firstWeight.toString())
      .replace("{firstUnit}", this.weighmentDetail.firstUnit)
      .replace("{firstWeightUser}", user)
      .replace("{firstWeightImage}", firstWeightImage)
      .replace("{remark}", this.dbService.escapeString(this.weighmentDetail.remark));
      console.log(stmt);
    var result = await this.dbService.executeInsertAutoId("weighment_details", "id", stmt);
    if (result['newId']) {
      this.getWeighmentDetails(this.weighment.rstNo).then(result => {
        this.weighment.weighmentDetails = result;
        this.weighmentDetail = Object.assign({}, this.weighment.weighmentDetails[this.weighment.weighmentDetails.length - 1]);
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
      .replace("{vehicleNo}", this.weighment.vehicleNo)
      .replace("{transporterCode}", this.weighment?.transporterCode ? this.weighment?.transporterCode.toString() : "")
      .replace("{transporterName}", this.dbService.escapeString(this.weighment?.transporterName)?this.dbService.escapeString(this.weighment?.transporterName):"")
      .replace("{status}", status)
      .replace("{rstNo}", this.weighment.rstNo.toString())
      .replace("{misc}", this.dbService.escapeString(this.weighment.misc)?this.dbService.escapeString(this.weighment.misc):"")
      .replace("{scrollDate}", this.weighment.scrollDate ? this.weighment.scrollDate : '')
      .replace("{reqIdDate}", this.weighment.reqIdDate ? this.weighment.reqIdDate : '');
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
      .replace("{transporterCode}", this.weighment?.transporterCode ? this.weighment?.transporterCode.toString() : "")
      .replace("{transporterName}", this.dbService.escapeString(this.weighment?.transporterName)?this.dbService.escapeString(this.weighment?.transporterName):"")
      .replace("{misc}", this.dbService.escapeString(this.weighment.misc))
      .replace("{status}", status)
      .replace("{scrollDate}", this.weighment.scrollDate ? this.weighment.scrollDate : "")
      .replace("{reqIdDate}", this.weighment.reqIdDate ? this.weighment.reqIdDate : "");

    var result = await this.dbService.executeInsertAutoId("weighment", "rstNo", stmt);
    if (result['newId'] === undefined) {
      this.notifier.notify("error", "Failed to create weighment");
      return;
    } else {
      this.ngZone.run(() => {
        this.weighment.rstNo = result['newId'];
      });
      if (this.isPresetVehicle) {
        this.insertPresetVehicleWeighmentDetail(status);
      } else {
        if (this.enterFirstWeightManually) {
          await this.insertCompleteWeighmentDetail();
        } else {
          this.insertFirstWeighment();
        }        
      }
    }
  }

  weightUpdated(value, weightType) {
    this.weighmentDetail.netWeight = Math.abs(this.weighmentDetail.firstWeight - this.weighmentDetail.secondWeight);
  }

  async insertCompleteWeighmentDetail() {
    var stmt = QueryList.INSERT_COMPLETE_WEIGHMENT_DETAIL
      .replace("{weighmentRstNo}", this.weighment.rstNo.toString())
      .replace("{material}", this.dbService.escapeString(this.weighmentDetail.material)?this.dbService.escapeString(this.weighmentDetail.material):"")
      .replace("{supplier}", this.dbService.escapeString(this.weighmentDetail.supplier)?this.dbService.escapeString(this.weighmentDetail.supplier):"")
      .replace("{firstWeighBridge}", this.weighbridge)
      .replace("{firstWeight}", this.weighmentDetail.firstWeight.toString())
      .replace("{firstUnit}", this.weighmentDetail.firstUnit)
      .replace("{firstWeightUser}", this.authService.getTokenOrOtherStoredData("id"))
      .replace("{secondWeighBridge}", this.weighbridge)
      .replace("{secondWeight}", this.weighmentDetail?.secondWeight?.toString())
      .replace("{secondUnit}", this.weighmentDetail.firstUnit)
      .replace("{customer}", this.weighmentDetail.customer?this.weighmentDetail.customer:"")
      .replace("{secondWeightUser}", this.authService.getTokenOrOtherStoredData("id"))
      .replace("{firstWeightImage}", this.weighmentDetail.firstWeightImage?this.weighmentDetail.firstWeightImage:"")
      .replace("{secondWeightImage}", this.weighmentDetail.secondWeightImage?this.weighmentDetail.secondWeightImage:"")
      .replace("{remark}", this.dbService.escapeString(this.weighmentDetail.remark));
    console.log(stmt);
    var result = await this.dbService.executeInsertAutoId("weighment_details", "id", stmt);
    if (result['newId']) {
      this.weighment.weighmentDetails = await this.getWeighmentDetails(this.weighment.rstNo);
      this.weighmentDetail = Object.assign({}, this.weighment.weighmentDetails[this.weighment.weighmentDetails.length - 1]);
      this.postWeighmentProcess();
      //this.notifier.notify("success", "Weighment created successfully");
    } else {
      await this.dbService.executeSyncDBStmt("DELETE", QueryList.DELETE_WEIGHMENT
        .replace("{rstNo}", this.weighment.rstNo.toString()));
      this.notifier.notify("error", "Failed to create weighment");
    }
  }

  async insertPresetVehicleWeighmentDetail(status: string) {
    var stmt = QueryList.INSERT_PRESET_VEHICLE_WEIGHMENT_DETAIL
      .replace("{weighmentRstNo}", this.weighment.rstNo.toString())
      .replace("{material}", this.dbService.escapeString(this.weighmentDetail.material)?this.dbService.escapeString(this.weighmentDetail.material):"")
      .replace("{supplier}", this.dbService.escapeString(this.weighmentDetail.supplier)?this.dbService.escapeString(this.weighmentDetail.supplier):"")
      .replace("{firstWeighBridge}", this.presetVehicle.weighbridge?this.presetVehicle.weighbridge:"")
      .replace("{firstWeight}", this.presetVehicle.weight.toString())
      .replace("{firstUnit}", this.weighmentDetail.firstUnit)
      .replace("{firstWeightUser}", this.presetVehicle.userid)
      .replace("{secondWeighBridge}", this.weighbridge)
      .replace("{secondWeight}", this.weighmentDetail.secondWeight.toString())
      .replace("{secondUnit}", this.weighmentDetail.secondUnit)
      .replace("{secondWeightUser}", this.authService.getTokenOrOtherStoredData("id"))
      .replace("{firstWeightImage}", this.weighmentDetail.firstWeightImage?this.weighmentDetail.firstWeightImage:"")
      .replace("{secondWeightImage}", this.weighmentDetail.secondWeightImage?this.weighmentDetail.secondWeightImage:"")
      .replace("{remark}", this.dbService.escapeString(this.weighmentDetail.remark)?this.dbService.escapeString(this.weighmentDetail.remark): "")
      .replace("{netWeight}", 
          Math.abs(this.weighmentDetail.firstWeight - this.weighmentDetail.secondWeight).toString());
    var result = await this.dbService.executeInsertAutoId("weighment_details", "id", stmt);
    if (result['newId']) {
      this.weighment.weighmentDetails = await this.getWeighmentDetails(this.weighment.rstNo);
      this.weighmentDetail = Object.assign({}, this.weighment.weighmentDetails[this.weighment.weighmentDetails.length - 1]);
      if (status !== "complete") {
        //Create new Weighment detail record for first weight with data of second weighment
        // of prev record
        await this.insertFirstWeighmentForPartial(
          this.weighbridge,
          this.weighmentDetail.secondWeight,
          this.weighmentDetail.secondUnit,
          this.weighmentDetail.secondWeightImage,
          this.authService.getTokenOrOtherStoredData("id")
        );
      }
      this.postWeighmentProcess();
      //this.notifier.notify("success", "Weighment created successfully");
    } else {
      this.notifier.notify("error", "Failed to create weighment");
    }
  }

  async insertFirstWeighment() {
    var stmt = QueryList.INSERT_FIRST_WEIGHMENT_DETAIL
      .replace("{weighmentRstNo}", this.weighment.rstNo.toString())
      .replace("{material}", this.dbService.escapeString(this.weighmentDetail.material)?this.dbService.escapeString(this.weighmentDetail.material): "")
      .replace("{supplier}", this.dbService.escapeString(this.weighmentDetail.supplier)?this.dbService.escapeString(this.weighmentDetail.supplier):"")
      .replace("{customer}", this.dbService.escapeString(this.weighmentDetail.customer)?this.dbService.escapeString(this.weighmentDetail.customer): "")
      .replace("{firstWeighBridge}", this.weighbridge)
      .replace("{firstWeight}", this.weighmentDetail.firstWeight.toString())
      .replace("{firstUnit}", this.weighmentDetail.firstUnit)
      .replace("{firstWeightUser}", this.authService.getTokenOrOtherStoredData("id"))
      .replace("{firstWeightImage}", this.weighmentDetail.firstWeightImage?this.weighmentDetail.firstWeightImage:"")
      .replace("{secondWeightImage}", this.weighmentDetail.secondWeightImage?this.weighmentDetail.secondWeightImage:"")
      .replace("{remark}", this.dbService.escapeString(this.weighmentDetail.remark));

    var result = await this.dbService.executeInsertAutoId("weighment_details", "id", stmt);
    if (result['newId']) {
      this.weighment.weighmentDetails = await this.getWeighmentDetails(this.weighment.rstNo);
      this.weighmentDetail = Object.assign({}, this.weighment.weighmentDetails[this.weighment.weighmentDetails.length - 1]);
      this.postWeighmentProcess();
      //this.notifier.notify("success", "Weighment created successfully");
    } else {
      this.notifier.notify("error", "Failed to create weighment");
    }
  }

  async updateSecondWeighment() {
    var stmt = QueryList.UPDATE_SECOND_WEIGHMENT_DETAIL
      .replace("{material}", this.weighmentDetail.material ? this.weighmentDetail.material: null)
      .replace("{supplier}", this.weighmentDetail.supplier)
      .replace("{customer}", this.weighmentDetail.customer ? this.weighmentDetail.customer:null)
      .replace("{secondWeighBridge}", this.weighbridge)
      .replace("{secondWeight}", this.weighmentDetail.secondWeight.toString())
      .replace("{secondUnit}", this.weighmentDetail.secondUnit ? this.weighmentDetail.secondUnit: "Kg")
      .replace("{secondWeightUser}", this.authService.getTokenOrOtherStoredData("id"))
      .replace("{firstWeightImage}", this.weighmentDetail.firstWeightImage?this.weighmentDetail.firstWeightImage:"")
      .replace("{secondWeightImage}", this.weighmentDetail.secondWeightImage?this.weighmentDetail.secondWeightImage:"")
      .replace("{netWeight}",
        this.weighmentDetail.netWeight ? this.weighmentDetail.netWeight?.toString() :
          Math.abs(this.weighmentDetail.firstWeight - this.weighmentDetail.secondWeight).toString())
      .replace("{remark}", this.dbService.escapeString(this.weighmentDetail.remark))
      .replace("{id}", this.weighment.weighmentDetails[this.weighment.weighmentDetails.length-1].id.toString());
      console.log(stmt);
    var result = await this.dbService.executeSyncDBStmt("UPDATE", stmt);
    if (result) {
      this.weighment.weighmentDetails = await this.getWeighmentDetails(this.weighment.rstNo);
      this.postWeighmentProcess();
      this.notifier.notify("success", "Second weighment updated successfully");
    } else {
      this.notifier.notify("error", "Failed to update second weighment");
    }
  }

  async displayWeighmentSummary() {
    var data = await this.printerService.getPreviewDataWithTemplate(
      this.weighment,
      this.weighment.weighmentDetails[this.weighment.weighmentDetails.length-1]
    );

    const dialogRef = this.dialog.open(PreviewDialogComponent, {
      data: {
        'htmlContent': data['content'],
        fontSize: 12,
        fields: data['ticketFields'],
        ticketTemplate: data['template'],
        'weighment': this.weighment,
        'weighmentDetail': this.weighmentDetail
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.sendDataToSAP();
      this.reset(false);
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

    if (this.weighmentDetail.firstWeight === undefined
      || isNaN(this.weighmentDetail.firstWeight)
      || this.weighmentDetail.firstWeight < 0) {
      this.notifier.notify("error", "Invalid first weight");
      return false;
    }

    if (!JSON.parse(sessionStorage.getItem("save_on_zero_weight")) &&
      this.weighmentDetail.firstWeight === 0) {
      this.notifier.notify("error", "Zero weight not allowed");
      return false;
    }

    if (this.weighmentDetail.id &&
      this.weighmentDetail.secondWeight === 0 &&
      !JSON.parse(sessionStorage.getItem("save_on_zero_weight"))) {
      this.notifier.notify("error", "Zero weight not allowed");
      return false;
    }

    if (!JSON.parse(sessionStorage.getItem("allow_zero_net_weight")) &&
      this.weighmentDetail.secondWeight === this.weighmentDetail.firstWeight) {
      this.notifier.notify("error", "Zero net weight not allowed");
      return false;
    }

    if (this.weighmentDetail.id && (this.weighmentDetail.secondWeight === undefined
      || isNaN(this.weighmentDetail.secondWeight)
      || this.weighmentDetail.secondWeight < 0)) {
      this.notifier.notify("error", "Invalid second weight");
      return false;
    }

    if (this.weighmentDetail.id &&
      (this.weighmentDetail.material === "null" || this.weighmentDetail.material === null || this.weighmentDetail.material === "")) {
      this.notifier.notify("error", "Material is mandatory for second weight.");
      return false;
    }

    if (JSON.parse(sessionStorage.getItem("enable_zero_check")) && !this.zeroResetDone) {
      this.notifier.notify("error", "Weighbridge was not set to zero before weighment.");
      return false;
    }

    //if (this.weighment.weighmentType === "inbound" && (!this.weighment.scrollNo || !this.weighment.scrollDate)) {
    //  this.notifier.notify("error", "Scroll number and scroll date are required for inbound");
    //  return false;
    //}

    //if (this.weighment.weighmentType === "inbound" && this.weighment.scrollDate.length!==8) {
    //  this.notifier.notify("error", "Scroll date must be of 8 digits");
    //  return false;
    //}

    if (this.weighment.weighmentType === "inbound" &&
      this.weighmentDetail.secondWeight > this.weighmentDetail.firstWeight) {
      this.notifier.notify("error", "Second weight can't be greater than first weight for inbound");
      return false;
    }

    if (this.weighment.weighmentType.indexOf("outbound")>-1 &&
      this.weighmentDetail.secondWeight < this.weighmentDetail.firstWeight) {
      this.notifier.notify("error", "First weight can't be greater than second weight for outbound");
      return false;
    }

    if (this.weighment.weighmentType.indexOf("outbound") > -1) {
      //if (!this.weighment.transporterCode) {
      //  this.notifier.notify("error", "Transporter code is required for outbound");
      //  return false;
      //}
      //if (!this.weighment.transporterName) {
      //  this.notifier.notify("error", "Transporter name is required for outbound");
      //  return false;
      //}
      //if (!this.weighment.reqId) {
      //  this.notifier.notify("error", "Request id is required for outbound");
      //  return false;
      //}
      //if (!this.weighment.reqIdDate) {
      //  this.notifier.notify("error", "Request id date is required for outbound");
      //  return false;
      //}
      //if (this.weighment.reqIdDate.length !== 8) {
      //  this.notifier.notify("error", "Request id date must be of 8 digits");
      //  return false;
      //}
      //if (!this.weighment.gatePassNo) {
      //  this.notifier.notify("error", "Gate pass no is required for outbound");
      //  return false;
      //}
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

  reset(isNavigationReqd) {
    this.weighment = new Weighment();
    this.weighmentDetail = new WeighmentDetail();
    this.transporter = null;
    this.isComplete = true;
    if (this.enableWeighmentTypes !== "yes") {
      this.weighment.weighmentType = "others";
    }
    this.router.navigate(["weighment"]);
  }

  capture() {
    this.captureImage();
    if (this.weighment?.weighmentDetails[this.weighment?.weighmentDetails?.length - 1]?.firstWeight === undefined) {
      this.weighmentDetail.firstWeight = this.currentWeight;
    } else {
      this.weighmentDetail.secondWeight = this.currentWeight;
      if (!this.enterFirstWeightManually) {
        this.weighmentDetail.firstWeight = this.weighment.weighmentDetails[this.weighment.weighmentDetails.length - 1].firstWeight;
        this.weighmentDetail.netWeight = Math.abs(this.weighmentDetail.secondWeight - this.weighmentDetail.firstWeight);
      }
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
          this.weighmentDetail = Object.assign(this.weighment.weighmentDetails[this.weighment.weighmentDetails.length - 1]);
        }
      });
      this.isPresetVehicle = false;
    } else if (keys[0] === "vehicleNo") {
      var presetVehicle = this.getPresetVehicle(criteria[keys[0]]);
      if (presetVehicle) {
        this.isPresetVehicle = true;
        this.weighmentDetail.firstWeighBridge = presetVehicle.weighbridge;
        this.weighmentDetail.firstWeight = presetVehicle.weight;
        this.weighmentDetail.firstWeightDatetime = new Date();
        this.weighmentDetail.firstWeightUser = presetVehicle.userid;
        this.weighment.weighmentDetails.push(this.weighmentDetail);
      } else {
        this.isPresetVehicle = false;
      }
    }
  }

  getPresetVehicle(vehicleNo) {
    this.presetVehicle = this.presetVehicles.find(ele => ele.vehicleNo === vehicleNo);
    return this.presetVehicle;
  }

  async getWeighmentDetails(rstNo) {
    var result = new Array<WeighmentDetail>();
    if (rstNo) {
      result = await this.dbService.executeSyncDBStmt("SELECT",
        QueryList.GET_WEIGHMENT_DETAILS.replace("{rstNo}", rstNo)
          .replace(/{date_format_code}/gi, sessionStorage.getItem("date_format") != null ? sessionStorage.getItem("date_format") : "113")
      );
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

  openSearchDialog() {
    var dialogRef = this.dialog.open(WeighmentSearchDialog, {
      height: "600px",
      width: "1100px",
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getWeighment({ "rstNo": result });
    });
  }

  copyToClipboard(textToCopy, msg) {
    this.clipboard.beginCopy(textToCopy);
    this.notifier.notify("success", msg);
  }

  async paste(event: ClipboardEvent) {
    var data = await navigator.clipboard.readText();
    this.weighment.vehicleNo = data;
  }
}
