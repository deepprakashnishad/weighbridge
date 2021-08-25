import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { LicenseService } from '../../license.service';
import { MyIpcService } from '../../my-ipc.service';

@Component({
  selector: 'app-initial-setup',
  templateUrl: './initial-setup.component.html',
  styleUrls: ['./initial-setup.component.scss']
})
export class InitialSetupComponent implements OnInit {

  mForm: FormGroup;

  server: string;
  port: string;
  dbName: string;
  username: string;
  password: string;
  weighbridge: string;

  isLicenseActive: boolean = false;
  licenseNumber: string;

  constructor(
    private notifier: NotifierService,
    private fb: FormBuilder,
    private ipcService: MyIpcService,
    private licenseService: LicenseService
  ) { }

  ngOnInit() {
    this.mForm = this.fb.group({
      inputWeighbridge: ['', Validators.required],
      inputDbName: ['', Validators.required],
      inputServer: ['', Validators.required],
      inputUsername: ['', Validators.required],
      inputPassword: ['', Validators.required]
    });

    this.ipcService.invokeIPC("loadEnvironmentVars").then(result => {
      console.log(result);
      this.weighbridge = result['weighbridge'];
      this.server = result['server'];
      this.dbName = result['database'];
      this.username = result['username'];
      this.password = result['password'];
    });

    this.licenseService.getLicenseDetails().then(async (result) => {
      console.log(result);
      if (result && result !== null) {
        this.licenseNumber = this.formatLicenseNumber(result['license']);
        var licenseStatus = await this.licenseService.validateLicenseDetail(result);
        this.isLicenseActive = licenseStatus['success'];
      } else {
        this.isLicenseActive = false;
      }
    });
  }

  formatLicenseNumber(licenseNumber) {
    let temp = [];

    temp.push(licenseNumber.substr(0, 4));

    if (licenseNumber.substr(4, 4) !== "")
      temp.push(licenseNumber.substr(4, 4));

    if (licenseNumber.substr(8, 4) != "")
      temp.push(licenseNumber.substr(8, 4));

    if (licenseNumber.substr(12, 4) != "")
      temp.push(licenseNumber.substr(12, 4));
    if (licenseNumber.substr(16, 4) != "")
      temp.push(licenseNumber.substr(16, 4));
    if (licenseNumber.substr(20, 4) != "")
      temp.push(licenseNumber.substr(20, 4));

    return temp.join('-');
  }

  save() {
    this.ipcService.invokeIPC("saveEnvironmentVars", [{
      "server": this.server,
      "database": this.dbName,
      "username": this.username,
      "password": this.password,
      "weighbridge": this.weighbridge
    }]).then(res => {
      if (res) {
        this.notifier.notify("success", "Save successful");
      } else {
        this.notifier.notify("error", "Failed to save");
      }
    });
  }

  loadInitialData() {
    this.ipcService.invokeIPC("createDataForInitialSetup").then(res => {
      if (res) {
        this.notifier.notify("success", "Loading process invoked");
      }
    })
  }

  async activateLicense() {
    var machineDetails = await this.ipcService.invokeIPC("getMachineDetails", []);
    machineDetails['license'] = this.licenseNumber?.replace(/-/g, '');
    if (machineDetails['license']?.length !== 24) {
      this.notifier.notify("error", "Invalid license number");
      return;
    }
    this.licenseService.activateLicense(machineDetails).subscribe(result => {
      if (result["success"]) {
        this.isLicenseActive = true;
        this.ipcService.invokeIPC("saveLicense", [machineDetails['machineId'], result["token"]]).then(result => {
          this.notifier.notify("success", "License successfully activated");
        });
        //this.ipcService.invokeIPC("saveSingleEnvVar", ["token", result["token"]]).then(result => {
        //  this.notifier.notify("success", "License successfully activated");
        //});
      } else {
        this.notifier.notify("error", "Failed to activate license");
      }
    });
  }

  async deactivateLicenseForMachine() {
    var machineDetails = await this.ipcService.invokeIPC("getMachineDetails", []);
    machineDetails['license'] = this.licenseNumber?.replace(/-/g, '');
    if (machineDetails['license']?.length !== 24) {
      this.notifier.notify("error", "Invalid license number");
      return;
    }
    var token = await this.ipcService.invokeIPC("loadEnvironmentVars", ["token"]);
    this.licenseService.deactivateLicenseForMachine(machineDetails, token).subscribe(result => {
      if (result["success"]) {
        this.isLicenseActive = false;
        this.licenseNumber = "";
        this.ipcService.invokeIPC("removeSingleEntry", ["token"]).then(result => {
          if (result) {
            this.notifier.notify("success", "License successfully de-activated");
          }
        });
      } else {
        this.notifier.notify("error", "Failed to remove license from this machine");
      }
    });
  }
}
