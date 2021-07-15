import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MyIpcService } from '../../my-ipc.service';
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

  afterFirstWeight: number;
  afterSecondWeight: number;
  enableAutoPrint: boolean = false;

  templates: Array<any> = [];

  constructor(
    private myIPCService: MyIpcService
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
    
  }

  print() {
    this.myIPCService.invokeIPC("printer-ipc", "print", "start /min notepad /P <filename>", "Hare Krishna Hare Krishna \n Krishna Krishna Hare Hare\nHare Rame Hare Rama\n Rama Rama Hare Hare")
  }

}
