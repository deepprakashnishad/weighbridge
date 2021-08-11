import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MyDbService } from '../../../my-db.service';

@Component({
  selector: 'app-challan-weight-check',
  templateUrl: './challan-weight-check.component.html',
  styleUrls: ['./challan-weight-check.component.css']
})
export class ChallanWeightCheckComponent implements OnInit {

  failureEffectOnInbound: string = "do_not_save";
  enableInboundChallanWeight: boolean = false;
  enableInboundValidation: boolean = false;
  inboundUpperLimit: string;
  inboundLowerLimit: string;

  failureEffectOnOutbound: string = "do_not_save";
  enableOutboundChallanWeight: boolean = false;
  enableOutboundValidation: boolean = false;
  outboundUpperLimit: string;
  outboundLowerLimit: string;

  constructor(
    private dbService: MyDbService
  ) { }

  ngOnInit() {
    this.failureEffectOnInbound = sessionStorage.getItem("inbound_on_validation_failure");
    this.enableInboundChallanWeight = sessionStorage.getItem("enable_inbound_challan_weight") === "true";
    this.enableInboundValidation = sessionStorage.getItem("enable_inbound_validation") === "true";
    this.inboundLowerLimit = sessionStorage.getItem("inbound_lower_limit");
    this.inboundUpperLimit = sessionStorage.getItem("inbound_upper_limit");

    this.failureEffectOnOutbound = sessionStorage.getItem("outbound_on_validation_failure");
    this.enableOutboundChallanWeight = sessionStorage.getItem("enable_outbound_challan_weight") === "true";
    this.enableOutboundValidation = sessionStorage.getItem("enable_outbound_validation") === "true";
    this.outboundLowerLimit = sessionStorage.getItem("outbound_lower_limit");
    this.outboundUpperLimit = sessionStorage.getItem("outbound_upper_limit");
  }

  save() {
    this.dbService.updateAppSetting([
      { "field": "inbound_on_validation_failure", "mValue": this.failureEffectOnInbound },
      { "field": "enable_inbound_challan_weight", "mValue": this.enableInboundChallanWeight },
      { "field": "enable_inbound_validation", "mValue": this.enableInboundValidation },
      { "field": "inbound_lower_limit", "mValue": this.inboundLowerLimit },
      { "field": "inbound_upper_limit", "mValue": this.inboundUpperLimit },
      { "field": "outbound_on_validation_failure", "mValue": this.failureEffectOnOutbound },
      { "field": "enable_outbound_challan_weight", "mValue": this.enableInboundChallanWeight },
      { "field": "enable_outbound_validation", "mValue": this.enableOutboundValidation },
      { "field": "outbound_lower_limit", "mValue": this.outboundLowerLimit },
      { "field": "outbound_upper_limit", "mValue": this.outboundUpperLimit },
    ]);
  }
}
