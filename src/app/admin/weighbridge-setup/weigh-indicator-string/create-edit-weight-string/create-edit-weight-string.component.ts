import { Component, OnInit } from '@angular/core';
import { WeighIndicator } from '../../weigh-indicator';
import { WeighIndicatorString } from '../../weigh-indicator-string';

@Component({
  selector: 'app-create-edit-weight-string',
  templateUrl: './create-edit-weight-string.component.html',
  styleUrls: ['./create-edit-weight-string.component.css']
})
export class CreateEditWeightStringComponent implements OnInit {

  indicatorString: WeighIndicatorString = new WeighIndicatorString();

  constructor() { }

  ngOnInit() {
  }

}
