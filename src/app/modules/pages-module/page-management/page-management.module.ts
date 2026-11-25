import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PageManagementComponent } from "./page-management.component";
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { PageManagementAddComponent } from "./page-management-add/page-management-add.component";
import { RearrangePageManagementComponent } from "../model/rearrange-page-management/rearrange-page-management.component";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ContentManagementComponent } from "./content-management/content-management.component";
import { NgbModule, NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { ContentManagementDetailComponent } from "./content-management/content-management-detail/content-management-detail.component";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { NgSelectModule } from "@ng-select/ng-select";
import { CKEditorModule } from 'ckeditor4-angular';
@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    DragDropModule,
    NgbNavModule,
    NgbModule,
    AngularEditorModule,
    NgSelectModule,
    CKEditorModule,
    RouterModule.forChild([
      { path: "", component: PageManagementComponent },
      { path: "add", component: PageManagementAddComponent },
      { path: "edit", component: PageManagementAddComponent },
      { path: "edit-content", component: ContentManagementComponent },
    ]),
  ],
  declarations: [
    PageManagementComponent,
    PageManagementAddComponent,
    RearrangePageManagementComponent,
    ContentManagementComponent,
    ContentManagementDetailComponent,
  ],
})
export class PageManagementModule { }
