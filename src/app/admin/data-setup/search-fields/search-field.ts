export class SearchField {
  id: number;
  displayName: string;
  entryMode: string;
  inOutMode: string;
  mValues: string;

  constructor() {
    this.entryMode = "LIST_SOFT";
    this.inOutMode = "GENERIC";
    this.mValues = null;
  }
}
