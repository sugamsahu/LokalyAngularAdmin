import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { ViewManagementComponent } from './view-management';
import { EditViewComponent } from './edit-view/edit-view.component';
import { Search } from './edit-search';

@NgModule({
  declarations: [ViewManagementComponent, EditViewComponent, Search],
  imports: [
    RouterModule.forChild([
      { path: "", component: ViewManagementComponent },
      { path: "add", component: EditViewComponent },
      { path: "edit", component: EditViewComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class ViewManagementModule { }
