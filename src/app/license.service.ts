import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NotifierService } from "angular-notifier";
import jwtDecode from "jwt-decode";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../environments/environment";
import { MyIpcService } from "./my-ipc.service";
import { BehaviorSubject } from 'rxjs';

//var ipcamera = require('node-hikvision-api');

@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  licenseUrl: string;

  validLicence: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  

  constructor(
    private ipcService: MyIpcService,
    private notifier: NotifierService,
    private http: HttpClient,
  ) {
    this.licenseUrl = environment.licenseurl + "/License";
  }

  async isLicenseValid() {
    var payload = await this.getLicenseDetails();
    if (payload) {
      try {
        return this.validateLicenseDetail(payload);
      } catch (ex) {
        return { success: false, msg: "License invalid" };
      }      
    }
    return { success: false, msg: "License missing" };
  }

  async validateLicenseDetail(payload) {
    var currentTimestamp = Math.floor((new Date()).getTime())/1000;
    if (currentTimestamp > payload['validTill']) {
      this.validLicence.next(false);
      return { success: false, msg: "License expired" };
    } else {
      var machineDetails = await this.ipcService.invokeIPC("getMachineDetails", []);
      if (machineDetails === false) {
        machineDetails = {};
        machineDetails['machineId'] = "machine-id-not-found";
        machineDetails['os'] = "windows";
      }
      if (payload['machineId'] !== machineDetails["machineId"]) {
        this.validLicence.next(false);
        return { success: false, msg: "License invalid for this machine" };
      }
      else
        this.validLicence.next(true);
        return { success: true, msg: "License verified" };
    }
  }

  async getLicenseToken() {
    var machineDetails = await this.ipcService.invokeIPC("getMachineDetails", []);
    if (machineDetails === false) {
      machineDetails = {};
      machineDetails['machineId'] = "machine-id-not-found";
      machineDetails['os'] = "windows";
    }
    return await this.ipcService.invokeIPC("getLicense", [machineDetails['machineId']]);
  }

  async getLicenseDetails() {
    var machineDetails = await this.ipcService.invokeIPC("getMachineDetails", []);
    if (machineDetails === false) {
      machineDetails = {};
      machineDetails['machineId'] = "machine-id-not-found";
      machineDetails['os'] = "windows";
    }
    var token = await this.ipcService.invokeIPC("getLicense", [machineDetails['machineId']]);
    if (token) {
      return jwtDecode(token);
    } else {
      return false;
    }
    
  }

  activateLicense(data): Observable<any> {
    return this.http.patch(`${this.licenseUrl}/assignMachine`, data)
      .pipe(
        catchError(this.handleError('Activate Machine', null)));
  }

  deactivateLicenseForMachine(data, token): Observable<any> {
    return this.http.patch(`${this.licenseUrl}/inactivateMachine`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        AuthInterceptorSkipHeader: ''
      }
    })
      .pipe(
        catchError(this.handleError('Inactivate machine', null)));
  }

  getPicture(pictureUrl:string="", username="", password=""): Observable<any> {    
    console.log(username);
    console.log(password);
    var authHeader = 'Basic ' + new Buffer(username+ ':' + password).toString('base64');
    return this.http.get(pictureUrl, {
      headers: { 'Authorization': authHeader },
      responseType: "blob"
    })
  }

  connectToCamera(pictureUrl: string = "", username = "", password = ""): Observable<any> {
    var authHeader = 'Basic ' + new Buffer("admin" + ':' + "NoPassword").toString('base64');
    return this.http.get(pictureUrl, {
      headers: { 'Authorization': authHeader },
      responseType: "blob"
    })
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.notifier.notify("error", "Failed to contact server. Please check your internet connection");
      if (error instanceof ErrorEvent) {
        return throwError('Unable to submit request. Please check your internet connection.');
      } else {
        return throwError(error);
      }
    };
  }
}
