import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NotifierService } from "angular-notifier";
import { MyDbService } from "../../../my-db.service";
import { QueryList } from "../../../query-list";
import { Utils } from "../../../utils";
import { Permission, User } from "../user";

@Component({
  selector: "app-add-edit-user-dialog",
  templateUrl:"./add-edit-user-dialog.component.html"
})
export class AddEditUserDialogComponent implements OnInit{

  user: User = new User();
  users: Array<User> = [];
  title: string = "Create New User";
  confirmPassword: string;
  permissions: Array<Permission> = [];

  constructor(
    private notifier: NotifierService,
    private dbService: MyDbService,
    private dialogRef: MatDialogRef<AddEditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: User
  ) {
    if (data) {
      if (data["user"]) {
        this.user = data['user'];
        this.title = `Edit ${this.user.fullname}`;
      }
      this.users = data['users'];
      console.log(this.users);
    }
  }

  ngOnInit() {
    this.getAllPermissions();
  }

  async getAllPermissions() {
    if (this.user.id) {
      var result = await this.dbService.executeSyncDBStmt(
        "SELECT",
        QueryList.GET_USER_PERMISSIONS.replace("{userid}", this.user.id.toString())
      );
      if (result) {
        this.user.permissions = result;
        console.log(this.user);
      };
    }
    this.dbService.executeSyncDBStmt("SELECT", QueryList.GET_ALL_PERMISSIONS).then(result => {
      this.permissions = result;
      for (var i = 0; i < this.permissions.length; i++) {
        this.user.permissions?.find(ele => {
          if (this.permissions[i].id === ele.id) {
            this.permissions[i].isSelected = true;
          }
        });
      }
    });
  }

  async save() {
    var operationSuccess = false;
    if (this.validate()) {
      if (this.user.id) {
        var updateStmt = QueryList.UPDATE_USER
          .replace("{username}", this.user.username.trim())
          .replace("{fullname}", this.user.fullname)
          .replace("{status}", this.user.status)
          .replace("{role}", this.user.role)
          .replace("{id}", this.user.id.toString());
        var result = await this.dbService.executeSyncDBStmt("UPDATE", updateStmt);
        if (result) {
          operationSuccess = true;
          this.notifier.notify("success", "User updated successfully");
        }
      } else {
        var insertStmt = QueryList.INSERT_USER
          .replace("{username}", this.user.username.trim())
          .replace("{fullname}", this.user.fullname)
          .replace("{status}", this.user.status)
          .replace("{password}", Utils.randomStringGenerator(6))
          .replace("{role}", this.user.role);
        result = await this.dbService.executeInsertAutoId("app_user", "id", insertStmt);
        if (result["newId"]) {
          operationSuccess = true;
          this.user.id = result['newId'];
          this.notifier.notify("success", "User created successfully");
        }
      }

      if (operationSuccess) {
        await this.dbService.executeSyncDBStmt(
          "DELETE",
          QueryList.DELETE_USER_PERMISSIONS
            .replace("{userid}", this.user.id.toString())
        );
        this.permissions.forEach(ele => {
          if (ele.isSelected) {
            this.dbService.executeSyncDBStmt(
              "INSERT",
              QueryList.INSERT_USER_PERMISSION
                .replace("{userid}", this.user.id.toString())
                .replace("{permissionid}", ele.id.toString())
            );
          }          
        });
        this.dialogRef.close(this.user);
      }
    }
  }

  close() {
    this.dialogRef.close();
  }

  validate() {
    var isValid = true;

    if (!this.user.username || !this.user.fullname || this.user?.fullname?.length === 0 || this.user.username?.length === 0) {
      this.notifier.notify("error", "Full name and username cannot be blank");
      return false;
    }

    var isUsernameDuplicate = this.users.some(ele => {
      if (ele.username === this.user.username && ele.id !== this.user.id) {
        return true;
      }
    });

    if (isUsernameDuplicate) {
      this.notifier.notify("error", "Duplicate username not allowed");
      return false;
    }
    return isValid;
  }

  resetPassword() {
    if (this.user.password !== this.confirmPassword) {
      this.notifier.notify("error", "Password and Confirm Password do not match");
      return false;
    } else if (!this.user.id) {
      this.notifier.notify("error", "User id cannot be undefined");
      return false;
    } else {
      this.dbService.executeSyncDBStmt("UPDATE", QueryList.RESET_PASSWORD
        .replace("{password}", Utils.mysql_real_escape_string(this.user.password))
        .replace("{id}", Utils.mysql_real_escape_string(this.user.id.toString()))
      ).then(result => {
        if (result) {
          this.notifier.notify("success", "Password reset successfull");
        } else {
          this.notifier.notify("error", "Failed to reset password");
        }
      });
    }
  }
}
