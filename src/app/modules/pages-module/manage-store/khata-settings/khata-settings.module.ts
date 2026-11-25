import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { KhataSettingsComponent } from './khata-settings.component';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [KhataSettingsComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: KhataSettingsComponent },

    ]),
    CommonApplicationModule,
    ReactiveFormsModule
  ]
})
export class KhatasettingsModule { }
