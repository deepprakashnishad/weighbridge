import { Component, OnInit } from '@angular/core';
import { MyDbService } from '../../../my-db.service';

@Component({
  selector: 'app-weighbridge-system-setup',
  templateUrl: './weighbridge-system-setup.component.html',
  styleUrls: ['./weighbridge-system-setup.component.css']
})
export class WeighbridgeSystemSetupComponent implements OnInit {

  saveOnZeroWeight: boolean = false;
  enableZeroCheck: boolean = false;
  zeroTolerance: number=0;

  allowZeroNetWeight: boolean = false;
  netWeightFluctuation: number=0;

  enableStableWeight: boolean = false;
  allowedVariation: number;

  constructor(private dbService: MyDbService) { }

  ngOnInit() {
    this.saveOnZeroWeight = sessionStorage.getItem("save_on_zero_weight") === "true";
    this.enableZeroCheck = sessionStorage.getItem("enable_zero_check") === "true";
    this.zeroTolerance = parseInt(sessionStorage.getItem("zero_tolerance"));

    this.allowZeroNetWeight = sessionStorage.getItem("allow_zero_net_weight") === "true";
    this.netWeightFluctuation = parseInt(sessionStorage.getItem("net_weight_fluctuation"));

    this.enableStableWeight = sessionStorage.getItem("enable_stable_weight") === "true";
    this.allowedVariation = parseInt(sessionStorage.getItem("allowed_variation"));
  }

  save() {
    this.dbService.updateAppSetting([
      { "field": "save_on_zero_weight", "mValue": this.saveOnZeroWeight},
      { "field": "enable_zero_check", "mValue": this.enableZeroCheck},
      { "field": "zero_tolerance", "mValue": this.zeroTolerance},
      { "field": "allow_zero_net_weight", "mValue": this.allowZeroNetWeight},
      { "field": "net_weight_fluctuation", "mValue": this.netWeightFluctuation},
      { "field": "enable_stable_weight", "mValue": this.enableStableWeight},
      { "field": "allowed_variation", "mValue": this.allowedVariation},
    ]);
  }

}
