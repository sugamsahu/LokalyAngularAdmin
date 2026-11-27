import {
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import { LoadedImage } from "ngx-image-cropper";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: "app-crop-image",
  templateUrl: "./crop-image.component.html",
  styleUrls: ["./crop-image.component.scss"],
})
export class CropImageComponent implements OnInit {
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageName: any = '';
  imageFile: any = null;
  cropWidth: number = 1;
  cropHeight: number = 1;
  tempcrop: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_crop_image: any;

  constructor(public dialogRef: MatDialogRef<CropImageComponent>,
    @Inject(MAT_DIALOG_DATA) public files: CropRectangleDialogModel,) {
    this.tempcrop = files.tempcrop
    this.imageFile = files.file;
    this.cropWidth = files.widthHeight?.cropWidth;
    this.cropHeight = files.widthHeight?.cropHeight;
    if (this.imageFile.name.indexOf('.') > -1) {
      this.croppedImageName = this.imageFile.name.split(".").slice(0, -1).join('.');
    } else {
      this.croppedImageName = this.imageFile.name.split('/').slice(0, -1).join('.');
    }
  }
  cropQuality = 60;
  myCroppedImage: any;
  file: any;
  ngOnInit() {
    this.style_obj_crop_image = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    $(
      "<style>.modal-dialog { max-width: 600px }</style>"
    ).appendTo("body");
  }

  imageCropped(event: any) {
    const timg = {
      src: event.base64,
      width: event.width,
      height: event.height,
      owidth: event.width,
      oheight: event.height,
      osize: this.tempcrop[0]?.osize,
      name: this.tempcrop[0]?.name,
      type: this.tempcrop[0]?.type,
      key: '',
    };
    this.tempcrop[0] = timg;
    this.myCroppedImage = this.tempcrop[0].src;
    this.dataURLtoFile(this.myCroppedImage, this.tempcrop[0].name)
  }

  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = window.atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    filename = new Date().getTime() + '_' + filename;
    this.file = new File([u8arr], filename, { type: mime });
  }

  imageLoaded(image: LoadedImage) {
    // show cropper
  }

  getspectRatio() {
    if (this.cropWidth && this.cropHeight) {
      return Number(this.cropWidth) / Number(this.cropHeight);
    } else {
      return 1;
    }
  }

  cropperReady() {
    // cropper ready
  }

  loadImageFailed() {
    // show message
  }

  uploadImages() {
    var data = {
      full_image: this.imageChangedEvent,
      crop_image: this.myCroppedImage,
      crop_image_file: this.file,
      croppedImages: this.tempcrop
    };

    this.dialogRef.close(data);
  }
}

export class CropRectangleDialogModel {
  constructor(public file: any, public widthHeight: any, public tempcrop: any) {
  }
}
