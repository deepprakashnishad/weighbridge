export class SearchField {
  id: number;
  displayName: string;
  entryMode: string;
  inOutMode: string;
  mValue: string;

  constructor() {
    this.entryMode = "LIST_SOFT";
    this.inOutMode = "GENERIC";
    this.mValue = null;
  }
}
