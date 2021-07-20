const freeTextFieldCnt = 10;


export class Ticket{
    gatePassNo: string;
    poDetails: string;
    currentDateTime: string;
    date1: Date;
    date2: Date;
    duration: number;
    ticketType: string;
    invoiceDateTime: Date;
    netWeight: number;
    totalPrint: number;
    invoicePrint: string;
    weighingPrint: string;
}

export class TicketField {
  id: number;
  templateId: number;
  field: string;
  displayName: string
  row: number;
  col: number;
  isIncluded: boolean;
  font: string;
  type: string;

  constructor() { }

  static fromJSON(result) {
    var ticketFields = [];

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
      ticketFields.push(temp);
      //if (temp.type === "ticket-field") {
      //  ticketFields.push(temp);
      //} else {
      //  freetextFields.push(temp);
      //}
    }

    return ticketFields;
  }

  static generateFreeTextRecords(fields: Array<TicketField>) {
    var freeTextRecords = [];
    for (var i = 0; i < freeTextFieldCnt; i++) {
      if (i < fields.length) {
        freeTextRecords.push(fields[i]);
      } else {
        var field = new TicketField();
        field.font = "R"
        field.type = "freetext";
        field.isIncluded = false;
        freeTextRecords.push(field);
      }
    }
    return freeTextRecords;
  }

  static generateTicketFields() {
    var fields = [
      { displayName: "Gate Pass No.", field: "gatePassNo" },
      { displayName: "PO Details", field: "poDetails" },
      { displayName: "Current date", field: "currentDate" },
      { displayName: "Current time", field: "currentTime" },
      { displayName: "Date1", field: "date1" },
      { displayName: "Date2", field: "date2" },
      { displayName: "Duration", field: "duration" },
      { displayName: "Inbound/Outbound", field: "weighmentType" },
      { displayName: "Invoice date", field: "invoiceDate" },
      { displayName: "Net weight", field: "invoiceTime" },
    ]
    var ticketFields = [];
    fields.forEach(ele => {
      var field = new TicketField();
      field.displayName = ele['displayName'];
      field.field = ele['field'];
      field.type = "ticket-field"
      field.font = "R";
      field.isIncluded = false;
      ticketFields.push(field);
    });
    return ticketFields;
  }

}
