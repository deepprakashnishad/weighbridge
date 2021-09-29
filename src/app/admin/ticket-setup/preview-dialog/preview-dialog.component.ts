import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { MyIpcService } from '../../../my-ipc.service';
import { Weighment, WeighmentDetail } from '../../../weighment/weighment';
import { Printer } from '../../printer-setup/printer';
import { PrinterService } from '../../printer-setup/printer.service';
import { TicketField } from '../ticket';
import { TicketTemplate } from '../ticket-template';

@Component({
  selector: 'app-preview-dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.css']
})
export class PreviewDialogComponent implements OnInit {

  fontSize: number = 12;
  htmlContent: string;
  ticketTemplate: TicketTemplate = new TicketTemplate();
  fields: Array<TicketField> = [];
  printers: Array<Printer> = [];
  selectedPrinter: Printer;
  weighment: Weighment;
  weighmentDetail: WeighmentDetail;
  printerType: string = "GRAPHICAL";

  constructor(
    private notifier: NotifierService,
    private myIPCService: MyIpcService,
    private printerService: PrinterService,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    if (data['htmlContent']) {
      this.htmlContent = data['htmlContent'];
    }

    if (data['fontSize']) {
      this.fontSize = data['fontSize'];
    }

    if (data['fields']) {
      this.fields = data['fields'];
    }

    if (data['ticketTemplate']) {
      this.ticketTemplate = data['ticketTemplate'];
      this.printerType = this.ticketTemplate.printerType;
    }

    if (data['weighment']) {
      this.weighment = data['weighment'];
    }

    if (data['weighmentDetail']) {
      this.weighmentDetail = data['weighmentDetail'];
    }
  }

  ngOnInit() {
    this.myIPCService.invokeIPC("loadEnvironmentVars", ["printers"]).then(printers => {
      console.log(printers);
      if (printers) {
        for (var key of Object.keys(printers)) {
          this.printers.push(printers[key]);
        }
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
    if (this.printerType === "GRAPHICAL") {
      let element = document.getElementById("ticket-content");
      let range = new Range();
      range.setStart(element, 0);
      range.setEndAfter(element);
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(range);
      this.myIPCService.invokeIPC("graphical-print-ipc",
        this.selectedPrinter,
        this.htmlContent, this.weighment.rstNo.toString()
      ).then(result => {});
    } else {
      if (this.weighment) {
        this.printerService.rawTextPrint(this.weighment, this.weighmentDetail, this.fields).then(result => {
          console.log(result);
          this.myIPCService.invokeIPC("cmdline-print-ipc", this.selectedPrinter, result);
        });
      }
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
