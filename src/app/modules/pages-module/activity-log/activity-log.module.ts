import { NgModule } from "@angular/core";
import { CommonApplicationModule } from "src/app/common-application.module";
import { RouterModule } from "@angular/router";
import { AgmCoreModule } from "@agm/core";
import { ActivityLogComponent } from "./activity-log.component";
@NgModule({
  declarations: [ActivityLogComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: ActivityLogComponent }]),
    CommonApplicationModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      libraries: ["places"],
    }),
  ],
})
export class ActivityLogModule { }
