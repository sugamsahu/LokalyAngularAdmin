import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { AppComponent } from "src/app/app.component";
import { CommonService } from "src/app/services/common.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ItemCollectionService } from "src/app/services/lookup/item-collection.service";
import { crop_rectangleComponent } from "../../../model/crop-rectangle/crop-rectangle.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-item-collection-add",
  templateUrl: "./item-collection-add.component.html",
  styleUrls: ["./item-collection-add.component.scss"],
})
export class ItemCollectionAddComponent implements OnInit, AfterViewInit {
  item_collection_id: any;
  main;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  is_display_is_eatery = parseFloat(this.general_setting.eatery_module);
  is_allow_whole_sale = parseFloat(this.general_setting.allow_wholeseller);
  store_label = this.general_setting.store_label;
  file: any;
  store_type_list = [];
  item_tag_list = [];
  item_category_list = [];
  item_sub_category_list = [];
  temp_item_category_list = [];
  temp_item_tag_list: any = [];
  temp_item_sub_category_list = [];
  temp = [];
  offers_module = this.general_setting.offers_module
  review_rating_module = this.general_setting.review_rating_module
  collection_category_image = this.general_setting.collection_category_image
  public itemCollectionForm: UntypedFormGroup;
  validate_tag_clicked: boolean = false;
  validate_category_clicked: boolean = false;
  validate_sub_category_clicked: boolean = false;
  @ViewChild('cursor') cursor;
  comma_separated_store_type_value: any = [];
  is_firts_edit: boolean = true;
  my_cropped_image_show: any;
  cropped_store_logo: any;
  is_cropped_image = false;
  my_cropped_image: string;
  cropFiles: any;
  croppedImages: any;
  is_image_delete: any;
  constructor(
    private router: Router,
    public translate: TranslateService,
    private appComponent: AppComponent,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private itemCollectionService: ItemCollectionService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    public commonService: CommonService,
    public spinner: NgxSpinnerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;

    if (location.href.indexOf("/item-collection/edit") > -1) {
      this.item_collection_id = this.cryptoService.decryptIdValue(
        "lookup_itemCollection_Id" +
        this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.item_collection_id == undefined) {
        this.router.navigate(["/item-collection"]);
      }
    }
  }

  ngOnInit(): void {
    this.validate_tag_clicked = false;
    this.validate_category_clicked = false;
    this.validate_sub_category_clicked = false;
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm()
    if (this.item_collection_id) {
      this.getData();
    } else {
      this.storeTypeListRecord();
      this.itemTagListRecord();
      this.itemCategoryListRecord();
      this.itemSubCategoryListRecord();
    }

  }

  ngAfterViewInit(): void {
    this.itemCollectionForm.get('is_rating').valueChanges.subscribe(val => {
    })
    this.cursor.nativeElement.focus();
  }

  loadForm() {
    this.itemCollectionForm = this.formBuilder.group({
      collection_name: ["", Validators.required],
      description: [""],
      store_types: ["", Validators.required],
      all_eatery: false,
      all_wholesale: false,
      all_store: false,
      collection_image: [this.collection_category_image],
      collection_type: ['1'],
      is_all_items: (false),
      is_discount: (false),
      is_offer: (false),
      is_rating: (false),
      rating_value: (null),
      is_recent_items: (false),
      item_created_date: new UntypedFormControl(null),
      is_tags: (false),
      tag_ids: (null),
      is_category: (false),
      category_ids: (null),
      is_sub_category: (false),
      sub_category_ids: (null),
      is_active: new UntypedFormControl(true),
    });

    this.itemCollectionForm.valueChanges.subscribe((newValue) => {
      this.cdr.detectChanges()
    });

  }
  /** Get item collection data using service */
  async getData() {
    let data = {
      item_collection_id: this.item_collection_id,
    };
    await this.itemCollectionService.collectionDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var colType = response.data.collection_type;
          this.comma_separated_store_type_value = response.data.store_category_type_id.split(",");
          if (colType == 1) {
            this.itemCollectionForm.patchValue({
              collection_name: response.data.collection_name,
              description: response.data.description,
              store_types: response.data.store_category_type_id.split(","),
              all_eatery: false,
              all_wholesale: false,
              all_store: false,
              collection_image: response.data.collection_image ? response.data.collection_image : this.collection_category_image,
              collection_type: response.data.collection_type,
              is_all_items: false,
              is_discount: false,
              is_offer: false,
              is_rating: false,
              rating_value: null,
              is_recent_items: false,
              item_created_date: null,
              is_tags: false,
              tag_ids: null,
              is_category: false,
              category_ids: null,
              is_sub_category: false,
              sub_category_ids: null,
              is_active: response.data.is_active == 1 ? true : false,
            });
          }
          if (colType == 2) {
            this.itemCollectionForm.patchValue({
              collection_name: response.data.collection_name,
              description: response.data.description,
              store_types: response.data.store_category_type_id.split(","),
              all_eatery: false,
              all_wholesale: false,
              all_store: false,
              collection_image: response.data.collection_image ? response.data.collection_image : this.collection_category_image,
              collection_type: response.data.collection_type,
              is_all_items: response.data.is_all_items,
              is_discount: response.data.is_discount,
              is_offer: response.data.is_offer,
              is_rating: response.data.is_rating,
              rating_value: response.data.rating_value,
              is_recent_items: response.data.is_recent_items,
              item_created_date: moment(response.data.item_created_date, this.main.DateFormate.split(' ')[0]),
              is_tags: response.data.is_tags,
              tag_ids:
                response.data.tag_ids == null
                  ? null
                  : response.data.tag_ids.split(","),
              is_category: response.data.is_category,
              category_ids:
                response.data.category_ids == null
                  ? null
                  : response.data.category_ids.split(","),
              is_sub_category: response.data.is_sub_category,
              sub_category_ids:
                response.data.sub_category_ids == null
                  ? null
                  : response.data.sub_category_ids.split(',').map(Number),
              is_active: response.data.is_active == "1" ? true : false,
            });
          }
          this.storeTypeListRecord();
          this.itemTagListRecord();
          this.itemCategoryListRecord();
          this.itemSubCategoryListRecord();
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => { },
    });
  }

  async storeTypeListRecord() {
    var data = {
      token_type: 1,
    };
    await this.itemCollectionService.getStoreTypeList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.store_type_list = response.data;
          this.temp = [];
          if (this.item_collection_id) {
            this.comma_separated_store_type_value.forEach((item) => {
              this.store_type_list.forEach((element) => {
                if (element.category_id == item) {
                  this.temp.push(element);
                }
              });
            });
            this.itemCollectionForm.controls["store_types"].setValue(this.temp);
            this.cdr.detectChanges();
          }
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  async itemTagListRecord() {
    var data = {
    };
    await this.itemCollectionService.getItemTagList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.item_tag_list = response.data;
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  async itemCategoryListRecord() {
    var data = {};
    await this.itemCollectionService.getItemCategory(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.item_category_list = response.data;
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  async itemSubCategoryListRecord() {
    this.spinner.show('home')
    var data = {};
    await this.itemCollectionService.getItemSubCategory(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide('home')
          this.item_sub_category_list = response.data;
          this.retunShowItems();
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  triggerSelectFile(fileInput: HTMLInputElement) {
    fileInput.click();
  }
  /** State will change while select other check box and data will come as per checkbox condition */
  stateChanged(event: any, type: any) {
    this.temp = [];
    if (this.itemCollectionForm.value.all_store == true) {
      this.store_type_list.forEach((element) => {
        this.temp.push(element);
      });
      this.itemCollectionForm.controls["store_types"].setValue(this.temp);
    }
    if (this.itemCollectionForm.value.all_eatery == true) {
      this.store_type_list.forEach((element) => {
        if (element.iseatery == 1) {
          this.temp.push(element);
        }
      });
      this.itemCollectionForm.controls["store_types"].setValue(this.temp);
    }
    if (this.itemCollectionForm.value.all_wholesale == true) {
      this.store_type_list.forEach((element) => {
        if (element.is_whole_seller == 1) {
          this.temp.push(element);
        }
      });
      this.itemCollectionForm.controls["store_types"].setValue(this.temp);
    }
    if (
      this.itemCollectionForm.value.all_store == false &&
      this.itemCollectionForm.value.all_eatery == false &&
      this.itemCollectionForm.value.all_wholesale == false
    ) {
      this.itemCollectionForm.controls["store_types"].setValue(null);
    }
    this.retunShowItems();
  }

  onFileChange(event: any): any {
    this.file = event.target.files[0];
    if (this.file.name.indexOf(".") > -1) {
      var extension = this.file.name.split(".").pop().toLowerCase();
    } else {
      var extension = this.file.name.split("/").pop().toLowerCase();
    }
    if ($.inArray(extension, ["png", "PNG", "jpg", "jpeg"]) == -1) {
      this.toastr.error(
        this.translate.instant(
          "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO"
        )
      );
      this.file = "";
      return;
    } else if (this.file.size / 1024 >= 2048) {
      this.toastr.error(
        this.translate.instant("IMAGE_SIZE_SHOULD_BE_LESS_THAN_2_MB")
      );
      this.file = "";
      return false;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.file);

    reader.onload = (event: any) => {
      this.itemCollectionForm.controls["collection_image"].setValue(
        event.target.result
      );
      this.cdr.detectChanges();
    };
  }

  openUpdateCollectionImageModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.my_cropped_image_show;
    modalRef.componentInstance.imageChangedEvent = this.my_cropped_image
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.cropFiles = this.cropFiles

    modalRef.componentInstance.newseller =
      this.cropped_store_logo == undefined
        ? this.itemCollectionForm.value.collection_image
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
      this.itemCollectionForm.controls["collection_image"].setValue(item.crop_image_file);
      this.my_cropped_image = item.full_image;
    }
    this.cdr.detectChanges();
  }

  removeImage() {
    this.itemCollectionForm.controls["collection_image"].setValue(
      this.collection_category_image
    );
    if (this.item_collection_id) {
      this.is_image_delete = 1;
    }
    this.is_cropped_image = false;
    this.my_cropped_image = "";
  }

  retunShowItems() {
    if (!this.item_collection_id) {
      this.itemCollectionForm.patchValue({
        tag_ids: null,
        category_ids: null,
        sub_category_ids: null
      });
    } else {
      if (!this.is_firts_edit) {
        this.itemCollectionForm.patchValue({
          tag_ids: null,
          category_ids: null,
          sub_category_ids: null
        });
      }
    }

    this.temp_item_category_list = [];
    this.temp_item_sub_category_list = [];
    this.temp_item_tag_list = [];

    this.item_tag_list.forEach(element => {
      var storeTypeIds = element.store_category_type_id.split(',');
      storeTypeIds.forEach(id => {
        if (this.itemCollectionForm.value.store_types.length != 0) {
          var details = this.itemCollectionForm?.value.store_types?.filter((item) => item.category_id == id)[0];
        }

        if (details) {
          var duplicate = this.temp_item_tag_list.filter((item) => item == element)[0];
          if (duplicate) {
          }
          else {
            this.temp_item_tag_list.push(element);
          }

        }
      })
    })

    this.item_category_list.forEach((catID) => {
      if (catID.store_types != null) {
        var storetype = catID.store_types.split(",");
        storetype.forEach((item) => {
          if (this.itemCollectionForm.value.store_types.length != 0) {
            var details = this.itemCollectionForm.value.store_types?.filter(
              (event) => event.category_name == item,
              true
            )[0];
          }
          if (details) {
            var duplicate = this.temp_item_category_list.filter(
              (event) => event == catID,
              true
            )[0];
            if (duplicate) {
            } else {
              this.temp_item_category_list.push(catID);
            }
          }
        });
      }
    });

    this.item_sub_category_list.forEach((subcatID) => {
      if (subcatID.store_types != null) {
        var storetype = subcatID.store_types.split(",");
        storetype.forEach((item) => {
          if (this.itemCollectionForm.value.store_types.length != 0) {
            var details = this.itemCollectionForm.value.store_types?.filter(
              (event) => event.category_name == item,
              true
            )[0];
          }
          if (details) {
            var duplicate = this.temp_item_sub_category_list.filter(
              (event) => event == subcatID,
              true
            )[0];
            if (duplicate) {
            } else {
              this.temp_item_sub_category_list.push(subcatID);
            }
          }
        });
      }
    });

    if (this.is_firts_edit) {
      this.is_firts_edit = false;
    }
    this.cdr.detectChanges();
  }

  validationCheck(event: any) {
    if (this.itemCollectionForm.value.rating_value > 5) {
      this.toastr.error('Rating should be less than equal to 5.0')
      this.itemCollectionForm.controls['rating_value'].setValue(null)
    }
  }

  /** Submit edited/new item collection data */
  onSubmit() {
    this.itemCollectionForm.controls["item_created_date"].clearValidators();
    this.itemCollectionForm.controls["item_created_date"].updateValueAndValidity();

    if (!this.itemCollectionForm.valid) {
      const controls = this.itemCollectionForm.controls;
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
      var item_created_date;
      if (this.itemCollectionForm.value.item_created_date == undefined) {
        var today = new Date();
        item_created_date = moment(today).format(this.main.DateFormate.split(' ')[0])
      }
      else {
        item_created_date = moment(this.itemCollectionForm.value.item_created_date).format(this.main.DateFormate?.split(' ')[0])
      }

      if (this.itemCollectionForm?.value.store_types == '') {
        this.toastr.error(this.translate.instant('STORE_TYPE_SELECTION'));
        return;
      }

      var tempStoretYPE: any = [];
      this.itemCollectionForm?.value.store_types.forEach((element) => {
        tempStoretYPE.push(element.category_id);
      });

      if (!this.itemCollectionForm) {
      }

      let formData = new FormData();

      formData.append("user_id", this.main.LoggedUserInfo.user_id);
      formData.append(
        "collection_name",
        this.itemCollectionForm.value.collection_name
      );

      if (
        this.itemCollectionForm.value.description != undefined &&
        this.itemCollectionForm.value.description != null &&
        this.itemCollectionForm.value.description != ""
      ) {
        formData.append(
          "description",
          this.itemCollectionForm.value.description
        );
      } else {
        formData.append("description", "");
      }

      formData.append("store_category_type_id", tempStoretYPE);
      if (this.is_cropped_image) {
        formData.append("collection_image", this.itemCollectionForm.value.collection_image);
      }
      if (this.is_image_delete == 1 && !this.is_cropped_image) {
        formData.append("is_image_delete", this.is_image_delete);
      }

      formData.append(
        "collection_type",
        this.itemCollectionForm.value.collection_type
      );
      formData.append(
        "is_active",
        this.itemCollectionForm.value.is_active == true ? "1" : "0"
      );

      if (this.itemCollectionForm.value.collection_type == 2) {
        if (
          this.itemCollectionForm.value.is_all_items == false &&
          this.itemCollectionForm.value.is_discount == false &&
          this.itemCollectionForm.value.is_offer == false &&
          this.itemCollectionForm.value.is_rating == false &&
          this.itemCollectionForm.value.is_recent_items == false &&
          this.itemCollectionForm.value.is_tags == false &&
          this.itemCollectionForm.value.is_sub_category == false &&
          this.itemCollectionForm.value.is_category == false
        ) {
          this.toastr.error(
            this.translate.instant("SELECT_AT_LEAST_ONE_AUTOMATIC_COLLECTION")
          );
          return this.itemCollectionForm;
        }
        formData.append(
          "is_all_items",
          this.itemCollectionForm.value.is_all_items == true ? "1" : "0"
        );
        formData.append(
          "is_discount",
          this.itemCollectionForm.value.is_discount == true ? "1" : "0"
        );
        formData.append(
          "is_offer",
          this.itemCollectionForm.value.is_offer == true ? "1" : "0"
        );
        formData.append(
          "is_rating",
          this.itemCollectionForm.value.is_rating == true ? "1" : "0"
        );
        formData.append(
          "is_recent_items",
          this.itemCollectionForm.value.is_recent_items == true ? "1" : "0"
        );
        formData.append(
          "is_tags",
          this.itemCollectionForm.value.is_tags == true ? "1" : "0"
        );
        formData.append(
          "is_category",
          this.itemCollectionForm.value.is_category == true ? "1" : "0"
        );
        formData.append(
          "is_sub_category",
          this.itemCollectionForm.value.is_sub_category == true ? "1" : "0"
        );

        if (this.itemCollectionForm.value.is_rating == true) {
          if (
            this.itemCollectionForm.value.rating_value == "" ||
            this.itemCollectionForm.value.rating_value == undefined
          ) {
            this.toastr.error(this.translate.instant("ENTER_RATING_VALUE"));
            return this.itemCollectionForm;
          } else {
            formData.append(
              "rating_value",
              this.itemCollectionForm.value.rating_value
            );
          }
        }

        //date logic here
        if (this.itemCollectionForm.value.is_recent_items == true) {
          if (this.itemCollectionForm.value.item_created_date == '' || this.itemCollectionForm.value.item_created_date == undefined || this.itemCollectionForm.value.item_created_date == null) {
            this.toastr.error(this.translate.instant('SELECT_DATE'));
            return this.itemCollectionForm;
          }
          else {
            formData.append('item_created_date', item_created_date);
          }
        }
        if (this.itemCollectionForm.value.is_tags == true) {
          if (
            this.itemCollectionForm.value.tag_ids == null ||
            this.itemCollectionForm.value.tag_ids == undefined ||
            this.itemCollectionForm.value.tag_ids.length == 0
          ) {
            this.toastr.error(this.translate.instant("SELECT_ITEM_TAG"));
            return this.itemCollectionForm;
          } else {
            formData.append("tag_id", this.itemCollectionForm.value.tag_ids);
          }
        }

        if (this.itemCollectionForm.value.is_category == true) {
          if (
            this.itemCollectionForm.value.category_ids == null ||
            this.itemCollectionForm.value.category_ids == undefined ||
            this.itemCollectionForm.value.category_ids.length == 0
          ) {
            this.toastr.error(this.translate.instant("SELECT_ITEM_CATEGORY"));
            return this.itemCollectionForm;
          } else {
            formData.append(
              "category_id",
              this.itemCollectionForm.value.category_ids
            );
          }
        }

        if (this.itemCollectionForm.value.is_sub_category == true) {
          if (
            this.itemCollectionForm.value.sub_category_ids == null ||
            this.itemCollectionForm.value.sub_category_ids == undefined ||
            this.itemCollectionForm.value.sub_category_ids.length == 0
          ) {
            this.toastr.error(
              this.translate.instant("SELECT_ITEM_SUB_CATEGORY")
            );
            return this.itemCollectionForm;
          } else {
            formData.append(
              "sub_category_id",
              this.itemCollectionForm.value.sub_category_ids
            );
          }
        }
      }

      if (this.item_collection_id) {
        formData.append("item_collection_id", this.item_collection_id);
        var data = formData;
      } else {
        var data = formData;
      }

      this.itemCollectionService.add(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/item-collection`]);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {
          this._snackbarService.error(error);
        },
        complete: () => { },
      });
    }
  }

  ResetIfFalse(label) {
    if (label == 'is_rating') {
      this.itemCollectionForm.controls["rating_value"].reset();
    }
    else if (label == 'is_recent_items') {
      this.itemCollectionForm.controls["item_created_date"].reset();
    }
    else if (label == 'is_tags') {
      this.itemCollectionForm.controls["tag_ids"].reset()
    }
    else if (label == 'is_category') {
      this.itemCollectionForm.controls["category_ids"].reset();
    }
    else if (label == 'is_sub_category') {
      this.itemCollectionForm.controls["sub_category_ids"].reset();
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
    const control = this.itemCollectionForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  ValidateTag() {
    this.validate_tag_clicked = true;
  }

  ValidateCat() {
    this.validate_category_clicked = true;
  }

  ValidateSubCat() {
    this.validate_sub_category_clicked = true;
  }

  cancelClick() {
    history.back();
  }

}
