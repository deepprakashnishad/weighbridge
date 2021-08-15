import { Injectable } from '@angular/core';
import { ActivityLog } from './activity-log';
import { environment } from './../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {

  actvityLogUrl: string;
  activityLogs: Array<ActivityLog>

  constructor(
    private http: HttpClient,
  ) {
      this.actvityLogUrl = '/getActivityLog';
  }

  getActivityLogs(pageSize, offset): Observable<Array<ActivityLog>> {
    return this.http.get<Array<ActivityLog>>(`${this.actvityLogUrl}?pageSize=${pageSize}&offset=${offset}`)
      .pipe(
        catchError(this.handleError('Get Token', null)));
  }

  getTotalAvailableRecords(): Observable<number> {
    return this.http.get<number>(`${this.actvityLogUrl}/count`)
      .pipe(
        catchError(this.handleError('Get Token', null)));
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
