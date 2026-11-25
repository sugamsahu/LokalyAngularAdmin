import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";

import { MatTabGroupGestureModule } from "@angular-material-gesture/mat-tab-group-gesture";
import { ShowHistoryComponent } from "./show-history.component";
@NgModule({
  declarations: [ShowHistoryComponent],
  imports: [
    RouterModule.forChild([
      { path: '', component: ShowHistoryComponent },
   
    ]),
    CommonApplicationModule,
    MatTabGroupGestureModule,
  ]
})


export class HistoryModule { }
