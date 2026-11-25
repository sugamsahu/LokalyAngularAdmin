import { NgModule } from "@angular/core";
import { StoreOrderBalanceComponent } from "./store-order-balance.component";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { CommonApplicationModule } from "src/app/common-application.module";
@NgModule({
    declarations: [
        StoreOrderBalanceComponent
    ],
    imports: [
        CommonApplicationModule, CommonModule,
        RouterModule.forChild([
            { path: "", component: StoreOrderBalanceComponent },
            { path: "add", component: StoreOrderBalanceComponent }
        ]),
    ]
})
export class StoreOrderBalanceModule { }
