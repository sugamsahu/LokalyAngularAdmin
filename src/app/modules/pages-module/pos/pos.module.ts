import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { PosComponent } from "./pos.component";
import { PosOrderComponent } from './pos-order/pos-order.component';
import { MatTabGroupGestureModule } from "@angular-material-gesture/mat-tab-group-gesture";
@NgModule({
  declarations: [PosComponent, PosOrderComponent],
  imports: [
    RouterModule.forChild([
      { path: '', component: PosComponent },
      { path: "add-pos", component: PosOrderComponent },
    ]),
    CommonApplicationModule,
    MatTabGroupGestureModule,
  ]
})
export class POSModule { }
