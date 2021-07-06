import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  afterFirstWeight: number;
  afterSecondWeight: number;
  enableAutoPrint: boolean = false;

  templates: Array<any> = [];

  constructor(
    private printerService: PrinterService,
  ) { 
    /* this.availablePrinters = Printer.generator(4);
    this.selectedPrinter1 = this.availablePrinters[0];
    this.selectedPrinter2 = this.availablePrinters[0];
    this.selectedPrinter3 = this.availablePrinters[0];
    this.selectedPrinter4 = this.availablePrinters[0];
    console.log(this.selectedPrinter1); */
    this.printerService.getAvailablePrinters().then((printers)=>{
      this.availablePrinters = Printer.jsonToPrintersArray(printers);
      this.selectedPrinter1 = this.availablePrinters[0];
      this.selectedPrinter2 = this.availablePrinters[0];
      this.selectedPrinter3 = this.availablePrinters[0];
      this.selectedPrinter4 = this.availablePrinters[0];
    });
  }

  ngOnInit() {
  }

}
