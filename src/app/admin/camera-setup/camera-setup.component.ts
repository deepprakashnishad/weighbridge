import { Component, OnInit } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';

@Component({
  selector: 'app-camera-setup',
  templateUrl: './camera-setup.component.html',
  styleUrls: ['./camera-setup.component.scss']
})
export class CameraSetupComponent implements OnInit {

  enableCamera: boolean;
  
  cameraId: string;
  password: string;
  username: string;
  pictureUrl: string;
  printDelayInMillis: number;
  imagePath: string;
  imageRefreshRate: number = 2500;

  constructor(
    private ipcService: MyIpcService,
    private notifier: NotifierService
  ) { }

  ngOnInit() {
    this.ipcService.invokeIPC("loadEnvironmentVars", ["camera"]).then(result => {
      if(result){
        if (result['cameraId']) {
          this.cameraId = result['cameraId'];
        }
        if (result['username']) {
          this.username = result['username'];
        }
        if (result['password']) {
          this.password = result['password'];
        }
        if (result['pictureUrl']) {
          this.pictureUrl = result['pictureUrl'];
        }
        if (result['printDelayInMillis']) {
          this.printDelayInMillis = result['printDelayInMillis'];
        }
        if (result['imagePath']) {
          this.imagePath = result['imagePath'];
        }
        if (result['imageRefreshRate']) {
          this.imageRefreshRate = result['imageRefreshRate'];
        }
        if(result['enableCamera']){
          this.enableCamera = result['enableCamera'];
        }
      } 
    });
  }

  save() {
    this.ipcService.invokeIPC("saveSingleEnvVar", ["camera", {
      "username": this.username,
      "password": this.password,
      "cameraId": this.cameraId,
      "pictureUrl": this.pictureUrl,
      "printDelayInMillis": this.printDelayInMillis,
      "imagePath": this.imagePath,
      "imageRefreshRate": this.imageRefreshRate,
      "enableCamera": this.enableCamera
    }]).then(result => {
      if (result) {
        this.notifier.notify("success", `Camera details updated successfully`);
      } else {
        this.notifier.notify("error", `Failed to update camera details`);
      }
    });
  }
}
