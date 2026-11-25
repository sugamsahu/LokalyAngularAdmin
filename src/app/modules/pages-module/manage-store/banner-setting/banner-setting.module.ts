import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { BannerSettingComponent } from './banner-setting.component';
import { BannerSettingAddComponent } from './banner-setting-add/banner-setting-add.component';

@NgModule({
  declarations: [BannerSettingComponent, BannerSettingAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: BannerSettingComponent },
      { path: "add", component: BannerSettingAddComponent },
      { path: "edit", component: BannerSettingAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class BannerSettingModule { }
