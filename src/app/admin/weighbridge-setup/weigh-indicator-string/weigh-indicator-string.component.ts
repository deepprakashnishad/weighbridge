import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../../my-db.service';
import { QueryList } from '../../../query-list';
import { SharedDataService } from '../../../shared-data.service';
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
    private sharedDataService: SharedDataService,
    private dbService: MyDbService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dbService.executeDBStmt("weighstrings", QueryList.GET_WEIGH_STRINGS);

    var subscription = this.sharedDataService.currentData.pipe().subscribe(currData => {
      if (currData['weighstrings']) {
        this.indicatorStrings = WeighIndicatorString.fromJSON(currData['weighstrings']);
      }
      if (this.indicatorStrings && this.indicatorStrings.length > 0) {
        subscription.unsubscribe();
      }
    }, () => { }, () => console.log("Fetch completed"));
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

  openEditDialog(selectedString, index){
    const ref = this.dialog.open(CreateEditWeightStringComponent,
      {
        height: "90%",
        width: "100vw",
        data: {
          title: "Edit Weight String",
          "indicatorString": selectedString
        }
      }  
    );

    ref.afterClosed().subscribe(result=>{
      if(result){
        this.indicatorStrings[index] = result;
      }
    });
  }

  delete(stringName, index) {
    //this.dbService.executeSyncDBStmt("DELETE",
    //  QueryList.DELETE_WEIGH_STRING.replace("{stringName}", stringName)).then(result => {
    //    if (result && result['error'] === undefined) {
    //      this.notifier.notify("success", "String deleted successfully");
    //      this.indicatorStrings.splice(index, 1);
    //    } else {
    //      this.notifier.notify("error", "String could not be deleted");
    //    }
    //  });
  }
}
