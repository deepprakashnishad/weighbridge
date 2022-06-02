import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../../my-db.service';
import { AdditionalField } from './additional-field';
import { CreateEditAdditionalFieldComponent } from './create-edit-additional-field/create-edit-additional-field.component';

@Component({
  selector: 'app-additional-fields',
  templateUrl: './additional-fields.component.html',
  styleUrls: ['./additional-fields.component.css']
})
export class AdditionalFieldsComponent implements OnInit {

  additionalFields: Array<AdditionalField>=[];
  displayedColumns: string[] = ['title', 'inOutMode', 'dataEntryMode', 'dataType', 'entryOn', "formula", 'isMandatory', 'action'];
  dataSource: MatTableDataSource<AdditionalField>;

  constructor(
    private notifier: NotifierService,
    private dialog: MatDialog,
    private dbService: MyDbService
  ) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<AdditionalField>([])
    for (var i = 0; i < 10; i++) {
      this.additionalFields.push(new AdditionalField());
    }
    var storedAdditionalFields = JSON.parse(sessionStorage.getItem("additional_fields"));
    for (var i = 0; i < storedAdditionalFields.length; i++) {
      var temp = AdditionalField.fromJson(storedAdditionalFields[i]);
      console.log(temp);
      this.additionalFields[i] = temp;
    }
  }

  openCreateDialog(){
    const ref = this.dialog.open(CreateEditAdditionalFieldComponent,
      {
        data: {
          title: "Create Additional Field"
        }
      }  
    );

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.additionalFields.push(result);
        this.dataSource.data = this.additionalFields;
      }
    });
  }

  openEditDialog(section, index){
    const ref = this.dialog.open(CreateEditAdditionalFieldComponent,
      {
        height: "90%",
        width: "100vw",
        disableClose: true,
        data: {
          title: "Edit Section",
          "section": section
        }
      }  
    );

    ref.afterClosed().subscribe(result=>{
      if(result){
        this.additionalFields[index] = result;
        this.dataSource.data = this.dataSource.data;
      }
    });
  }

  delete(field, index){

  }

  save() {
    var activeData = this.additionalFields.filter(ele => ele.isActive);
    var data = JSON.stringify(activeData);
    this.dbService.updateAppSetting([{
      field: "additional_fields",
      mValue: data
    }]);
  }
}
