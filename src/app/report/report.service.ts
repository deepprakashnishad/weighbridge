import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  getHtmlReportText(dataRows: Array<any>, columns: Array<string>, fieldLength) {
    var mText = "";
    for (var column of columns) {
      if (column !== "action") {
        mText = `${mText} <td>${column.toLocaleUpperCase().substr(0, fieldLength)}</td>`;
      }
      
    }
    mText = `<tr>${mText}</tr>`;

    for (var i in dataRows) {
      var data = dataRows[i];
      for (var column of columns) {
        if (column === "sNo") {
          mText = `${mText} <td>${i + 1}</td>`;
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

  getRawReportText(dataRows: Array<any>, columns: Array<string>, fieldLength) {
    var mText = "";
    for (var column of columns) {
      if (column !== "action") {
        if (column.toLocaleUpperCase().length <= fieldLength) {
          mText = mText + column + " ".repeat(fieldLength - column.length);
        } else {
          mText = `${mText} <td>${column.toLocaleUpperCase().substr(0, fieldLength)}</td>`;
        }        
      }
    }
    mText = `${mText} newline `;

    for (var i in dataRows) {
      var data = dataRows[i];
      for (var column of columns) {
        if (column === "sNo") {
          mText = `${mText} ${i + 1}`;
        } else if (column.indexOf("WeightUser") > -1) {
          var temp = `${data[column]?.fullname?.substr(0, fieldLength) ?
            data[column]?.fullname?.substr(0, fieldLength) : ""}`;
          if (temp < fieldLength) {
            temp = " ".repeat(fieldLength - temp.length);
          }
          mText = mText + temp;
        } else if (column === "action") { } else {
          var temp = `${data[column]?.toString().substr(0, fieldLength) ? data[column]?.toString().substr(0, fieldLength) : ""}`;
          if (temp < fieldLength) {
            temp = " ".repeat(fieldLength - temp.length);
          }
          mText = mText + temp;
        }        
      }
      mText = `${mText} newline`;
    }
    return mText;
  }
}
