import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: 'app-ck-editor-images',
  templateUrl: './ck-editor-images.component.html',
  styleUrls: ['./ck-editor-images.component.scss']
})
export class CkEditorImagesComponent implements OnInit {
  private destroy$ = new Subject();
  imageList: any = [];
  store_id: any;
  parentUrl: any;
  LoginUserDetails = JSON.parse(localStorage.getItem("LoginUserDetails"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  selectedStore = JSON.parse(localStorage.getItem("selectedStore"));
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  constructor(
    public commonService: CommonService,
    public spinner: NgxSpinnerService,
  ) {
    this.spinner.show('home');
    if (window.opener) {
      // Get the URL of the parent browser
      this.parentUrl = window.opener.location.href;
    } else {
    }
  }

  ngOnInit(): void {
    if (this.parentUrl.indexOf("/items/edit-master-adminitem") > -1 || this.parentUrl.indexOf("/items/item-masterItemAdd") > -1) {
      this.store_id = this.selectedStore.store_id
      this.getCkEditorImageList();
    } else if ((this.parentUrl.indexOf("/items/edit-adminitem") > -1 || this.parentUrl.indexOf("/items/item-add") > -1) && this.LoginUserDetails.role_id != 2) {
      this.store_id = this.selectedStore.store_id
      this.getCkEditorImageList();
    } else if ((this.parentUrl.indexOf("/items/item-edit") > -1 || this.parentUrl.indexOf("/items/item-add") > -1) && this.LoginUserDetails.role_id == 2) {
      this.store_id = this.loginUserStore.store_id
      this.getCkEditorImageList();
    } else if (this.parentUrl.indexOf("/common-configuration") > -1 || this.parentUrl.indexOf("/template") > -1 || this.parentUrl.indexOf("/email") > -1 || this.parentUrl.indexOf("/help") > -1 || this.parentUrl.indexOf("/page-management") > -1) {
      this.store_id = '';
      this.getCkEditorImageList();
    }
  }

  getCkEditorImageList() {
    let data: any = {};
    if (this.store_id) {
      data.store_id = this.store_id;
    }
    this.commonService.getCkImageList(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide('home');
          this.imageList = response.data;
        } else {
          this.spinner.hide('home');
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  onSelect(selectedFile) {
    // Execute a custom JavaScript function in CKEditor with the selected image URL
    // window.opener.CKEDITOR.tools.callFunction(window.opener.CKEDITOR.tools.getNextId() - 1, selectedFile);
    window.opener.CKEDITOR.tools.callFunction(1, selectedFile);
    // Close CKFinder window
    this.imageList = [];
    window.close();
  }

}
