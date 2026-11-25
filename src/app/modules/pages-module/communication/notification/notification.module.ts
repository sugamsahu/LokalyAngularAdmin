import { NgModule } from '@angular/core';
import { NotificationComponent } from './notification.component';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { AgmCoreModule } from '@agm/core';
import { RouterModule } from '@angular/router';
import { AddEditNotificationComponent } from './add-edit-notification/add-edit-notification.component';

@NgModule({
  declarations: [NotificationComponent, AddEditNotificationComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: NotificationComponent },
      { path: "add", component: AddEditNotificationComponent },
      { path: "edit", component: AddEditNotificationComponent },
    ]),
    CommonApplicationModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      libraries: ["places"],
    }),
  ],
})
export class NotificationModule { }
