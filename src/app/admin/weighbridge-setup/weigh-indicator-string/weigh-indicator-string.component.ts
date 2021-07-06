import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { WeighIndicatorString } from '../weigh-indicator-string';
import { CreateEditWeightStringComponent } from './create-edit-weight-string/create-edit-weight-string.component';

@Component({
  selector: 'app-weigh-indicator-string',
  templateUrl: './weigh-indicator-string.component.html',
  styleUrls: ['./weigh-indicator-string.component.css']
})
export class WeighIndicatorStringComponent implements OnInit {

  indicatorStrings: Array<WeighIndicatorString>=[];

  constructor(
    private notifier: NotifierService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openCreateDialog(){
    const ref = this.dialog.open(CreateEditWeightStringComponent,
      {
        data: {
          title: "Create Weight String"
        }
      }  
    );

    ref.afterClosed().subscribe(result=>{
      this.indicatorStrings.push(result);
    });
  }

  openEditDialog(section, index){
    const ref = this.dialog.open(CreateEditWeightStringComponent,
      {
        height: "90%",
        width: "100vw",
        disableClose: true,
        data: {
          title: "Edit Weight String",
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
