import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../../my-db.service';
import { MyIpcService } from '../../../my-ipc.service';
import { QueryList } from '../../../query-list';
import { SharedDataService } from '../../../shared-data.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { WeighIndicator } from '../weigh-indicator';
import { CreateEditWeighIndicatorComponent } from './create-edit-weigh-indicator/create-edit-weigh-indicator.component';

@Component({
  selector: 'app-weighing-indicators',
  templateUrl: './weighing-indicators.component.html',
  styleUrls: ['./weighing-indicators.component.css']
})
export class WeighingIndicatorsComponent implements OnInit {

  indicators: Array<WeighIndicator>=[];
  displayedColumns: string[] = ['isLocal', 'connection', 'comPort', 'ipAddress', 'port', 'name', 'indicatorString', 'status', 'unit', 'decimalPoint', 'action'];
  @ViewChild(MatTable) indicatorTable: MatTable<any>;

  constructor(
    private notifier: NotifierService,
    private dialog: MatDialog,
    private dbService: MyDbService,
    private ngZone: NgZone,
    private ipcService: MyIpcService,
    private sharedDataService: SharedDataService
  ) { }

  ngOnInit() {
    this.dbService.executeDBStmt("weighstrings", QueryList.GET_WEIGH_STRINGS);
    this.dbService.executeDBStmt("weighindicators", QueryList.GET_WEIGH_INDICATOR);

    var subscription = this.sharedDataService.currentData.pipe().subscribe(currData => {
      if (currData['weighindicators'] && currData['weighstrings']) {
        this.indicators = WeighIndicator.fromJSON(currData['weighindicators'], currData['weighstrings']);
      }
      if (this.indicators && this.indicators.length > 0) {
        subscription.unsubscribe();
      }
    }, () => { }, () => console.log("Fetch completed"));
  }

  openCreateDialog(){
    const ref = this.dialog.open(CreateEditWeighIndicatorComponent,
      {
        data: {
          title: "Create Weight Indicator",
          isNew: true,
          "existingIndicators": this.indicators,
        }
      }  
    );

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.indicators.push(result);
        this.indicatorTable.renderRows();
      }
    });
  }

  openEditDialog(indicator, index){
    const ref = this.dialog.open(CreateEditWeighIndicatorComponent,
      {
        height: "90%",
        width: "100vw",
        disableClose: true,
        data: {
          "title": "Edit Weight Indicator",
          "indicator": indicator,
          "existingIndicators": this.indicators,
          isNew: false
        }
      }  
    );

    ref.afterClosed().subscribe(result=>{
      if(result){
        this.indicators[index] = result;
        this.indicatorTable.renderRows();
      }
    });
  }

  async delete(field, index) {

    var result = await this.dbService.executeSyncDBStmt("SELECT",
      QueryList.SELECT_WEIGHMENT_DETAILS_BY_WEIGHBRIDGE
        .replace('{firstWeighBridge}', field.wiName)
        .replace('{secondWeighBridge}', field.wiName)
    );

    if (result.length === 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: `Delete weighbridge ${field.wiName}`,
          message: `You are about the weighbridge ${field.wiName}. Are you sure? Please confirm.`
        }
      });
      dialogRef.afterClosed().subscribe(async (isConfirmed) => {
        if (isConfirmed) {
          var result = await this.dbService.executeSyncDBStmt("DELETE", QueryList.DELETE_WEIGH_INDICATOR.replace("{id}", field.id))
          if (result['error']) {
            console.log(result['error']);
            this.notifier.notify("error", "Weigh indicator could not be deleted");
          } else if (result === true) {
            this.indicators.splice(index, 1);
            var envIndicatorStrings = this.indicators.map(ele => ele.wiName);
            this.ipcService.invokeIPC("saveSingleEnvVar", ["weighIndicators", envIndicatorStrings]);
            this.notifier.notify("success", "Weigh indicator deleted successfully");
            this.indicatorTable.renderRows();
          }
        }
      });
    } else {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: `Cannot delete weighbridge ${field.wiName}`,
          message: `Weigh indicator ${field.wiName} cannot be deleted as it has weighment records associated.`,
          yesButtonText: "Ok",
          hideNoButton:true
        }
      });
    }

    

    
  }
}
