import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { OtherSettingsComponent } from './other-settings.component';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [OtherSettingsComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: OtherSettingsComponent },

    ]),
    CommonApplicationModule,
    ReactiveFormsModule
  ]
})
export class OtherSettingsModule { }
