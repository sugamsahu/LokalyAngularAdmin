import { ItemPickerModalsModule } from "src/app/modules/pages-module/model/add-select-item/item-picker-modals.module";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { DineInSettingComponent } from "./dine-in-setting.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [DineInSettingComponent],
  imports: [
    ItemPickerModalsModule,
    RouterModule.forChild([{ path: "", component: DineInSettingComponent }]),
    CommonApplicationModule,
    ReactiveFormsModule,
  ],
})
export class DineInSettingModule { }
