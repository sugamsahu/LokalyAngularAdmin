import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonConfigurationComponent } from './common-configuration.component';
import { RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddEditCityAreaComponent } from './add-edit-city-area/add-edit-city-area.component';
import { GenerateCodeComponent } from './generate-code/generate-code.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CKEditorModule } from 'ckeditor4-angular';
@NgModule({
    declarations: [
        CommonConfigurationComponent,
        AddEditCityAreaComponent,
        GenerateCodeComponent,
    ],
    imports: [
        RouterModule.forChild([
            { path: "", component: CommonConfigurationComponent },
        ]),
        NgbModule,
        CommonModule,
        AngularEditorModule,
        MatDatepickerModule,
        CommonApplicationModule,
        CKEditorModule
    ],
    bootstrap: [CommonConfigurationComponent]
})

export class CommonConfigurationModule { }