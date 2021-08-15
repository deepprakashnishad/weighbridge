import { Component, Inject, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { MyDbService } from "../../my-db.service";
import { QueryList } from "../../query-list";
import { Weighment } from "../weighment";

@Component({
  selector: "app-weighment-search-dialog",
  templateUrl: "weighment-search-dialog.component.html",
  styleUrls: ["weighment-search-dialog.component.scss"]
})
export class WeighmentSearchDialog implements OnInit {

  records: Array<Weighment> = [];
  filteredRecords: Array<Weighment> = [];
  displayedColumns: Array<string> = ["rstNo", "vehicleNo", "dateTime", "action"];

  rstSearchTxt: string;
  vehicleTxt: string;

  constructor(
    private dbService: MyDbService,
    private router: Router,
    private dialogRef: MatDialogRef<WeighmentSearchDialog>
  ) { }

  ngOnInit() {
    this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_PENDING_RECORDS).then(
      result => {
        this.records = result;
        this.filteredRecords = this.records;
      }
    );


  }

  navigateTo(path, rstNo) {
    this.router.navigate([path], { queryParams: { "rstNo": rstNo } });
    this.dialogRef.close();
  }

  filter() {
    console.log(this.vehicleTxt);
    this.filteredRecords = this.records.filter(ele => {
      return (!this.rstSearchTxt || ele.rstNo.toString().indexOf(this.rstSearchTxt) > -1) && (!this.vehicleTxt || ele.vehicleNo.indexOf(this.vehicleTxt) > -1);
    })
  }
}
