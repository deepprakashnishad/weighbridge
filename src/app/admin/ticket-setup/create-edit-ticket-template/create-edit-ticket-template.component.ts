import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    public dialogRef: MatDialogRef<CreateEditTicketTemplateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

}
