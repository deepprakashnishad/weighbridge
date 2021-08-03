import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../../my-db.service';
import { QueryList } from '../../../query-list';
import { SharedDataService } from '../../../shared-data.service';
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

  constructor(
    private notifier: NotifierService,
    private dialog: MatDialog,
    private dbService: MyDbService,
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
          isNew: true
        }
      }  
    );

    ref.afterClosed().subscribe(result=>{
      this.indicators.push(result);
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
          isNew: false
        }
      }  
    );

    ref.afterClosed().subscribe(result=>{
      if(result){
        this.indicators[index] = result;
      }
    });
  }

  delete(field, index){

  }
}
