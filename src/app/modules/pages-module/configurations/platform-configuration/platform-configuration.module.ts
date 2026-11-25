import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PlatformConfigurationComponent } from "./platform-configuration.component";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";

@NgModule({
  declarations: [PlatformConfigurationComponent],
  imports: [
    CommonModule,
    CommonApplicationModule,
    RouterModule.forChild([
      { path: "", component: PlatformConfigurationComponent },
    ]),
  ],
})
export class PlatformConfigurationModule { }
