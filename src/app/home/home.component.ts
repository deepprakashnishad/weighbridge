import { AfterContentChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { MyDbService } from '../my-db.service';
import { MyIpcService } from '../my-ipc.service';
import { QueryList } from '../query-list';
import { environment } from "./../../environments/environment";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  options: Array<any> = [
    {icon: "assets/icons/truck-50.png", title: "Vehicle Registration",route: ""},
    {icon: "assets/icons/bullet-camera-50.png", title: "CCTV",route: ""},
    {icon: "assets/icons/print-60.png", title: "Print Reciept",route: ""},
    {icon: "assets/icons/networking-manager-50.png", title: "Local Network",route: ""},
    {icon: "assets/icons/weight-station-50.png", title: "Weighment",route: ""},
    {icon: "assets/icons/people-60.png", title: "Users",route: ""},
    {icon: "assets/icons/database-50.png", title: "Database",route: ""},
    {icon: "assets/icons/ftp-server-50.png", title: "Upload",route: ""},
    {icon: "assets/icons/card-payment-50.png", title: "Card Payment",route: ""},
    {icon: "assets/icons/sms-50.png", title: "SMS",route: ""},
    {icon: "assets/icons/search-database-48.png", title: "Search Database",route: ""},
    {icon: "assets/icons/upload-to-the-cloud-50.png", title: "Upload",route: ""},
    {icon: "assets/icons/tollbooth-50.png", title: "Vehical Exit",route: ""},
    {icon: "assets/icons/email-send-48.png", title: "Email",route: ""},
    {icon: "assets/icons/microsoft-excel-60.png", title: "Export to excel",route: ""},
    {icon: "assets/icons/data-sheet-60.png", title: "Datasheet",route: ""},
  ];

  constructor(
    private dbService: MyDbService,
    private ipc: MyIpcService
  ) { }

  ngOnInit() {
    this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_APP_SETTINGS).then(result => {
      if (result && result.length > 0) {
        result.forEach(ele => {
          sessionStorage.setItem(ele["field"], ele['mValue']);
          try {
            if (ele['field'] === "logLevel") {
              this.ipc.invokeIPC("updateLogLevel", [ele['mValue']]);
            }
          } catch (e) {

          }
        });
      }
    });

    this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_SEARCH_FIELDS).then(result => {
      if (result && result.length > 0) {
        var search_fields = {};
        result.forEach(ele => {
          if (ele['enable'] === 1) {
            search_fields[ele['fieldName']] = ele;
          }
        });
        sessionStorage.setItem("search_fields", JSON.stringify(search_fields));
      }
    });
  }
}
