import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ChoicesComponent } from "./choices.component";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ChoicesAddComponent } from "./choices-add/choices-add.component";

@NgModule({
  declarations: [ChoicesComponent, ChoicesAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: ChoicesComponent },
      { path: "add", component: ChoicesAddComponent },
      { path: "edit", component: ChoicesAddComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class ChoicesModule { }
