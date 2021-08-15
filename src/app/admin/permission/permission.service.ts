import { Injectable, Inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Permission } from './permission';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

	permissionUrl: string;

  	constructor(
	  	private http: HttpClient,
	) {
	     this.permissionUrl = '/permission';
	}

	getPermissions(): Observable<Array<Permission>> {
	  	return this.http.get<Permission>(this.permissionUrl)
	  		.pipe(
	  			retry(2),
	  			catchError(this.handleError('Get Token', null)));
  	}

  	addPermission(permission): Observable<Permission> {
	    return this.http.post<Permission>(this.permissionUrl, permission)
	    .pipe(
	       catchError(this.handleError('Add Permission', null)));
  	}

  	updatePermission(permission): Observable<Permission> {
	    console.log(permission)
	    return this.http.put<Permission>(this.permissionUrl, permission)
	      .pipe(
	        catchError(this.handleError('Update Permission', null))
	      )
  	}

  	deletePermission(permissionId): Observable<Permission> {
	    return this.http.delete<Permission>(this.permissionUrl +'/'+ permissionId)
	    .pipe(
	       retry(2),
	       catchError(this.handleError('Delete Permission', null)));
  	}

  	private handleError<T> (operation = 'operation', result?: T) {
	    return (error: any): Observable<T> => {
	      // Let the app keep running by returning an empty result.
	    	if (error instanceof ErrorEvent) {
	    		return throwError('Unable to submit request. Please check your internet connection.');
	    	} else {
	    		return throwError(error);
	    	}
	    };
  	}
}
