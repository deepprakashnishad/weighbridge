import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { HelpData } from "../../help-data";
import { HtmlViewerComponent } from "../html-viewer/html-viewer.component";

@Component({
  selector: "app-help",
  template: "<button mat-icon-button color='primary' (click)='openHTMLViewer()'><mat-icon>info</mat-icon></button>"
})
export class HelpComponent implements OnInit {

  @Input('content') content: string;
  @Input('tag') tag: string;

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
    if (this.content === undefined) {
      this.content = HelpData.map[this.tag];
    }
  }

  openHTMLViewer() {
    this.dialog.open(HtmlViewerComponent, {
      width: "600px",
      height: "500px",
      data: { "htmlContent": this.content }
    });
  }
}
