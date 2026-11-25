import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DemoStoreComponent } from "./demo-store.component";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";

@NgModule({
  declarations: [DemoStoreComponent],
  imports: [
    CommonModule,
    CommonApplicationModule,
    RouterModule.forChild([
      { path: "", component: DemoStoreComponent },
    ]),
  ],
})
export class DemoStoreModule { }
