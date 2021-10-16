import { Injectable } from "@angular/core";
import { MyDbService } from "../my-db.service";

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private dbService: MyDbService
  ) {

  }

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

  private getMinLengthFieldArray(dataRows: Array<any>, columns: Array<string>, newHeaderColumns: Array<string>, maxFieldLength: number) {
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

  async getWeighmentReport(sql) {
    var result = await this.dbService.executeSyncDBStmt("SELECT", sql);
    return this.processResultWithFinalWeight(result);
  }

  async getHTMLReport(sql) {
    var reportData = await this.getWeighmentReport(sql);

    var htmlContent = `<style>
                          * {
                          font-family: sans-serif;
                      }

                    /* table wrapper for continuous border */
                    .table {
                      width: 100%;
                      border: solid 1px rgb(221, 221, 221);
                      border-radius: 4px;
                      overflow: auto;
                      text-align: left;
                    }

                    /* table border */
                    .table table {
                      width: 100%;
                      border-collapse: collapse; /* removes gap between cells */
                    }

                    .table thead th {
                      font-weight: bold;
                      background-color: rgb(245, 245, 245);
                      border-bottom: solid 1px rgb(221, 221, 221);
                    }

                    /* cell padding */
                    .table th, td, .header {
                      padding: 10px;
                      text-align: center;
                    }

                    /* add row hover */
                    .table tr: hover td {
                      background-color: rgb(245, 245, 245);
                    }

                    /* create 1px gap in table for line */
                    .table tr.line-break td {
                      position: relative;
                      top: 1px;
                    }

                    /* create the line */
                    .table tr.line-break td: after {
                      content: '';
                      position: absolute;
                      top: -1px;
                      left: 0px;
                      height: 1px;
                      width: 100%;
                      background-color: rgb(235, 235, 235);
                    }

                    /* reduce width of line for first and last cells, by cell padding amount */
                    .table tr.line-break td: first-child: after,
                    .table tr.line-break td: last-child: after {
                      width: calc(100% - 10px);
                    }

                    /* pull line on first cell to the right */
                    .table tr.line-break td: first-child: after {
                      right: 0px;
                      left: auto;
                    }

                    </style>`;
    htmlContent = `${htmlContent}<div class='header'>`;
    if (sessionStorage.getItem("report_header_1")) {
      htmlContent = `${htmlContent}<h3>${sessionStorage.getItem("report_header_1")}</h3>`;
    }
    if (sessionStorage.getItem("report_header_2")) {
      htmlContent = `${htmlContent}<h3>${sessionStorage.getItem("report_header_2")}</h3>`;
    }

    if (sessionStorage.getItem("report_print_current_date")) {
      var currentdate = new Date();
      var currDate = `${currentdate.getMonth() + 1}/${currentdate.getDate() - 1}/${currentdate.getFullYear()}`;
      htmlContent = `${htmlContent}<h3>${currDate}</h3>`;
    }
    htmlContent = `${htmlContent}</div>`;
    htmlContent = `${htmlContent}<div class='table'>`;
    htmlContent = `${htmlContent}<table>`;
    htmlContent = `${htmlContent}<tr>
                    <th>Rst No</th>
                    <th>Vehicle No</th>
                    <th>WT1</th>
                    <th>Datetime1</th>
                    <th>WT2</th>
                    <th>Datetime2</th>
                    <th>Net Weight</th>
                    </tr>`;
    console.log(reportData);
    for (var data of reportData) {
      htmlContent = `${htmlContent}<tr>\
                    <td>${data['rstNo']}</td>\
                    <td>${data['vehicleNo']}</td>\
                    <td>${data['firstWeight']}</td>\
                    <td>${data['firstWeightDatetime']}</td>\
                    <td>${data['secondWeight']}</td>\
                    <td>${data['secondWeightDatetime']}</td>\
                    <td>${data['netWeight']}</td>\
                    </tr>`
    }
    htmlContent = `${htmlContent}</table>`;
    htmlContent = `${htmlContent}</div>`;
    return htmlContent;
  }

  private processResultWithFinalWeight(dataRows) {
    var finalResults = [];
    for (var i = 0; i < dataRows.length;) {
      var tempArr = [];
      for (var j = i; j < dataRows.length;) {
        if (tempArr.length === 0 || tempArr[0]?.rstNo === dataRows[j].rstNo) {
          tempArr.push(dataRows[j]);
          i++; j++;
        } else {
          break;
        }
      }
      finalResults.push(this.getFormattedFinalWeighment(tempArr));
    }
    
    return finalResults;
  }

  private getFormattedFinalWeighment(rows) {
    var data = {};
    data['rstNo'] = rows[0]['rstNo'];
    data['vehicleNo'] = rows[0]['vehicleNo'];
    data['reqId'] = rows[0]['reqId'];
    data['weighmentType'] = rows[0]['weighmentType'];
    data['gatePassNo'] = rows[0]['gatePassNo'];
    data['poDetails'] = rows[0]['poDetails'];
    data['transporterCode'] = rows[0]['transporterCode'];
    data['transporterName'] = rows[0]['transporterName'];
    data['status'] = rows[0]['status'];
    data['createdAt'] = rows[0]['createdAt'];
    data['scrollNo'] = rows[0]['scrollNo'];
    data['scrollDate'] = rows[0]['scrollDate'];
    data['syncFlag'] = rows[0]['syncFlag'];

    data['firstWeight'] = rows[0]['firstWeight'];
    data['firstWeightDatetime'] = rows[0]['firstWeightDatetime'];
    data['secondWeight'] = rows[rows.length - 1]['secondWeight'];
    data['firstWeightDatetime'] = rows[rows.length - 1]['secondWeightDatetime'];
    data['netWeight'] = Math.abs(rows[0]['secondWeight'] - rows[rows.length - 1]['firstWeight']);
    return data;
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
