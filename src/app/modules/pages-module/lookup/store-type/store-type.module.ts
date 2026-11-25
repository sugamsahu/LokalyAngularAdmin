import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { StoreTypeAddComponent } from "./store-type-add/store-type-add.component";
import { StoreTypeComponent } from "./store-type.component";

@NgModule({
  declarations: [StoreTypeComponent, StoreTypeAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: StoreTypeComponent },
      { path: "add", component: StoreTypeAddComponent },
      { path: "edit", component: StoreTypeAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class StoreTypeModule { }
