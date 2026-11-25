import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-upload-video',
  templateUrl: './upload-video.component.html',
  styleUrls: ['./upload-video.component.scss']
})
export class UploadVideoComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_video: any;
  url;
  video_file: any;
  @Output() video: EventEmitter<any> = new EventEmitter();
  constructor(public activeModal: NgbActiveModal,
    public translate: TranslateService, private toastr: ToastrService) { }

  ngOnInit(): void {
    // $(
    //   "<style>.modal-dialog { max-width: 600px }</style>"
    // ).appendTo("body");
    this.style_obj_video = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  onSelectFile(event) {
    var file = event.target.files[0];
    if (file.name.indexOf('.') > -1) {
      var extension = file.name.split(".").pop().toLowerCase();
    } else {
      var extension = file.name.split('/').pop().toLowerCase();
    }
    if (extension == 'png' || extension == 'PNG' || extension == 'jpg' || extension == 'jpeg' || extension == 'webp') {
      this.toastr.error(this.translate.instant('PLEASE_SELECT_VIDEO_FILE'));
      return;
    }
    if (file) {
      var size: any = (file.size / 1024).toFixed(0);
      if (size > 20000) {
        this.toastr.error(this.translate.instant("VIDEO_SIZE_SHOULD_BE_LESS_THAN_20_MB"));
        this.url = undefined;
        return;
      }
    }
    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        this.url = (<FileReader>event.target).result;
        this.dataURLtoFile(this.url, file.name)
      }
    }
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
    this.video_file = new File([u8arr], filename, { type: mime });
  }

  save_video() {
    var video: any = {
      url: this.url,
      file: this.video_file
    }
    this.video.emit(video);
    this.activeModal.dismiss();
  }
}
