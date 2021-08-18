import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { QueryList } from '../../query-list';
import { HtmlViewerComponent } from '../../shared/html-viewer/html-viewer.component';
import { Weighment, WeighmentDetail } from '../../weighment/weighment';
import { TicketTemplate } from '../ticket-setup/ticket-template';
import { Printer } from './printer';
import { PrinterService } from './printer.service';


@Component({
  selector: 'app-printer-setup',
  templateUrl: './printer-setup.component.html',
  styleUrls: ['./printer-setup.component.css']
})
export class PrinterSetupComponent implements OnInit {

  availablePrinters: Array<Printer> = [];
  selectedPrinter1: any;
  selectedPrinter2: any;
  selectedPrinter3: any;
  selectedPrinter4: any;

  printCntAfterFirstWeight: number;
  printCntAfterSecondWeight: number;
  enableAutoPrint: boolean = false;

  templates: Array<TicketTemplate> = [];

  constructor(
    private myIPCService: MyIpcService,
    private dbService: MyDbService,
    private notifier: NotifierService,
    private printerService: PrinterService,
    private dialog: MatDialog
  ) {
    this.myIPCService.invokeIPC("printer-ipc", "getPrinters").then((printers) => {
      this.availablePrinters = Printer.jsonToPrintersArray(printers);
    });

    this.myIPCService.invokeIPC("loadEnvironmentVars", ["printers"]).then(result => {
      if (result['printer1']) {
        this.availablePrinters.some(printer => {
          if (result['printer1']['name'] === printer['name']) {
            this.selectedPrinter1 = printer;
            return true;
          }
        }); 
      }
      if (result['printer2']) {
        this.availablePrinters.some(printer => {
          if (result['printer2']['name'] === printer['name']) {
            this.selectedPrinter2 = printer;
            return true;
          }
        });
      }
      if (result['printer3']) {
        this.availablePrinters.some(printer => {
          if (result['printer3']['name'] === printer['name']) {
            this.selectedPrinter3 = printer;
            return true;
          }
        });
      }
      if (result['printer4']) {
        this.availablePrinters.some(printer => {
          if (result['printer4']['name'] === printer['name']) {
            this.selectedPrinter4 = printer;
            return true;
          }
        });
      }
    });
  }

  printerSelected(key, value) {
    this.myIPCService.invokeIPC("saveSingleEnvVar", ["printers", {
      "printer1": this.selectedPrinter1,
      "printer2": this.selectedPrinter2,
      "printer3": this.selectedPrinter3,
      "printer4": this.selectedPrinter4,
    }]).then(result => {
      if (result) {
        this.notifier.notify("success", `${key} updated successfully`);
      } else {
        this.notifier.notify("error", `Failed to update ${key}`);
      }
    });
  }

  ngOnInit() {
    this.enableAutoPrint = sessionStorage.getItem("enable_auto_print_post_weighment") === "true";
    this.printCntAfterFirstWeight = parseInt(sessionStorage.getItem("print_cnt_post_weight1"));
    this.printCntAfterSecondWeight = parseInt(sessionStorage.getItem("print_cnt_post_weight2"));

    this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_ALL_TICKET_TEMPLATE)
      .then(result => {
        this.templates = result;
      });
  }

  print(printer) {
    var selectedPrinter;
    if (printer === "printer1") {
      selectedPrinter = this.selectedPrinter1;
    } else if (printer === "printer2") {
      selectedPrinter = this.selectedPrinter2;
    } else if (printer === "printer3") {
      selectedPrinter = this.selectedPrinter3;
    } else if (printer === "printer4") {
      selectedPrinter = this.selectedPrinter4;
    }
    //this.printerService.rawTextPrint();
  }

  preview() {
    var weighment = Weighment.randomGenerator("inbound", 3, "pending");
    this.printerService.previewText(
      weighment,
      weighment.weighmentDetails[weighment.weighmentDetails.length - 1]
    ).then(result => {
      console.log(result);
      this.dialog.open(HtmlViewerComponent, {
        data: { htmlContent: result }
      });
    });
  }

  save() {
    this.dbService.updateAppSetting([
      { field: "enable_auto_print_post_weighment", mValue: this.enableAutoPrint },
      { field: "print_cnt_post_weight1", mValue: this.printCntAfterFirstWeight },
      { field: "print_cnt_post_weight2", mValue: this.printCntAfterSecondWeight }
    ]);
  }
}
