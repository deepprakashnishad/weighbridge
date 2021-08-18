const ticketPredefinedFields = [
  { displayName: "Transporter Code", field: "transporterCode" },
  { displayName: "Transporter Name", field: "transporterName" },
  { displayName: "Scroll No", field: "scrollNo" },
  { displayName: "Rst No", field: "rstNo" },
  { displayName: "Vehicle No", field: "vehicleNo" },
  { displayName: "Request Id", field: "reqId" },
  { displayName: "status", field: "status" },
  { displayName: "Gate Pass No.", field: "gatePassNo" },
  { displayName: "PO Details", field: "poDetails" },
  { displayName: "Created At", field: "createdAt" },
  { displayName: "Duration", field: "duration" },
  { displayName: "Inbound/Outbound", field: "weighmentType" },
  { displayName: "Weighment Details", field: 'weighmentDetails' },
  { displayName: "Weighslip No", field: "weighDetails_id" },
  { displayName: "Material", field: "weighDetails_material" },
  { displayName: "Supplier", field: "weighDetails_supplier" },
  { displayName: "Wt1(KG)", field: "weighDetails_firstWeight" },
  { displayName: "In Date/Time", field: "weighDetails_firstWeightDatetime" },
  { displayName: "Wt2(KG)", field: "weighDetails_secondWeight" },
  { displayName: "Out Date/Time", field: "weighDetails_secondWeightDatetime" },
  { displayName: "Net Wt(KG)", field: "weighDetails_netWeight" },
]

const weighmentDetailColumnFields = [
  { displayName: "Material", field: "material" },
  { displayName: "Supplier", field: "supplier" },
  { displayName: "First Weight", field: "firstWeight" },
  { displayName: "First Unit", field: "firstUnit" },
  { displayName: "First Wt Datetime", field: "firstWeightDatetime" },
  { displayName: "Second Wt", field: "secondWeight" },
  { displayName: "Second Unit", field: "secondUnit" },
  { displayName: "Second Wt Datetime", field: "secondWeightDatetime" },
  { displayName: "Remark", field: "remark" },
  { displayName: "Net Weight", field: "netWeight" },
]

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

  static fromJSON(result, isSeparateReqd) {
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

  static generateFreeTextRecords(fields: Array<TicketField>) {
    var freeTextRecords = [];
    for (var i = 0; i < ticketPredefinedFields.length; i++) {
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
    var ticketFields = [];
    ticketPredefinedFields.forEach(ele => {
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

  static generateColumnFieldRecords() {
    var ticketFields = [];
    weighmentDetailColumnFields.forEach(ele => {
      var field = new TicketField();
      field.displayName = ele['displayName'];
      field.field = ele['field'];
      field.type = "weighment_detail"
      field.font = "R";
      field.isIncluded = false;
      ticketFields.push(field);
    });
    return ticketFields;
  }

}


//export class Ticket{
//    gatePassNo: string;
//    poDetails: string;
//    currentDateTime: string;
//    date1: Date;
//    date2: Date;
//    duration: number;
//    ticketType: string;
//    invoiceDateTime: Date;
//    netWeight: number;
//    totalPrint: number;
//    invoicePrint: string;
//    weighingPrint: string;
//}
