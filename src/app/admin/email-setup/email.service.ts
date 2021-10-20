import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { MyDbService } from '../../my-db.service';
import { MyIpcService } from '../../my-ipc.service';
import { QueryList } from '../../query-list';
import { ReportService } from '../../report/report.service';
import { Weighment, WeighmentDetail } from '../../weighment/weighment';
import { TicketField } from '../ticket-setup/ticket';
import { TicketService } from '../ticket-setup/ticket.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private htmlContent: string;

  constructor(
    private notifier: NotifierService,
    private dbService: MyDbService,
    private ticketService: TicketService,
    private ipcService: MyIpcService,
    private reportService: ReportService
  ) { }

  async emailDailyReport() {
    var currentdate = new Date();
    var currDate = `${currentdate.getMonth() + 1}/${currentdate.getDate()}/${currentdate.getFullYear()}`;
    var startDate = `${currDate} 12:00:00 AM`;
    var endDate = `${currDate} 11:59:59 PM`;

    var sql = `SELECT convert(varchar, firstWeightDatetime, 20) as firstWeightDatetime, \
                convert(varchar, secondWeightDatetime, 20) as secondWeightDatetime, \
                wd.firstWeight, wd.secondWeight, wd.netWeight, wd.material, wd.supplier, wd.id, \ 
                w.* FROM weighment w INNER JOIN weighment_details wd \
              ON w.rstNo = wd.weighmentRstNo AND
              wd.firstWeightDatetime >= Convert(datetime, '${startDate}', 101)\
              AND wd.secondWeightDatetime <= Convert(datetime, '${endDate}', 101)`;

    var htmlContent = await this.reportService.getHTMLReport(sql);

    return await this.ipcService.invokeIPC("send-html-attachment-email", [{
      reportContent: htmlContent,
      text: `PFA weighment daily report for ${currDate}`,
      subject: `Daily report - ${currDate}`,
      filename: `daily_report_${currentdate.getMonth() + 1}_${currentdate.getDate()}_${currentdate.getFullYear()}.pdf`,
    }]);
  }
}
