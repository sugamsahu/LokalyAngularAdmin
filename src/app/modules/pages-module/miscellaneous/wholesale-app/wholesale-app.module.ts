import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WholesaleappAddComponent } from './wholesaleapp-add/wholesaleapp-add.component';
import { WholesaleAppComponent } from './wholesale-app.component';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";

@NgModule({
  declarations: [
    WholesaleappAddComponent, WholesaleAppComponent
  ],
  imports: [
    CommonModule, CommonApplicationModule,
    RouterModule.forChild([
      { path: "", component: WholesaleAppComponent },
      { path: "edit", component: WholesaleappAddComponent },
    ]),
  ]
})
export class WholesaleAppModule { }
