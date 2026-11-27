import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { EmailComponent } from "./email.component";
import { EditEmailComponent } from "./edit-email/edit-email.component";
import { AngularEditorModule } from "@kolkov/angular-editor";
import { CKEditorModule } from 'ckeditor4-angular';
@NgModule({
  declarations: [EmailComponent, EditEmailComponent],
  imports: [
    RouterModule.forChild([
      { path: "", component: EmailComponent },
      { path: "edit", component: EditEmailComponent },
      { path: "add", component: EditEmailComponent },
    ]),
    CommonApplicationModule,
    AngularEditorModule,
    CKEditorModule
  ],
})
export class EmailModule { }
