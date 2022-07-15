import { Component, OnInit } from '@angular/core';
import { MyDbService } from '../../../my-db.service';

@Component({
  selector: 'app-weighment-types',
  templateUrl: './weighment-types.component.html',
  styleUrls: []
})
export class WeighmentTypesComponent implements OnInit {

  enableInbound: boolean;
  enableOutbound: boolean;
  enableOutboundExport: boolean;
  enableOutboundDomestic: boolean;
  enableOutboundSubcontract: boolean;
  enableOthers: boolean;
  enableInternal: boolean;
  enableWeighmentTypes: string;

  constructor(private dbService: MyDbService) { }

  ngOnInit() {
    this.enableInbound = sessionStorage.getItem("enableInbound") == "true";
    this.enableOutbound = sessionStorage.getItem("enableOutbound") == "true";
    this.enableOutboundExport = sessionStorage.getItem("enableOutboundExport") == "true";
    this.enableOutboundDomestic = sessionStorage.getItem("enableOutboundDomestic") == "true";
    this.enableOutboundSubcontract = sessionStorage.getItem("enableOutboundSubcontract") == "true";
    this.enableOthers = sessionStorage.getItem("enableOthers") == "true";
    this.enableInternal = sessionStorage.getItem("enableInternal") == "true";
    this.enableWeighmentTypes = sessionStorage.getItem("enableWeighmentTypes") ? sessionStorage.getItem("enableWeighmentTypes"):"yes";
  }

  save() {
    this.dbService.updateAppSetting([
      { "field": "enableInbound", "mValue": this.enableInbound },
      { "field": "enableOutbound", "mValue": this.enableOutbound },
      { "field": "enableOutboundExport", "mValue": this.enableOutboundExport },
      { "field": "enableOutboundDomestic", "mValue": this.enableOutboundDomestic },
      { "field": "enableOutboundSubcontract", "mValue": this.enableOutboundSubcontract },
      { "field": "enableOthers", "mValue": this.enableOthers },
      { "field": "enableInternal", "mValue": this.enableInternal },
      { "field": "enableWeighmentTypes", "mValue": this.enableWeighmentTypes },
    ]);
  }
}
