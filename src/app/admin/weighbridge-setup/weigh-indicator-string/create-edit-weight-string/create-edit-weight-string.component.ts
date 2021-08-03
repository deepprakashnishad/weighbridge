import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../../../my-db.service';
import { QueryList } from '../../../../query-list';
import { WeighIndicator } from '../../weigh-indicator';
import { WeighIndicatorString } from '../../weigh-indicator-string';

@Component({
  selector: 'app-create-edit-weight-string',
  templateUrl: './create-edit-weight-string.component.html',
  styleUrls: ['./create-edit-weight-string.component.css']
})
export class CreateEditWeightStringComponent implements OnInit {

  indicatorString: WeighIndicatorString = new WeighIndicatorString();

  constructor(
    private notifier: NotifierService,
    private dbService: MyDbService,
    private dialogRef: MatDialogRef<CreateEditWeightStringComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    if (data && data['indicatorString']) {
      this.indicatorString = data['indicatorString'];
    }
  }

  ngOnInit() {
  }

  async save() {
    if (this.indicatorString.stringName && this.indicatorString.stringName?.length === 0) {
      return;
    }
    const undefinedRegExp = /undefined/g;
    var stmt = QueryList.INSERT_WEIGH_STRING;
    var result = await this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_WEIGH_STRING_BY_NAME.replace("{stringName}", this.indicatorString.stringName));
    if (result && result.length > 0) {
      stmt = QueryList.UPDATE_WEIGH_STRING;
    }
    stmt = stmt.replace("{stringName}", this.indicatorString.stringName)
      .replace("{totalChars}", this.indicatorString.totalChars ? this.indicatorString.totalChars.toString(): "null")
      .replace("{variableLength}", this.indicatorString.variableLength?"1":"0")
      .replace("{type}", this.indicatorString.type)
      .replace("{pollingCommand}", this.indicatorString.pollingCommand)
      .replace("{baudRate}", this.indicatorString.baudRate ? this.indicatorString.baudRate.toString(): "null")
      .replace("{dataBits}", this.indicatorString.dataBits ? this.indicatorString.dataBits.toString(): "null")
      .replace("{stopBits}", this.indicatorString.stopBits ? this.indicatorString.stopBits.toString(): "null")
      .replace("{parity}", this.indicatorString.parity)
      .replace("{flowControl}", this.indicatorString.flowControl)
      .replace("{weightCharPosition1}", this.indicatorString.weightCharPosition1 ? this.indicatorString.weightCharPosition1.toString():"null")
      .replace("{weightCharPosition2}", this.indicatorString.weightCharPosition2 ? this.indicatorString.weightCharPosition2.toString(): "null")
      .replace("{weightCharPosition3}", this.indicatorString.weightCharPosition3 ? this.indicatorString.weightCharPosition3.toString(): "null")
      .replace("{weightCharPosition4}", this.indicatorString.weightCharPosition4 ? this.indicatorString.weightCharPosition4.toString(): "null")
      .replace("{weightCharPosition5}", this.indicatorString.weightCharPosition5 ? this.indicatorString.weightCharPosition5.toString(): "null")
      .replace("{weightCharPosition6}", this.indicatorString.weightCharPosition6 ? this.indicatorString.weightCharPosition6.toString(): "null")
      .replace("{startChar1}", this.indicatorString.startChar1)
      .replace("{startChar2}", this.indicatorString.startChar2)
      .replace("{startChar3}", this.indicatorString.startChar3)
      .replace("{startChar4}", this.indicatorString.startChar4)
      .replace("{endChar1}", this.indicatorString.endChar1)
      .replace("{endChar2}", this.indicatorString.endChar2)
      .replace("{endChar3}", this.indicatorString.endChar3)
      .replace("{signCharPosition}", this.indicatorString.signCharPosition ? this.indicatorString.signCharPosition.toString():"null")
      .replace("{negativeSignValue}", this.indicatorString.negativeSignValue)
      .replace("{delimeter}", this.indicatorString.delimeter)
      .replace(undefinedRegExp, "");
    try {
      if (result && result.length > 0) {
        result = await this.dbService.executeSyncDBStmt("UPDATE", stmt);
      } else {
        result = await this.dbService.executeSyncDBStmt("INSERT", stmt);
      }
      console.log(result);
      if (result && result['error']===undefined) {
        this.notifier.notify("success", "Weigh string saved successfully");
        this.dialogRef.close();
      } else {
        this.notifier.notify("error", "Weigh string could not saved");
      }      
    } catch (ex) {
      this.notifier.notify("error", "Weigh string could not be saved");
      console.log(ex);
    }
    
  }

  close() {
    this.dialogRef.close();
  }
}
