import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  UntypedFormArray,
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { ManageStoreService } from "src/app/services/manage-store.service";
import { DineInService } from "src/app/services/store-management/dine-in.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AddSelectItemComponent } from "../../model/add-select-item/add-select-item.component";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-dine-in-setting",
  templateUrl: "./dine-in-setting.component.html",
  styleUrls: ["./dine-in-setting.component.scss"],
})
export class DineInSettingComponent implements OnInit, AfterViewInit {
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  deliveryboy_label = this.general_setting.deliveryboy_label;
  store_label = this.general_setting.store_label;
  khata_label = this.general_setting.khata_label;
  allow_khata = this.general_setting.allow_khata;
  global_currency = this.general_setting.currency_symbol;
  allow_wallet = this.general_setting.allow_wallet;
  offers_module = this.general_setting.offers_module;
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  subscription_model = this.PlatformSetting.subscription_model;
  formGroup: UntypedFormGroup;
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
  pos_allowed: any;
  constructor(
    public translate: TranslateService,
    public manageStoreService: ManageStoreService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private formBuilder: UntypedFormBuilder,
    public DineInService: DineInService,
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

    this.PlatformSetting =
      this.PlatformSetting == null
        ? this.main.platform_setting
        : this.PlatformSetting;
    if (this.offers_module == 1) {
      this.offers_module = this.main.LoggedUserStoreInfo.offer_module;
    }
    this.pos_allowed = this.main.LoggedUserStoreInfo.pos_allowed
    if (this.pos_allowed == 1) {
      this.pos_allowed = this.main.LoggedUserStoreInfo.pos == 1 ? 1 : 0;
    }
    this.loadform();
    this.DineInSettingRecord();
    this.getHelpDetails();
  }

  //LOAD FORM
  loadform() {
    this.formGroup = this.formBuilder.group({
      dine_in_allowed: new UntypedFormControl(true),
      dine_in_guest_customer: new UntypedFormControl(true),
      dine_in_packaging_per_order: new UntypedFormControl(null),
      dine_in_min_max: new UntypedFormControl(true),
      dine_in_offer: new UntypedFormControl(true),
      dine_in_wallet: new UntypedFormControl(true),
      dinein_allow_item_packaging: new UntypedFormControl(false),
      category_id: new UntypedFormControl(null),
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
    return this.formGroup.get("payment_methods") as UntypedFormArray;
  }

  paymentArray: UntypedFormArray;
  addPaymentItem(responseDataForPaymentMethod) {
    this.paymentArray = this.formGroup.get("payment_methods") as UntypedFormArray;
    this.paymentArray.push(this.paymentRows(responseDataForPaymentMethod));
    this.formGroup.updateValueAndValidity();
  }
  //get dineIn settings
  dineInDetails: any = [];
  store_payments: any = [];
  method_name: any = [];
  display_key: any = [];
  payment_method_id: any = [];
  default_cat_id: any = [];
  async DineInSettingRecord() {
    var data = {
      store_id: this.seller_details.store_id,
    };
    await this.DineInService.getDineInSettings(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.dineInDetails = response.data;
          this.formGroup.controls["dine_in_allowed"].setValue(
            this.dineInDetails.dine_in_allowed == 1 ? true : false
          );
          this.formGroup.controls["dine_in_guest_customer"].setValue(
            this.dineInDetails.dine_in_guest_customer == 1 ? true : false
          );

          this.formGroup.controls["dine_in_min_max"].setValue(
            this.dineInDetails.dine_in_min_max == 1 ? true : false
          );

          this.formGroup.controls["dine_in_offer"].setValue(
            this.dineInDetails.dine_in_offer == 1 ? true : false
          );

          this.formGroup.controls["dine_in_wallet"].setValue(
            this.dineInDetails.dine_in_wallet == 1 ? true : false
          );

          this.formGroup.controls["dinein_allow_item_packaging"].setValue(
            this.dineInDetails.dinein_allow_item_packaging == 1 ? true : false
          );

          if (this.allow_wallet == 0) {
            this.formGroup.controls["dine_in_wallet"].setValue(false);
          }

          if (this.offers_module == 0) {
            this.formGroup.controls["dine_in_offer"].setValue(false);
          }

          this.categoryList = [];
          this.dineInDetails.categories_list.forEach((item) => {
            if (item.count != 0) {
              this.categoryList.push(item);
            }
          });

          var Ids: any = [];
          Ids = this.dineInDetails.dine_in_exclude_categories.split(",");
          this.categoryList.forEach((element) => {
            Ids.forEach((id) => {
              if (element.category_id == id) {
                this.default_cat_id.push(element);
              }
            });
          });
          this.formGroup.controls["category_id"].setValue(this.default_cat_id);

          this.formGroup.controls["dine_in_packaging_per_order"].setValue(
            this.dineInDetails.dine_in_packaging_per_order
          );
          if (this.dineInDetails.dine_in_exclude_items && this.dineInDetails.dine_in_exclude_items != "") {
            this.selecteditems = this.dineInDetails.dine_in_exclude_items.split(',');
          }
          this.store_payments = this.dineInDetails.dine_in_payment_methods;

          response.data.dine_in_payment_methods.forEach((payment) => {
            payment.is_added = payment.is_added == 1 ? true : false;
            payment.is_agree = payment.is_agree == 1 ? true : false;
            payment.allow_order_above_khata_limit =
              payment.allow_order_above_khata_limit == 1 ? true : false;
          });

          this.dineInDetails.dine_in_payment_methods.forEach(
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
  /** Open SelectItemsComponent modal */
  //modal for item
  openSelectItem() {
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.IsDineInStiing = true;
    modalRef.componentInstance.initialSelectedItems = this.selecteditems;
    modalRef.componentInstance.selectedPopupItems.subscribe((items) => {
      this.selecteditems = items;
    });
  }

  onPreviousButton() {
    if (this.general_setting.pos_module && this.pos_allowed == '1') {
      this.router.navigate([`/possetting`])
    } else if (this.main.LoggedUserStoreInfo.is_searchable == "1") {
      this.router.navigate([`/order-settings`])
    } else if (this.general_setting.allow_khata) {
      this.router.navigate([`/khatasettings`])
    } else {
      this.router.navigate([`/payment-setting`])
    }
  }

  onNextButton() {
    if (this.general_setting.dinein_module && this.main.LoggedUserStoreInfo.iseatery == '1') {
      this.router.navigate([`/manage-table`])
    } else {
      this.router.navigate([`/storeholidays`])
    }
  }

  /** Submit for add dine in setting data */
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
        return item?.item_variants_id;
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
      this.formGroup.value.category_id.forEach((element) => {
        cat_ids.push(element.category_id);
      });
      var data = {
        store_id: this.seller_details.store_id,
        dine_in_allowed: this.formGroup.value.dine_in_allowed == true ? 1 : 0,
        dine_in_guest_customer:
          this.formGroup.value.dine_in_guest_customer == true ? 1 : 0,
        dine_in_packaging_per_order:
          this.formGroup.value.dine_in_packaging_per_order,
        dine_in_min_max: this.formGroup.value.dine_in_min_max == true ? 1 : 0,
        dine_in_offer: this.formGroup.value.dine_in_offer == true ? 1 : 0,
        dine_in_wallet: this.formGroup.value.dine_in_wallet == true ? 1 : 0,
        dinein_allow_item_packaging:
          this.formGroup.value.dinein_allow_item_packaging == true ? 1 : 0,
        dine_in_exclude_items: itemIdlist.toString(),
        dine_in_exclude_categories: cat_ids.toString(),
        dine_in_payment_methods: JSON.stringify(pays),
      };
      this.DineInService.saveDine_InSettings(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.skipShow = false;
            this.seller_details.dine_in_allowed = response.data.dine_in_allowed
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
      data.module_key = '101'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '101'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '101'
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
