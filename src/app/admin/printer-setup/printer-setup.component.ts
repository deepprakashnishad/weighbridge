import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { QueryList } from '../../query-list';
import { TicketTemplate } from '../ticket-setup/ticket-template';
import { Printer } from './printer';


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
    private dbService: MyDbService
  ) {
    this.myIPCService.invokeIPC("printer-ipc", "getPrinters").then((printers) => {
      this.availablePrinters = Printer.jsonToPrintersArray(printers);
      this.selectedPrinter1 = this.availablePrinters[0];
      this.selectedPrinter2 = this.availablePrinters[0];
      this.selectedPrinter3 = this.availablePrinters[0];
      this.selectedPrinter4 = this.availablePrinters[0];
    });
  }

  ngOnInit() {
    this.enableAutoPrint = sessionStorage.getItem("enable_auto_print_post_weighment") === "true";
    this.printCntAfterFirstWeight = parseInt(sessionStorage.getItem("print_cnt_post_weight1"));
    this.printCntAfterSecondWeight = parseInt(sessionStorage.getItem("print_cnt_post_weight2"));

    this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_ALL_TICKET_TEMPLATE)
      .then(result => {
        console.log(result);
        this.templates = result;
      });
  }

  print() {
    this.myIPCService.invokeIPC("printer-ipc", "print", "start /min notepad /P <filename>", "Radhe Krishna Radhe Krishna \n Krishna Krishna Radhe Radhe\nSita Ram Sita Rama\n Rama Rama Sita Sita");
  }

  save() {
    this.dbService.updateAppSetting([
      { field: "enable_auto_print_post_weighment", mValue: this.enableAutoPrint },
      { field: "print_cnt_post_weight1", mValue: this.printCntAfterFirstWeight },
      { field: "print_cnt_post_weight2", mValue: this.printCntAfterSecondWeight }
    ]);
  }
}
