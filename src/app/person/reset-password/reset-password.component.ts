import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotifierService } from 'angular-notifier';
import { PersonService } from '../person.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  password: string = "";
  @Input("personId") personId: string;
  passwordCntl: FormControl = new FormControl();

  constructor(
    private notifier: NotifierService,
    private personService: PersonService,
    public dialogRef: MatDialogRef<ResetPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.personId = this.data.personId;
  }

  generatePassword(){
    this.password = Math.random().toString(36).slice(-10);
  }

  copied(){
    this.notifier.notify("success", "Password copied to clipboard");
  }

  resetPassword($event){
    this.personService.resetPassword(this.personId, this.password).subscribe(result=>{
      if(result['success']){
        this.notifier.notify("success", "Password reset successfull");
      }
    });
  }

}
