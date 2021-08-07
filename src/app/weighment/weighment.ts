import { User } from "../admin/user-management/user";
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

  static fromJSON(data) {
    var weighment = new Weighment();
    weighment.createdAt = data['createdAt'];
    weighment.gatePassNo = data['gatePassNo'] !== null ? data['gatePassNo']: undefined;
    weighment.poDetails = data['poDetails'] != null? data['poDetails']: undefined;
    weighment.reqId = data['reqId']!=null? data['reqId']: undefined;
    weighment.rstNo = data['rstNo'];
    weighment.vehicleNo = data['vehicleNo'];
    weighment.weighmentType = data['weighmentType'];
    weighment.transporterCode = data['transporterCode'] != null ? data['transporterCode'] : undefined;
    weighment.transporterName = data['transporterName'] != null ? data['transporterName'] : undefined;
    weighment.status = data['status'];
    weighment.scrollNo = data['scrollNo'] !== null ? data['scrollNo'] : undefined;


    return weighment;
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
  firstWeightUser: User;

  secondWeighBridge: Weighbridge;
  secondWeight: number;
  secondUnit: string;
  secondWeightDatetime: Date;
  secondWeightUser: User;
  remark: string;
  netWeight: number;

  constructor() {
    this.firstUnit = "Kg";
    this.secondUnit = "Kg";
    this.remark = "";
    this.material = "";
    this.supplier = "";
  }

  static fromJSON(data) {
    var weighmentDetails = new WeighmentDetail();
    weighmentDetails.id = data['id'];
    weighmentDetails.weighmentRstNo = data['weighmentRstNo'];
    weighmentDetails.material = data['material'] != null ? data['material']: undefined;
    weighmentDetails.supplier = data['supplier'] != null? data['supplier']: undefined;

    weighmentDetails.firstWeighBridge = data['firstWeighBridge'];
    weighmentDetails.firstWeight = data['firstWeight'];
    weighmentDetails.firstUnit = data['firstUnit'];
    weighmentDetails.firstWeightDatetime = data['firstWeightDatetime'];
    weighmentDetails.firstWeightUser = data['firstWeightUser'];

    weighmentDetails.secondWeighBridge = data['secondWeighBridge'];
    weighmentDetails.secondWeight = data['secondWeight'];
    weighmentDetails.secondUnit = data['secondUnit'];
    weighmentDetails.secondWeightDatetime = data['secondWeightDatetime'];
    weighmentDetails.secondWeightUser = data['secondWeightUser'];

    weighmentDetails.remark = data['remark'] != "null" ? data['remark']: undefined;
    weighmentDetails.netWeight = data['netWeight'];
    return weighmentDetails;
  }

  static fromJSONList(dataList: Array<any>) {
    var weighmentDetails = [];

    for (var data of dataList) {
      weighmentDetails.push(this.fromJSON(data));
    }

    return weighmentDetails;
  }
}

export class Weighbridge{
    id: string;
    title: string;
}
