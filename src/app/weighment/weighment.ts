import { User } from "../admin/user-management/user";
import { Person } from "../person/person";
import { Utils } from "../utils";

export class Weighment{
  rstNo: number;
  vehicleNo: string;
  reqId: string;
  weighmentType: string;
  gatePassNo: string;
  poDetails: string;
  scrollNo: string;
  transporterCode: number;
  transporterName: string;
  status: string;
  createdAt: string;
  weighmentDetails: Array<WeighmentDetail>;
  scrollDate: string;
  reqIdDate: string;
  misc: string;

  constructor(){
    this.weighmentType = "inbound";
    this.weighmentDetails = [];
  }

  static fromJSON(data) {
    var weighment = new Weighment();
    weighment.createdAt = data['createdAt'];
    weighment.gatePassNo = data['gatePassNo'] !== null ? data['gatePassNo']: undefined;
    weighment.poDetails = data['poDetails'] != null? data['poDetails']: undefined;
    weighment.reqId = data['reqId'] != null ? data['reqId'] : undefined;
    weighment.reqIdDate = data['reqIdDate'] != null ? data['reqIdDate'] : undefined;
    weighment.rstNo = data['rstNo'];
    weighment.vehicleNo = data['vehicleNo'];
    weighment.weighmentType = data['weighmentType'];
    weighment.transporterCode = data['transporterCode'] != null ? data['transporterCode'] : undefined;
    weighment.transporterName = data['transporterName'] != null ? data['transporterName'] : undefined;
    weighment.status = data['status'];
    weighment.misc = data['misc'];
    weighment.scrollNo = data['scrollNo'] !== null ? data['scrollNo'] : undefined;
    weighment.scrollDate = data['scrollDate'] !== null ? data['scrollDate'] : undefined;
    return weighment;
  }

  static randomGenerator(weighmentType: string, weighmentDetailCnt: number, status) {
    var weighment = new Weighment();
    weighment.scrollDate = (new Date()).toString();
    weighment.scrollNo = "M" + Utils.randomStringGenerator(4);
    weighment.createdAt = (new Date()).toString();
    weighment.gatePassNo = "1";
    weighment.poDetails = Utils.randomStringGenerator(6);
    weighment.reqId = Utils.randomStringGenerator(4);
    weighment.rstNo = Utils.randomNumberGenerator(4, 1000, 9999);
    weighment.status = status;
    weighment.transporterCode = Utils.randomNumberGenerator(4, 1000, 9999);
    weighment.transporterName = Utils.randomStringGenerator(12);
    weighment.vehicleNo = Utils.randomStringGenerator(2) + Utils.randomNumberGenerator(2) + Utils.randomStringGenerator(2) + Utils.randomNumberGenerator(4);
    weighment.weighmentType = weighmentType;
    weighment.misc = Utils.randomStringGenerator(12);
    var min = 10000;
    var max = 99999;
    for (var i = 0; i < weighmentDetailCnt; i++) {
      var weighmentDetail = WeighmentDetail.randomGenerator(
        weighmentType == "inbound", i < weighmentDetailCnt - 1 || status === "complete", weighment.rstNo,
        min, max
      );

      if (weighmentType === "inbound") {
        max = weighmentDetail.secondWeight - 1;
      } else {
        min = weighmentDetail.secondWeight + 1;
      }
      weighment.weighmentDetails.push(weighmentDetail);
    }

    return weighment;
  }
}

export class WeighmentDetail {
  id: number;
  weighmentRstNo: number;
  material: string;
  supplier: string;
  customer: string;
  firstWeighBridge: string;
  firstWeight: number;
  firstUnit: string;
  firstWeightDatetime: any;//Date;
  firstWeightUser: User;

  secondWeighBridge: string;
  secondWeight: number;
  secondUnit: string;
  secondWeightDatetime: any;// Date;
  secondWeightUser: User;
  remark: string;
  netWeight: number;
  firstWeightImage: string;
  secondWeightImage: string;

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

    weighmentDetails.customer = data['customer'];

    weighmentDetails.remark = data['remark'] != "null" ? data['remark']: undefined;
    weighmentDetails.netWeight = data['netWeight'];
    weighmentDetails.firstWeightImage = data['firstWeightImage'] != "null" ? data['firstWeightImage']: undefined;
    weighmentDetails.secondWeightImage = data['secondWeightImage'] != "null" ? data['secondWeightImage']: undefined;
    return weighmentDetails;
  }

  static fromJSONList(dataList: Array<any>) {
    var weighmentDetails = [];

    for (var data of dataList) {
      weighmentDetails.push(this.fromJSON(data));
    }

    return weighmentDetails;
  }

  static randomGenerator(isFirstWeightGreater, isComplete, rstNo, mMin, mMax) {
    var weighmentDetail = new WeighmentDetail();
    weighmentDetail.firstWeighBridge = Utils.randomStringGenerator(8);
    weighmentDetail.firstWeightDatetime = new Date().toLocaleString();
    weighmentDetail.firstWeightUser = User.randomGenerator();
    weighmentDetail.id = Utils.randomNumberGenerator(3);
    weighmentDetail.firstWeight = Utils.randomNumberGenerator(5, mMin, mMax);

    weighmentDetail.material = Utils.randomStringGenerator(8);
    weighmentDetail.supplier = Utils.randomStringGenerator(15);
    weighmentDetail.customer = Utils.randomStringGenerator(15);
    weighmentDetail.remark = Utils.randomStringGenerator(25);
    weighmentDetail.id = Utils.randomNumberGenerator(4);
    weighmentDetail.weighmentRstNo = rstNo;
    if (isComplete) {
      weighmentDetail.secondWeighBridge = Utils.randomStringGenerator(8);
      weighmentDetail.secondWeightDatetime = new Date().toLocaleString();
      weighmentDetail.secondWeightUser = User.randomGenerator();
      var min = mMin;
      var max = mMax;
      if (isFirstWeightGreater) {
        min = weighmentDetail.firstWeight + 1;
      } else {
        max = weighmentDetail.firstWeight - 1;
      }
      weighmentDetail.secondWeight = Utils.randomNumberGenerator(5, min, max);
      weighmentDetail.netWeight = Math.abs(weighmentDetail.secondWeight - weighmentDetail.firstWeight)
    }

    return weighmentDetail;
  }
}
