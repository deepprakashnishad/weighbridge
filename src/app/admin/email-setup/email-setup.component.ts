import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-email-setup',
  templateUrl: './email-setup.component.html',
  styleUrls: ['./email-setup.component.css']
})
export class EmailSetupComponent implements OnInit {

  allowEmail: boolean;
  enableDailyEmail: boolean;
  enableCollectionEmail: boolean;

  emailProvider: string;
  senderEmailId: string;
  senderEmailPassword: string;
  senderName: string;
  emailServer: string;
  emailProtocol: string;
  port: string;
  recipientEmailId: string;
  recipientRemarks: string;

  dailyEmailTime: string;
  collectionEmailTime: string;
  emailOn: string;

  recipients: Array<any> = [];

  constructor() { }

  ngOnInit() {
  }

  addRecipientToList(){
    if(this.recipientEmailId && this.recipientEmailId.length>0){
      this.recipients.push({"email": this.recipientEmailId, "remarks": this.recipientRemarks});
      this.recipientEmailId = "";
      this.recipientRemarks="";
    }
  }

  removeRecipient(index){
    if(index > -1 && index < this.recipients.length){
      this.recipients.splice(index, 1);
    }
  }

  save(){}

  sendTestEmail(){}
}
