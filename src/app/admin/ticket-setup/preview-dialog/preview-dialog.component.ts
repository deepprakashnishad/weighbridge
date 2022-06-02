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
    if (data['printingType']) {
      this.printerType = data['printingType'];
    }
  }

  ngOnInit() {
    this.myIPCService.invokeIPC("loadEnvironmentVars", ["printers"]).then(printers => {
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

    this.myIPCService.invokeIPC("loadEnvironmentVars", ["selectedPrinterType"])
      .then(printerType => {
        this.printerType = printerType;
      });
  }

  print() {
    if (this.printerType === "GRAPHICAL") {
      let printContent = document.getElementById("ticket-content").innerHTML;
      this.myIPCService.invokeIPC("writeToHtml", printContent).then(path => {
        this.myIPCService.invokeIPC("graphical-print-ipc",
          this.selectedPrinter,
          path, this.weighment.rstNo.toString()
        ).then(result => { });
      });
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
        //this.notifier.notify("success", `Selected printer set to ${this.selectedPrinter.name}`);
      } else {
        this.notifier.notify("error", `Failed to update selected printer`);
      }
    });
  }

  selectedPrinterTypeUpdated() {
    this.myIPCService.invokeIPC("saveSingleEnvVar", ["selectedPrinterType", this.printerType])
      .then(result => {
        if (result) {
          //this.notifier.notify("success", `Selected printer set to ${this.printerType}`);
        } else {
          this.notifier.notify("error", `Failed to update selected printer`);
        }
      });
  }
}
