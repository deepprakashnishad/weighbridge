import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  public data: any = {};
  private dataSource = new  BehaviorSubject(this.data);
  currentData = this.dataSource.asObservable();

  isWeightStable = false;
  prevWeight: number;
  cnt: number = 0;

  constructor() { }
  
  updateData(key: any, value: any) {
    this.data[key] = value;
    this.dataSource.next(this.data);
  }
}
