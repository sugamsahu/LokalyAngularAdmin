import { NgModule } from "@angular/core";
import { CommonApplicationModule } from "src/app/common-application.module";
import { RouterModule } from "@angular/router";
import { TemplateComponent } from "./template.component";
import { AddTemplateComponent } from "./add-template/add-template.component";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { CKEditorModule } from 'ckeditor4-angular';

@NgModule({
  declarations: [TemplateComponent, AddTemplateComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: TemplateComponent },
      { path: "add", component: AddTemplateComponent },
      { path: "edit", component: AddTemplateComponent },
    ]),
    CommonApplicationModule,
    AngularEditorModule,
    PickerModule,
    CKEditorModule,
  ],
})
export class TemplateModule { }
