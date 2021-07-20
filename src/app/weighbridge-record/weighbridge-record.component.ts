import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { MyDbService } from '../my-db.service';
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
  currentWeight: any = 10000;
  pendingRecords: Array<Weighment>;

  isWeightStable = false;

  prevWeight: number;
  cnt: number=0;

  constructor(
    private sharedDataService: SharedDataService,
    private dbService: MyDbService,
    private ngZone: NgZone,
    private router: Router,
  ) { }

  ngOnInit() {
    //Later remove this line
    setTimeout(() => { this.isWeightStable = true }, 2000);

    //Get pending records
    this.fetchPendingRecords();
    setInterval(() => {
      this.fetchPendingRecords();
    }, refreshTime);

    //Subscribe to weight
    this.sharedDataService.currentData.pipe().subscribe(currData => {
      this.updateCurrentWeight(currData);
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

  updateCurrentWeight(currData) {
    this.ngZone.run(() => {
      this.currentWeight = currData['currWeight'];
    });
    if (this.prevWeight === currData) {
      this.cnt++;
      if (this.cnt > 10) {
        this.isWeightStable = true;
        this.ngZone.run(() => {
          this.currentWeight = currData['currWeight'];
        });
      }
    } else {
      this.cnt = 0;
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
}
