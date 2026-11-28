import { TrackByKeyDirective } from '../../../utils/track-by-key.directive';
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { PickOrderProcessComponent } from "../pick-order-process/pick-order-process.component";
import { PickOrderComponent } from "./pick-order.component";
@NgModule({
  declarations: [PickOrderComponent],
  imports: [
    TrackByKeyDirective,
    RouterModule.forChild([
      { path: "", component: PickOrderComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class PickOrderModule { }
