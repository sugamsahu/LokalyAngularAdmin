import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";

import { TabGroupGestureModule } from "src/app/utils/tab-group-gesture.module"; // swipe tabs on the legacy tab group
import { ShowHistoryComponent } from "./show-history.component";
@NgModule({
  declarations: [ShowHistoryComponent],
  imports: [
    RouterModule.forChild([
      { path: '', component: ShowHistoryComponent },
   
    ]),
    CommonApplicationModule,
    TabGroupGestureModule,
  ]
})


export class HistoryModule { }
