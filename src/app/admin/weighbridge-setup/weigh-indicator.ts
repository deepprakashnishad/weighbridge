import { WeighIndicatorString } from "./weigh-indicator-string";

export class WeighIndicator{
  id: string;
  type: string;
  httpType: string;
  comPort: string;
  port: number;
  wiName: string;
  indicatorString: string; 
  ipAddress: string;
  status: string;
  measuringUnit: string;
  decimalPoint: number;

  constructor() {
    this.type = "serial";
    this.comPort = "COM1";
    this.port = 8080;
    this.status = "Active";
    this.decimalPoint = 0;
    this.measuringUnit = "KG";
  }

  static fromJSON(data, weighStrings) {
    var indicators = new Array<WeighIndicator>();
    for (var i = 0; i < data.length; i++) {
      var indicator = new WeighIndicator();
      var ele = data[i];
      indicator.comPort = ele['comPort'];
      indicator.decimalPoint = ele['decimalPoint'];
      indicator.httpType = ele['httpType'];
      indicator.id = ele['id'];
      indicator.indicatorString = ele['weighstring'];
      indicator.ipAddress = ele['ipAddress'];
      indicator.measuringUnit = ele['measuringUnit'];
      indicator.port = ele['port'];
      indicator.status = ele['status'];
      indicator.type = ele['type'];
      indicator.wiName = ele['wiName'];

      indicators.push(indicator);
    }

    return indicators;
  }
}
