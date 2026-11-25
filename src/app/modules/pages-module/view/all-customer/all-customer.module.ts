import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { AllCustomer } from './all-customer.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AllCustomer],
  imports: [
    RouterModule.forChild([
      { path: "", component: AllCustomer },
    ]),
    CommonApplicationModule,
  ],
})
export class AllCustomerModule { }
