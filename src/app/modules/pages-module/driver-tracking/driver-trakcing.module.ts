import { NgModule } from '@angular/core';
import { DriverTrackingComponent } from './driver-tracking.component';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { RouterModule } from '@angular/router';
import { AgmCoreModule } from "@agm/core";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";

@NgModule({
  declarations: [DriverTrackingComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: DriverTrackingComponent },
    ]),
    CommonApplicationModule,
    AngularFirestoreModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      libraries: ["places"],
    }),
  ],
})
export class DriverTrakcingModule { }
