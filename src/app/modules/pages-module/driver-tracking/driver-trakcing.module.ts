import { NgModule } from '@angular/core';
import { DriverTrackingComponent } from './driver-tracking.component';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { RouterModule } from '@angular/router';
import { GoogleMapsModule } from "@angular/google-maps";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";

@NgModule({
  declarations: [DriverTrackingComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: DriverTrackingComponent },
    ]),
    CommonApplicationModule,
    AngularFirestoreModule,
    GoogleMapsModule,
  ],
})
export class DriverTrakcingModule { }
