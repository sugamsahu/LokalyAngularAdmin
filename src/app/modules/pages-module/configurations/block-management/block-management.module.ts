import { NgModule } from '@angular/core';
import { BlockManagementComponent } from './block-management.component';
import { RouterModule } from '@angular/router';
import { CommonApplicationModule } from 'src/app/common-application.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@NgModule({ 
  declarations: [BlockManagementComponent
    
],
imports: [
    RouterModule.forChild([
        { path: "", component: BlockManagementComponent },
    ]),
    NgbModule,
    CommonModule,
    CommonApplicationModule,
],
})
export class BlockManagementModule { }
