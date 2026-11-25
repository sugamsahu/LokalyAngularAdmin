import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BusinessHoursComponent } from "./business-hours.component";
import { SortPipe } from "../../util/sort.pipe";
@NgModule({
  declarations: [BusinessHoursComponent],
  imports: [
    RouterModule.forChild([{ path: "", component: BusinessHoursComponent }]),
    CommonApplicationModule,
    ReactiveFormsModule,
  ],
  providers: [SortPipe],
})
export class BusinessHoursModule { }
