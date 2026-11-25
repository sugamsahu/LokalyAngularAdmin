import { NgModule } from "@angular/core";
import { DownloadCenterComponent } from "./download-center.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { RouterModule } from "@angular/router";
@NgModule({
  declarations: [DownloadCenterComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: DownloadCenterComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class DownloadCenterModule { }
