import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../my-db.service';
import { MyIpcService } from '../my-ipc.service';
import { QueryList } from '../query-list';
import { SharedDataService } from '../shared-data.service';
import { Weighment } from '../weighment/weighment';

const refreshTime = 3000;

@Component({
  selector: 'app-weighbridge-record',
  templateUrl: './weighbridge-record.component.html',
  styleUrls: ['./weighbridge-record.component.css']
})
export class WeighbridgeRecordComponent implements OnInit {

  selectedIndicator: any;
  weighIndicators: Array<any> = [];
  currentWeight: any;
  currData: any;
  pendingRecords: Array<Weighment>;

  isWeightStable = false;

  prevWeight: number;
  cnt: number = 0;

  allowedNoOfDays = 8;

  constructor(
    private sharedDataService: SharedDataService,
    private dbService: MyDbService,
    private ipcService: MyIpcService,
    private ngZone: NgZone,
    private notifier: NotifierService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.initializePendingRecords();
    this.fetchWeighIndicators();
  }

  async fetchWeighIndicators() {
    var weighIndicators = [];
    weighIndicators  = await this.ipcService.invokeIPC("loadEnvironmentVars", ["weighIndicators"]);
    if (weighIndicators && weighIndicators.length>0) {
      var indicatorNames = "(";
      weighIndicators.forEach(ele => {
        indicatorNames = indicatorNames.concat(`'${ele}',`);
      })
      indicatorNames = indicatorNames.replace(/.$/, ")");
      var stmt = "SELECT wi.*, wi.type as wiType, ws.*, ws.type as stringType FROM weighindicator wi, weighstring ws WHERE wiName IN {weighIndicators} AND wi.weighString=ws.stringName AND wi.status='Active'".replace("{weighIndicators}", indicatorNames);
      var result = await this.dbService.executeSyncDBStmt("SELECT", stmt);
      if (result['error']) {
        this.notifier.notify("error", "Database error - " + result['error']);
        return;
      }
      this.weighIndicators = result;
      this.selectedIndicator = this.weighIndicators[0];
      this.sharedDataService.updateData("selectedWeighBridge", this.selectedIndicator);
      this.refreshWeightReader();
      this.initializeWeightReader();
    }
  }

  getWeight() {
    this.ipcService.invokeIPC("write-to-port", [this.selectedIndicator['pollingCommand']]);
  }

  selectedIndicatorUpdated() {
    this.sharedDataService.updateData("selectedWeighBridge", this.selectedIndicator);
    this.refreshWeightReader();
    this.initializeWeightReader();
  }

  initializeWeightReader() {
    if (this.selectedIndicator['stringType']==="continuous") {
      setInterval(this.updateCurrentWeight.bind(this), 1000);
    }

    //Subscribe to weight
    this.sharedDataService.currentData.pipe().subscribe(currData => {
      if (currData['currWeight']) {
        this.currData = currData['currWeight'];
        if (this.selectedIndicator['stringType'] === "polling") {
          this.updateCurrentWeight();
        }
      }
      this.updatePendingRecords(currData['PENDING_RECORDS']);
      if (currData['WEIGHMENT_COMPLETED']) {
        this.fetchPendingRecords();
        this.sharedDataService.updateData("WEIGHMENT_COMPLETED", false);
      }
    });
  }

  initializePendingRecords() {
    this.fetchPendingRecords();
    setInterval(() => {
      this.fetchPendingRecords();
    }, refreshTime);
  }

  fetchPendingRecords() {
    this.dbService.executeDBStmt("PENDING_RECORDS", QueryList.GET_PENDING_RECORDS);
  }

  updateCurrentWeight() {
    if (!this.currData) {
      this.isWeightStable = false;
      this.currentWeight = "Err!";
      return;
    }
    var currWeight = this.currData;

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
    } else if ( this.selectedIndicator['stringType'] !== 'polling') {
      
      this.currentWeight = "Err!";
      this.isWeightStable = false;
    }
  }

  updatePendingRecords(records) {
    this.ngZone.run(() => {
      this.pendingRecords = records;
    });    
  }

  navigateTo(path, rstNo) {
    this.router.navigate([path], { queryParams: { "rstNo": rstNo } });
  }

  refreshWeightReader() {
    this.ipcService.invokeIPC("initialize-port",
    "",
      {
        wiType: this.selectedIndicator.wiType,
        comPort: this.selectedIndicator.comPort,
        weighString: this.selectedIndicator
    });
  }

  isPendingForLong(record: Weighment) {
    var currDate = new Date();
    var recordDate = new Date(record.createdAt);
    return currDate.getTime() - recordDate.getTime() > this.allowedNoOfDays*24*60*60*1000;
  }

  reverseOrder() {
    this.pendingRecords = this.pendingRecords.reverse();
  }
}
