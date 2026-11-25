import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
  HostListener
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormArray,
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { ManageStoreService } from "src/app/services/manage-store.service";
import { PosSeetingService } from "src/app/services/store-management/pos-seeting.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AddSelectItemComponent } from "../../model/add-select-item/add-select-item.component";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { cloneDeep } from "lodash";
@Component({
  selector: "app-pos-setting",
  templateUrl: "./pos-setting.component.html",
  styleUrls: ["./pos-setting.component.scss"],
})
export class POSSettingComponent implements OnInit, AfterViewInit {
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  user_role_confirm = JSON.parse(localStorage.getItem("user_role_confirm"));
  setup_steps = localStorage.getItem("setup_steps");
  deliveryboy_label = this.general_setting.deliveryboy_label;
  store_label = this.general_setting.store_label;
  khata_label = this.general_setting.khata_label;
  allow_khata = this.general_setting.allow_khata;
  global_currency = this.general_setting.currency_symbol;
  allow_wallet = this.general_setting.allow_wallet;
  offers_module = this.general_setting.offers_module;
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  subscription_model = this.platform_setting.subscription_model;
  formGroup: FormGroup;
  main: any;
  IsStoreManager = 0;
  oldmanageitem: any;
  oldmanagestore: any;
  selectedLanguage: any;
  selecteditems: any = [];
  categoryList: any = [];
  @ViewChild('cursor') cursor
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  skipShow: boolean = true;
  lastAddedItems: any = [];
  constructor(
    public translate: TranslateService,
    public manageStoreService: ManageStoreService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private formBuilder: FormBuilder,
    public PosSeetingService: PosSeetingService,
    private cdr: ChangeDetectorRef,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private modalService: NgbModal,
    private _helpService: BannerService,
    private router: Router,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }
  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    if (
      this.main.LoggedUserStoreInfo.role_id == this.main.UserRole.StoreManager
    ) {
      this.IsStoreManager = 1;
    }

    this.platform_setting =
      this.platform_setting == null
        ? this.main.platform_setting
        : this.platform_setting;
    if (this.offers_module == 1) {
      this.offers_module = this.main.LoggedUserStoreInfo.offer_module;
    }
    this.loadform();
    this.DineInSettingRecord();
    this.getHelpDetails();
  }

  //LOAD FORM
  loadform() {
    this.formGroup = this.formBuilder.group({
      pos_allowed: new FormControl(true),
      pos_guest_customer: new FormControl(true),
      pos_packaging_per_order: new FormControl(null),
      pos_min_max: new FormControl(true),
      pos_offer: new FormControl(true),
      pos_wallet: new FormControl(true),
      pos_allow_item_packaging: new FormControl(false),
      category_id: new FormControl(null),
      payment_methods: this.formBuilder.array([]),
    });
  }

  paymentRows(data?) {
    return this.formBuilder.group({
      allow_order_above_khata_limit: [
        data && data.allow_order_above_khata_limit
          ? data.allow_order_above_khata_limit
          : "",
      ],
      display_key: [data && data.display_key ? data.display_key : ""],
      is_added: [data && data.is_added ? data.is_added : ""],
      is_agree: [data && data.is_agree ? data.is_agree : ""],
      is_test_mode: [data && data.is_test_mode ? data.is_test_mode : ""],
      max_order_value: [
        data && data.max_order_value ? data.max_order_value : "",
      ],
      merchant_id: [data && data.merchant_id ? data.merchant_id : ""],
      merchant_key: [data && data.merchant_key ? data.merchant_key : ""],
      method_name: [data && data.method_name ? data.method_name : ""],
      method_name_display: [
        data && data.method_name_display ? data.method_name_display : "",
      ],
      method_type: [data && data.method_type ? data.method_type : ""],
      method_type_val: [
        data && data.method_type_val ? data.method_type_val : "",
      ],
      payment_method_id: [
        data && data.payment_method_id ? data.payment_method_id : "",
      ],
      payment_type_id: [
        data && data.payment_type_id ? data.payment_type_id : "",
      ],
      published_key: [data && data.published_key ? data.published_key : ""],
      secret_key: [data && data.secret_key ? data.secret_key : ""],
      test_published_key: [
        data && data.test_published_key ? data.test_published_key : "",
      ],
      test_secret_key: [
        data && data.test_secret_key ? data.test_secret_key : "",
      ],
      upi_id: [data && data.upi_id ? data.upi_id : ""],
    });
  }

  get paymentFormArr() {
    return this.formGroup.get("payment_methods") as FormArray;
  }

  paymentArray: FormArray;
  addPaymentItem(responseDataForPaymentMethod) {
    this.paymentArray = this.formGroup.get("payment_methods") as FormArray;
    this.paymentArray.push(this.paymentRows(responseDataForPaymentMethod));
    this.formGroup.updateValueAndValidity();
  }
  //get dineIn settings
  dineInDetails: any = [];
  store_payments: any = [];
  method_name: any = [];
  display_key: any = [];
  payment_method_id: any = [];
  //
  default_cat_id: any = [];
  async DineInSettingRecord() {
    var data = {
      store_id: this.seller_details.store_id,
    };
    await this.PosSeetingService.getPOSSettings(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.lastAddedItems = response.data.pos_exclude_items.map((variant) => variant.item_variants_id);

          this.dineInDetails = response.data;
          this.formGroup.controls["pos_allowed"].setValue(
            this.dineInDetails.pos_allowed == 1 ? true : false
          );

          this.formGroup.controls["pos_guest_customer"].setValue(
            this.dineInDetails.pos_guest_customer == 1 ? true : false
          );

          this.formGroup.controls["pos_min_max"].setValue(
            this.dineInDetails.pos_min_max == 1 ? true : false
          );

          this.formGroup.controls["pos_offer"].setValue(
            this.dineInDetails.pos_offer == 1 ? true : false
          );

          this.formGroup.controls["pos_wallet"].setValue(
            this.dineInDetails.pos_wallet == 1 ? true : false
          );

          this.formGroup.controls["pos_allow_item_packaging"].setValue(
            this.dineInDetails.pos_allow_item_packaging == 1 ? true : false
          );

          if (this.allow_wallet == 0) {
            this.formGroup.controls["pos_wallet"].setValue(false);
          }

          if (this.offers_module == 0) {
            this.formGroup.controls["pos_offer"].setValue(false);
          }

          this.categoryList = [];
          this.dineInDetails.categories_list.forEach((item) => {
            if (item.count != 0) {
              this.categoryList.push(item);
            }
          });

          if (this.dineInDetails.pos_exclude_categories) {
            var Ids: any = [];
            Ids = this.dineInDetails.pos_exclude_categories.split(",");
            this.categoryList.forEach((element) => {
              Ids.forEach((id) => {
                if (element.category_id == id) {
                  this.default_cat_id.push(element);
                }
              });
            });
            this.formGroup.controls["category_id"].setValue(this.default_cat_id);
          }

          this.formGroup.controls["pos_packaging_per_order"].setValue(
            this.dineInDetails.pos_packaging_per_order
          );

          this.selecteditems = this.dineInDetails.pos_exclude_items;
          this.store_payments = this.dineInDetails.pos_payment_methods;

          response.data.pos_payment_methods.forEach((payment) => {
            payment.is_added = payment.is_added == 1 ? true : false;
            payment.is_agree = payment.is_agree == 1 ? true : false;
            payment.allow_order_above_khata_limit =
              payment.allow_order_above_khata_limit == 1 ? true : false;
          });

          this.dineInDetails.pos_payment_methods.forEach(
            (responseDataForPaymentMethod, i) => {
              this.addPaymentItem(responseDataForPaymentMethod);
            }
          );
          this.cdr.detectChanges();
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  onPreviousButton() {
    if (this.main.LoggedUserStoreInfo.is_searchable == "1") {
      this.router.navigate([`/order-settings`])
    } else if (this.general_setting.allow_khata) {
      this.router.navigate([`/khatasettings`])
    } else {
      this.router.navigate([`/payment-setting`])
    }
  }

  onNextButton() {
    if (this.general_setting.dinein_module && this.main.LoggedUserStoreInfo.iseatery == '1') {
      this.router.navigate([`/dine-in-setting`])
    } else {
      this.router.navigate([`/storeholidays`])
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKeyPress(event: KeyboardEvent) {
    if (this.modalService.hasOpenModals() && event.keyCode === 27) {
      this.modalService.dismissAll();
    }
  }

  /** Open SelectItemsComponent modal  */
  //modal for item
  openSelectItem() {
    this.selecteditems.forEach(element => {
      if (element.item_image_ids) {
        var imageObject: any = [];
        var img = element.item_image_ids.split(',');
        img.forEach((vraiant_image: any) => {
          var found = element.item_images.filter((item: any) => item.item_image_id == vraiant_image)[0];
          if (found) {
            let obj: any = {
              image: found.image,
              thumbImage: found.image,
              type: found.type
            }
            imageObject.push(obj)
          }
        });
        element.ImageObject = imageObject;
      }
    });

    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
      backdrop: 'static',

    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.IsDineInStiing = true;
    modalRef.componentInstance.initialSelectedItems = this.selecteditems;
    modalRef.componentInstance.selectedPopupItems.subscribe((items) => {
      this.selecteditems = items;
    });
  }
  /** Submit method for add pos setting module */
  //save
  submit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
      this.toastr.error(this.translate.instant("ENTER_ALL_REQUIRED_FIELDS"));
      return;
    } else {
      var itemIdlist = this.selecteditems.map(function (item) {
        return item.item_variants_id;
      });

      var pays = [];
      this.formGroup.value.payment_methods.forEach((element: any) => {
        if (element.is_added == true) {
          element.is_added = 1;
          (element.max_order_value = Number(element.max_order_value).toFixed(
            2
          )),
            pays.push(element);
        }
      });

      if (pays.length == 0) {
        this.toastr.error(this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_PAYMENT_METHOD"));
        return;
      }

      var cat_ids = [];
      if (this.formGroup.value.category_id) {
        this.formGroup.value.category_id.forEach((element) => {
          cat_ids.push(element.category_id);
        });
      }
      var data = {
        store_id: this.seller_details.store_id,

        pos_allowed: this.formGroup.value.pos_allowed == true ? 1 : 0,

        pos_guest_customer:
          this.formGroup.value.pos_guest_customer == true ? 1 : 0,

        pos_packaging_per_order: this.formGroup.value.pos_packaging_per_order,

        pos_min_max: this.formGroup.value.pos_min_max == true ? 1 : 0,

        pos_offer: this.formGroup.value.pos_offer == true ? 1 : 0,

        pos_wallet: this.formGroup.value.pos_wallet == true ? 1 : 0,

        pos_allow_item_packaging:
          this.formGroup.value.pos_allow_item_packaging == true ? 1 : 0,

        pos_exclude_items: itemIdlist.toString(),

        pos_exclude_categories: cat_ids.toString(),

        pos_payment_methods: JSON.stringify(pays),
        previously_pos_exclude_items: this.lastAddedItems.toString()
      };

      this.PosSeetingService.savePOSSettings(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.skipShow = false;
            localStorage.setItem('setup_steps', '7');
            this.seller_details.pos_allowed = response.data.pos_allowed
            localStorage.setItem("loginUserStore", JSON.stringify(this.seller_details));
            this._snackbarService.success(response.message);
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
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '102'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '102'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '102'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_details = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

}
