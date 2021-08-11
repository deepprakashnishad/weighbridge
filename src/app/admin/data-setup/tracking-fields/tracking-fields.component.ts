import { Component, OnInit } from '@angular/core';
import { MyDbService } from '../../../my-db.service';

@Component({
  selector: 'app-tracking-fields',
  templateUrl: './tracking-fields.component.html',
  styleUrls: ['./tracking-fields.component.css']
})
export class TrackingFieldsComponent implements OnInit {

  minTruckLength: number = 8;

  minimumLenRecieptNo: number = 4;

  constructor(private dbService: MyDbService) { }

  ngOnInit() {
    this.minTruckLength = parseInt(sessionStorage.getItem("min_vehicle_length"));
    this.minimumLenRecieptNo = parseInt(sessionStorage.getItem("min_reciept_length"));
  }

  save() {
    this.dbService.updateAppSetting([
      { "field": "min_vehicle_length", "mValue": this.minTruckLength },
      { "field": "min_reciept_length", "mValue": this.minimumLenRecieptNo },
    ]);
  }
}
