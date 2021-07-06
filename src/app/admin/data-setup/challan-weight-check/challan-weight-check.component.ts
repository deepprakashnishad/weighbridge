import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-challan-weight-check',
  templateUrl: './challan-weight-check.component.html',
  styleUrls: ['./challan-weight-check.component.css']
})
export class ChallanWeightCheckComponent implements OnInit {

  failureEffectOnOutbound: string = "do_not_save";
  failureEffectOnInbound: string = "do_not_save";

  constructor(
  ) { }

  ngOnInit() {
  }

}
