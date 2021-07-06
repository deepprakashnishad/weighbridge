import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { SharedDataService } from '../shared-data.service';
import { Weighment } from './weighment';
import { WeighmentSummaryComponent } from './weighment-summary/weighment-summary.component';

@Component({
  selector: 'app-weighment',
  templateUrl: './weighment.component.html',
  styleUrls: ['./weighment.component.css']
})
export class WeighmentComponent implements OnInit {

  weighment: Weighment = new Weighment();

  truckNo: string;
  rstNo: string;
  weighmentType: string = "INBOUND";
  weighmentTypes: Array<string> = ["INBOUND", "OUTBOUND", "INTERNAL"];
  currDate = new Date();
  gatePassNo: string;
  poDetails: string;
  supplier: string;
  material: string;
  firstWeight: number;
  secondWeight: number;
  netWeight: number;

  currWeight: number;
  
  constructor(
    private sharedDataService: SharedDataService,
    private notifier: NotifierService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.sharedDataService.currentData.subscribe((data)=>{
      this.currWeight = data['currWeight'];
      this.weighment.firstWeight = this.currWeight;
    this.weighment.secondWeight = this.currWeight+1000;
    });
  }

  truckSelected(event){
    this.weighment.truckNumber = event;
    this.truckNo = event;
  }

  supplierSelected(event){
    this.weighment.supplier = event;
    this.supplier = event;
  }

  materialSelected(event){
    this.weighment.material = event;
    this.material = event;
  }

  save(){
    if(this.truckNo === undefined || this.truckNo.length < 0){
      this.notifier.notify("error", "Truck number is required");
      return;
    }

    if(this.supplier === undefined || this.supplier.length < 0){
      this.notifier.notify("error", "Supplier is required");
      return;
    }

    if(this.material === undefined || this.material.length < 0){
      this.notifier.notify("error", "Material is required");
      return;
    }

    this.weighment.firstWeight = this.currWeight;
    this.weighment.secondWeight = this.currWeight;

    const dialogRef = this.dialog.open(WeighmentSummaryComponent, {
      height:"800px",
      width: "1000px",
      data: {
        weighment: this.weighment
      }
    })
  }

  reset(){}
}