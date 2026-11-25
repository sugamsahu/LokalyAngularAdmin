import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { KhataComponent } from "./khata.component";

@NgModule({
  declarations: [KhataComponent,
  ],
  imports: [
    RouterModule.forChild([
      { path: "", component: KhataComponent },
    ]),
    CommonApplicationModule,
  ],
  
})
export class KhataModule {}