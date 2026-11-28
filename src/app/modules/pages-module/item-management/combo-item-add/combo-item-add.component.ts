import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild, OnDestroy } from "@angular/core";
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ItemService } from "src/app/services/item.service";
import { crop_rectangleComponent } from "../../model/crop-rectangle/crop-rectangle.component";
import * as moment from "moment";
import { UserRoles } from "src/app/enums/user-roles";
import { CommonService } from "src/app/services/common.service";
import { Subject, takeUntil } from "rxjs";
import { AddSelectItemComponent } from "../../model/add-select-item/add-select-item.component";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-combo-item-add",
  templateUrl: "./combo-item-add.component.html",
  styleUrls: ["./combo-item-add.component.scss"],
})
export class ComboItemAddComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject()
  comboItemId: number;
  main: any;
  formGroup: UntypedFormGroup;
  myCroppedImageShow: any;
  cropped_logo: any;
  newaddCombo: any = {};
  comboList: any = [{}];
  comboArray: UntypedFormArray;
  isCroppedImage = false;
  myCroppedImage: string;
  cropped_item_image: any;
  itemId: any;
  comboItemData: any;
  mindate: any;
  general_setting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @ViewChild('cursor') cursor: ElementRef;
  userRoleEnum = UserRoles;
  AllowManageItem: boolean = false;
  isStoreManager: boolean = false;
  croppedImages: any;
  cropFiles: any;
  session = this.appComponent.sessionConfig();
  admin_combo: boolean = false;
  tempCombo: any = [];

  constructor(
    private router: Router,
    private itemService: ItemService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cryptoService: CryptoService,
    private formBuilder: UntypedFormBuilder,
    private el: ElementRef,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    if (
      this.main.LoggedUserInfo.role_id == this.main.UserRole.SuperAdmin ||
      this.main.LoggedUserInfo.role_id == this.main.UserRole.Admin
    ) {
      this.admin_combo = true;
      this.main.LoggedUserStoreInfo = JSON.parse(localStorage.getItem("selectedStore"));
    }
    this.loadForm();
    if (location.href.indexOf("/items/comboitemedit") > -1) {
      this.itemId = this.cryptoService.decryptIdValue(
        "itemComboId" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
        this.main.CryptoKey
      );
      if (this.itemId == undefined) {
        this.router.navigate(["/items/combo"]);
      } else {
        if (this.main.LoggedUserStoreInfo.role_id == this.userRoleEnum.StoreManager) {
          this.isStoreManager = true;
          this.getStoreManagerSettings();
        }
        this.getComboData();
      }
    } else {
    }
    this.mindate = new Date();
    if (this.itemId == undefined) {
      this.addComboItem();
    }
  }

  loadForm(
    picture = "",
    name = "",
    description = "",
    discountedPrice = "",
    tax = "",
    packaging = ""
  ) {
    this.formGroup = this.formBuilder.group({
      picture: new UntypedFormControl(
        picture ? picture : this.main.LoggedUserStoreInfo.category_customer_icon
      ),
      comboName: [name, Validators.required],
      validTill: [null],
      description: [description],
      discountedPrice: [discountedPrice, Validators.required],
      tax: [null, [Validators.max(100)]],
      packaging: [packaging],
      itemCombo: this.formBuilder.array([]),
    });
  }

  getStoreManagerSettings() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id
    }

    this.commonService.getStoreSetting(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.data.manage_item == 1) {
          this.AllowManageItem = true;
        } else {
          this.AllowManageItem = false;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
      },
    })
  }

  getComboData() {
    var fd = new FormData();
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("item_id", this.itemId);
    this.itemService.getComboItemData(fd).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          let res = response.data;
          this.comboItemData = res;
          this.formGroup.patchValue({
            picture: res.item_image,
            comboName: res.item_name,
            validTill: moment(this.comboItemData.valid_till, this.DateFormateFromServerSideOnlyDateReturn()).toDate(),
            description: res.item_description,
            discountedPrice: res.item_variants[0].discounted_price,
            tax: res.item_variants[0].tax,
            packaging: res.item_variants[0].packaging
          })

          if (this.itemId) {
            this.cdr.detectChanges();
            this.cursor.nativeElement.focus();
          }

          this.comboItemData.combo_items?.forEach(comboItem => {
            var comboVarientArray = [];
            comboItem.combo_variants.forEach(comboVarient => {
              var data = {
                "combo_item_detail_id": comboVarient.combo_item_detail_id,
                "item_id": comboVarient.item_id,
                "item_variants_id": comboVarient.item_variants_id,
                "quantity": comboVarient.quantity <= 0 ? 1 : comboVarient.quantity,
                "price": comboVarient.item_price,
                "discountedprice": comboVarient.discounted_price,
                "packaging": comboVarient.packaging
              }
              comboVarientArray.push(data);
            });
            comboItem.combo_variants = [];
            comboItem.combo_variants = comboVarientArray;
          });
          this.setComboItemArray(this.comboItemData.combo_items);
          this.cdr.detectChanges();
        } else {
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  createComboItems() {
    return this.formBuilder.group({
      combo_item_id: [0],
      combo_item_name: ["", [Validators.required]],
      quantity: [null, [Validators.required]],
      combo_variants: [[], [Validators.required]],
    });
  }

  setComboItemArray(comboList) {
    this.formGroup.controls["itemCombo"] = this.formBuilder.array(
      comboList?.map((i) =>
        this.formBuilder.group({
          combo_item_id: [i.combo_item_id],
          combo_item_name: [i.combo_item_name, [Validators.required]],
          quantity: [i.quantity, [Validators.required]],
          combo_variants: [i.combo_variants, [Validators.required]],
        })
      )
    );
    this.formGroup.controls["itemCombo"].updateValueAndValidity();
    this.formGroup.get('itemCombo')['controls'].forEach(item => {
      this.formGroup.value.itemCombo.push(item.value)
    })
  }

  addComboItem() {
    if (this.formGroup.controls["itemCombo"].valid) {
      this.comboArray = this.formGroup.get("itemCombo") as UntypedFormArray;
      this.comboArray.push(this.createComboItems());
      this.formGroup.updateValueAndValidity();
    } else {
      this.formArrayControlError();
    }
  }

  formArrayControlError() {
    var flag = false
    for (let index = 0; index < this.formGroup.controls["itemCombo"]["controls"].length; index++) {
      if (this.formGroup.controls["itemCombo"]["controls"][index].value.combo_variants.length == 0) {
        flag = true
      }
    }
    if (flag) {
      this.toastr.error("Please specify the Combo Item Details (Name, Quantity)");
    } else {
      this.toastr.error("Please specify the Combo Item Details (Name, Quantity)");
    }
    const arrayControls = this.formGroup.controls["itemCombo"]["controls"];
    Object.keys(arrayControls).forEach((controlName, i) => {
      const controls =
        this.formGroup.controls["itemCombo"]["controls"][i].controls;

      Object.keys(controls).forEach((controlName1, j) => {
        controls[controlName1].markAsTouched();
      });
    });
    return
  }

  removeComboItem(comboItemId: any) {
    this.comboArray = this.formGroup.get("itemCombo") as UntypedFormArray;
    this.comboArray.removeAt(comboItemId);
    this.formGroup.updateValueAndValidity();
  }

  openImageCropModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.myCroppedImageShow;
    modalRef.componentInstance.imageChangedEvent = this.myCroppedImage
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.cropFiles = this.cropFiles
    modalRef.componentInstance.add_banner = false;
    modalRef.componentInstance.newseller =
      this.cropped_item_image == undefined
        ? this.formGroup.value.picture
        : this.cropped_item_image;

    modalRef.componentInstance.isCroppedImage = this.isCroppedImage;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.updateComboPic(receivedEntry);
    });
  }

  updateComboPic(item) {
    if (item.crop_image_file != undefined) {
      this.isCroppedImage = true;
      this.cropFiles = item.cropFiles
      this.croppedImages = item.croppedImages
      this.cropped_item_image = item.crop_image;
      this.formGroup.controls["picture"].setValue(item.crop_image_file);
      this.myCroppedImage = item.full_image;
    }
    this.cdr.detectChanges();
  }

  removeLogoImage() {
    this.formGroup.controls['picture'].setValue("assets/icons/no_image.svg");
    this.isCroppedImage = false;
    this.myCroppedImage = this.main.LoggedUserStoreInfo.category_customer_icon;
  }

  openSelectItem(comboItemId) {
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.comboItemSelection = true;

    modalRef.componentInstance.comboItemId = this.itemId ? this.itemId : 0;
    modalRef.componentInstance.initialSelectedItems = this.formGroup.get("itemCombo").value[comboItemId].combo_variants;
    if (this.admin_combo) {
      modalRef.componentInstance.admin_combo = this.admin_combo;
    }
    modalRef.componentInstance.selectedPopupItems.subscribe({
      next: (result: any) => {
        this.selectItems(comboItemId, result);
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  selectItems(id, items) {
    items.forEach(element => {
      element.combo_item_detail_id = Number(element.combo_item_detail_id)
    });
    this.formGroup.controls["itemCombo"]["controls"][
      id
    ].controls.combo_variants.setValue(items);
    this.formGroup.value.itemCombo = this.formGroup.get("itemCombo").value
  }

  formArraycontrolHasError(arrayIndex, validation, controlName): boolean {
    const control =
      this.formGroup.controls["itemCombo"]["controls"][arrayIndex].controls[
      controlName
      ];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  clearStartDate() {
    this.formGroup.controls['validTill'].setValue(null);
  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.general_setting.date_format_web.split(" ")[0];
  }

  cancelClick() {
    history.back();
  }

  ngAfterViewInit(): void {
    if (!this.itemId) {
      this.cursor.nativeElement.focus();
    }
  }

  onSubmit() {
    var is_valid: boolean = true;
    this.formGroup.get("itemCombo").value.forEach(element => {
      if (element.combo_item_name == '' || element.quantity == null) {
        is_valid = false;
        this.formArrayControlError();
      }
    });
    if (!is_valid) {
      return;
    }
    if (this.formGroup.value.comboName == "" || this.formGroup.value.discountedPrice == "") {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName, i) => {
        if (controlName != "validTill") {
          if (controlName != "itemCombo") {
            if (controlName != "picture") {
              if (controlName != "itemCombo") {
                if (i == 0) {
                  const invalidControl = this.el.nativeElement.querySelector(
                    '[formcontrolname="' + controlName + '"]'
                  );
                  invalidControl.focus();
                }
                controls[controlName].markAsTouched();
              }
            }
          }
        }
      });
    } else {
      var flag = false
      for (let index = 0; index < this.formGroup.controls["itemCombo"]["controls"].length; index++) {
        if (this.formGroup.controls["itemCombo"]["controls"][index].value.combo_variants.length == 0) {
          flag = true
        }
      }
      if (flag) {
        this.toastr.error("Please specify the Combo Item Details (Name, Quantity)");
        return
      }
      let formdata = this.formGroup.value;
      if (formdata.picture == "assets/icons/no_image.svg") {
        formdata.picture = 'null';
      }
      var fd = new FormData();
      fd.append("user_id", this.main.LoggedUserInfo.user_id);
      fd.append("store_id", this.main.LoggedUserStoreInfo.store_id);
      fd.append("item_id", this.itemId != undefined ? this.itemId : 0);

      fd.append("item_name", formdata.comboName);
      fd.append("tax", formdata.tax);
      fd.append("packaging", formdata.packaging);

      fd.append("combo_items", JSON.stringify(this.formGroup.get("itemCombo").value));
      fd.append(
        "item_description",
        formdata.description != undefined ? formdata.description : ""
      );
      fd.append("item_image", formdata.picture);
      fd.append('valid_till', formdata.validTill != null ? moment(formdata.validTill).format(this.DateFormateFromServerSideOnlyDateReturn()) : '');
      fd.append("item_price", formdata.discountedPrice);

      this.itemService.addEditComboItem(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message);
            this.router.navigate(["/items"]);
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => {
          // handle error
        },
        complete: () => { },
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
