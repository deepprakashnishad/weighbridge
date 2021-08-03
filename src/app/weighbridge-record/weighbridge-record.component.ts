import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { MyDbService } from '../my-db.service';
import { MyIpcService } from '../my-ipc.service';
import { QueryList } from '../query-list';
import { SharedDataService } from '../shared-data.service';
import { Weighbridge, Weighment } from '../weighment/weighment';
import {Record} from './record';

const refreshTime = 60000;

@Component({
  selector: 'app-weighbridge-record',
  templateUrl: './weighbridge-record.component.html',
  styleUrls: ['./weighbridge-record.component.css']
})
export class WeighbridgeRecordComponent implements OnInit {

  selectedWeighbridge: Weighbridge;
  weighbridges: Array<Weighbridge> = [];
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
    private router: Router,
  ) { }

  ngOnInit() {
    //Later remove this line
    //setTimeout(() => { this.isWeightStable = true }, 2000);

    //Get pending records
    this.fetchPendingRecords();
    setInterval(() => {
      this.fetchPendingRecords();
    }, refreshTime);

    setInterval(this.updateCurrentWeight.bind(this), 1000);

    //Subscribe to weight
    this.sharedDataService.currentData.pipe().subscribe(currData => {
      if (currData['currWeight']) {
        this.currData = currData['currWeight'];
        //this.updateCurrentWeight(currData['currWeight']);
      }
      this.updatePendingRecords(currData['PENDING_RECORDS']);
      if (currData['WEIGHMENT_COMPLETED']) {
        this.fetchPendingRecords();
        this.sharedDataService.updateData("WEIGHMENT_COMPLETED", false);
      }
    });    
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

    if (currWeight['timestamp'] > (new Date().getTime())-1000) {
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
    this.ipcService.invokeIPC("serial-port-ipc", "initialiaze-port");
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
