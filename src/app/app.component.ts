import { Component } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { EmailService } from './admin/email-setup/email.service';
import { AuthenticationService } from './authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'Accubridge';
  isLoggedIn = false;

  constructor(
    private authService: AuthenticationService,
    private _electronService: ElectronService,
    private _emailService: EmailService
  ) { }

  ngOnInit() {
    this.authService.isLoggedIn.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    this._electronService.ipcRenderer.on('send-daily-weighment-report', (event, arg) => {
      console.log("Invoking mail sender")
      this._emailService.emailDailyReport();
    });
  }
}
