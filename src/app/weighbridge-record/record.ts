import { Utils } from "../utils";

export class Record{
    inTime: string;
    truckNo: string;

    static randomRecordGenerator(){
        var record = new Record();
        record.inTime = `${Utils.randomNumberGenerator(2, 0, 23)}:${Utils.randomNumberGenerator(2, 0, 59)}:${Utils.randomNumberGenerator(2, 0, 59)}`;
        record.truckNo = `${Utils.randomStringGenerator(2)}${Utils.randomNumberGenerator(2)}-${Utils.randomStringGenerator(2)}${Utils.randomNumberGenerator(4)}`;
        return record;
    }

    static generateList(length){
        var records: Array<Record> = [];
        for(var i=0;i<length;i++){
            records.push(this.randomRecordGenerator());
        }
        return records;
    }
}