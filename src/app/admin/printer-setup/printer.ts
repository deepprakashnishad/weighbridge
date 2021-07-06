import { Utils } from "src/app/utils";

export class Printer{
    name: string;
    description: string;
    status: number;
    isDefault: boolean;
    deviceUri: string;
    isAcceptingJobs: boolean;

    static jsonToPrintersArray(json){
        var printers = new Array<Printer>();

        json.forEach(ele => {
            var printer = new Printer();
            printer.name = ele['name'];
            printer.description = ele['description'];
            printer.status = ele['status'];
            printer.isDefault = ele['isDefault'];
            printer.deviceUri = ele['options']['device-uri'];
            printer.isAcceptingJobs = ele['options']['printer-is-accepting-jobs'];

            printers.push(printer);
        });
        return printers;
    }

    static generator(cnt){
        var printers = new Array<Printer>();
        for(var i=0; i<cnt; i++){
            var printer = new Printer();
            printer.name = Utils.randomStringGenerator(5);
            printer.description = Utils.randomStringGenerator(45);
            printer.deviceUri = Utils.randomStringGenerator(50);
            printers.push(printer);
        }
        return printers;
    }
}