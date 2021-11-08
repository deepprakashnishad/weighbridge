import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NotifierService } from "angular-notifier";
import jwtDecode from "jwt-decode";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "../environments/environment";
import { MyIpcService } from "./my-ipc.service";

@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  licenseUrl: string;

  constructor(
    private ipcService: MyIpcService,
    private notifier: NotifierService,
    private http: HttpClient
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
      return { success: false, msg: "License expired" };
    } else {
      var machineDetails = await this.ipcService.invokeIPC("getMachineDetails", []);
      if (payload['machineId'] !== machineDetails["machineId"]) {
        return { success: false, msg: "License invalid for this machine" };
      }
      else
        return { success: true, msg: "License verified" };
    }
  }

  async getLicenseToken() {
    var machineDetails = await this.ipcService.invokeIPC("getMachineDetails", []);
    return await this.ipcService.invokeIPC("getLicense", [machineDetails['machineId']]);
  }

  async getLicenseDetails() {
    var machineDetails = await this.ipcService.invokeIPC("getMachineDetails", []);
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
