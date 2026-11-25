import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubCategoryTypeComponent } from './sub-category-type.component';
import { SubCategoryTypeAddComponent } from './sub-category-type-add/sub-category-type-add.component';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";


@NgModule({
  declarations: [
    SubCategoryTypeAddComponent, SubCategoryTypeComponent,
  ],
  imports: [
    CommonModule, CommonApplicationModule,
    RouterModule.forChild([
      { path: "", component: SubCategoryTypeComponent },
      { path: "add", component: SubCategoryTypeAddComponent },
      { path: "edit", component: SubCategoryTypeAddComponent },
    ]),
  ]
})
export class SubCategoryTypeModule { }
