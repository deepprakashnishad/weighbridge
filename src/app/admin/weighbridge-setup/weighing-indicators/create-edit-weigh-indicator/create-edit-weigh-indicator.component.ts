import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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

  constructor(
  ) { }

  ngOnInit() {
  }

  verify(){

  }

  save(){
    
  }

  cancel(){}
}
