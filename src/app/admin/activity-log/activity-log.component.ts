import {Component, ViewChild, AfterViewInit, OnInit} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, SortDirection} from '@angular/material/sort';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import { ActivityLog } from './activity-log';
import { ActivityLogService } from './activity-log.service';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss']
})
export class ActivityLogComponent implements OnInit, AfterViewInit {

  data: Array<ActivityLog> = [];

  displayedColumns: string[] = ['createdAt', 'action', 'user', 'entity', 'oldValue', 'newValue'];
  pageSize = 50;
  resultsLength = 0;
  isLoadingResults = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(
    private activityLogService: ActivityLogService
  ) { }

  ngOnInit() {
    this.activityLogService.getTotalAvailableRecords().subscribe((totalRecordsCount)=>{
      this.resultsLength = totalRecordsCount;
    });
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.activityLogService!.getActivityLogs(this.paginator.pageSize, this.paginator.pageSize*this.paginator.pageIndex)
            .pipe(catchError(() => observableOf(null)));
        }),
        map(data => {
          this.isLoadingResults = false;

          if (data === null) {
            return [];
          }
          data = data.map(ele=>{
            var d = new Date(ele['createdAt'])
            ele['createdAt'] = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
            return ele;
          });

          // this.resultsLength = data.total_count;
          return data;
        })
      ).subscribe(data => this.data = data);
  }
}