import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-weighbridge-system-setup',
  templateUrl: './weighbridge-system-setup.component.html',
  styleUrls: ['./weighbridge-system-setup.component.css']
})
export class WeighbridgeSystemSetupComponent implements OnInit {

  saveOnZeroWeight: boolean = false;
  zeroCheck: boolean = false;
  zeroTolerance: number=0;

  allowZeroNetWeight: boolean = false;
  netWeightFluctuation: number=0;

  enableStableWeight: boolean = false;
  allowedVariation: number;
  constructor() { }

  ngOnInit() {
  }

}
