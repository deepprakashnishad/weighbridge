export class Report{
    header1: string;
    header2: string;
    printCurrentDate: boolean;
    printSearchParameters: boolean;

    reportReadOnly: boolean;
    passwordProtected: boolean;
    password: string;

    dateFormat: string;
    timeFormat: string;
    currency: string;
    noOfDecimalsForWeight: string;
}