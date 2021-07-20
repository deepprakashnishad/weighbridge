import { Person } from "../person/person";

export class Weighment{
  rstNo: number;
  vehicleNo: string;
  reqId: number;
  weighmentType: string;
  gatePassNo: number;
  poDetails: string;
  scrollNo: string;
  transporterCode: number;
  transporterName: string;
  status: string;
  createdAt: string;
  weighmentDetails: Array<WeighmentDetail>;

  constructor(){
    this.weighmentType = "inbound";
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
    this.firstUnit = "Kg";
  }
}

export class Weighbridge{
    id: string;
    title: string;
}
