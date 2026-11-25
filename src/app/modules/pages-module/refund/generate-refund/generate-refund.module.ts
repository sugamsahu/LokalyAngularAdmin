import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { GenerateRefundComponent } from './generate-refund.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RefundinfoComponent } from './refundinfo/refundinfo.component';
import { AddRefundComponent } from './add-refund/add-refund.component';
import { ViewRefundComponent } from './view-refund/view-refund.component';
@NgModule({
    declarations: [
        GenerateRefundComponent,
        AddRefundComponent,
        RefundinfoComponent,
        ViewRefundComponent,
    ],
    imports: [
        CommonApplicationModule,
        FormsModule, ReactiveFormsModule,
        RouterModule.forChild([
            { path: "", component: GenerateRefundComponent },
            { path: "add", component: AddRefundComponent },
            { path: "edit-refund", component: AddRefundComponent },
            { path: "view-refund", component: ViewRefundComponent }
        ]),
    ]
})

export class generateRefundModule { }