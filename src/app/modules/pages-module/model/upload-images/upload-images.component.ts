import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from "@ngx-translate/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styleUrls: ['./upload-images.component.scss']
})
export class UploadImagesComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  files: File[] = [];
  style_obj_upload_image: any;

  constructor(public dialogRef: MatDialogRef<UploadImagesComponent>, public translate: TranslateService, private toastr: ToastrService,) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_upload_image = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    const box = document.getElementById('box');

    box.addEventListener('dragstart', event => {
      event.preventDefault();
    });

    box.addEventListener('drop', event => {
      event.preventDefault();
    });
  }

  onSelect(event: any): void {
    event.addedFiles.forEach(element => {
      var file = element;
      if (file.name.indexOf('.') > -1) {
        var extension = file.name.split(".").pop().toLowerCase();
      } else {
        var extension = file.name.split('/').pop().toLowerCase();
      }
      if ($.inArray(extension, ['png', 'PNG', 'jpg', 'jpeg', 'webp']) == -1) {
        this.toastr.error(this.translate.instant('PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO'));
        return;
      } else {
        this.files.push(element);
      }
    });
  }

  cropImages() {
    this.dialogRef.close(this.files);
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.files, event.previousIndex, event.currentIndex);
  }

  closeModal() {
    this.dialogRef.close();
  }
}
