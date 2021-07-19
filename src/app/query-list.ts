export class QueryList{

  //Weighment
  static readonly INSERT_WEIGHMENT: string = "INSERT INTO weighment(rstNo, vehicleNo, reqId, gatePassNo, weighmentType, poDetails, transporterCode, transporterName, status, createdAt) VALUES({rstNo}, '{vehicleNo}', {reqId}, {gatePassNo}, '{weighmentType}', '{poDetails}', {transporterCode}, '{transporterName}', '{status}', GETDATE());";
  static readonly INSERT_WEIGHMENT_DETAIL: string = "INSERT INTO weighment_details(id, weighmentRstNo, material, supplier, firstWeighBridge, firstWeight, firstUnit, firstWeightDatetime, firstWeightUser, secondWeighBridge, secondWeight, secondUnit, secondWeightDatetime, secondWeightUser, remark, netWeight) VALUES({id}, {weighmentRstNo}, '{material}', '{supplier}', '{firstWeighBridge}', {firstWeight}, '{firstUnit}', {firstWeightDatetime}, {firstWeightUser}, {secondWeighBridge}, {secondWeight}, '{secondUnit}', {secondWeightDatetime}, {secondWeightUser}, '{remark}', {netWeight})";
  static readonly INSERT_FIRST_WEIGHMENT_DETAIL: string = "INSERT INTO weighment_details(id, weighmentRstNo, material, supplier, firstWeighBridge, firstWeight, firstUnit, firstWeightDatetime, firstWeightUser, remark) VALUES({id}, {weighmentRstNo}, '{material}', '{supplier}', '{firstWeighBridge}', {firstWeight}, '{firstUnit}', GETDATE(), {firstWeightUser}, '{remark}')";
  static readonly UPDATE_SECOND_WEIGHMENT_DETAIL: string = "UPDATE weighment_details SET material='{material}', supplier='{supplier}', secondWeighBridge='{secondWeighBridge}', secondWeight={secondWeight}, secondUnit='{secondUnit}', secondWeightDatetime=GETDATE(), secondWeightUser={secondWeightUser}, remark='{remark}', netWeight={netWeight} WHERE id={id}";

  static readonly GET_WEIGHMENTS = "SELECT * FROM weighment WHERE ";
  static readonly GET_WEIGHMENT_DETAILS = "SELECT * FROM weighment_details WHERE weighmentRstNo={rstNo}";
  // Weighbridges
  static readonly GET_WEIGHBRIDGES: string = "Select * from weighbridge";
    
  //Tags
  static readonly INSERT_TAG: string = "INSERT INTO tag(tagType, value) VALUES('{tagType}', '{value}')";
  static readonly GET_ALL_TAGS: string = "SELECT * FROM tag";
  static readonly GET_TAGS_BY_TYPE: string = "SELECT * FROM tag WHERE tagType={tagType}";

  //SearchFields
  static readonly INSERT_SEARCH_FIELD: string = "INSERT INTO search_field(id, displayName, entryMode, inOutMode, mValues) VALUES({id}, '{displayName}', '{entryMode}', '{inOutMode}', '{mValues}'); SELECT SCOPE_IDENTITY() as id";
  //static readonly UPDATE_SEARCH_FIELD: string = "UPDATE search_field(displayName, entryMode, inOutMode, mValues) SET VALUES('{displayName}', '{entryMode}', '{inOutMode}', '{mValues}') WHERE id={id}";
  static readonly UPDATE_SEARCH_FIELD: string = "UPDATE search_field  SET displayName='{displayName}', entryMode='{entryMode}', inOutMode='{inOutMode}', mValues='{mValues}' WHERE id={id}";
  static readonly DELETE_SEARCH_FIELD: string = "DELETE search_field where id={id}";
  static readonly GET_ALL_SEARCH_FIELD: string = "SELECT * FROM search_field";

  //Weigh Strings
  static readonly INSERT_WEIGH_STRING: string = "INSERT INTO weighstring (stringName, totalChars, variableLength, type, pollingCommand, baudRate, dataBits, stopBits, parity, flowControl, weightCharPosition1, weightCharPosition2, weightCharPosition3, weightCharPosition4, weightCharPosition5, weightCharPosition6, startChar1, startChar2, startChar3, startChar4, endChar1, endChar2, endChar3, signCharPosition, negativeSignValue) VALUES ('{stringName}', {totalChars}, {variableLength}, '{type}', '{pollingCommand}', '{baudRate}', {dataBits}, {stopBits}, '{parity}', '{flowControl}', {weightCharPosition1}, {weightCharPosition2}, {weightCharPosition3}, {weightCharPosition4}, {weightCharPosition5}, {weightCharPosition6}, '{startChar1}', '{startChar2}', '{startChar3}', '{startChar4}', '{endChar1}', '{endChar2}', '{endChar3}', {signCharPosition}, '{negativeSignValue}')";
  static readonly GET_WEIGH_STRINGS: string = "SELECT * FROM weighstring";

  //Weigh Indicators
  static readonly INSERT_WEIGH_INDICATOR: string = "INSERT INTO weighindicator(weighstring, port, status, measuringUnit, decimalPoint, type, httpType, comPort, wiName, ipAddress) VALUES('{weighstring}', {port}, '{status}', '{measuringUnit}', {decimalPoint}, '{type}', '{httpType}', '{comPort}', '{wiName}', '{ipAddress}')"
  static readonly GET_WEIGH_INDICATOR: string = "SELECT * FROM weighindicator";

  //Ticket Templates
  static readonly INSERT_TICKET_TEMPLATE: string = "INSERT INTO ticket_template(id, name, applicableTo, printerType, defaultPrinter, labelLength, copiesPerPrint, alignment, width, font, fontSize, operatingType) VALUES({id}, '{name}', '{applicableTo}', '{printerType}', '{defaultPrinter}', {labelLength}, {copiesPerPrint}, '{alignment}', {width}, '{font}', {fontSize}, '{operatingType}')";
  static readonly UPDATE_TICKET_TEMPLATE: string = "UPDATE ticket_template SET id={id}, name='{name}', applicableTo='{applicableTo}', printerType='{printerType}', defaultPrinter='{defaultPrinter}', labelLength={labelLength}, copiesPerPrint={copiesPerPrint}, alignment='{alignment}', width={width}, font='{font}', fontSize={fontSize}, operatingType='{operatingType}'";
  static readonly GET_ALL_TICKET_TEMPLATE: string = "SELECT * FROM ticket_template";

  //Ticket Field
  static readonly INSERT_TICKET_FIELD: string = "INSERT INTO template_detail(id, templateId, field, type, displayName, row, col, isIncluded, font) VALUES({id}, {templateId}, '{field}', '{type}', '{diplayName}', {row}, {col}, {isIncluded}, '{font}')";
  static readonly GET_TICKET_FIELDS: string = "SELECT * FROM template_detail WHERE templateId={templateId}";
  static readonly UPDATE_TICKET_FIELD: string = "UPDATE template_detail SET templateId={templateId}, field='{field}', type='{type}', displayName='{displayName}', row={row}, col={col}, isIncluded={isIncluded}, font='{font}' WHERE id={id}";
  static readonly DELETE_TICKET_FIELD: string = "DELETE FROM template_detail WHERE id={id}";
}
