export class AdditionalField{
  fieldName: string;
  displayName: string;
  inOutMode: string;
  dataEntryMode: string;
  dataType: string;
  entryOn: string;
  formula: string;
  isMandatory: boolean;
  isActive: boolean;

  static fromJson(data: any): AdditionalField {
    var additionalField = new AdditionalField();
    additionalField.fieldName = data['fieldName'];
    additionalField.displayName = data['displayName'];
    additionalField.inOutMode = data['inOutMode'];
    additionalField.isActive = data['isActive'];
    additionalField.isMandatory = data['isMandatory'];
    additionalField.dataType = data['dataType'];

    return additionalField;
  }
}
