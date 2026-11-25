import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { ItemConfigurationComponent } from './item-configuration.component';

@NgModule({

  declarations: [ItemConfigurationComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: ItemConfigurationComponent },
    ]),
    CommonApplicationModule,
  ],
})
export class ItemConfigurationModule { }
