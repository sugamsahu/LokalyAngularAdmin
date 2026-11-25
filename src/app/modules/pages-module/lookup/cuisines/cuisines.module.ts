import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { CuisinesAddComponent } from "./cuisines-add/cuisines-add.component";
import { CuisinesComponent } from "./cuisines.component";

@NgModule({
  declarations: [CuisinesComponent, CuisinesAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: CuisinesComponent },
      { path: "add", component: CuisinesAddComponent },
      { path: "edit", component: CuisinesAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class CuisinesModule { }
