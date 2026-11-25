import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { ManagetableComponent } from './manage-table.component';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ManagetableAddComponent } from './manage-table-add/manage-table-add.component';

@NgModule({
  declarations: [ManagetableComponent, ManagetableAddComponent],
  imports: [
    RouterModule.forChild([
        { path: "", component: ManagetableComponent },
        { path: "add", component: ManagetableAddComponent },
        { path: "edit", component: ManagetableAddComponent },
        
      ]),
      CommonApplicationModule,
      ReactiveFormsModule
    ]
})
export class ManagetableModule { }
