import { NgModule } from "@angular/core";
import { CommonApplicationModule } from "src/app/common-application.module";
import { RouterModule } from "@angular/router";
import { AgmCoreModule } from "@agm/core";
import { NotificationTemplateComponent } from "./notification-template.component";
import { AddNotificationComponent } from "./add-notification/add-notification.component";
@NgModule({
  declarations: [NotificationTemplateComponent, AddNotificationComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: NotificationTemplateComponent },
      { path: "add", component: AddNotificationComponent },
      { path: "edit", component: AddNotificationComponent },
    ]),
    CommonApplicationModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      libraries: ["places"],
    }),
  ],
})
export class NotificationTemplateModule { }
