import { Injectable, Inject } from '@angular/core';
import { environment } from './../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Role } from './role';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

	roleUrl: string;

  constructor(
  	private http: HttpClient,
  ) {
     this.roleUrl = '/role';
  }

  getRoles(): Observable<Array<Role>> {
  	return this.http.get<Role>(this.roleUrl)
  		.pipe(
  			catchError(this.handleError('Get Token', null)));
  }

  addRole(role): Observable<Role> {
    return this.http.post<Role>(this.roleUrl, role)
    .pipe(
       catchError(this.handleError('Add Role', null)));
  }

  updateRole(role): Observable<Role> {
    return this.http.put<Role>(this.roleUrl, role)
      .pipe(
        catchError(this.handleError('Update Role', null))
      )
  }

  updateRolePermissions(role): Observable<Role> {
    return this.http.put<Role>(this.roleUrl+"/updatePermissionCollection", role)
      .pipe(
        catchError(this.handleError('Update role permission collection', null))
      )
  }

  deleteRole(roleId): Observable<Role> {
     return this.http.delete<Role>(this.roleUrl +'/'+ roleId)
    .pipe(
       catchError(this.handleError('Delete Role', null)));
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
