import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { NotificationListComponent } from "./notification-list.component";
@NgModule({
  declarations: [NotificationListComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: NotificationListComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class NotificationModule { }
