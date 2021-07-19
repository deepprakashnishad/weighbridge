import { Component, OnInit, NgZone } from '@angular/core';
import { MyDbService } from '../my-db.service';
import { QueryList } from '../query-list';
import { SharedDataService } from '../shared-data.service';
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

  isWeightStable = false;

  prevWeight: number;
  cnt: number=0;

  constructor(
    private sharedDataService: SharedDataService,
    private dbService: MyDbService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    //Later remove this line
    setTimeout(() => { this.isWeightStable = true }, 2000);

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
      if (this.prevWeight === currData) {
        this.cnt++;
        if (this.cnt > 100) {
          this.isWeightStable = true;
          this.ngZone.run(() => {
            //this.currentWeight = currData['currWeight'];
          });
        }
      } else {
        this.cnt = 0;
        this.isWeightStable = false;
      }
    });    
  }


}
