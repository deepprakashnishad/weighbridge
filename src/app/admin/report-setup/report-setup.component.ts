import { Component, OnInit } from '@angular/core';
import { Report } from './report';

@Component({
  selector: 'app-report-setup',
  templateUrl: './report-setup.component.html',
  styleUrls: ['./report-setup.component.css']
})
export class ReportSetupComponent implements OnInit {

  report: Report = new Report();

  constructor() { }

  ngOnInit() {
  }

}
