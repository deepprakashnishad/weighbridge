import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../../my-db.service';
import { QueryList } from '../../../query-list';
import { TicketTemplate } from '../ticket-template';

@Component({
  selector: 'app-create-edit-ticket-template',
  templateUrl: './create-edit-ticket-template.component.html',
  styleUrls: ['./create-edit-ticket-template.component.css']
})
export class CreateEditTicketTemplateComponent implements OnInit {

  template: TicketTemplate = new TicketTemplate();
  copyFrom: TicketTemplate;

  constructor(
    private dbService: MyDbService,
    private notifier: NotifierService,
    public dialogRef: MatDialogRef<CreateEditTicketTemplateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  save() {
    const undefinedRegExp = /undefined/g;
    if (this.template.id) {
      var stmt = QueryList.UPDATE_TICKET_TEMPLATE
        .replace("{id}", this.template?.id.toString())
        .replace("{name}", this.template?.name)
        .replace("{applicableTo}", this.template?.applicableTo)
        .replace("{printerType}", this.template?.printerType)
        .replace("{defaultPrinter}", this.template?.defaultPrinter)
        .replace("{labelLength}", this.template?.labelLength?.toString())
        .replace("{copiesPerPrint}", this.template?.copiesPerPrint?.toString())
        .replace("{alignment}", this.template?.alignment)
        .replace("{width}", this.template?.width?.toString())
        .replace("{font}", this.template?.font)
        .replace("{fontSize}", this.template?.fontSize ? this.template?.fontSize.toString() : "10")
        .replace("{operatingType}", this.template?.operatingType)
        .replace(undefinedRegExp, "");
    } else {
      var stmt = QueryList.INSERT_TICKET_TEMPLATE
        .replace("{name}", this.template?.name)
        .replace("{applicableTo}", this.template?.applicableTo)
        .replace("{printerType}", this.template?.printerType)
        .replace("{defaultPrinter}", this.template?.defaultPrinter)
        .replace("{labelLength}", this.template?.labelLength?.toString())
        .replace("{copiesPerPrint}", this.template?.copiesPerPrint?.toString())
        .replace("{alignment}", this.template?.alignment)
        .replace("{width}", this.template?.width ? this.template?.width.toString():"200")
        .replace("{font}", this.template?.font)
        .replace("{fontSize}", this.template?.fontSize ? this.template?.fontSize.toString(): "10")
        .replace("{operatingType}", this.template?.operatingType)
        .replace(undefinedRegExp, "");
    }
    this.dbService.executeInsertAutoId("ticket_template", "id", stmt).then(result => {
      console.log(result);
      this.notifier.notify("success", "Ticket template created successfully");
    });
  }

}
