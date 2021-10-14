import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  getHtmlReportText(dataRows: Array<any>, columns: Array<string>, fieldLength) {
    var mText = "";
    for (var column of columns) {
      if (column !== "action") {
        if (column.toLocaleUpperCase() === "WEIGHMENTTYPE") {
          mText = `${mText} <td>${"TYPE".substr(0, fieldLength)}</td>`;
        } else if (column.toLocaleUpperCase() === "FIRSTWEIGHBRIDGE") {
          mText = `${mText} <td>${"WB1".substr(0, fieldLength)}</td>`;
        } else if (column.toLocaleUpperCase() === "FIRSTWEIGHT") {
          mText = `${mText} <td>${"WT1".substr(0, fieldLength)}</td>`;
        }
        else if (column.toLocaleUpperCase() === "FIRSTWEIGHTDATETIME") {
          mText = `${mText} <td>${"DATETIME1".substr(0, fieldLength)}</td>`;
        }
        else if (column.toLocaleUpperCase() === "FIRSTWEIGHTUSER") {
          mText = `${mText} <td>${"USER1".substr(0, fieldLength)}</td>`;
        }
        else if (column.toLocaleUpperCase() === "SECONDWEIGHBRIDGE") {
          mText = `${mText} <td>${"WB2".substr(0, fieldLength)}</td>`;
        }
        else if (column.toLocaleUpperCase() === "SECONDWEIGHT") {
          mText = `${mText} <td>${"WT2".substr(0, fieldLength)}</td>`;
        }
        else if (column.toLocaleUpperCase() === "SECONDWEIGHTDATETIME") {
          mText = `${mText} <td>${"DATETIME2".substr(0, fieldLength)}</td>`;
        }
        else if (column.toLocaleUpperCase() === "SECONDWEIGHTUSER") {
          mText = `${mText} <td>${"USER2".substr(0, fieldLength)}</td>`;
        }
        else if (column.toLocaleUpperCase() === "NETWEIGHT") {
          mText = `${mText} <td>${"NETWT".substr(0, fieldLength)}</td>`;
        }
        else {
          mText = `${mText} <td>${column.toLocaleUpperCase().substr(0, fieldLength)}</td>`;
        }
        
      }
      
    }
    mText = `<tr>${mText}</tr>`;

    for (var i in dataRows) {
      var data = dataRows[i];
      for (var column of columns) {
        if (column === "sNo") {
          mText = `${mText} <td>${parseInt(i) + 1}</td>`;
        } else if (column.indexOf("WeightUser") > -1) {
          mText = `${mText} <td>${data[column]?.fullname?.substr(0, fieldLength) ? data[column]?.fullname?.substr(0, fieldLength):""}</td>`;
        } else if (column === "action") {

        } else {
          mText = `${mText} <td>${data[column]?.toString().substr(0, fieldLength) ? data[column]?.toString().substr(0, fieldLength):""}</td>`;
        }        
      }
      mText = `<tr>${mText}</tr>`;
    }
    mText = `<table>${mText}</table>`;
    return mText;
  }

  getRawTextForFilePrinting(dataRows: Array<any>, columns: Array<string>, maxFieldLength) {
    var mText = "";
    var newHeaderColumns = [...columns];

    for (var i in newHeaderColumns) {
      if (newHeaderColumns[i] !== "action") {
        if (newHeaderColumns[i].toLocaleUpperCase() === "WEIGHMENTTYPE") {
          newHeaderColumns[i] = "TYPE".substr(0, maxFieldLength);
        } else if (newHeaderColumns[i].toLocaleUpperCase() === "FIRSTWEIGHBRIDGE") {
          newHeaderColumns[i] = "WB1".substr(0, maxFieldLength);
        } else if (newHeaderColumns[i].toLocaleUpperCase() === "FIRSTWEIGHT") {
          newHeaderColumns[i] = "WT1".substr(0, maxFieldLength);
        }
        else if (newHeaderColumns[i].toLocaleUpperCase() === "FIRSTWEIGHTDATETIME") {
          newHeaderColumns[i] = "DATETIME1".substr(0, maxFieldLength);
        }
        else if (newHeaderColumns[i].toLocaleUpperCase() === "FIRSTWEIGHTUSER") {
          newHeaderColumns[i] = "USER1".substr(0, maxFieldLength);
        }
        else if (newHeaderColumns[i].toLocaleUpperCase() === "SECONDWEIGHBRIDGE") {
          newHeaderColumns[i] ="WB2".substr(0, maxFieldLength);
        }
        else if (newHeaderColumns[i].toLocaleUpperCase() === "SECONDWEIGHT") {
          newHeaderColumns[i] ="WT2".substr(0, maxFieldLength);
        }
        else if (newHeaderColumns[i].toLocaleUpperCase() === "SECONDWEIGHTDATETIME") {
          newHeaderColumns[i] = "DATETIME2".substr(0, maxFieldLength);
        }
        else if (newHeaderColumns[i].toLocaleUpperCase() === "SECONDWEIGHTUSER") {
          newHeaderColumns[i] = "USER2".substr(0, maxFieldLength);
        }
        else if (newHeaderColumns[i].toLocaleUpperCase() === "NETWEIGHT") {
          newHeaderColumns[i] = "NETWT".substr(0, maxFieldLength);
        }
      }
    }

    var minLengthArray = this.getMinLengthFieldArray(dataRows, columns, newHeaderColumns, maxFieldLength);

    for (var column of newHeaderColumns) {
      if (column !== "action") {
        if (column.toLocaleUpperCase().length <= minLengthArray[column]) {
          mText = mText + column.toLocaleUpperCase() + " ".repeat(minLengthArray[column] - column.length);
        } else {
          mText = `${mText} ${column.toLocaleUpperCase().substr(0, maxFieldLength)}`;
        }
      }
    }
    mText = `${mText}\n`;

    for (var i in dataRows) {
      var data = dataRows[i];
      for (var column of columns) {
        if (column === "sNo") {
          var temp = `${(parseInt(i) + 1).toString().substr(0, maxFieldLength) ? (i + 1)?.toString().substr(0, maxFieldLength) : ""}`;
          if (temp.length < minLengthArray[column]) {
            temp = temp + " ".repeat(minLengthArray[column] - temp.length);
          }
          mText = mText + temp;
        } else if (column.indexOf("WeightUser") > -1) {
          var temp = `${data[column]?.fullname?.substr(0, maxFieldLength) ?
            data[column]?.fullname?.substr(0, maxFieldLength) : ""}`;
          if (temp.length < minLengthArray[column]) {
            temp = temp+" ".repeat(minLengthArray[column] - temp.length);
          }
          mText = mText + temp;
        } else if (column !== "action") {
          var temp = `${data[column]?.toString().substr(0, maxFieldLength) ? data[column]?.toString().substr(0, maxFieldLength) : ""}`;
          if (temp.length < minLengthArray[column]) {
            temp = temp+" ".repeat(minLengthArray[column] - temp.length) ;
          }
          mText = mText + temp;
        }
      }
      //mText = `${mText}\"`;
      mText = `${mText}\n`;
    }
    return mText;
  }

  getMinLengthFieldArray(dataRows: Array<any>, columns: Array<string>, newHeaderColumns: Array<string>, maxFieldLength: number) {
    var defaultAddedLength = 1;
    var minLengthMap = {};
    var mText = "";
    for (var column of newHeaderColumns) {
      if (column !== "action") {
        if (column === "TYPE") {
          minLengthMap["weighmentType"] = "WEIGHMENTTYPE".substr(0, maxFieldLength);
        } else if (column === "WB1") {
          newHeaderColumns["firstWeighBridge"] = "FIRSTWEIGHBRIDGE".substr(0, maxFieldLength);
        } else if (column === "WT1") {
          newHeaderColumns["FirstWeight"] = "FIRSTWEIGHT".substr(0, maxFieldLength);
        }
        else if (column === "DATETIME1") {
          newHeaderColumns["firstWeightDatetime"] = "FIRSTWEIGHTDATETIME".substr(0, maxFieldLength);
        }
        else if (column === "USER1") {
          newHeaderColumns["firstWeightUser"] = "FIRSTWEIGHTUSER".substr(0, maxFieldLength);
        }
        else if (column === "WB2") {
          newHeaderColumns["secondWeighBridge"] = "SECONDWEIGHBRIDGE".substr(0, maxFieldLength);
        }
        else if (column === "WT2") {
          newHeaderColumns["secondWeight"] = "SECONDWEIGHT".substr(0, maxFieldLength);
        }
        else if (column === "DATETIME2") {
          newHeaderColumns["secondWeightDatetime"] = "SECONDWEIGHTDATETIME".substr(0, maxFieldLength);
        }
        else if (column === "USER2") {
          newHeaderColumns["secondWeightUser"] = "SECONDWEIGHTUSER".substr(0, maxFieldLength);
        }
        else if (column === "NETWT") {
          newHeaderColumns["netWeight"] = "NETWEIGHT".substr(0, maxFieldLength);
        } else {
          minLengthMap[column] = column.length < maxFieldLength ? column.length : maxFieldLength;
        }        
      }
    }

    for (var i in dataRows) {
      var data = dataRows[i];
      for (var column of columns) {
        if (column === "sNo") {
          minLengthMap[column] = i?.length > minLengthMap[column] ? i.length : minLengthMap[column];
        }else if (column.indexOf("WeightUser") > -1) {
          minLengthMap[column] = data[column]?.fullname.length > minLengthMap[column] ? data[column]?.fullname.length : minLengthMap[column];
        } else {
          minLengthMap[column] = data[column]?.length > minLengthMap[column] ? data[column]?.length : minLengthMap[column];
        }
      }
    }

    for (var key of Object.keys(minLengthMap)) {
      minLengthMap[key] = (minLengthMap[key] + defaultAddedLength) > maxFieldLength ? maxFieldLength : (minLengthMap[key] + defaultAddedLength);
    }

    return minLengthMap;
  }

  //Deprecated against getRawTextForFilePrinting
  //getRawReportTextArray(dataRows: Array<any>, columns: Array<string>, fieldLength) {
  //  var resArray = [];
  //  var mText = "python print.py R \"";
  //  for (var column of columns) {
  //    if (column !== "action") {
  //      if (column.toLocaleUpperCase().length <= fieldLength) {
  //        mText = mText + column + " ".repeat(fieldLength - column.length);
  //      } else {
  //        mText = `${mText} ${column.toLocaleUpperCase().substr(0, fieldLength)}<`;
  //      }
  //    }
  //  }
  //  mText = `${mText}\"`;
  //  mText = `${mText} newline `;
  //  resArray.push(mText);    

  //  for (var i in dataRows) {
  //    mText = `python print.py R \"`;
  //    var data = dataRows[i];
  //    for (var column of columns) {
  //      if (column === "sNo") {
  //        mText = `${mText} ${i + 1}`;
  //      } else if (column.indexOf("WeightUser") > -1) {
  //        var temp = `${data[column]?.fullname?.substr(0, fieldLength) ?
  //          data[column]?.fullname?.substr(0, fieldLength) : ""}`;
  //        if (temp.length < fieldLength) {
  //          temp = " ".repeat(fieldLength - temp.length);
  //        }
  //        mText = mText + temp;
  //      } else if (column === "action") { } else {
  //        var temp = `${data[column]?.toString().substr(0, fieldLength) ? data[column]?.toString().substr(0, fieldLength) : ""}`;
  //        if (temp.length < fieldLength) {
  //          temp = " ".repeat(fieldLength - temp.length) + temp;
  //        }
  //        mText = mText + temp;
  //      }
  //    }
  //    mText = `${mText}\"`;
  //    mText = `${mText} newline`;
  //    resArray.push(mText);
  //  }
  //  return resArray;
  //}

  ////Deprecated against getRawTextForFilePrinting
  //getRawReportText(dataRows: Array<any>, columns: Array<string>, fieldLength) {
  //  var mText = " R \"";
  //  for (var column of columns) {
  //    if (column !== "action") {
  //      if (column.toLocaleUpperCase().length <= fieldLength) {
  //        mText = mText + column + " ".repeat(fieldLength - column.length);
  //      } else {
  //        mText = `${mText} ${column.toLocaleUpperCase().substr(0, fieldLength)}<`;
  //      }        
  //    }
  //  }
  //  mText = `${mText}\"`;
  //  mText = `${mText} newline `;

  //  for (var i in dataRows) {
  //    mText = `${mText} R \"`;
  //    var data = dataRows[i];
  //    for (var column of columns) {
  //      if (column === "sNo") {
  //        mText = `${mText} ${i + 1}`;
  //      } else if (column.indexOf("WeightUser") > -1) {
  //        var temp = `${data[column]?.fullname?.substr(0, fieldLength) ?
  //          data[column]?.fullname?.substr(0, fieldLength) : ""}`;
  //        if (temp.length < fieldLength) {
  //          temp = " ".repeat(fieldLength - temp.length);
  //        }
  //        mText = mText + temp;
  //      } else if (column === "action") { } else {
  //        var temp = `${data[column]?.toString().substr(0, fieldLength) ? data[column]?.toString().substr(0, fieldLength) : ""}`;
  //        if (temp.length < fieldLength) {
  //          temp = " ".repeat(fieldLength - temp.length) + temp;
  //        }
  //        mText = mText + temp;
  //      }        
  //    }
  //    mText = `${mText}\"`;
  //    mText = `${mText} newline`;
  //  }
  //  return `python print.py ${mText}`;
  //}

}
