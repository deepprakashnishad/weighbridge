import { Component, OnInit, ViewChild, ElementRef, NgZone } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { AuthenticationService } from '../../authentication/authentication.service';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { QueryList } from '../../query-list';
import { SharedDataService } from '../../shared-data.service';

@Component({
  selector: 'app-vehicle-setup',
  templateUrl: './vehicle-setup.component.html',
  styleUrls: ['./vehicle-setup.component.scss']
})
export class VehicleSetupComponent implements OnInit {

  enableWhiteSpacesInVehicle: boolean = true;

  @ViewChild('vehicleCntl') vehicleCntl: ElementRef;

  currDate = new Date();
  currentWeight: any = 10000;
  currData: any;
  isWeightStable: boolean = true;
  stableWeightCheckEnabled: boolean = JSON.parse(sessionStorage.getItem("enable_stable_weight"));
  prevWeight: number;
  cnt: number = 0;
  minReadingCountForStableWeight = 3;
  weighbridge: string;

  vehicleNo: string="";
  weight: number;

  selectedIndicator: any = { "stringType": "continuous" };

  zeroResetDone: boolean;

  vehicleTareWeights: Array<any> = [];

  displayedColumns: string[] = ['sNo', 'vehicleNo', 'weight', 'weighbridge', 'createdBy', 'action'];

  dataSource: MatTableDataSource<any>;

  constructor(
    private sharedDataService: SharedDataService,
    private authService: AuthenticationService,
    private notifier: NotifierService,
    private dbService: MyDbService,
    private ipcService: MyIpcService,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.enableWhiteSpacesInVehicle = sessionStorage.getItem("enableWhiteSpacesInVehicle") == "true";
    this.dataSource = new MatTableDataSource<any>();
    if (this.selectedIndicator?.stringType === "continuous") {
      setInterval(this.updateCurrentWeight.bind(this), 1000);
    }

    this.sharedDataService.currentData.subscribe((data) => {
      this.currData = data['currWeight'];
      if (this.selectedIndicator?.stringType === "polling") {
        this.updateCurrentWeight();
      }

      if (data["selectedWeighBridge"]) {
        this.selectedIndicator = data["selectedWeighBridge"];
        this.weighbridge = this.selectedIndicator.wiName;
      }
    });

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      console.log(data);
      console.log(filter);
      return data?.vehicleNo.indexOf(filter)>-1;
    };
  

    setInterval(() => {
      this.currDate = new Date();
    }, 1000 * 60);

    this.fetchPresetVehicles();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue;
  }

  async fetchPresetVehicles() {
    this.vehicleTareWeights = await this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_VEHICLE_TARE_WEIGHT);
    this.dataSource.data = this.vehicleTareWeights;
  }

  ngAfterViewInit() {
    this.vehicleCntl.nativeElement.focus();
  }

  updateCurrentWeight() {
    //this.currData = { weight: 12000, timestamp: (new Date()).getTime() };
    if (!this.currData) {
      this.isWeightStable = false;
      this.currentWeight = "Err!";
      this.capture();
      return;
    }
    var currWeight = this.currData;
    if (this.selectedIndicator?.stringType === "polling") {
      this.currentWeight = currWeight['weight'];
      this.isWeightStable = true;
      this.capture();
    } else {
      if (currWeight['timestamp'] > (new Date().getTime()) - 3000) {
        this.currentWeight = currWeight['weight'];

        if (Math.abs(parseFloat(this.currentWeight)) <= parseInt(sessionStorage.getItem("zero_tolerance"))) {
          this.zeroResetDone = true;
        }
        if (this.stableWeightCheckEnabled) {
          if (parseInt(sessionStorage.getItem("allowed_variation")) >=
            Math.abs(this.prevWeight - currWeight['weight'])) {
            this.cnt++;
            if (this.cnt >= this.minReadingCountForStableWeight) {
              this.isWeightStable = true;
            }
          } else {
            this.cnt = 0;
            this.prevWeight = this.currentWeight;
            this.isWeightStable = false;
          }
        } else {
          this.isWeightStable = true;
        }
      } else {
        this.isWeightStable = false;
        this.currentWeight = "Err!";
        this.capture();
      }
    }
  }

  isVehicleNoExists(vehicleNo) {
    return this.vehicleTareWeights.some(ele => ele.vehicleNo === vehicleNo);
  }

  async save() {
    if (!this.isValid()) {
      return;
    }

    if (this.isVehicleNoExists(this.vehicleNo)) {
      var stmt = QueryList.UPDATE_VEHICLE_TARE_WEIGHT
        .replace("{vehicleNo}", this.vehicleNo)
        .replace("{weight}", this.weight.toString())
        .replace("{createdBy}", this.authService.getTokenOrOtherStoredData("id"))
        .replace("{weightbridge}", this.weighbridge.toString());
      var result = await this.dbService.executeSyncDBStmt("UPDATE", stmt);
    } else {
      var stmt = QueryList.INSERT_VEHICLE_TARE_WEIGHT
        .replace("{vehicleNo}", this.vehicleNo)
        .replace("{weight}", this.weight.toString())
        .replace("{createdBy}", this.authService.getTokenOrOtherStoredData("id"))
        .replace("{weightbridge}", this.weighbridge.toString());
      var result = await this.dbService.executeSyncDBStmt("INSERT", stmt);
    }
    
    if (result) {
      this.reset();
      this.fetchPresetVehicles();
      this.notifier.notify("success", "Vehicle tare weight saved successfully");
    } else {
      this.notifier.notify("error", "Vehicle tare weight could not be saved");
    }
  }

  reset() {
    this.vehicleNo = undefined;
    this.weight = undefined;
    this.applyFilter("");
  }

  isValid() {
    if (this.vehicleNo === undefined || this.vehicleNo.length < 0) {
      this.notifier.notify("error", "Vehicle number is required");
      return false;
    }

    
    if (this.weight === undefined
      || isNaN(this.weight)
      || this.weight < 0) {
      this.notifier.notify("error", "Invalid first weight");
      return false;
    }
    return true;
  }

  capture() {
    //this.currentWeight = Utils.randomNumberGenerator(5, 10000, 50000);
    
    this.weight = this.currentWeight;
    
  }

  getWeight() {
    this.ipcService.invokeIPC("write-to-port", [this.selectedIndicator['pollingCommand']]);
  }

  async remove(item, index) {
    var result = await this.dbService.executeSyncDBStmt("DELETE",
      QueryList.DELETE_VEHICLE_TARE_WEIGHT.replace("{vehicleNo}", item.vehicleNo));
    if (result) {
      this.fetchPresetVehicles();
      this.notifier.notify("success", "Vehicle deleted successfully");
    } else {
      this.notifier.notify("error", "Vehicle could not be deleted");
    }
  }
}
