module.exports = Object.freeze({
  seed: {
    app_user: [{
      "id": 1,
      "username": "admin",
      "fullname": "Administrator",
      "role": "Admin",
      "password": "Admin123",
      "status": "Active"
    }, {
      "id": 2,
      "username": "test",
      "fullname": "Test User",
      "role": "Operator",
      "password": "Test123",
      "status": "Active"
    }
    ],
    permission: [
      { id: 1, permission: "Weighment" },
      { id: 2, permission: "System setup" },
      { id: 3, permission: "Ticket Setup" },
      { id: 4, permission: "Vehicle Setup" },
      { id: 5, permission: "Backup" },
      { id: 6, permission: "Data edit after complete weighment" },
      { id: 7, permission: "Theft detection report" },
      { id: 8, permission: "Reports" },
      { id: 9, permission: "Code and list entries" },
      { id: 10, permission: "User Management" },
      { id: 11, permission: "Change Password" },
      { id: 12, permission: "Partial Weighment" },
      { id: 13, permission: "Theft Detection Setup" },
    ],
    user_permission: [
      { userid: 1, permissionid: 1},
      { userid: 1, permissionid: 2},
      { userid: 1, permissionid: 3},
      { userid: 1, permissionid: 4},
      { userid: 1, permissionid: 5},
      { userid: 1, permissionid: 6},
      { userid: 1, permissionid: 7},
      { userid: 1, permissionid: 8},
      { userid: 1, permissionid: 9},
      { userid: 1, permissionid: 10},
      { userid: 1, permissionid: 11},
      { userid: 1, permissionid: 12},
      { userid: 1, permissionid: 13},
      { userid: 2, permissionid: 1},
      { userid: 2, permissionid: 2},
      { userid: 2, permissionid: 3},
    ],
    ticket_template: [
      {
        id: 1,
        name: "GENERIC",
        applicableTo: "GENERIC",
        printerType: "DOT-MATRIX",
        labelLength: 200,
        copiesPerPrint: 1,
        alignment: 'Horizontal',
        width: 200,
        font: "Arial",
        fontSize: 10,
        defaultPrinter: null,
        operatingType: null
      }
    ],
    template_detail: [
      { id: 1, templateId: 1, field: "transporterCode", type: "ticket-field", displayName: 'Tranporter Code', row: null, col: null, isIncluded: 0, font: "R" },
      {
        id: 2, templateId: 1, field: "transporterName", type: "ticket-field", displayName: 'Transporter Name', row: 6, col: 2, isIncluded: 1, font: "R"
      },
      {
        id: 3, templateId: 1, field: "scrollNo", type: "ticket-field", displayName: 'Scroll No', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 4, templateId: 1, field: "rstNo", type: "ticket-field", displayName: 'Rst No', row: 4, col: 2, isIncluded: 1, font: "R"
      },
      {
        id: 5, templateId: 1, field: "vehicleNo", type: "ticket-field", displayName: 'Vehicle No', row: 5, col: 2, isIncluded: 1, font: "R"
      },
      {
        id: 6, templateId: 1, field: "reqId", type: "ticket-field", displayName: 'Request Id', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 7, templateId: 1, field: "status", type: "ticket-field", displayName: 'status', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 8, templateId: 1, field: "gatePassNo", type: "ticket-field", displayName: 'Gate Pass No.', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 9, templateId: 1, field: "poDetails", type: "ticket-field", displayName: 'PO Details', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 10, templateId: 1, field: "createdAt", type: "ticket-field", displayName: 'Created At', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 11, templateId: 1, field: "duration", type: "ticket-field", displayName: 'Duration', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 12, templateId: 1, field: "weighmentType", type: "ticket-field", displayName: 'Inbound / Outbound', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 13, templateId: 1, field: "weighmentDetails", type: "ticket-field", displayName: 'Weighment Details', row: 9, col: 2, isIncluded: 1, font: "R"
      },
      {
        id: 14, templateId: 1, field: "weighDetails_id", type: "ticket-field", displayName: 'Weighslip No', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 15, templateId: 1, field: "weighDetails_material", type: "ticket-field", displayName: 'Material', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 16, templateId: 1, field: "weighDetails_supplier", type: "ticket-field", displayName: 'Supplier', row: 5, col: 60, isIncluded: 1, font: "R"
      },
      {
        id: 17, templateId: 1, field: "weighDetails_firstWeight", type: "ticket-field", displayName: 'Wt1(KG)', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 18, templateId: 1, field: "weighDetails_firstWeightDatetime", type: "ticket-field", displayName: 'In Date / Time', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 19, templateId: 1, field: "weighDetails_secondWeight", type: "ticket-field", displayName: 'Wt2(KG)', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 20, templateId: 1, field: "weighDetails_secondWeightDatetime", type: "ticket-field", displayName: 'Out Date / Time', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 21, templateId: 1, field: "weighDetails_netWeight", type: "ticket-field", displayName: 'Net Wt(KG)', row: null, col: null, isIncluded: 1, font: "R"
      },
      {
        id: 22, templateId: 1, field: null, type: "freetext", displayName: 'BHARAT FORGE LIMITED', row: 1, col: 20, isIncluded: 1, font:	"DB"
      },
      {
        id: 23, templateId: 1, field: null, type: "freetext", displayName: 'MUNDHWA, PUNE 411036', row: 2, col: 20, isIncluded: 1, font: "DB"
      },
      { id: 24, templateId: 1, field: null, type: "freetext", displayName: '---------------------------------------------------------------', row: 3, col: 1, isIncluded: 1, font: "R" }
    ],
    weighstring: [
      {
        stringName: "Avery8",
        totalChars: 19,
        variableLength: 0,
        type: "continuous",
        pollingCommand: null,
        baudRate: 1200,
        dataBits: 7,
        stopBits: 1,
        parity: "even",
        flowControl: "None",
        weightCharPosition1: 5,
        weightCharPosition2: 6,
        weightCharPosition3: 7,
        weightCharPosition4: 8,
        weightCharPosition5: 9,
        weightCharPosition6: null,
        startChar1: 2,
        startChar2: null,
        startChar3: null,
        startChar4: null,
        endChar1: 3,
        endChar2: "D",
        endChar3: "A",
        signCharPosition: 4,
        negativeSignValue: "-"
      },
      {
        stringName: "Avery7",
        totalChars: 19,
        variableLength: 0,
        type: "continuous",
        pollingCommand: null,
        baudRate: 2400,
        dataBits: 7,
        stopBits: 1,
        parity: "even",
        flowControl: "None",
        weightCharPosition1: 5,
        weightCharPosition2: 6,
        weightCharPosition3: 7,
        weightCharPosition4: 8,
        weightCharPosition5: 9,
        weightCharPosition6: null,
        startChar1: 2,
        startChar2: null,
        startChar3: null,
        startChar4: null,
        endChar1: 3,
        endChar2: "D",
        endChar3: "A",
        signCharPosition: 4,
        negativeSignValue: "-"
      },
      {
        stringName: "UNP",
        totalChars: 13,
        variableLength: 0,
        type: "continuous",
        pollingCommand: null,
        baudRate: 2400,
        dataBits: 8,
        stopBits: 1,
        parity: "None",
        flowControl: "None",
        weightCharPosition1: 3,
        weightCharPosition2: 4,
        weightCharPosition3: 5,
        weightCharPosition4: 6,
        weightCharPosition5: 7,
        weightCharPosition6: null,
        startChar1: 2,
        startChar2: null,
        startChar3: null,
        startChar4: null,
        endChar1: 3,
        endChar2: "D",
        endChar3: "A",
        signCharPosition: 2,
        negativeSignValue: "-"
      },
      {
        stringName: "String15",
        totalChars: 11,
        variableLength: 0,
        type: "continuous",
        pollingCommand: null,
        baudRate: 2400,
        dataBits: 8,
        stopBits: 1,
        parity: "None",
        flowControl: "None",
        weightCharPosition1: 2,
        weightCharPosition2: 3,
        weightCharPosition3: 4,
        weightCharPosition4: 5,
        weightCharPosition5: 6,
        weightCharPosition6: 7,
        startChar1: 2,
        startChar2: null,
        startChar3: null,
        startChar4: null,
        endChar1: 3,
        endChar2: "D",
        endChar3: "A",
        signCharPosition: 1,
        negativeSignValue: null
      },        
      {
        stringName: "Sartorius MT",
        totalChars: 11,
        variableLength: 0,
        type: "continuous",
        pollingCommand: null,
        baudRate: 9600,
        dataBits: 7,
        stopBits: 1,
        parity: "None",
        flowControl: "None",
        weightCharPosition1: 5,
        weightCharPosition2: 6,
        weightCharPosition3: 7,
        weightCharPosition4: 8,
        weightCharPosition5: 9,
        weightCharPosition6: 10,
        startChar1: 2,
        startChar2: 31,
        startChar3: 42,
        startChar4: 48,
        endChar1: 3,
        endChar2: null,
        endChar3: null,
        signCharPosition: null,
        negativeSignValue: null
      }
    ],
    weighindicator: [{
      id: 1,
      weighstring: "String15",
      port: 8080,
      status: "Active",
      measuringUnit: "KG",
      decimalPoint: 0,
      type: "serial",
      httpType: null,
      comPort: "COM1",
      wiName: "String 15",
      ipAddress: null
    }],
    search_field: [{
      id: 1,
      displayName: "Supplier",
      inOutMode: "GENERIC",
      entryMode: "LIST_SOFT"
    }, {
        id: 2,
        displayName: "Material",
        inOutMode: "GENERIC",
        entryMode: "LIST_SOFT"
    }]
  },

  sqlStmt: {
    app_user: "INSERT INTO app_user(id, fullname, username, password, status, role) VALUES('{id}', '{fullname}', '{username}', '{password}', '{status}', '{role}')",
    permission: "INSERT INTO permission(id, permission) VALUES({id}, '{permission}')",
    user_permission: "INSERT INTO user_permission(userid, permissionid) VALUES({userid}, {permissionid})",
    ticket_template: "INSERT INTO ticket_template(id, name, applicableTo, printerType, defaultPrinter, labelLength, copiesPerPrint, alignment, width, font, fontSize, operatingType) VALUES({id}, '{name}', '{applicableTo}', '{printerType}', '{defaultPrinter}', {labelLength}, {copiesPerPrint}, '{alignment}', {width}, '{font}', {fontSize}, '{operatingType}')",
    template_detail: "INSERT INTO template_detail(id, templateId, field, type, displayName, row, col, isIncluded, font) VALUES({id}, {templateId}, '{field}', '{type}', '{displayName}', {row}, {col}, {isIncluded}, '{font}')",
    weighindicator: "INSERT INTO weighindicator(id, weighstring, port, status, measuringUnit, decimalPoint, type, httpType, comPort, wiName, ipAddress) VALUES({id}, '{weighstring}', {port}, '{status}', '{measuringUnit}', {decimalPoint}, '{type}', '{httpType}', '{comPort}', '{wiName}', '{ipAddress}')",
    weighstring: "INSERT INTO weighstring (stringName, totalChars, variableLength, type, pollingCommand, baudRate, dataBits, stopBits, parity, flowControl, weightCharPosition1, weightCharPosition2, weightCharPosition3, weightCharPosition4, weightCharPosition5, weightCharPosition6, startChar1, startChar2, startChar3, startChar4, endChar1, endChar2, endChar3, signCharPosition, negativeSignValue) VALUES ('{stringName}', {totalChars}, {variableLength}, '{type}', '{pollingCommand}', '{baudRate}', {dataBits}, {stopBits}, '{parity}', '{flowControl}', {weightCharPosition1}, {weightCharPosition2}, {weightCharPosition3}, {weightCharPosition4}, {weightCharPosition5}, {weightCharPosition6}, '{startChar1}', '{startChar2}', '{startChar3}', '{startChar4}', '{endChar1}', '{endChar2}', '{endChar3}', {signCharPosition}, '{negativeSignValue}')",
    search_field: "INSERT INTO search_field(id, displayName, entryMode, inOutMode) VALUES({id}, '{displayName}', '{entryMode}', '{inOutMode}')"
  },

  envStmts: {
    weighString: {
      stmt: "SELECT wi.comPort as comPort, ws.* FROM weighindicator wi, weighstring ws WHERE id={weighIndicatorId} AND wi.weighString=ws.stringName",
      replacementKeys: ["weighIndicatorId"],
      isSingleRecord: true
    }
  }
  
})
