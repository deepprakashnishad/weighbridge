import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { SAP_ENCRYPTION_KEY } from './../../utils';
import * as CryptoJS from 'crypto-js';

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
  syncBatchSize: string;

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
      inputPassword: [''],
      inputBatchSize: ['200']
    });

    this.enableSAPIntegration = sessionStorage.getItem("enableSAPIntegration") === "true";
    this.sapEndpoint = sessionStorage.getItem("sapEndpoint");
    this.username = sessionStorage.getItem("sapUsername");
    this.syncBatchSize = sessionStorage.getItem("syncBatchSize");
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
      this.syncBatchSize="200";
    } else {
      encryptedPassword = CryptoJS.AES.encrypt(this.password, SAP_ENCRYPTION_KEY).toString();
    }

    this.dbService.updateAppSetting([
      { field: "enableSAPIntegration", mValue: this.enableSAPIntegration },
      { field: "sapEndpoint", mValue: this.sapEndpoint },
      { field: "sapUsername", mValue: this.username },
      { field: "sapPassword", mValue: encryptedPassword },
      { field: "syncBatchSize", mValue: this.syncBatchSize }
    ]);
  }

  updateLogLevel() {
    this.dbService.updateAppSetting([
      { field: "logLevel", mValue: this.logLevel }
    ]);
    this.ipcService.invokeIPC("updateLogLevel", [this.logLevel]);
  }
}
