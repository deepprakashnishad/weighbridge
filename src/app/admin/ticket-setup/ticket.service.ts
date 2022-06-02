import { Injectable } from "@angular/core";
import { TicketField } from "./ticket";

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  getSortedFields(data) {
    var result = this.fromJSON(data, true);
    return this.getCurrentFieldData(
      result['ticketFields'],
      result['freetextFields'],
      result['weighDetailFields'],
    )
  }

  fromJSON(result, isSeparateReqd) {
    var ticketFields = [];
    var freetextFields = [];
    var weighDetailFields = [];
    for (var i = 0; i < result.length; i++) {
      var temp: TicketField = new TicketField();
      temp.col = result[i]['col'];
      temp.row = result[i]['row'];
      temp.id = result[i]['id'];
      temp.templateId = result[i]['templateId'];
      temp.displayName = result[i]['displayName'];
      temp.field = result[i]['field'];
      temp.font = result[i]['font'];
      temp.isIncluded = result[i]['isIncluded'];
      temp.type = result[i]['type'];
      if (isSeparateReqd) {
        if (temp.type === "ticket-field") {
          ticketFields.push(temp);
        } else if (temp.type === "weighment_detail") {
          weighDetailFields.push(temp);
        } else {
          freetextFields.push(temp);
        }
      } else {
        ticketFields.push(temp);
      }
    }
    if (isSeparateReqd) {
      return { "ticketFields": ticketFields, "freetextFields": freetextFields, "weighDetailFields": weighDetailFields };
    } else {
      return ticketFields;
    }
  }

  getCurrentFieldData(
    ticketFields: Array<TicketField>,
    textFields: Array<TicketField>,
    wdFields: Array<TicketField>,
  ) {
    var result = [];
    for (var i = 0; i < ticketFields.length; i++) {
      var temp = ticketFields[i];
      if (temp.col !== null && temp.row !== null && temp.isIncluded) {
        result.push(temp);
      }
    }
    for (var i = 0; i < textFields.length; i++) {
      var temp = textFields[i];
      if (temp.displayName?.length > 0 && temp.col !== null && temp.row !== null && temp.isIncluded) {
        result.push(temp);
      }
    }
    if (this.includeWeighmentTableField(ticketFields)) {
      for (var i = 0; i < wdFields.length; i++) {
        var temp = wdFields[i];
        if (temp.displayName?.length > 0 && temp.col !== null && temp.isIncluded) {
          result.push(temp);
        }
      }
    }

    result = result.sort(function (a, b) {
      if (a['row']===null || b['row']===null || ((a['row'] - b['row']) === 0)) {
        return a['col'] - b['col'];
      }
      return a['row'] - b['row'];
    })
    return result;
  }

  includeWeighmentTableField(ticketFields) {
    for (var i in ticketFields) {
      if (ticketFields[i]['field'] === "weighmentDetails") {
        return ticketFields[i]['isIncluded'];
      }
    }
    return false;
  }
}
