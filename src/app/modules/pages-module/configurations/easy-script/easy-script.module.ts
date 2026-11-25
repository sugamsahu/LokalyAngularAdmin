import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { EasyScriptComponent } from "./easy-script.component";

@NgModule({
  declarations: [EasyScriptComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: EasyScriptComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class EasyScriptModule {}
