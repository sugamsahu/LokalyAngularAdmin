import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";


@Component({
  selector: "app-crop-rectangle",
  templateUrl: "./crop-rectangle.component.html",
  styleUrls: ["./crop-rectangle.component.scss"],
})
export class crop_rectangleComponent implements OnInit, OnChanges {
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  @Input() myCroppedImage: any;
  @Input() imageChangedEvent: any;
  @Input() customer_user_pic: any;
  @Input() newseller: any;
  @Input() cropFiles = [];
  @Input() aspectRatio;
  @Input() isCroppedImage: any;
  @Input() width: any;
  @Input() height: any;
  @Input() isOfferImage: any;
  disableBtn: boolean = false;

  public users: any;
  public UrL: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting.store_label;
  LicenseInfo: any;
  whatsappURL: any;
  myCroppedImageShow: any;
  add_banner;
  cropType = 'jpeg';
  file: any;
  storageRef: any;
  newThumbnail: any[];
  url: string;
  croppedImages = [];
  keepSpectRatio = false;
  backgroundColor: any;
  cropQuality = 60;
  cropWidth
  cropHeight
  crop_offer_width: any;
  crop_offer_height: any;
  style_obj_crop_rectangle: any;
  @Input() added_file; //Item add
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private toastr: ToastrService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit() {
    this.style_obj_crop_rectangle = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }

    // $(
    //   "<style>.modal-dialog { max-width: 600px }</style>"
    // ).appendTo("body");

    if (this.cropFiles) {
      this.disableBtn = true;
    }

    if (!this.customer_user_pic) {
      this.customer_user_pic = false;
    }
    if (this.generalSetting.business_model == 3) {
      this.crop_offer_height = '189';
      this.crop_offer_width = '388';
    } else {
      this.crop_offer_height = '289';
      this.crop_offer_width = '388';
    }

    if(this.added_file){
      this.itemImage(this.added_file)
    }
  }
  ngOnChanges() {
  }

  fileChangeEvent(event: any): void {
    console.log(event)
    this.keepSpectRatio = false;
    var file = event.target.files[0];
    if (file.name.indexOf('.') > -1) {
      var extension = file.name.split(".").pop().toLowerCase();
    } else {
      var extension = file.name.split('/').pop().toLowerCase();
    }
    if ($.inArray(extension, ['png', 'PNG', 'jpg', 'jpeg', 'webp']) == -1) {
      this.toastr.error(this.translate.instant('PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO'));
      return;
    }
    this.croppedImages = [];
    this.cropFiles = [];
    this.imageChangedEvent = event;
    Array.from(event.target.files).forEach((file: any) => {
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

    if (this.cropFiles) {
      this.disableBtn = true;
    }

  }

  itemImage(event?: any): void {
    this.keepSpectRatio = false;
    var file = this.added_file;
    if (file.name.indexOf('.') > -1) {
      var extension = file.name.split(".").pop().toLowerCase();
    } else {
      var extension = file.name.split('/').pop().toLowerCase();
    }
    if ($.inArray(extension, ['png', 'PNG', 'jpg', 'jpeg', 'webp']) == -1) {
      this.toastr.error(this.translate.instant('PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO'));
      return;
    }
    this.croppedImages = [];
    this.cropFiles = [];
    this.imageChangedEvent = this.added_file;
      this.cropFiles.push({
        ext: this.getFilenameExtension(this.added_file),
        file: this.added_file,
        type: this.added_file.type,
      });
      this.croppedImages.push({
        osize: (this.added_file.size / 1024).toFixed(0) + 'KB',
        name: this.added_file.name,
        type: this.cropType ? 'image/' + this.cropType : this.added_file.type,
      });

    if (this.cropFiles) {
      this.disableBtn = true;
    }

  }

  /** Get format of crop type */
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

  getaspectRatioOffer() {
    if (this.crop_offer_width && this.crop_offer_height) {
      this.keepSpectRatio = true;
      return parseInt(this.crop_offer_width) / parseInt(this.crop_offer_height);
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
    if (this.isOfferImage) {
      if (event.width > 1920) {
        this.crop_offer_width = '1920';
        this.crop_offer_height = Math.round((event.height / event.width) * 1920) + '';
      }

    } else {
      if (event.width > 1920) {
        this.cropWidth = '1920';
        this.cropHeight = Math.round((event.height / event.width) * 1920) + '';
      }
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
    if(this.added_file){
      filename = new Date().getTime() + '_' + filename;
    }
    this.file = new File([u8arr], filename, { type: mime });
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
