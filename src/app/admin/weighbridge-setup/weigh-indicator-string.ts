import { WeighIndicator } from "./weigh-indicator";

export class WeighIndicatorString{
    id: number;
    stringName: string;
    totalChars: number;
    variableLength: boolean;
    type: string;
    pollingCommand: string;
    delimeter: string;

    //Serial port setting
    baudRate: number;
    dataBits: number;
    stopBits: number;
    parity: string;
    flowControl: string;

    weightCharPosition1: number;
    weightCharPosition2: number;
    weightCharPosition3: number;
    weightCharPosition4: number;
    weightCharPosition5: number;
    weightCharPosition6: number;

    startChar1: string;
    startChar2: string;
    startChar3: string;
    startChar4: string;

    endChar1: string;
    endChar2: string;
    endChar3: string;

    signCharPosition: number;
  negativeSignValue: string;

  constructor() {
    this.totalChars = 11;
    this.parity = "None";
    this.flowControl = "None";
    this.variableLength = false;
    this.dataBits = 8;
    this.baudRate = 2400;
    this.stopBits = 1;
    this.type = "continuous";
    this.startChar1 = "2";
    this.endChar1 = "3";
    this.delimeter = "";
    this.signCharPosition = 2;
  }

  static fromJSON(data) {
    var indicators: Array<WeighIndicatorString> = [];
    for (var i = 0; i < data.length; i++) {
      var ele = data[i];
      var indicator: WeighIndicatorString = new WeighIndicatorString();
      indicator.id = ele['id'];
      indicator.baudRate = ele['baudRate'];
      indicator.stringName = ele['stringName'];
      indicator.dataBits = ele['dataBits'];
      indicator.flowControl = ele['flowControl'];
      indicator.type = ele['type'];
      indicator.negativeSignValue = ele['negativeSignValue'];
      indicator.parity = ele['parity'];
      indicator.pollingCommand = ele['pollingCommand'];
      indicator.signCharPosition = ele['signCharPosition'];
      indicator.stopBits = ele['stopBits'];
      indicator.totalChars = ele['totalChars'];
      indicator.variableLength = ele['variableLength'];

      indicator.endChar1 = ele['endChar1'];
      indicator.endChar2 = ele['endChar2'];
      indicator.endChar3 = ele['endChar3'];

      indicator.startChar1 = ele['startChar1'];
      indicator.startChar2 = ele['startChar2'];
      indicator.startChar3 = ele['startChar3'];
      indicator.startChar4 = ele['startChar4'];

      indicator.weightCharPosition1 = ele['weightCharPosition1'];
      indicator.weightCharPosition2 = ele['weightCharPosition2'];
      indicator.weightCharPosition3 = ele['weightCharPosition3'];
      indicator.weightCharPosition4 = ele['weightCharPosition4'];
      indicator.weightCharPosition5 = ele['weightCharPosition5'];
      indicator.weightCharPosition6 = ele['weightCharPosition6'];
      indicator.delimeter = ele['delimeter'];
      indicators.push(indicator);
    }

    return indicators;
  }
}
