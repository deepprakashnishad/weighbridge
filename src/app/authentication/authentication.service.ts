import { Injectable, Inject } from '@angular/core';
import { environment } from './../../environments/environment';
import {HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { retry, catchError, map, tap } from 'rxjs/operators';
import {AuthResponse} from './auth-response';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    AuthInterceptorSkipHeader:''    
  })
};

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  redirectUrl: string;
  loginUrl: string;
  signupUrl: string;
  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
  	private http: HttpClient,
    private router: Router,
    private notifier: NotifierService
  ) {
  	this.loginUrl = environment.baseurl+'/UserLogin/login';
  	this.signupUrl = environment.baseurl+'/UserLogin';
  }

  authorizeUser(accessListReqd: string[]):boolean{
      if (this.getTokenOrOtherStoredData()){
        if(accessListReqd===undefined || accessListReqd.length == 0){
          return true;
        }
        let permissionList:string = this.getTokenOrOtherStoredData('permissions')
        if(permissionList === undefined){
          return false;
        }

        let allowedPermissionList = permissionList.split(',')
          return accessListReqd.every((ele)=> 
          {  
            return allowedPermissionList.indexOf(ele) >=0 
          }
        )
      }else{
        return false;
      }
      
  }

  getTokenOrOtherStoredData(key='token') {
    if (sessionStorage.getItem(key)) {
      return sessionStorage.getItem(key);
    } else if (localStorage.getItem(key)) {
      let data = {
        token  : localStorage.getItem('token'),
        name : localStorage.getItem('name'),
        mobile : localStorage.getItem('mobile'),
        email : localStorage.getItem('email'),
        role : localStorage.getItem('role'),
        permissions : localStorage.getItem('permissions')
      }
      this.storeLocalData(data, "SESSION_STORAGE")
      return localStorage.getItem(key);
    } else {
      return '';
    }
  }

  signup(registrationData): Observable<AuthResponse> {
  	const mRegistrationData = {
  		userid: registrationData.username,
  		name: registrationData.name,
  		mobile: registrationData.mobile,
  		email: registrationData.email,
  		password: registrationData.password
  	};
  	return this.http.post<AuthResponse>(
  		this.signupUrl, registrationData, httpOptions)
  		.pipe(
  			retry(2),
  			catchError(this.handleError('registration', null))
  		);
  }

  login(credentials): Observable<AuthResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa(credentials.username + ':' + credentials.password),
        AuthInterceptorSkipHeader:''
      })
    };

  	return this.http.post<AuthResponse>(
  		this.loginUrl, null, httpOptions)
  		.pipe(
  			retry(2),
  			catchError(this.handleError('login', null))
  		);
  }

  logout(): void{
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
    this.isLoggedIn.next(false);
  }

  storeLocalData(data: any, storageType): void {
    if (storageType === "LOCAL_STORAGE") {
      localStorage.setItem('token', data.token, );
      if(data.fbToken){
        sessionStorage.setItem('fbToken', data.fbToken);
      }
      localStorage.setItem('name', data.name);
      localStorage.setItem('mobile', data.mobile);
      localStorage.setItem('email', data.email);
      localStorage.setItem('role', data.role);
      localStorage.setItem('permissions', data.permissions);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('id', data.id);
    } else {
      sessionStorage.setItem('token', data.token, );
      if(data.fbToken){
        sessionStorage.setItem('fbToken', data.fbToken);
      }
      sessionStorage.setItem('name', data.name);
      sessionStorage.setItem('mobile', data.mobile);
      sessionStorage.setItem('email', data.email);
      sessionStorage.setItem('role', data.role);
      sessionStorage.setItem('permissions', data.permissions);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('id', data.id);
    }
    this.isLoggedIn.next(true);
  }

  patchStoredData(data: any):void{
    Object.keys(data).forEach((key)=>{
      if(localStorage.getItem(key)){
        localStorage.setItem(key, data[key]);
      }
      if(sessionStorage.getItem(key)){
        sessionStorage.setItem(key, data[key]);
      }
    });
  }

  handleForbiddenRequest(error){
    this.redirectUrl = this.router.url
    this.router.navigate(['/login', {'error':[error.error.msg]}])
    localStorage.clear();
    sessionStorage.clear();
    this.isLoggedIn.next(false);
  }

  /**
 * Handle Http operation that failed.
 * Let the app continue.
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
  handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // Let the app keep running by returning an empty result.
      if(error instanceof HttpErrorResponse && error.status === 403){
        this.redirectUrl = this.router.url
        this.router.navigate(['/login', {'error':[error.error.msg]}])
        localStorage.clear();
        sessionStorage.clear();
        this.isLoggedIn.next(false);
      }else if(error instanceof HttpErrorResponse && error.status === 500){
        this.notifier.notify("error", error.error.msg);
        this.notifier.notify("error", "Server error. Please contact developer");
        return throwError(error);
      }else if (error instanceof ErrorEvent) {
    		return throwError('Unable to submit request. Please check your internet connection.');
    	} else {
    		return throwError(error);
    	}
    };
  }
}
