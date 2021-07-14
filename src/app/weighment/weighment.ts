import { Person } from "../person/person";

export class Weighment{
    truckNumber: string;
    rstNo: string;
    weightmentType: string;
    supplier: string;
    material: string;
    gatePassNo: string;
    poDetails: string;
    unit: string;

    firstWeighBridge: Weighbridge;
    firstWeight: number;
    firstWeightDatetime: Date;
    firstWeightUser: Person;

    secondWeighBridge: Weighbridge;
    secondWeight: number;
    secondWeightDatetime: Date;
    secondWeightUser: Person;

    netWeight: number;  

    constructor(){
      this.weightmentType = "inbound";
    }
}

export class Weighbridge{
    id: string;
    title: string;
}
