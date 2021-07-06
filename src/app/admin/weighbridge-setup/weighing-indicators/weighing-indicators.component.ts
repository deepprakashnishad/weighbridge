import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotifierService } from 'angular-notifier';
import { WeighIndicator } from '../weigh-indicator';
import { CreateEditWeighIndicatorComponent } from './create-edit-weigh-indicator/create-edit-weigh-indicator.component';

@Component({
  selector: 'app-weighing-indicators',
  templateUrl: './weighing-indicators.component.html',
  styleUrls: ['./weighing-indicators.component.css']
})
export class WeighingIndicatorsComponent implements OnInit {

  indicatorStrings: Array<WeighIndicator>=[];
  displayedColumns: string[] = ['isLocal', 'connection', 'comPort', 'ipAddress', 'port', "name", 'indicatorString', 'status', 'unit', 'decimalPoint'];
  dataSource: MatTableDataSource<WeighIndicator>;

  constructor(
    private notifier: NotifierService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openCreateDialog(){
    const ref = this.dialog.open(CreateEditWeighIndicatorComponent,
      {
        data: {
          title: "Create Weight Indicator"
        }
      }  
    );

    ref.afterClosed().subscribe(result=>{
      this.indicatorStrings.push(result);
    });
  }

  openEditDialog(section, index){
    const ref = this.dialog.open(CreateEditWeighIndicatorComponent,
      {
        height: "90%",
        width: "100vw",
        disableClose: true,
        data: {
          title: "Edit Weight Indicator",
          "section": section
        }
      }  
    );

    ref.afterClosed().subscribe(result=>{
      if(result){
        this.indicatorStrings[index] = result;
      }
    });
  }

  delete(field, index){

  }
}
