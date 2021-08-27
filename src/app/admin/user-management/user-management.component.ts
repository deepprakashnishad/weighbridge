import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MyDbService } from "../../my-db.service";
import { QueryList } from "../../query-list";
import { AddEditUserDialogComponent } from "./add-edit-user-dialog/add-edit-user-dialog.component";
import { User } from "./user";

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagement implements OnInit{

  users: Array<User>;
  displayedColumns: Array<string> = ['id', "fullName", "username", "role", "status", "action"];
  datasource: MatTableDataSource<User> = new MatTableDataSource();

  constructor(
    private dbService: MyDbService,
    private dialog: MatDialog
  ) {
    
  }

  ngOnInit() {
    this.refreshUsersList();
  }

  refreshUsersList() {
    this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_ALL_USERS)
    .then(result => {
      this.users = result;
      this.datasource.data = this.users;
    });
  }

  openUserEditDialog(user) {
    if (user) {
      var dialogRef = this.dialog.open(AddEditUserDialogComponent, {
        data: {
          "user": user,
          "users": this.users
        }
      });
    } else {
      var dialogRef = this.dialog.open(AddEditUserDialogComponent, {
        data: {"users": this.users}
      });
    }

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshUsersList();  
      }
    });
  }
}
