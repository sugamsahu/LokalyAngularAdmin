import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { SmsComponent } from "./sms.component";
import { EditSmsComponent } from "./sms/edit-sms/edit-sms.component";
@NgModule({
  declarations: [SmsComponent, EditSmsComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: SmsComponent },
      { path: "add", component: EditSmsComponent },
      { path: "edit", component: EditSmsComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class SmsModule { }
