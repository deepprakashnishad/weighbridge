import { AuthenticationService } from './../authentication/authentication.service';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { retry, catchError } from 'rxjs/operators';

export const AuthInterceptorSkipHeader = 'AuthInterceptorSkipHeader';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
 
  constructor(private authenticationService: AuthenticationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if(req.headers.has('AuthInterceptorSkipHeader')){
      console.log("Skipping authorization header");
      const headers = req.headers.delete(AuthInterceptorSkipHeader);
      return next.handle(req.clone({ headers }));
    }

    // Get the auth token from the service.
    const authToken = this.authenticationService.getTokenOrOtherStoredData();
 
    // Clone the request and replace the original headers with
    // cloned headers, updated with the authorization.
    // send cloned request with header to the next handler.
    let authReq = req.clone(
        {headers: req.headers.append('Authorization', 'Bearer ' + authToken)}
      );
    return next.handle(authReq)
    .pipe(
      retry(0),
      catchError(this.authenticationService.handleError('Authorization failed...', null))
    );
  }
}