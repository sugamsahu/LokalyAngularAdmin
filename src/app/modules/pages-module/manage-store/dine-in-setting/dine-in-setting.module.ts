import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DineInSettingComponent } from "./dine-in-setting.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [DineInSettingComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: DineInSettingComponent }]),
    CommonApplicationModule,
    ReactiveFormsModule,
  ],
})
export class DineInSettingModule { }
