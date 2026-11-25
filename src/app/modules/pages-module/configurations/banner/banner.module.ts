import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { BannerComponent } from "./banner.component";
import { AddEditBannerComponent } from './add-edit-banner/add-edit-banner.component';

@NgModule({
  declarations: [BannerComponent, AddEditBannerComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: BannerComponent },
      { path: "add", component: AddEditBannerComponent },
      { path: "edit", component: AddEditBannerComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class BannerModule { }
