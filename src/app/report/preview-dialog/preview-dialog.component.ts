import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { MyIpcService } from '../../my-ipc.service';
import { Printer } from '../../admin/printer-setup/printer';
import { PrinterService } from '../../admin/printer-setup/printer.service';
import { TicketService } from '../../admin/ticket-setup/ticket.service';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-preview-dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.css']
})
export class PreviewDialogComponent implements OnInit {

  fontSize: number = 12;
  htmlContent: string;
  rawText: string;
  printers: Array<Printer> = [];
  selectedPrinter: Printer;
  printingType: string = "GRAPHICAL";
  title: string = "Weighment Report";


  constructor(
    private notifier: NotifierService,
    private myIPCService: MyIpcService,
    private reportService: ReportService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    if (data['htmlContent']) {
      this.htmlContent = data['htmlContent'];
    }

    if (data['fontSize']) {
      this.fontSize = data['fontSize'];
    }

    if (data['rawText']) {
      this.rawText = data['rawText'];
    }
  }

  ngOnInit() {
    this.myIPCService.invokeIPC("loadEnvironmentVars", ["printers"]).then(printers => {
      console.log(printers);
      for (var key of Object.keys(printers)) {
        this.printers.push(printers[key]);
      }
      this.myIPCService.invokeIPC("loadEnvironmentVars", ["selectedPrinter"])
      .then(printer => {
        this.printers.some(tempPrinter => {
          if (tempPrinter['name'] === printer['name']) {
            this.selectedPrinter = tempPrinter;
            return true;
          }
        });
      });
    });
  }

  print() {
    if (this.printingType === "GRAPHICAL") {
      let element = document.getElementById("ticket-content");
      let range = new Range();
      range.setStart(element, 0);
      range.setEndAfter(element);
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(range);
      var filename = this.title + "_"+(new Date()).getTime();
      console.log(filename);
      this.myIPCService.invokeIPC("graphical-print-ipc",
        this.selectedPrinter,
        this.htmlContent, `${filename}`
      ).then(result => {});
    } else {
      this.myIPCService.invokeIPC("cmdline-print-ipc", [this.selectedPrinter, this.rawText? this.rawText: '']);
    }
  }

  selectedPrinterUpdated() {
    this.myIPCService.invokeIPC("saveSingleEnvVar", ["selectedPrinter", this.selectedPrinter])
    .then(result => {
      if (result) {
        this.notifier.notify("success", `Selected printer set to ${this.selectedPrinter.name}`);
      } else {
        this.notifier.notify("error", `Failed to update selected printer`);
      }
    });
  }
}
