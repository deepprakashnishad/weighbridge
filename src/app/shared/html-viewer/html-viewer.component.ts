import { Component, Inject, Input } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-html-viewer',
  templateUrl: "html-viewer.component.html"
})
export class HtmlViewerComponent {

  htmlContent: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    if (data['htmlContent']) {
      this.htmlContent = data['htmlContent'];
    }
  }
}
