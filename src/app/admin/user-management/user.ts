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
}

export class Permission {
  id: number;
  permissionName: string;
  isSelected: boolean;
}
