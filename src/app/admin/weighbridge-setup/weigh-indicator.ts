import { WeighIndicatorString } from "./weigh-indicator-string";

export class WeighIndicator{
    type: string;
    httpType: string;
    comPort: string;
    port: number;
    name: string;
    indicatorString: WeighIndicatorString; 
    ipAddress: string;
    status: string;
    measuringUnit: string;
    decimalPoint: number; 
}