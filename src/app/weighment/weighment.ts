import { Person } from "../person/person";

export class Weighment{
  rstNo: number;
  vehicleNo: string;
  reqId: number;
  weighmentType: string;
  gatePassNo: number;
  poDetails: string;
  transporterCode: number;
  transporterName: string;
  status: string;
  weighmentDetails: Array<WeighmentDetail>;

  constructor(){
    this.weighmentType = "inbound";
    //this.reqId = 99;
    //this.gatePassNo = 2;
    //this.vehicleNo = "MH 13 AZ 1234";
    //this.transporterCode = 40003;
    //this.transporterName = "ATO (I) LIMITED";
    this.weighmentDetails = [];
  }
}

export class WeighmentDetail {
  id: number;
  weighmentRstNo: number;
  material: string;
  supplier: string;
  firstWeighBridge: Weighbridge;
  firstWeight: number;
  firstUnit: string;
  firstWeightDatetime: Date;
  firstWeightUser: Person;

  secondWeighBridge: Weighbridge;
  secondWeight: number;
  secondUnit: string;
  secondWeightDatetime: Date;
  secondWeightUser: Person;
  remark: string;
  netWeight: number;

  constructor() {
    this.remark = "Hare Krishna";
    this.firstUnit = "Kg";
    this.supplier = "Krishna";
  }
}

export class Weighbridge{
    id: string;
    title: string;
}
