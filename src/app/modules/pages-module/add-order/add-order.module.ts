import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { AddOrderComponent } from "./add-order.component";

@NgModule({
    declarations: [AddOrderComponent],
    imports: [
        RouterModule.forChild([
            { path: '', component: AddOrderComponent },
        ]),
        CommonApplicationModule
    ]
})

export class AddOrderModule { }
