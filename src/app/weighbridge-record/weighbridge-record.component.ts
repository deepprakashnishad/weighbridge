import { Component, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { log } from 'console';
import { interval } from 'rxjs';
import { take, takeUntil, takeWhile } from 'rxjs/operators';
import { MyDbService } from '../my-db.service';
import { QueryList } from '../query-list';
import { SharedDataService } from '../shared-data.service';
import { Utils } from '../utils';
import { Weighbridge } from '../weighment/weighment';
import {Record} from './record';

@Component({
  selector: 'app-weighbridge-record',
  templateUrl: './weighbridge-record.component.html',
  styleUrls: ['./weighbridge-record.component.css']
})
export class WeighbridgeRecordComponent implements OnInit {

  selectedWeighbridge: Weighbridge;
  weighbridges: Array<Weighbridge> = [];
  currentWeight: number = 10000;
  pendingRecords: Array<Record>;

  constructor(
    private sharedDataService: SharedDataService,
    private dbService: MyDbService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.dbService.executeDBStmt("weighbridges", QueryList.GET_WEIGHBRIDGES);

    var subscription = this.sharedDataService.currentData.pipe().subscribe(currData=>{
      this.weighbridges = currData['weighbridges'];
      console.log(this.weighbridges);
      if(this.weighbridges && this.weighbridges.length>0){
        this.selectedWeighbridge = this.weighbridges[0];
        subscription.unsubscribe();
      }
    }, () => { }, () => console.log("Fetch completed"));


    //Subscribe to weight
    this.sharedDataService.currentData.pipe().subscribe(currData => {
      this.ngZone.run(() => {
        this.currentWeight = currData['currWeight'];
        console.log(this.currentWeight);
      });
    });    
  }


}
