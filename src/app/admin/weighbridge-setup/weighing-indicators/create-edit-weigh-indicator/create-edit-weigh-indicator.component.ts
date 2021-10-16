import { ChangeDetectorRef, Component, Inject, NgZone, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../../../my-db.service';
import { MyIpcService } from '../../../../my-ipc.service';
import { QueryList } from '../../../../query-list';
import { SharedDataService } from '../../../../shared-data.service';
import { WeighIndicator } from '../../weigh-indicator';
import { WeighIndicatorString } from '../../weigh-indicator-string';

@Component({
  selector: 'app-create-edit-weigh-indicator',
  templateUrl: './create-edit-weigh-indicator.component.html',
  styleUrls: ['./create-edit-weigh-indicator.component.css']
})
export class CreateEditWeighIndicatorComponent implements OnInit {

  indicator: WeighIndicator = new WeighIndicator();
  indicatorStrings: Array<WeighIndicatorString> = [];
  isNew = true;
  ports: Array<any> = [];
  verification_weight = "";
  cnt: number;
  prevWeight: any;
  selectedString: WeighIndicatorString = new WeighIndicatorString();
  currWeighData: any;
  existingIndicators: Array<WeighIndicator> = [];
  updateWeightIntervalId: any;
  isPortVerified = false;

  constructor(
    private notifier: NotifierService,
    private sharedDataService: SharedDataService,
    private dbService: MyDbService,
    private dialog: MatDialog,
    private ipcService: MyIpcService,
    private ngzone: NgZone,
    private dialogRef: MatDialogRef<CreateEditWeighIndicatorComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.isNew = data['isNew'];
    this.existingIndicators = data['existingIndicators'];
    if (data['indicator']) {
      this.indicator = data["indicator"];
    }
  }

  ngOnInit() {
    this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_WEIGH_STRINGS).then(result => {
      if (result && result.length>1) {
        this.indicatorStrings = WeighIndicatorString.fromJSON(result);
        this.updateSelectedString(this.indicator.indicatorString);
      }
    });
    this.refreshPortList();
  }

  refreshPortList() {
    this.ipcService.invokeIPC("get-available-ports").then(result => {
      this.ports = result.map(ele => ele.path);
    });
  }

  selectedStringChanged() {
    this.updateSelectedString(this.indicator.indicatorString);
  }

  updateSelectedString(newString) {
    for (var i = 0; i < this.indicatorStrings.length; i++) {
      if (this.indicatorStrings[i].stringName == newString) {
        this.selectedString = this.indicatorStrings[i];
      }
    }
  }

  async verify() {
    //if (this.existingIndicators.some(ele => {
    //  if (ele.comPort === this.indicator.comPort) {
    //    return true;
    //  }
    //})) {
    //  this.notifier.notify("error", "One port cannot be used by multiple indicators");
    //  return;
    //}

    await this.ipcService.invokeIPC("close-port-if-path-is", this.indicator.comPort);

    //var isMainPortOpen = await this.ipcService.invokeIPC("is-port-open", this.indicator.comPort);
    //console.log("Main port - " + isMainPortOpen);

    this.ipcService.invokeIPC("verify-port",
      "verification-weight-recieved",
      {
        weighbridgeName: this.indicator.wiName,
        type: this.indicator.type,
        comPort: this.indicator.comPort,
        weighString: this.selectedString
      }
    );
    this.updateWeightIntervalId = setInterval(this.updateCurrentWeight.bind(this), 1000);
    this.sharedDataService.currentData.pipe().subscribe(currData => {
      this.currWeighData = currData['verification_weight'];
    });
  }

  updateCurrentWeight() {
    if (!this.currWeighData) {
      this.verification_weight = "Err!";
      return;
    }
    var currWeight = this.currWeighData;
    if (currWeight['timestamp'] > (new Date().getTime()) - 1000) {
      this.verification_weight = currWeight['weight'];
      if (this.prevWeight === currWeight['weight']) {
        this.cnt++;
        if (this.cnt > 1) {
          this.isPortVerified = true;
        }
      } else {
        this.cnt = 0;
        this.prevWeight = this.verification_weight;
      }
    } else if (this.selectedString.type !== "polling") {
      if (!isNaN(parseInt(this.verification_weight))) {
        this.verification_weight = "Not connected";
      } 
    }
  }

  isValid() {
    var isValid = true;
    if (this.indicator.wiName === undefined || this.indicator.wiName.length===0) {
      isValid = false;
      this.notifier.notify("error", "Weighment indicator name is required");
    }

    if (this.indicator.indicatorString === undefined) {
      isValid = false;
      this.notifier.notify("error", "Weighment indicator name is required");
    }

    if (this.existingIndicators.some(ele => ele.wiName === this.indicator.wiName)) {
      isValid = false;
      this.notifier.notify("error", "Weighment indicator name cannot be duplicate");
    }
    return isValid;
  }

  async save() {
    const undefinedRegExp = /undefined/g;
    if (this.indicator.id) {
      var stmt = QueryList.UPDATE_WEIGH_INDICATOR
        .replace("{comPort}", this.indicator.comPort)
        .replace("{port}", this.indicator.port ? this.indicator.port.toString() : "8080")
        .replace("{weighstring}", this.indicator?.indicatorString)
        .replace("{status}", this.indicator.status)
        .replace("{measuringUnit}", this.indicator.measuringUnit)
        .replace("{decimalPoint}", this.indicator.decimalPoint ? this.indicator.decimalPoint.toString() : "0")
        .replace("{type}", this.indicator.type)
        .replace("{httpType}", this.indicator.httpType)
        .replace("{ipAddress}", this.indicator.ipAddress)
        .replace("{wiName}", this.indicator.wiName)
        .replace("{id}", this.indicator.id.toString())
        .replace(undefinedRegExp, "");
      var result = await this.dbService.executeSyncDBStmt("UPDATE", stmt);
      if (result['error']) {
        if (result["error"]) {
          this.notifier.notify("error", result["error"]);
        } else {
          this.notifier.notify("error", "Weigh indicator could not be updated");
        }
      } else if (result) {
        //this.ipcService.invokeIPC("weighIndicators")
        this.addIndicatorToLocalList();
        this.notifier.notify("success", "Weigh indicator updated successfully");
        this.ipcService.invokeIPC("close-verification-port").then(result => {
          console.log(result);
        });
        this.dialogRef.close(this.indicator);
      } else {
        this.notifier.notify("error", "Weigh indicator could not be updated");
      }
    } else {
      if (!this.isValid()) {
        return;
      }
      var stmt = QueryList.INSERT_WEIGH_INDICATOR
        .replace("{comPort}", this.indicator.comPort)
        .replace("{port}", this.indicator.port ? this.indicator.port.toString() : "8080")
        .replace("{weighstring}", this.indicator?.indicatorString)
        .replace("{status}", this.indicator.status)
        .replace("{measuringUnit}", this.indicator.measuringUnit)
        .replace("{decimalPoint}", this.indicator.decimalPoint ? this.indicator.decimalPoint.toString() : "0")
        .replace("{type}", this.indicator.type)
        .replace("{httpType}", this.indicator.httpType)
        .replace("{ipAddress}", this.indicator.ipAddress)
        .replace("{wiName}", this.indicator.wiName)
        .replace(undefinedRegExp, "");
      var result = await this.dbService.executeInsertAutoId("weighindicator", "id", stmt);
      if (result['newId']) {
        this.addIndicatorToLocalList();
        this.notifier.notify("success", "Weigh indicator created successfully");
        this.ipcService.invokeIPC("close-verification-port").then(result => {
          console.log(result);
        });
        this.dialogRef.close(this.indicator);
      } else {
        if (result["error"]) {
          this.notifier.notify("error", result["error"]);
        } else {
          this.notifier.notify("error", "Weigh indicator could not be created");
        }
      }
    }
  }

  async addIndicatorToLocalList() {
    var envIndicatorStrings = [];
    envIndicatorStrings = await this.ipcService.invokeIPC("loadEnvironmentVars", ["weighIndicators"]);
    if (envIndicatorStrings === undefined) {
      envIndicatorStrings = [];
    }
    if (envIndicatorStrings.indexOf(this.indicator.wiName) === -1) {
      envIndicatorStrings.push(this.indicator.wiName);
      this.ipcService.invokeIPC("saveSingleEnvVar", ["weighIndicators", envIndicatorStrings]);
    }    
  }

  setAsDefault() {
    this.ipcService.invokeIPC("saveSingleEnvVar", ["weighIndicatorId", this.indicator.id]).then(result => {
      if (result) {
        this.notifier.notify("success", `Default string set to ${this.indicator.indicatorString}`);
      } else {
        this.notifier.notify("error", `Failed to set default string`);
      }
    });
  }

  cancel() {
    this.ipcService.invokeIPC("close-verification-port").then(result => {
    });
    this.dialogRef.close();
  }

  writeToPortTest() {
    this.ipcService.invokeIPC("write-to-verification-port", ["Hare Krishna"]).then(result => {
      console.log(result);
    })
  }
}

