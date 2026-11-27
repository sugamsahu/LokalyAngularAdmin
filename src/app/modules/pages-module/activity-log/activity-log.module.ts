import { NgModule } from "@angular/core";
import { CommonApplicationModule } from "src/app/common-application.module";
import { RouterModule } from "@angular/router";
import { ActivityLogComponent } from "./activity-log.component";
@NgModule({
  declarations: [ActivityLogComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: ActivityLogComponent }]),
    CommonApplicationModule,
  ],
})
export class ActivityLogModule { }
