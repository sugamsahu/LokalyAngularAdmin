import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { StoreholidaysComponent } from './store-holidays.component';
import { StoreholidaysAddComponent } from './store-holidays-add/store-holidays-add/store-holidays-add.component';

@NgModule({
  declarations: [StoreholidaysComponent, StoreholidaysAddComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: StoreholidaysComponent },
      { path: "add", component: StoreholidaysAddComponent },
      { path: "edit", component: StoreholidaysAddComponent },
    ]),
    CommonApplicationModule,
  ]
})
export class StoreholidaysModule { }
