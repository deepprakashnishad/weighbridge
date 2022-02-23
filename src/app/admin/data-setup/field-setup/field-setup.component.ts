import { Component, OnInit } from '@angular/core';
import { MyDbService } from '../../../my-db.service';

@Component({
  selector: 'app-field-setup',
  templateUrl: './field-setup.component.html',
  styleUrls: []
})
export class FieldSetupComponent implements OnInit {

  dateFormat: string;
  enableWhiteSpacesInVehicle: boolean;

  constructor(private dbService: MyDbService) { }

  ngOnInit() {
    this.dateFormat = sessionStorage.getItem("date_format");
    this.enableWhiteSpacesInVehicle = sessionStorage.getItem("enableWhiteSpacesInVehicle") == "true";
  }

  save() {
    this.dbService.updateAppSetting([
      { "field": "date_format", "mValue": this.dateFormat },
      { "field": "enableWhiteSpacesInVehicle", "mValue": this.enableWhiteSpacesInVehicle },
    ]);
  }
}
