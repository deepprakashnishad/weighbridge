import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-weighment-report',
  templateUrl: './weighment-report.component.html',
  styleUrls: ['./weighment-report.component.css']
})
export class WeighmentReportComponent implements OnInit {

  reportType: string = "all";
  fromTime: string;
  toTime: string;
  fromRSTNo: string;
  toRSTNo: string;
  truckNumber: string;
  supplier: string;
  material: string;

  status: string;

  columns: string[] = ['SNo', 'RSTNo', 'Truck No', 'Supplier','Material', 'Wbridge1', 'Wt1', 'DateTime1', 'Operator1', 'GatePassNo', 'PODetails', 'Wbridge2', 'Wt2', 'Datetime2', 'Operator2', 'NetWt', 'Duration'];
  displayedColumns: string[] = ['SNo', 'RSTNo', 'Truck No', 'Supplier','Material', 'Wbridge1', 'Wt1', 'DateTime1', 'Operator1', 'GatePassNo', 'PODetails', 'Wbridge2', 'Wt2', 'Datetime2', 'Operator2', 'NetWt', 'Duration'];

  dataSource: Array<any> = [];
  
  constructor() { }

  ngOnInit() {
  }

  search(){}

  export(){}
}
