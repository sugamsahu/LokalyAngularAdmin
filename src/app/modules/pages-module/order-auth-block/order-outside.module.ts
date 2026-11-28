import { TrackByKeyDirective } from '../../../utils/track-by-key.directive';
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { OrderAuthBlockComponent } from "./order-auth-block.component";
@NgModule({
  declarations: [OrderAuthBlockComponent],
  imports: [
    TrackByKeyDirective,
    RouterModule.forChild([{ path: "", component: OrderAuthBlockComponent }]),
    CommonApplicationModule,
  ],
})
export class OrderOutsideModule {}
