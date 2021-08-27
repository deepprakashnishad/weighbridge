import { Component, OnInit } from '@angular/core';
import { MyDbService } from '../../../my-db.service';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent implements OnInit {

  enableInboundOutbound: boolean;
  enableInternalWeight: boolean;
  enableDataEditAfterCompletion: boolean;

  maxTextfieldLength: number = 500;

  constructor(private dbService: MyDbService) { }

  ngOnInit() {
    this.enableInboundOutbound = sessionStorage.getItem("enable_inbound_outbound") === "true";
    this.enableInternalWeight = sessionStorage.getItem("enable_internal_weight") === "true";
    this.enableDataEditAfterCompletion = sessionStorage.getItem("enable_data_edit_after_completion") === "true";

    this.maxTextfieldLength = parseInt(sessionStorage.getItem("data_edit_reason_length"));
  }

  save() {
    this.dbService.updateAppSetting([
      { "field": "enable_inbound_outbound", "mValue": this.enableInboundOutbound },
      { "field": "enable_internal_weight", "mValue": this.enableInternalWeight },
      { "field": "enable_data_edit_after_completion", "mValue": this.enableDataEditAfterCompletion },
      { "field": "data_edit_reason_length", "mValue": this.maxTextfieldLength },
    ]);
  }
}
