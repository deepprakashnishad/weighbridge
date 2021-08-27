import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from "@angular/core";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { Weighment, WeighmentDetail } from "../weighment";

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


  constructor() {
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
          this.mtable.renderRows();
        }
      }
    }
  }

  ngAfterViewInit() {
    this.mtable.renderRows();
  }
}
