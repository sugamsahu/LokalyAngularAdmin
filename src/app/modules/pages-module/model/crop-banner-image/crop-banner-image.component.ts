import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-crop-banner-image',
  templateUrl: './crop-banner-image.component.html',
  styleUrls: ['./crop-banner-image.component.scss']
})
export class CropBannerImageComponent implements OnInit {

  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  public users: any;
  public UrL: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting.store_label;
  LicenseInfo: any;
  whatsappURL: any;
  myCroppedImageShow: any;
  myCroppedImage;
  customer_user_pic;
  imageChangedEvent: any;
  newseller: any;
  cropWidth = '1366';
  cropQuality = 60;
  cropHeight = '552';
  cropType = 'jpeg';
  file: any;
  storageRef: any;
  newThumbnail: any[];
  url: string;
  croppedImages = [];
  cropFiles = [];
  keepSpectRatio = false;
  backgroundColor: any;
  style_obj_crop_banner_image: any;
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private toastr: ToastrService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_crop_banner_image = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    // $(
    //   "<style>.modal-dialog { max-width: 600px }</style>"
    // ).appendTo("body");
  }

  fileChangeEvent(event: any): void {
    this.keepSpectRatio = false;
    this.cropFiles = [];
    this.croppedImages = [];
    let files = event.target.files;
    var file = event.target.files[0];
    if (file.name.indexOf('.') > -1) {
      var extension = file.name.split(".").pop().toLowerCase();
    } else {
      var extension = file.name.split('/').pop().toLowerCase();
    }
    if (file.size / 1024 > 100) {
      this.toastr.error(this.translate.instant("IMAGE_SIZE_SHOULD_BE_LESS_THAN_100_KB"));
      file = {};
      files = {}
    }
    else if ($.inArray(extension, ['png', 'PNG', 'jpg', 'jpeg', 'gif']) == -1) {
      this.toastr.error(this.translate.instant('PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO'));
      return;
    }
    this.imageChangedEvent = event;
    Array.from(files).forEach((file: any) => {
      this.cropFiles.push({
        ext: this.getFilenameExtension(file),
        file: file,
        type: file.type,
      });
      this.croppedImages.push({
        osize: (file.size / 1024).toFixed(0) + 'KB',
        name: file.name,
        type: this.cropType ? 'image/' + this.cropType : file.type,
      });
    });
  }

  getFormat(ext) {
    if (this.cropType === '*') {
      return ext + '';
    } else {
      return this.cropType;
    }
  }

  getspectRatio() {
    if (this.cropWidth && this.cropHeight) {
      this.keepSpectRatio = true;
      return parseInt(this.cropWidth) / parseInt(this.cropHeight);
    } else {
      return 1;
    }
  }

  getBackgroundColor(item) {
    let color = '#fff';
    if (this.cropType === 'png') {
      color = null;
    } else {
      if (this.cropType === '*' && item.type.indexOf('png') !== -1) {
        color = null;
      }
    }
    return color;
  }

  getFilenameExtension(file) {
    let ex = file.name.split('.').pop();
    if (ex === 'jpg') ex = 'jpeg';
    return ex;
  }

  imageCropped(event: any) {
    if (event.width > 1920) {
      this.cropWidth = '1920';
      this.cropHeight = Math.round((event.height / event.width) * 1920) + '';
    }
    const timg = {
      src: event.base64,
      width: event.width,
      height: event.height,
      owidth: event.width,
      oheight: event.height,
      osize: this.croppedImages[0]?.osize,
      name: this.croppedImages[0]?.name,
      type: this.croppedImages[0]?.type,
      key: '',
    };
    this.croppedImages[0] = timg;
    this.myCroppedImage = this.croppedImages[0].src;
    this.dataURLtoFile(this.myCroppedImage, this.croppedImages[0].name)
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
    this.file = new File([u8arr], filename, { type: "image/png" });
  }

  save_image() {
    var data = {
      full_image: this.imageChangedEvent,
      crop_image: this.myCroppedImage,
      crop_image_file: this.file,
      cropFiles: this.cropFiles,
      croppedImages: this.croppedImages
    };
    this.passEntry.emit(data);
    this.activeModal.dismiss("Cross click");
  }

}
