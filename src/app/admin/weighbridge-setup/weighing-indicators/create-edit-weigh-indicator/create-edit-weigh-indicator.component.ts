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
  selectedString: WeighIndicatorString = new WeighIndicatorString();

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
    this.dbService.executeDBStmt("weighstrings", QueryList.GET_WEIGH_STRINGS);
    this.refreshPortList();
    var subscription = this.sharedDataService.currentData.pipe().subscribe(currData => {
      if (currData['weighstrings']) {
        this.indicatorStrings = WeighIndicatorString.fromJSON(currData['weighstrings']);
        this.updateSelectedString(this.indicator.indicatorString);
      }
      if (this.indicatorStrings && this.indicatorStrings.length > 0) {
        subscription?.unsubscribe();
      }
    }, () => { }, () => console.log("Fetch completed"));
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

  verify() {
    this.ipcService.invokeIPC("verify-port", 
      "verification-weight-recieved",
      {
        type: this.indicator.type,
        comPort: this.indicator.comPort,
        baudRate: this.selectedString.baudRate,
        parity: this.selectedString.parity,
        dataBits: this.selectedString.dataBits,
        stopBits: this.selectedString.stopBits
      }
    );
    this.sharedDataService.currentData.pipe().subscribe(currData => {
      this.ngzone.run(() => {
        this.verification_weight = currData['verification_weight'];
        console.log(this.verification_weight);
      });
    });
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

  cancel() {
    this.dialogRef.close();
  }
}

