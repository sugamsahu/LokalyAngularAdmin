import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonApplicationModule } from "src/app/common-application.module";
import { UpdatePriceComponent } from './update-price.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { updatePriceSearch } from './updatePriceSearch';
@NgModule({
    declarations: [
        UpdatePriceComponent, updatePriceSearch
    ],
    imports: [
        FormsModule, ReactiveFormsModule, CommonApplicationModule,
        RouterModule.forChild([
            { path: "", component: UpdatePriceComponent }
        ]),
    ]
})
export class UpdatePriceModule { }
