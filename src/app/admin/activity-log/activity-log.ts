import { Person } from "src/app/person/person";

export class ActivityLog{
    person: Person;
    entityAffected: string;
    actionType: string;
    oldValue: any;
    newValue: any;
}