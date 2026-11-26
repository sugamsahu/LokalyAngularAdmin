import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { NgxPaginationModule } from "ngx-pagination";
import { NgxSpinnerModule } from "ngx-spinner";
import { ClipboardModule } from "ngx-clipboard";
import { ImageCropperModule } from "ngx-image-cropper";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { MaterialModule } from "src/app/material/material/material.module";
import { ComponentsModule } from "src/app/components/components.module";

// The light, common building blocks the pop-up (modal) components use, so each
// modal module below only adds the heavy library its own components need.
const COMMON = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  NgbModule,
  NgSelectModule,
  TranslateModule,
  NgxPaginationModule,
  NgxSpinnerModule,
  ClipboardModule,
  ImageCropperModule,
  FontAwesomeModule,
  MaterialModule,
  ComponentsModule,
];

@NgModule({
  imports: COMMON,
  exports: COMMON,
})
export class ModalCommonModule {}
