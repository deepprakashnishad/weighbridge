import { Printer } from "../printer-setup/printer";

export class TicketTemplate{
    name: string;
    applicableTo: string;
    printerType: string;
    default: string;
    labelLength: number;
    copiesPerPrint: number;
    alignment: string;
    width: number;
    font: string;
    fontSize: string;
    operatingType: string;
    printer: Printer;
}