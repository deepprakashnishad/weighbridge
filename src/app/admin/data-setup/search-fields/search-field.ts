export class SearchField {
  id: number;
  displayName: string;
  entryMode: string;
  inOutMode: string;
  mValue: string;
  fieldName: string;
  enable: number;

  constructor() {
    this.entryMode = "LIST_SOFT";
    this.inOutMode = "GENERIC";
    this.mValue = null;
    this.enable = 0;
  }
}
