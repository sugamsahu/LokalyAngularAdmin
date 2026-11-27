import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";

import { TabGroupGestureModule } from "src/app/utils/tab-group-gesture.module"; // swipe tabs on the legacy tab group
import { AskLokalyComponent } from "./ask-lokaly.component";
import { EditAskLokalyComponent } from './edit-ask-lokaly/edit-ask-lokaly.component';


@NgModule({
  declarations: [AskLokalyComponent, EditAskLokalyComponent],
  imports: [
    RouterModule.forChild([
      { path: '', component: AskLokalyComponent },
      { path: "add", component: EditAskLokalyComponent },
      { path: "edit", component: EditAskLokalyComponent },
    ]),
    CommonApplicationModule,
    TabGroupGestureModule,
  ]
})


export class AskLokalyModule { }
