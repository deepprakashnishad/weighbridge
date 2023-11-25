const ticketPredefinedFields = [
  { displayName: "Transporter Code", field: "transporterCode" },
  { displayName: "Transporter Name", field: "transporterName" },
  { displayName: "Scroll No", field: "scrollNo" },
  { displayName: "Scroll Date", field: "scrollDate" },
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
  { displayName: "Wt1 Operator", field: "weighDetails_firstWeightUser" },
  { displayName: "Wt2 Operator", field: "weighDetails_secondWeightUser" },
  { displayName: "Customer", field: "weighDetails_customer" },
  { displayName: "Misc", field: "misc" },
]

const predefinedImageFields = [
  { displayName: "Image 1", field: "img1" },
  { displayName: "Image 2", field: "img2" },
]

const weighmentDetailColumnFields = [
  { displayName: "SNo", field: "sNo" },
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
  { displayName: "Customer", field: "customer" },
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

  static generateImageFields(predefinedFields: Array<TicketField> = []) {
    var imageFields = [];
    predefinedImageFields.forEach(ele => {
      var field = new TicketField();
      var found = false;
      for (var preEle of predefinedFields) {
        if (preEle.field === ele.field) {
          field.id = preEle.id;
          field.displayName = preEle.displayName;
          field.field = preEle.field;
          field.type = preEle.type
          field.font = preEle.font;
          field.col = preEle.col;
          field.row = preEle.row;
          field.isIncluded = preEle.isIncluded;
          imageFields.push(field);
          found = true;
        }
      }
      if (!found) {
        field.displayName = ele['displayName'];
        field.field = ele['field'];
        field.type = "image-field"
        field.font = "R";
        field.isIncluded = false;
        imageFields.push(field);
      }

    });
    return imageFields;
  }

  static generateNewlineTicketField() {
    var newlineField = new TicketField();
    newlineField.col = 3;
    newlineField.displayName = "Newline";
    newlineField.field = "newline";
    newlineField.row = 32767;
    newlineField.isIncluded = true;
    newlineField.type = "newline";
    return newlineField;
  }

  static generateReverseFeedTicketField() {
    var reverseFeedField = new TicketField();
    reverseFeedField.col = 7;
    reverseFeedField.displayName = "Reverse Feed";
    reverseFeedField.field = "reverseFeed";
    reverseFeedField.row = -1;
    reverseFeedField.isIncluded = true;
    reverseFeedField.type = "reverseFeed";
    return reverseFeedField;
  }

  static fromJSON(result, isSeparateReqd) {
    var ticketFields = [];
    var freetextFields = [];
    var weighDetailFields = [];
    var imageFields = [];
    var newLineField;
    var reverseFeedField;
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
        } else if (temp.type === "freetext") {
          freetextFields.push(temp);
        } else if (temp.type === "newline") {
          newLineField = temp;
        } else if (temp.type === "reverseFeed") {
          reverseFeedField = temp;
        } else if (temp.type === "image-field") {
          imageFields.push(temp);
        }
      } else {
        ticketFields.push(temp);
      }
    }
    if (isSeparateReqd) {
      return {
        "ticketFields": ticketFields,
        "freetextFields": freetextFields,
        "weighDetailFields": weighDetailFields,
        "newlineField": newLineField,
        "reverseFeedField": reverseFeedField,
        "imageFields": imageFields
      };
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

  static generateTicketFields(predefinedFields: Array<TicketField> = []) {
    var ticketFields = [];
    ticketPredefinedFields.forEach(ele => {
      var field = new TicketField();
      var found = false;
      for (var preEle of predefinedFields) {
        if (preEle.field === ele.field) {
          field.id = preEle.id;
          field.displayName = preEle.displayName;
          field.field = preEle.field;
          field.type = preEle.type
          field.font = preEle.font;
          field.col = preEle.col;
          field.row = preEle.row;
          field.isIncluded = preEle.isIncluded;
          ticketFields.push(field);
          found = true;
        }        
      }
      if (!found) {
        field.displayName = ele['displayName'];
        field.field = ele['field'];
        field.type = "ticket-field"
        field.font = "R";
        field.isIncluded = false;
        ticketFields.push(field);
      }
      
    });
    return ticketFields;
  }

  static generateColumnFieldRecords(predefinedFields: Array<TicketField> = []) {
    var ticketFields = [];
    weighmentDetailColumnFields.forEach(ele => {
      var field = new TicketField();
      var found = false;
      for (var preEle of predefinedFields) {
        if (preEle.field === ele.field) {
          field.id = preEle.id;
          field.displayName = preEle.displayName;
          field.field = preEle.field;
          field.type = preEle.type
          field.col = preEle.col;
          field.row = preEle.row;
          field.font = preEle.font;
          field.isIncluded = preEle.isIncluded;
          ticketFields.push(field);
          found = true;
        }
      }
      if (!found) {
        field.displayName = ele['displayName'];
        field.field = ele['field'];
        field.type = "weighment_detail"
        field.font = "R";
        field.isIncluded = false;
        ticketFields.push(field);
      }
    });
    return ticketFields;
  }

}
