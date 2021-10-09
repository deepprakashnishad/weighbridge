import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { HelpData } from "../../help-data";
import { MyDbService } from "../../my-db.service";
import { HtmlViewerComponent } from "../html-viewer/html-viewer.component";

@Component({
  selector: "app-help",
  template: "<button mat-icon-button color='primary' (click)='openHTMLViewer()'><mat-icon>info</mat-icon></button>"
})
export class HelpComponent implements OnInit {

  @Input('content') content: string;
  @Input('tag') tag: string;

  constructor(
    private dialog: MatDialog,
    private dbService: MyDbService
  ) {
  }

  ngOnInit() {
    if (this.content === undefined) {
      this.content = HelpData.map[this.tag];
    }
  }

  openHTMLViewer() {
    this.dialog.open(HtmlViewerComponent, {
      width: "100vh",
      data: { "htmlContent": this.content }
    });

    //this.dbService.executeSyncDBStmt(
    //  "SELECT", `SELECT * from help WHERE id='${this.tag}'`).then(result => {
    //    console.log(result);
    //    this.dialog.open(HtmlViewerComponent, {
    //      width: "100vh",
    //      data: { "htmlContent": result[0]['content'] }
    //    });
    //  });
    
  }
}
