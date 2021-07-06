import {Role} from './../admin/role/role';
import {Permission} from '../admin/permission/permission';

export class Person{
	id: string;
	name: string;
	mobile: string;
	email: string;
	role: Role;
	permissions: Permission[];
	status: string;
	password: string;

	constructor(){
		this.email = "";
		this.mobile = "";
		this.name = "";
		this.permissions = [];
		this.status = "";
		this.role = new Role();
		this.password = "";
	}
}