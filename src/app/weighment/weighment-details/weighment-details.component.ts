import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from "@angular/core";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { NotifierService } from "angular-notifier";
import { MyDbService } from "../../my-db.service";
import { QueryList } from "../../query-list";
import { WeighmentDetail } from "../weighment";

@Component({
  selector: 'app-weighment-details',
  templateUrl: './weighment-details.component.html',
  styleUrls: ['./weighment-details.component.css']
})
export class WeighmentDetailComponent implements OnInit, OnChanges, AfterViewInit {

  @Input("weighmentDetails") weighmentDetails: Array<WeighmentDetail> = [];

  displayedColumns: string[] = ['position', 'material', 'remark', 'firstWeight',
    'secondWeight', 'netWeight', 'firstWeighBridge', 'firstWeightDatetime', 'firstWeightUser',
    'secondWeighBridge', 'secondUnit', 'secondWeightDatetime', 'secondWeightUser'];
  dataSource: MatTableDataSource<WeighmentDetail>;

  @ViewChild("mtable", { static: false }) mtable: MatTable<any>;


  constructor(
    private dbService: MyDbService,
    private notifier: NotifierService
  ) {
    this.dataSource = new MatTableDataSource(this.weighmentDetails);
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    var keys = Object.keys(changes);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i] === "weighmentDetails" && changes[keys[i]].currentValue !== undefined) {
        this.dataSource.data = changes[keys[i]].currentValue;
        if (this.mtable) {
          this.mtable?.renderRows();
        }
      }
    }
  }

  ngAfterViewInit() {
    this.mtable?.renderRows();
  }

  async materialSelected(event, index, row) {
    var newMaterial = `${event.code}-${event.mValue}`;
    var result = this.dbService.executeSyncDBStmt("UPDATE",
      QueryList.UPDATE_WEIGHMENT_DETAIL
        .replace("{values}", `material='${newMaterial}'`)
        .replace("{id}", row['id'])
    );
    if (result) {
      this.notifier.notify("success", `Material update successfully to ${newMaterial}`);
    } else {
      this.notifier.notify("error", `Material could not be updated. Try again`);
    }
  }
}
