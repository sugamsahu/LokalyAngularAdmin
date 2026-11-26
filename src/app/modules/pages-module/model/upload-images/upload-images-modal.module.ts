import { NgModule } from "@angular/core";
import { NgxDropzoneModule } from "ngx-dropzone";
import { ModalCommonModule } from "../modal-common.module";
import { UploadImagesComponent } from "./upload-images.component";

// Image upload pop-up (item edit). Keeps ngx-dropzone out of pages.module.
@NgModule({
  imports: [ModalCommonModule, NgxDropzoneModule],
  declarations: [UploadImagesComponent],
  exports: [UploadImagesComponent],
})
export class UploadImagesModalModule {}
