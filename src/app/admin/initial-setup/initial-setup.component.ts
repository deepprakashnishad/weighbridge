import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
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

  constructor(
    private notifier: NotifierService,
    private fb: FormBuilder,
    private ipcService: MyIpcService
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
}
