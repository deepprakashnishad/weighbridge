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

  updateWeightIntervalId: any;

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
    //var subscription = this.sharedDataService.currentData.pipe().subscribe(currData => {
    //  if (currData['weighstrings']) {
    //    this.indicatorStrings = WeighIndicatorString.fromJSON(currData['weighstrings']);
    //    this.updateSelectedString(this.indicator.indicatorString);
    //  }
    //  if (this.indicatorStrings && this.indicatorStrings.length > 0) {
    //    subscription?.unsubscribe();
    //  }
    //}, () => { }, () => console.log("Fetch completed"));
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
        console.log(this.selectedString);
        console.log(newString);
      }
    }
  }

  verify() {
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
    var currWeight = this.currWeighData;
    console.log(currWeight);
    if (currWeight['timestamp'] > (new Date().getTime()) - 1000) {
      this.verification_weight = currWeight['weight'];
      if (this.prevWeight === currWeight['weight']) {
        this.cnt++;
        if (this.cnt > 1) {
          this.ipcService.invokeIPC("close-verification-port");
          clearInterval(this.updateWeightIntervalId);
        }
      } else {
        this.cnt = 0;
        this.prevWeight = this.verification_weight;
      }
    } else {
      this.verification_weight = "Err!";
    }
  }

  async save() {
    if (this.indicator.indicatorString === undefined) {
      this.notifier.notify("error", "Please select weigh indicator string");
      return;
    }
    const undefinedRegExp = /undefined/g;
    var insertStmt = QueryList.INSERT_WEIGH_INDICATOR
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

    var result = await this.dbService.executeInsertAutoId("weighindicator", "id", insertStmt);
    if (result['newId']) {
      this.notifier.notify("success", "Weigh indicator created successfully");
      this.dialogRef.close();
    } else {
      this.notifier.notify("error", "Weigh indicator could not be created");
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
    this.dialogRef.close();
  }
}

