import { Component, OnInit } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { EmailService } from './email.service';

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
  emailPort: string;
  recipientEmailId: string;
  recipientRemarks: string;

  dailyEmailTime: string;
  collectionEmailTime: string;
  emailCondition: string;

  recipients: Array<any> = [];

  constructor(
    private dbService: MyDbService,
    private ipcService: MyIpcService,
    private emailService: EmailService,
    private notifier: NotifierService
  ) { }

  ngOnInit() {
    this.allowEmail = sessionStorage.getItem("allow_email")==="true";
    this.enableDailyEmail = sessionStorage.getItem("enable_daily_email") === "true";
    this.enableCollectionEmail = sessionStorage.getItem("enable_daily_operator_collection_email") === "true";
    this.emailProvider = sessionStorage.getItem("email_provider");
    this.senderEmailId = sessionStorage.getItem("sender_email_id");
    //this.senderEmailPassword = sessionStorage.getItem("email_password");
    this.senderName = sessionStorage.getItem("sender_name");
    this.emailServer = sessionStorage.getItem("email_server");
    this.emailProtocol = sessionStorage.getItem("email_protocol");
    this.emailPort = sessionStorage.getItem("email_port");
    this.dailyEmailTime = sessionStorage.getItem("daily_email_time");
    this.collectionEmailTime = sessionStorage.getItem("collection_email_time");
    this.emailCondition = sessionStorage.getItem("email_condition");
    this.recipients = JSON.parse(sessionStorage.getItem("recipients")) ? JSON.parse(sessionStorage.getItem("recipients")) : [];
  }

  save() {
    this.dbService.updateAppSetting([
      { field: "allow_email", mValue: this.allowEmail },
      { field: "enable_daily_email", mValue: this.enableDailyEmail },
      { field: "enable_daily_operator_collection_email", mValue: this.enableCollectionEmail },
      { field: "email_provider", mValue: this.emailProvider },
      { field: "sender_email_id", mValue: this.senderEmailId },
      { field: "email_password", mValue: this.senderEmailPassword },
      { field: "sender_name", mValue: this.senderName },
      { field: "email_server", mValue: this.emailServer },
      { field: "email_protocol", mValue: this.emailProtocol },
      { field: "email_port", mValue: this.emailPort },
      { field: "daily_email_time", mValue: this.dailyEmailTime },
      { field: "collection_email_time", mValue: this.collectionEmailTime },
      { field: "email_condition", mValue: this.emailCondition },
      { field: "recipients", mValue: JSON.stringify(this.recipients) },
    ]);
  }

  updateDailyReportScheduler(event) {
    if (this.enableCollectionEmail) {
      this.ipcService.invokeIPC("schedule-job", ["daily-weighment-report", event]);
    } else {
      this.ipcService.invokeIPC("cancel-job", ["daily-weighment-report"]);
    }
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

  sendTestEmail() {
    var mRecipients = this.recipients.map(ele => ele.email);
    var mRecipientsStr = mRecipients.join(";");
    if (this.emailCondition === 'enableDailyEmail') {
      this.emailService.emailDailyReport().then(result => {
        this.notifier.notify("success", "Daily report email sent successfully.");
      });
    } else {
      this.ipcService.invokeIPC(
        "send-email",
        [
          "Hare Krishna. This is test content",
          "Test mail from weighbridge",
          mRecipientsStr
        ]
      ).then(result => {
        console.log(result);
      });
    }
    
  }
}
