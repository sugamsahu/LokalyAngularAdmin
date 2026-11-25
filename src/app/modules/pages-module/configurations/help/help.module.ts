import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HelpComponent } from "./help.component";
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgbModule, NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { NgSelectModule } from "@ng-select/ng-select";
import { HelpAddEditComponent } from "./help-add-edit/help-add-edit.component";
import { HelpAddEditDetailComponent } from "./help-add-edit/help-add-edit-detail/help-add-edit-detail.component";
import { CKEditorModule } from "ckeditor4-angular";
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
      { path: "", component: HelpComponent },
      { path: "add", component: HelpAddEditComponent },
      { path: "edit", component: HelpAddEditComponent },
    ]),
  ],
  declarations: [
    HelpComponent,
    HelpAddEditComponent,
    HelpAddEditDetailComponent,
  ],
})
export class HelpModule {}
