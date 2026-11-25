import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CategoryTypeComponent } from './category-type.component';
import { CategoryTypeAddComponent } from './category-type-add/category-type-add.component';
import { CommonApplicationModule } from "src/app/common-application.module";

@NgModule({
  declarations: [
    CategoryTypeComponent, CategoryTypeAddComponent
  ],
  imports: [
    RouterModule.forChild([
      { path: "", component: CategoryTypeComponent },
      { path: "add", component: CategoryTypeAddComponent },
      { path: "edit", component: CategoryTypeAddComponent },
    ]),
    CommonApplicationModule
  ]
})
export class CategoryTypeModule { }
