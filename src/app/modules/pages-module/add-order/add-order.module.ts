import { ItemPickerModalsModule } from "src/app/modules/pages-module/model/add-select-item/item-picker-modals.module";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { AddOrderComponent } from "./add-order.component";

@NgModule({
    declarations: [AddOrderComponent],
    imports: [
    ItemPickerModalsModule,
        RouterModule.forChild([
            { path: '', component: AddOrderComponent },
        ]),
        CommonApplicationModule
    ]
})

export class AddOrderModule { }
