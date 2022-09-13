import { Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, 
          ValidatorFn, ValidationErrors} from '@angular/forms';
import { AuthenticationService } from './../authentication.service';
import {AuthResponse} from './../auth-response';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { NotifierService } from 'angular-notifier';
import { MatDialog } from '@angular/material/dialog';
import { InitialSetupComponent } from '../../admin/initial-setup/initial-setup.component';
import { LicenseService } from '../../license.service';
import { MyIpcService } from '../../my-ipc.service';

const MismatchPasswordValidator: ValidatorFn = (fg: FormGroup): ValidationErrors | null => {
  const pass = fg.get('materialFormCardPasswordEx');
  const confirmPass = fg.get('materialFormCardConfirmPass');

  return pass && confirmPass && pass.value === confirmPass.value ? null : {passwordMismatched: true};
};


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{

    errors: Array<string> = [];
    cardForm: FormGroup;
    loginForm: FormGroup;
    authResponse: AuthResponse;
    isPassword = true;
    passwordOrText = 'password';
    hide = true;
  version = "";
  image: any;
  private rememberMe = false;


  constructor(
    public fb: FormBuilder,
    private authService: AuthenticationService,
    public snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private ngZone: NgZone,
    private notifier: NotifierService,
    private licenseService: LicenseService,
    private ipcService: MyIpcService,
    private route: ActivatedRoute) {
    this.cardForm = fb.group({
      materialFormCardNameEx: ['', [Validators.required, Validators.minLength(4)]],
      materialFormCardEmailEx: ['', [Validators.email, Validators.required]],
      materialFormCardMobile: ['', [Validators.maxLength(10), Validators.required, Validators.minLength(10), Validators.pattern('[0-9]*')]],
      materialFormCardPasswordEx: ['', [Validators.required, Validators.minLength(4)]],
      materialFormCardConfirmPass: ['', Validators.required],
      materialFormCardUsernameEx: ['', [Validators.required, Validators.minLength(4)]]
    }, {validator: MismatchPasswordValidator});

    this.loginForm = fb.group({
      inputUsername: ['', Validators.required],
      inputPassword: ['', Validators.required],
      inputRememberMe: [false]
    });
  }

  ngOnInit(){
      const errors = this.route.paramMap.pipe(
        map((params)=>params.get('error'))
      );
      errors.subscribe(val=>{
        if (val !== null) {
          this.errors.push(val)
          this.notifier.notify("error", val);
        }
      });

    this.ipcService.invokeIPC("getAppInfo", []).then(results => {
      this.version = results['version'];      
    });

    //this.ipcService.invokeIPC("loadEnvironmentVars", ["camera"]).then(result => {
    //  this.licenseService.connectToCamera(result['pictureUrl'], result['user'], result['password']).subscribe(result => {
    //    console.log(result)
    //  })
    //  this.ipcService.invokeIPC("captureImage", result)
    //});
  }

  onSubmit(): void {
    if (this.cardForm.valid) {
      this.errors = [];
      const name = this.cardForm.get('materialFormCardNameEx').value;
      const password = this.cardForm.get('materialFormCardPasswordEx').value;
      const email = this.cardForm.get('materialFormCardEmailEx').value;
      const mobile = this.cardForm.get('materialFormCardMobile').value;
      const username = this.cardForm.get('materialFormCardUsernameEx').value;
      this.authService.signup(
        {name: name, password: password, email: email, mobile: mobile, username: username}
        ).subscribe((authResponse) =>  {
          this.authResponse = authResponse;
          if (authResponse) {
            this.openSnackBar('User successfully created', 'Dismiss');
            this.storeData(this.authResponse);
            this.clearForm();
            this.router.navigate(['']);
          }
        }, error => {
          this.notifier.notify("error", error.error.msg);
            this.errors.push(error.error.raw.msg);
        });
    }
  }

  clearForm(): void {
    this.cardForm.reset()
    this.cardForm.markAsPristine()
    this.cardForm.markAsUntouched()
    this.cardForm.updateValueAndValidity()
    this.loginForm.reset()
    this.loginForm.markAsPristine()
    this.loginForm.markAsUntouched()
    this.loginForm.updateValueAndValidity()
  }

  login(): void {
    if (this.loginForm.valid) {
      this.errors = [];

      const username = this.loginForm.get('inputUsername').value;
      const password = this.loginForm.get('inputPassword').value;
      this.rememberMe = this.loginForm.controls['inputRememberMe'].value;

      //this.authService.login({ username: username, password: password }).then(result => {
      //  if (result) {
      //    this.ngZone.run(() => {
      //      this.router.navigate(["/home"]);
      //    });
      //  }
      //});

      this.licenseService.isLicenseValid().then((result) => {
        if (!result["success"]) {
          this.notifier.notify("error", result['msg']);
          this.notifier.notify("error", "Please activate using Initial Setup");
          //return;
        }
        const username = this.loginForm.get('inputUsername').value;
        const password = this.loginForm.get('inputPassword').value;
        this.rememberMe = this.loginForm.controls['inputRememberMe'].value;

        this.authService.login({ username: username, password: password }).then(result => {
          if (result) {
            this.ngZone.run(() => {
              this.router.navigate(["/home"]);
            });
          }
        });
      });
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000
    });
  }

  onToggleShowPassword() {
    this.isPassword = !this.isPassword;
    if (this.isPassword) {
      this.passwordOrText = 'password';
    } else {
      this.passwordOrText = 'text';
    }
  }

  storeData(authResponse){
    var data = authResponse;
    data.permissions = this.getPermissionList(authResponse.permissions);
    data.role = authResponse.role.name
    if (this.rememberMe) { 
      this.authService.storeLocalData(data)
    } 
    this.authService.storeLocalData(data)
  }

  getPermissionList(permissions){
    const permissionList = [];
    for (let i = permissions.length - 1; i >= 0; i--) {
      permissionList.push(permissions[i].permission);
    }
    return permissionList.join(',');
  }

  openInitialSetupDialog() {
    const dialogRef = this.dialog.open(InitialSetupComponent, {
      height: "95vh",
      width: "95vw"
    });
  }
}

