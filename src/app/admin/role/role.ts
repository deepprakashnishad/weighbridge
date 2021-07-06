import {Permission} from './../permission/permission';

export class Role {
	id: number;
	name: string;
	permissions: Array<Permission>;
}
