export class WeighIndicatorString{
    id: string;
    name: string;
    totalChars: number;
    variableLength: boolean;
    type: string;
    pollingCommand: string;

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
}