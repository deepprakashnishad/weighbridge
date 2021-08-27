import { Component, OnInit } from '@angular/core';
import { MyDbService } from '../../my-db.service';
import { Report } from './report';

@Component({
  selector: 'app-report-setup',
  templateUrl: './report-setup.component.html',
  styleUrls: ['./report-setup.component.css']
})
export class ReportSetupComponent implements OnInit {

  report: Report = new Report();

  constructor(private dbService: MyDbService) { }

  ngOnInit() {

    this.report.header1 = sessionStorage.getItem("report_header_1");
    this.report.header2 = sessionStorage.getItem("report_header_2");
    this.report.printCurrentDate = sessionStorage.getItem("report_print_current_date") === "true";
    this.report.printSearchParameters = sessionStorage.getItem("report_print_search_params") === "true";

    this.report.reportReadOnly = sessionStorage.getItem("report_readonly") === "true";
    this.report.passwordProtected = sessionStorage.getItem("is_report_password_protected") === "true";
    this.report.password = sessionStorage.getItem("report_password");

    this.report.currency = sessionStorage.getItem("currency");
    this.report.dateFormat = sessionStorage.getItem("report_date_format");
    this.report.timeFormat = sessionStorage.getItem("report_time_format");
    this.report.noOfDecimalsForWeight = sessionStorage.getItem("decimals_in_weight");
  }

  save() {
    this.dbService.updateAppSetting([
      { field: "report_header_1", mValue: this.report.header1 },
      { field: "report_header_2", mValue: this.report.header2 },
      { field: "report_print_current_date", mValue: this.report.printCurrentDate },
      { field: "report_print_search_params", mValue: this.report.printSearchParameters },
      { field: "report_readonly", mValue: this.report.reportReadOnly },
      { field: "is_report_password_protected", mValue: this.report.passwordProtected },
      { field: "report_password", mValue: this.report.password },
      { field: "currency", mValue: this.report.currency },
      { field: "report_date_format", mValue: this.report.dateFormat },
      { field: "report_time_format", mValue: this.report.timeFormat },
      { field: "decimals_in_weight", mValue: this.report.noOfDecimalsForWeight },
    ]);
  }
}
