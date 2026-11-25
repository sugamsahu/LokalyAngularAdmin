import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { PackageTypeComponent } from './package-type.component';
import { PackageTypeAddComponent } from './package-type-add/package-type-add.component';

@NgModule({
  declarations: [
    PackageTypeComponent, PackageTypeAddComponent
  ],
  imports: [
    RouterModule.forChild([
      { path: "", component: PackageTypeComponent },
      { path: "add", component: PackageTypeAddComponent },
      { path: "edit", component: PackageTypeAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class PackageTypeModule { }
