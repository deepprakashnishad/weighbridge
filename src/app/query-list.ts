export class QueryList{

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
}
