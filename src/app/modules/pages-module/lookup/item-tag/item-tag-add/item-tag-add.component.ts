import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { CryptoService } from 'src/app/services/custom/crypto.service';

import { ItemTagService } from 'src/app/services/lookup/item-tag.service';
import { crop_rectangleComponent } from '../../../model/crop-rectangle/crop-rectangle.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-tag-add',
  templateUrl: './item-tag-add.component.html',
  styleUrls: ['./item-tag-add.component.scss']
})
export class ItemTagAddComponent implements OnInit, AfterViewInit {

  item_tag_id: any;
  main;
  file: any = null;
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  store_label = this.general_setting.store_label;
  is_display_is_eatery = parseFloat(this.general_setting.eatery_module);
  is_allow_whole_seller = parseFloat(this.general_setting.allow_wholeseller);
  temp = [];
  store_type_list = [];
  item_tag_image = this.general_setting.item_tag_image;
  my_cropped_image_show: any;
  cropped_store_logo: any;
  is_cropped_image = false;
  my_cropped_image: string;
  cropFiles: any;
  croppedImages: any;
  @ViewChild('cursor') cursor
  is_image_delete: any;
  public itemTagForm: FormGroup;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private appComponent: AppComponent,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private itemTagService: ItemTagService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;

    if (location.href.indexOf("/item-tag/edit") > -1) {
      this.item_tag_id = this.cryptoService.decryptIdValue(
        "lookup_itemTag_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.cryptoService.clearCookie("lookup_itemTag_Id" + this.main.LoggedUserInfo.role_id?.toString());
      if (this.item_tag_id == undefined) {
        this.router.navigate(["/item-tag"]);
      }
    }
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    this.DisplayEaterycondition();
    this.storeTypeListRecord();

    if (this.item_tag_id) {
      this.getData();
    }
  }

  DisplayEaterycondition() {
    if (this.general_setting) {
      this.is_display_is_eatery = parseFloat(this.general_setting.eatery_module);
      this.is_allow_whole_seller = parseFloat(this.general_setting.allow_wholeseller);
      this.store_label = this.general_setting.store_label;
    } else {
      this.is_display_is_eatery = parseFloat(this.main.eatery_module);
      this.is_allow_whole_seller = parseFloat(this.main.allow_wholeseller);
      this.store_label = this.main.store_label;
    }
  }

  loadForm() {
    this.itemTagForm = this.formBuilder.group({
      item_tag_name: ["", Validators.required],
      item_tag_description: [""],
      item_tag_image: [this.item_tag_image],
      store_types: [''],
      all_eatery: false,
      all_wholesale: false,
      all_store: false
    });
  }
  /** Get item tag data using service */
  getData() {

    let data = {
      item_tag_id: this.item_tag_id,
    };
    this.itemTagService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.itemTagForm.setValue({
            item_tag_name: response.data.item_tag_name,
            item_tag_description: response.data.item_tag_description,
            store_types: response.data.store_category_type_id.split(','),
            item_tag_image: response.data.item_tag_image == "" ? this.item_tag_image : response.data.item_tag_image,
            all_eatery: false,
            all_wholesale: false,
            all_store: false
          });
          var temp = []
          this.itemTagForm.value.store_types.forEach(element => {
            temp.push(Number(element))
          });
          this.itemTagForm.controls['store_types'].setValue(temp)
        }
      },
      error: (error) => {

        this._snackbarService.error(error);
      },
      complete: () => {


      },
    });
  }

  async storeTypeListRecord() {

    var data = {
      token_type: 1,
    };
    await this.itemTagService.getStoreTypeList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {

          this.store_type_list = response.data;
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }
  /** Data will be added as per clicked checkbox */
  stateChanged(event: any, type: any) {
    this.temp = []
    if (this.itemTagForm.value.all_store == true) {
      this.store_type_list.forEach(element => {
        this.temp.push(element.category_id)
      });
      this.itemTagForm.controls['store_types'].setValue(this.temp)
    }
    if (this.itemTagForm.value.all_eatery == true) {
      this.store_type_list.forEach(element => {
        if (element.iseatery == 1) {
          this.temp.push(element.category_id)
        }
      });
      this.itemTagForm.controls['store_types'].setValue(this.temp)
    }
    if (this.itemTagForm.value.all_wholesale == true) {
      this.store_type_list.forEach(element => {
        if (element.is_whole_seller == 1) {
          this.temp.push(element.category_id)
        }
      });
      this.itemTagForm.controls['store_types'].setValue(this.temp)
    }
    if (this.itemTagForm.value.all_store == false && this.itemTagForm.value.all_eatery == false && this.itemTagForm.value.all_wholesale == false) {
      this.itemTagForm.controls['store_types'].setValue(null)
    }
  }

  triggerSelectFile(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  onFileChange(event: any): any {
    this.file = event.target.files[0];
    if (this.file.name.indexOf('.') > -1) {
      var extension = this.file.name.split(".").pop().toLowerCase();
    } else {
      var extension = this.file.name.split('/').pop().toLowerCase();
    }
    if ($.inArray(extension, ['png', 'PNG', 'jpg', 'jpeg']) == -1) {
      this.toastr.error(this.translate.instant('PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO'));
      this.file = ''
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(this.file);

    reader.onload = (event: any) => {
      this.itemTagForm.controls['item_tag_image'].setValue(event.target.result)
      this.cdr.detectChanges();
    }
  }

  openUpdateTagImageModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.my_cropped_image_show;
    modalRef.componentInstance.imageChangedEvent = this.my_cropped_image
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.cropFiles = this.cropFiles

    modalRef.componentInstance.newseller =
      this.cropped_store_logo == undefined
        ? this.itemTagForm.value.item_tag_image
        : this.cropped_store_logo;
    modalRef.componentInstance.isCroppedImage = this.is_cropped_image;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {

      this.editProfilePic(receivedEntry);
    });
  }

  editProfilePic(item) {
    if (item.crop_image_file != undefined) {
      this.is_cropped_image = true;
      this.cropFiles = item.cropFiles
      this.croppedImages = item.croppedImages

      this.cropped_store_logo = item.crop_image;
      this.itemTagForm.controls["item_tag_image"].setValue(item.crop_image_file);
      this.my_cropped_image = item.full_image;
    }
    this.cdr.detectChanges();
  }

  removeImage() {
    this.itemTagForm.controls["item_tag_image"].setValue(this.item_tag_image);
    if (this.item_tag_id) {
      this.is_image_delete = 1;
    }
  }
  /** Submit edit/new item tag data */
  onSubmit() {
    if (!this.itemTagForm.valid) {
      const controls = this.itemTagForm.controls;

      Object.keys(controls).forEach((controlName, i) => {
        if (i == 0) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          invalidControl.focus();
        }
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      let formData = new FormData()
      formData.append("user_id", this.main.LoggedUserInfo.user_id);
      formData.append("item_tag_name", this.itemTagForm.value.item_tag_name);
      formData.append("item_tag_description", this.itemTagForm.value.item_tag_description);
      formData.append("store_type_id", this.itemTagForm.value.store_types);

      if (this.is_cropped_image) {
        formData.append("item_tag_image", this.itemTagForm.value.item_tag_image);
      } 

      if (this.item_tag_id) {
        formData.append("item_tag_id", this.item_tag_id);
        if (this.is_image_delete == 1 && !this.is_cropped_image) {
          formData.append("is_image_delete", this.is_image_delete);
        }
      }

      this.itemTagService.add(formData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/item-tag`]);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {

          this._snackbarService.error(error);
        },
        complete: () => {

        },
      });
    }
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement =
      this.el.nativeElement.querySelector("form .ng-invalid");

    window.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: "smooth",
    });
  }

  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  controlHasError(validation, controlName): boolean {
    const control = this.itemTagForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  cancelClick() {
    history.back();
  }

}
