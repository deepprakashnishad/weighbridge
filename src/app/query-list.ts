export class QueryList{

  //Weighment
  static readonly INSERT_WEIGHMENT: string = "INSERT INTO weighment(rstNo, vehicleNo, scrollNo, \
  reqId, gatePassNo, weighmentType, poDetails, transporterCode, transporterName, status, \
  createdAt, scrollDate, reqIdDate, misc) \
  VALUES({rstNo}, '{vehicleNo}', '{scrollNo}', '{reqId}', '{gatePassNo}', '{weighmentType}', \
  '{poDetails}', '{transporterCode}', '{transporterName}', '{status}', GETDATE(), '{scrollDate}', '{reqIdDate}', '{misc}');";
  static readonly UPDATE_WEIGHMENT: string = "UPDATE weighment SET scrollNo='{scrollNo}', reqId='{reqId}', \
        gatePassNo='{gatePassNo}', weighmentType='{weighmentType}', transporterCode='{transporterCode}', vehicleNo='{vehicleNo}', \
        transporterName='{transporterName}', status='{status}', scrollDate='{scrollDate}', reqIdDate='{reqIdDate}', misc='{misc}' WHERE rstNo={rstNo}";
  static readonly DELETE_WEIGHMENT = "DELETE weighment WHERE rstNo='{rstNo}'";
  static readonly UPDATE_WEIGHMENT_STATUS: string = "UPDATE weighment SET status='{status}' WHERE rstNo={rstNo}";
  //Weighment Details
  static readonly INSERT_WEIGHMENT_DETAIL: string = "INSERT INTO weighment_details( \
    id, weighmentRstNo, material, supplier, firstWeighBridge, firstWeight, firstUnit, firstWeightDatetime, firstWeightUser, \
    secondWeighBridge, secondWeight, secondUnit, secondWeightDatetime, secondWeightUser, remark, netWeight, customer, firstWeightImage, secondWeightImage) \
    VALUES({id}, {weighmentRstNo}, '{material}', '{supplier}', '{firstWeighBridge}', {firstWeight}, '{firstUnit}', \
    {firstWeightDatetime}, {firstWeightUser}, {secondWeighBridge}, {secondWeight}, '{secondUnit}', {secondWeightDatetime}, \
    {secondWeightUser}, '{remark}', {netWeight}, '{customer}', '{firstWeightImage}', '{secondWeightImage}')";
  static readonly SELECT_WEIGHMENT_DETAILS_BY_WEIGHBRIDGE: string = "SELECT * FROM weighment_details WHERE firstWeighBridge='{firstWeighBridge}' OR secondWeighBridge='{secondWeighBridge}'";
  static readonly INSERT_FIRST_WEIGHMENT_DETAIL: string = "INSERT INTO weighment_details( \
  id, weighmentRstNo, material, supplier, firstWeighBridge, firstWeight, firstUnit, firstWeightDatetime, \
  firstWeightUser, remark, customer, firstWeightImage, secondWeightImage) \
  VALUES({id}, {weighmentRstNo}, '{material}', '{supplier}', '{firstWeighBridge}', {firstWeight}, '{firstUnit}', \
  GETDATE(), {firstWeightUser}, '{remark}', '{customer}', '{firstWeightImage}', '{secondWeightImage}') ";

  static readonly INSERT_COMPLETE_WEIGHMENT_DETAIL: string = "INSERT INTO weighment_details( \
  id, weighmentRstNo, material, supplier, firstWeighBridge, firstWeight, firstUnit, firstWeightDatetime, firstWeightUser,\
  secondWeighBridge, secondWeight, secondUnit, secondWeightDatetime, secondWeightUser, remark, customer, \
  firstWeightImage, secondWeightImage) \
  VALUES({id}, {weighmentRstNo}, '{material}', '{supplier}', \
  '{firstWeighBridge}', {firstWeight}, '{firstUnit}', GETDATE(), {firstWeightUser},\
  '{secondWeighBridge}', {secondWeight}, '{secondUnit}', GETDATE(), {secondWeightUser}, '{remark}', '{customer}', '{firstWeightImage}', '{secondWeightImage}') ";

  static readonly INSERT_PRESET_VEHICLE_WEIGHMENT_DETAIL: string = "INSERT INTO weighment_details( \
  id, weighmentRstNo, material, supplier, firstWeighBridge, firstWeight, firstUnit, firstWeightDatetime, firstWeightUser, \
  secondWeighBridge, secondWeight, secondUnit, secondWeightDatetime, secondWeightUser, netWeight, remark, customer \
  firstWeightImage, secondWeightImage) \
  VALUES({id}, {weighmentRstNo}, '{material}', '{supplier}', '{firstWeighBridge}', {firstWeight}, '{firstUnit}', \
  GETDATE(), {firstWeightUser}, '{secondWeighBridge}', {secondWeight}, '{secondUnit}', \
  GETDATE(), {secondWeightUser}, {netWeight},'{remark}', '{customer}', '{firstWeightImage}', '{secondWeightImage}') ";

  static readonly UPDATE_SECOND_WEIGHMENT_DETAIL: string = "UPDATE weighment_details SET material='{material}', \
  supplier = '{supplier}', secondWeighBridge = '{secondWeighBridge}', secondWeight = {secondWeight}, \
  secondUnit = '{secondUnit}', secondWeightDatetime = GETDATE(), secondWeightUser = {secondWeightUser}, \
  remark = '{remark}', secondWeightImage='{secondWeightImage}', \
  netWeight = {netWeight}, customer='{customer}' WHERE id = {id}";
  static readonly UPDATE_WEIGHMENT_DETAIL: string = "UPDATE weighment_details SET {values} WHERE id='{id}'";
  static readonly GET_WEIGHMENTS = "SELECT * FROM weighment ";
  static readonly GET_PENDING_RECORDS = "SELECT rstNo, vehicleNo, weighmentType, FORMAT(createdAt, '{date_format_code}') as createdAt1 \
      FROM weighment WHERE status='Pending'";
  static readonly GET_WEIGHMENT_DETAILS = "SELECT id, weighmentRstNo, material, supplier, firstWeighBridge, firstUnit, firstWeight, \
    FORMAT(firstWeightDatetime, '{date_format_code}') as firstWeightDatetime, firstWeightUser, secondWeighBridge, secondUnit, secondWeight, \
    FORMAT(secondWeightDatetime, '{date_format_code}') as secondWeightDatetime, secondWeightUser, remark, netWeight, customer, \
    firstWeightImage, secondWeightImage \
    FROM weighment_details WHERE weighmentRstNo={rstNo} ORDER BY id";

  static readonly GET_WEIGHMENTS_WITH_LATEST_DETAIL = "SELECT w.*, id, weighmentRstNo, material, supplier, \
    firstWeighBridge, firstUnit, firstWeight, \
    FORMAT(firstWeightDatetime, '{date_format_code}') as firstWeightDatetime, \
    firstWeightUser, secondWeighBridge, secondUnit, secondWeight, \
    FORMAT(secondWeightDatetime, '{date_format_code}') as secondWeightDatetime, customer, \
    firstWeightImage, secondWeightImage, \
    secondWeightUser, remark, netWeight FROM weighment w, weighment_details wd WHERE w.rstNo=wd.weighmentRstNo";

  static readonly GET_COMPLETED_RECORDS = "SELECT w.*, id, weighmentRstNo, material, supplier, \
    firstWeighBridge, firstUnit, firstWeight, \
    FORMAT(firstWeightDatetime, '{date_format_code}') as firstWeightDatetime, \
    firstWeightUser, secondWeighBridge, secondUnit, secondWeight, \
    FORMAT(secondWeightDatetime, '{date_format_code}') as secondWeightDatetime, customer  \
    secondWeightUser, remark, netWeight FROM weighment w, weighment_details wd \
    WHERE w.rstNo = wd.weighmentRstNo AND w.status = 'complete' AND wd.weighmentRstNo IN ( \
    SELECT MAX(weighmentRstNo) \
    FROM weighment w, weighment_details wd \
    WHERE w.rstNo = wd.weighmentRstNo";

  //static readonly GET_WEIGHMENTS_WITH_LATEST_DETAIL = "SELECT * FROM weighment w  RIGHT JOIN  \
  //    (SELECT id, weighmentRstNo, material, supplier, firstWeighBridge, firstUnit, firstWeight, \
  //  convert(varchar, firstWeightDatetime, 20) as firstWeightDatetime, firstWeightUser, secondWeighBridge, secondUnit, secondWeight, \
  //  convert(varchar, secondWeightDatetime, 20) as secondWeightDatetime, secondWeightUser, remark, netWeight FROM weighment_details wd RIGHT JOIN \
  //    (SELECT max(id) as maxid from weighment_details group by weighmentRstNo)\
  //    as wd1 on wd.id = wd1.maxid) as wd2 on w.rstNo = wd2.weighmentRstNo";

  // Weighbridges
  static readonly GET_WEIGHBRIDGES: string = "Select * from weighbridge";
    
  //Tags
  static readonly INSERT_TAG: string = "INSERT INTO tag(tagType, value) VALUES('{tagType}', '{value}')";
  static readonly GET_ALL_TAGS: string = "SELECT * FROM tag";
  static readonly GET_TAGS_BY_TYPE: string = "SELECT * FROM tag WHERE tagType={tagType}";

  //SearchFields
  static readonly INSERT_SEARCH_FIELD: string = "INSERT INTO search_field(id, displayName, entryMode, inOutMode) VALUES({id}, '{displayName}', '{entryMode}', '{inOutMode}')";
  //static readonly UPDATE_SEARCH_FIELD: string = "UPDATE search_field(displayName, entryMode, inOutMode, mValues) SET VALUES('{displayName}', '{entryMode}', '{inOutMode}', '{mValues}') WHERE id={id}";
  static readonly UPDATE_SEARCH_FIELD: string = "UPDATE search_field  SET displayName='{displayName}',fieldName='{fieldName}', entryMode='{entryMode}', inOutMode='{inOutMode}', enable={enable} WHERE id={id}";
  static readonly DELETE_SEARCH_FIELD: string = "DELETE search_field where id={id}";
  static readonly GET_ALL_SEARCH_FIELD: string = "SELECT * FROM search_field";

  //Search Field Value
  static readonly INSERT_SEARCH_FIELD_VALUE: string = "INSERT INTO search_field_value(id, search_field_id, mValue, code) VALUES({id}, {search_field_id}, '{mValue}', '{code}')";
  static readonly DELETE_SEARCH_FIELD_VALUE_BY_SEARCH_FIELD_ID: string = "DELETE search_field_value WHERE search_field_id={search_field_id}";
  static readonly GET_SEARCH_FIELD_VALUES_BY_SEARCH_FIELD_ID: string = "SELECT * FROM search_field_value WHERE search_field_id={search_field_id}";
  static readonly GET_SEARCH_FIELD_VALUES_BY_SEARCH_FIELD_TEXT: string = "SELECT * FROM search_field_value WHERE mValue LIKE '%{str}%' OR mValue LIKE '%{str}%'";
  static readonly UPDATE_SEARCH_FIELD_VALUE: string = "UPDATE search_field_value SET mValue='{mValue}', code='{code}' WHERE id={id}";
  static readonly DELETE_SEARCH_FIELD_VALUE_BY_ID: string = "DELETE search_field_value WHERE id={id}";
  //Weigh Strings
  static readonly INSERT_WEIGH_STRING: string = "INSERT INTO weighstring (stringName, totalChars, variableLength, type, pollingCommand, baudRate, dataBits, stopBits, parity, flowControl, weightCharPosition1, weightCharPosition2, weightCharPosition3, weightCharPosition4, weightCharPosition5, weightCharPosition6, startChar1, startChar2, startChar3, startChar4, endChar1, endChar2, endChar3, signCharPosition, negativeSignValue, delimeter) VALUES ('{stringName}', {totalChars}, {variableLength}, '{type}', '{pollingCommand}', '{baudRate}', {dataBits}, {stopBits}, '{parity}', '{flowControl}', {weightCharPosition1}, {weightCharPosition2}, {weightCharPosition3}, {weightCharPosition4}, {weightCharPosition5}, {weightCharPosition6}, '{startChar1}', '{startChar2}', '{startChar3}', '{startChar4}', '{endChar1}', '{endChar2}', '{endChar3}', {signCharPosition}, '{negativeSignValue}', '{delimeter}')";
  static readonly UPDATE_WEIGH_STRING: string = "UPDATE weighstring SET totalChars={totalChars}, variableLength={variableLength}, type='{type}', pollingCommand='{pollingCommand}', baudRate={baudRate}, dataBits={dataBits}, stopBits={stopBits}, parity='{parity}', flowControl='{flowControl}', weightCharPosition1={weightCharPosition1}, weightCharPosition2={weightCharPosition2}, weightCharPosition3={weightCharPosition3}, weightCharPosition4={weightCharPosition4}, weightCharPosition5={weightCharPosition5}, weightCharPosition6={weightCharPosition6}, startChar1='{startChar1}', startChar2='{startChar2}', startChar3='{startChar3}', startChar4='{startChar4}', endChar1='{endChar1}', endChar2='{endChar2}', endChar3='{endChar3}', signCharPosition={signCharPosition}, negativeSignValue='{negativeSignValue}', delimeter='{delimeter}' WHERE stringName='{stringName}'";
  static readonly DELETE_WEIGH_STRING: string = "DELETE weighstring WHERE stringName='{stringName}'";
  static readonly GET_WEIGH_STRINGS: string = "SELECT * FROM weighstring";
  static readonly GET_WEIGH_STRING_BY_NAME: string = "SELECT * FROM weighstring WHERE stringName='{stringName}'";

  //Weigh Indicators
  static readonly INSERT_WEIGH_INDICATOR: string = "INSERT INTO weighindicator(id, weighstring, port, status, measuringUnit, decimalPoint, type, httpType, comPort, wiName, ipAddress) VALUES({id}, '{weighstring}', {port}, '{status}', '{measuringUnit}', {decimalPoint}, '{type}', '{httpType}', '{comPort}', '{wiName}', '{ipAddress}')";
  static readonly UPDATE_WEIGH_INDICATOR: string = "UPDATE weighindicator SET weighstring='{weighstring}', port={port}, status='{status}', measuringUnit='{measuringUnit}', decimalPoint={decimalPoint}, type='{type}', httpType='{httpType}', comPort='{comPort}', wiName='{wiName}', ipAddress='{ipAddress}' WHERE id={id}";
  static readonly UPDATE_WEIGH_INDICATOR_STATUS: string = "UPDATE weighindicator SET status='{status}' WHERE weighstring='{weighstring}'";
  static readonly DELETE_WEIGH_INDICATOR: string = "DELETE weighindicator WHERE id={id}";
  static readonly GET_WEIGH_INDICATOR: string = "SELECT * FROM weighindicator";

  //Ticket Templates
  static readonly INSERT_TICKET_TEMPLATE: string = "INSERT INTO ticket_template(id, name, applicableTo, printerType, defaultPrinter, labelLength, copiesPerPrint, alignment, width, font, fontSize, operatingType) VALUES({id}, '{name}', '{applicableTo}', '{printerType}', '{defaultPrinter}', {labelLength}, {copiesPerPrint}, '{alignment}', {width}, '{font}', {fontSize}, '{operatingType}')";
  static readonly UPDATE_TICKET_TEMPLATE: string = "UPDATE ticket_template SET name='{name}', applicableTo='{applicableTo}', printerType='{printerType}', defaultPrinter='{defaultPrinter}', labelLength={labelLength}, copiesPerPrint={copiesPerPrint}, alignment='{alignment}', width={width}, font='{font}', fontSize={fontSize}, operatingType='{operatingType}' WHERE id={id}";
  static readonly GET_ALL_TICKET_TEMPLATE: string = "SELECT * FROM ticket_template";
  static readonly DELETE_TICKET_TEMPLATE: string = "DELETE FROM ticket_template WHERE id={id}";

  //Ticket Field
  static readonly INSERT_TICKET_FIELD: string = "INSERT INTO template_detail(id, templateId, field, type, displayName, row, col, isIncluded, font) VALUES({id}, {templateId}, '{field}', '{type}', '{displayName}', {row}, {col}, {isIncluded}, '{font}')";
  static readonly GET_TICKET_FIELDS: string = "SELECT * FROM template_detail WHERE templateId={templateId}";
  static readonly UPDATE_TICKET_FIELD: string = "UPDATE template_detail SET templateId={templateId}, field='{field}', type='{type}', displayName='{displayName}', row={row}, col={col}, isIncluded={isIncluded}, font='{font}' WHERE id={id}";
  static readonly DELETE_TICKET_FIELD: string = "DELETE FROM template_detail WHERE id={id}";
  static readonly DELETE_TICKET_FIELDS_BY_TEMPLATE_ID: string = "DELETE FROM template_detail WHERE templateId={templateId}";

  //User
  static readonly GET_USER_BY_CREDENTIALS: string = "SELECT * FROM app_user WHERE username='{username}' AND password='{password}'";
  static readonly GET_ALL_USERS: string = "SELECT * FROM app_user";
  static readonly GET_USER_BY_ID: string = "SELECT fullname, id, username, status, role FROM app_user WHERE id={id}";
  static readonly UPDATE_USER: string = "UPDATE app_user SET username='{username}',fullname='{fullname}', role='{role}', status='{status}' WHERE id={id}";
  static readonly INSERT_USER: string = "INSERT INTO app_user(id, fullname, username, password, status, role) VALUES('{id}', '{fullname}', '{username}', '{password}', '{status}', '{role}')";

  //Permission
  static readonly GET_ALL_PERMISSIONS: string = "SELECT * FROM permission";
  static readonly GET_USER_PERMISSIONS: string = "SELECT p.* FROM permission p, user_permission up WHERE p.id=up.permissionid AND up.userid={userid}";
  static readonly DELETE_USER_PERMISSIONS: string = "DELETE FROM user_permission WHERE userid={userid}";
  static readonly INSERT_USER_PERMISSION: string = "INSERT INTO user_permission(userid, permissionid) VALUES({userid}, {permissionid})";
  static readonly INSERT_PERMISSION: string = "INSERT INTO permission(id, permission) VALUES({id}, '{permission}')"
  static readonly RESET_PASSWORD: string = "UPDATE app_user SET password='{password}' WHERE id={id}";

  //Application data
  static readonly GET_APP_SETTINGS: string = "SELECT * FROM app_data";
  static readonly GET_SEARCH_FIELDS: string = "SELECT * FROM search_field";
  static readonly UPDATE_APP_SETTING: string = "UPDATE app_data set mValue='{mValue}' WHERE field='{field}'"

  //DB Backup
  static readonly BACKUP: string = "BACKUP DATABASE weighbridge TO DISK = '{path}'";

  static readonly INSERT_VEHICLE_TARE_WEIGHT = "INSERT INTO vehicle_tare_weight(vehicleNo, weighbridge, weight, createdBy) \
                  VALUES('{vehicleNo}', '{weighbridge}', {weight}, {createdBy})";

  static readonly UPDATE_VEHICLE_TARE_WEIGHT = "UPDATE vehicle_tare_weight set weighbridge='{weighbridge}', \
                  weight={weight}, createdBy={createdBy} WHERE vehicleNo='{vehicleNo}'";

  static readonly GET_VEHICLE_TARE_WEIGHT = "SELECT v.vehicleNo, u.username createdBy, v.weighbridge, \
                  v.weight, v.createdBy as userid FROM vehicle_tare_weight v, app_user u WHERE u.id=v.createdBy";

  static readonly DELETE_VEHICLE_TARE_WEIGHT = "DELETE vehicle_tare_weight WHERE vehicleNo='{vehicleNo}'";

  static readonly SELECT_WEIGHMENT_WITHOUT_DETAILS =
    "SELECT * FROM weighment WHERE rstNo NOT IN (SELECT weighmentRstNo FROM weighment_details) AND status!='abort'";
}
