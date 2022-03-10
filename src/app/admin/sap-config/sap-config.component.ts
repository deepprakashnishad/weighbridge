import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import * as CryptoJS from 'crypto-js';
import { SAP_ENCRYPTION_KEY } from '../../utils';

@Component({
  selector: 'sap-config',
  templateUrl: './sap-config.component.html',
  styleUrls: []
})
export class SapConfigComponent implements OnInit {

  mForm: FormGroup;

  enableSAPIntegration: boolean;
  sapEndpoint: string;
  username: string;
  password: string;

  logLevel: string;

  constructor(
    private dbService: MyDbService,
    private fb: FormBuilder,
    private ipcService: MyIpcService,
    private notifier: NotifierService
  ) { }

  ngOnInit() {
    this.mForm = this.fb.group({
      inputSapEndpoint: [''],
      inputUsername: [''],
      inputPassword: ['']
    });

    this.enableSAPIntegration = sessionStorage.getItem("enableSAPIntegration") === "true";
    this.sapEndpoint = sessionStorage.getItem("sapEndpoint");
    this.username = sessionStorage.getItem("sapUsername");

    this.logLevel = sessionStorage.getItem("logLevel");
  }

  updateEnableSAPIntegration(event) {
    this.enableSAPIntegration = event.checked;
  }

  save() {
    var encryptedPassword = "";
    if (!this.enableSAPIntegration) {
      this.sapEndpoint = "";
      this.username = "";
      this.password = "";
    } else {
      encryptedPassword = CryptoJS.AES.encrypt(this.password, SAP_ENCRYPTION_KEY).toString();
    }

    this.dbService.updateAppSetting([
      { field: "enableSAPIntegration", mValue: this.enableSAPIntegration },
      { field: "sapEndpoint", mValue: this.sapEndpoint },
      { field: "sapUsername", mValue: this.username },
      { field: "sapPassword", mValue: encryptedPassword }
    ]);
  }

  updateLogLevel() {
    this.dbService.updateAppSetting([
      { field: "logLevel", mValue: this.logLevel }
    ]);
    this.ipcService.invokeIPC("updateLogLevel", [this.logLevel]);
  }
}
