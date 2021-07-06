import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Weighment } from '../weighment';

@Component({
  selector: 'app-weighment-summary',
  templateUrl: './weighment-summary.component.html',
  styleUrls: ['./weighment-summary.component.css']
})
export class WeighmentSummaryComponent implements OnInit {

  weighment: Weighment = new Weighment();

  constructor(
    public dialogRef: MatDialogRef<WeighmentSummaryComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) { 
    if(data){
      this.weighment = data.weighment;
      console.log(this.weighment);
    }
  }

  ngOnInit() {
  }

}
