import { Utils } from "../../utils";

export class User {
  id: number;
  fullname: string;
  role: string;
  password: string;
  username: string;
  status: string;
  permissions: Array<Permission>

  constructor() {
    this.status = "Active";
    this.permissions = [];
  }

  static randomGenerator() {
    var user = new User();
    user.id = Utils.randomNumberGenerator(1);
    user.fullname = Utils.randomStringGenerator(12);
    user.username = Utils.randomStringGenerator(6);
    return user;
  }
}

export class Permission {
  id: number;
  permissionName: string;
  isSelected: boolean;
}
