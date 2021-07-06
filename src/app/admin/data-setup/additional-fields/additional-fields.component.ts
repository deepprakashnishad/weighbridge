import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotifierService } from 'angular-notifier';
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
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<AdditionalField>([])
  }

  openCreateDialog(){
    const ref = this.dialog.open(CreateEditAdditionalFieldComponent,
      {
        data: {
          title: "Create Additional Field"
        }
      }  
    );

    ref.afterClosed().subscribe(result=>{
      this.additionalFields.push(result);
      this.dataSource.data = this.additionalFields;
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
}
