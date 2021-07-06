import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateEditTicketTemplateComponent } from './create-edit-ticket-template/create-edit-ticket-template.component';
import { TicketTemplate } from './ticket-template';

@Component({
  selector: 'app-ticket-setup',
  templateUrl: './ticket-setup.component.html',
  styleUrls: ['./ticket-setup.component.css']
})
export class TicketSetupComponent implements OnInit {

  templates: Array<TicketTemplate> = [];
  selectedTemplate: TicketTemplate = new TicketTemplate();

  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnInit() {

  }

  openAddTicketTemplateDialog(){
    const dialogRef = this.dialog.open(CreateEditTicketTemplateComponent, {
      width: "600px",
      data: {title: "New ticket template"}
    });

    dialogRef.afterClosed().subscribe((result)=>{
      console.log(result);
    });
  }

  openEditTicketTemplateDialog(){
    const dialogRef = this.dialog.open(CreateEditTicketTemplateComponent, {
      data: {
        title: "New ticket template",
        ticketTemplate: this.selectedTemplate
      }
    });

    dialogRef.afterClosed().subscribe((result)=>{
      console.log(result);
    });
  }
}
