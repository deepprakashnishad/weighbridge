import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
    selector: 'confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

    public title: string = "Confirm";
    public message: string = "Are you sure?";

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>) {

    if (data['message']) {
      this.message = data['message'];
    }

    if (data['title']) {
      this.title = data['title'];
    }

   }
}
