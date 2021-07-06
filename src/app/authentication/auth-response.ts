import {Role} from '../admin/role/role';
import {Permission} from '../admin/permission/permission';

export class AuthResponse {
  name: string;
  id: number;
  mobile: string;
  email: string;
  status: string;
  token: string;
  role: Role;
  permissions: Array<Permission>;

  constructor(id: number, title: string, mobile: string, email: string,
    status: string, token: string, role: Role, permissions?: Array<Permission>) {
    this.id = id;
    this.name = title;
    this.email = email;
    this.mobile = mobile;
    this.status = status;
    this.token = token;
    this.role = role;
    this.permissions = permissions || [];
  }

  addPermission(permission: Permission): void {
    this.permissions.push(permission);
  }
}
