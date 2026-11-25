import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { POSSettingComponent } from './pos-setting.component';

@NgModule({
  declarations: [POSSettingComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: POSSettingComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class POSSettingModule { }
