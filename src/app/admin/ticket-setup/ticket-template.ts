import { Printer } from "../printer-setup/printer";

export class TicketTemplate{
  id: number;
  name: string;
  applicableTo: string;
  printerType: string;
  defaultPrinter: string;
  labelLength: number;
  copiesPerPrint: number;
  alignment: string;
  width: number;
  font: string;
  fontSize: number;
  operatingType: string;

  constructor() {
    this.applicableTo = "GENERIC";
    this.printerType = "DOT-MATRIX";
    this.labelLength = 200;
    this.copiesPerPrint = 1;
    this.font = "Arial";
    this.fontSize = 10;
    this.labelLength = 200;
  }
}
