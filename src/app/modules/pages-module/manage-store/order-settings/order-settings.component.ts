import { Component, OnInit, ViewChild, Input, AfterViewInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  UntypedFormArray,
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { ManageStoreService } from "src/app/services/manage-store.service";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import * as moment from "moment";
import { DeliveryInfoModelComponent } from "../../model/delivery-info/delivery-info.component";
import { SlotCutoffMethodinfoModelComponent } from "../../model/slot-cutoff-method-info/slot-cutoff-method-info.component";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import { CityAreaModelComponent } from "../../model/city-area/city-area.component";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { ToastrService } from "ngx-toastr";
import { CommonService } from "src/app/services/common.service";

export const MY_FORMATS = {
  parse: {
    dateInput: "YYYY/MM/DD",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@Component({
  selector: "app-order-settings",
  templateUrl: "./order-settings.component.html",
  styleUrls: ["./order-settings.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class OrderSettingsComponent implements OnInit, AfterViewInit {
  @Input() mode: "12h" | "24h" = "24h";
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  dupliacte_ordersetting = localStorage.getItem("dupliacte_order");
  setup_steps = localStorage.getItem("setup_steps");
  deliveryboy_label = this.general_setting.deliveryboy_label;
  global_currency = this.general_setting.currency_symbol;
  pincode_label = this.general_setting.pincode_label;
  delivery_radius_type = this.general_setting.delivery_radius_type;
  customer_location_type = parseInt(this.general_setting.customer_location_type);
  pincode_length = this.general_setting.pincode_length;
  customer_location_Name =
    this.customer_location_type == 1
      ? "DISTANCE"
      : this.customer_location_type == 2
        ? "Area, City"
        : this.pincode_label;
  moment: any = moment;
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  business_model = this.platform_setting.business_model;
  subscription_model = this.platform_setting.subscription_model;
  order_settings = this.platform_setting.order_settings;
  isFullAccessSetting =
    this.order_settings == 2 && this.subscription_model != 1 ? true : false;
  closeResult: string;
  orderSettingId: any;
  orderModeDisabled: boolean = false;
  paymentSettingShow: boolean = false;
  paymentSettingDisabled: boolean = false;
  deliverydetails: any = {
    to_min: "",
    from_min: "",
    from_pincode: "",
    to_pincode: "",
  };
  iseatery = this.seller_details.iseatery;
  areacitycount: number = 0;
  expressAreaCityCount: number = 0;
  submitData: any;
  deliveryChargeTypeList: any = [];
  store_label = this.general_setting.store_label;
  khata_label = this.general_setting.khata_label;
  allow_khata = this.general_setting.allow_khata;
  delivery_form: UntypedFormGroup;
  main: any;
  oldmanageitem: any;
  oldmanagestore: any;
  selectedLanguage: any;
  PickupTimeFormate: any = [
    { id: 1, name: "MINS" },
    { id: 2, name: "HOURS" },
    { id: 3, name: "DAYS" },
  ];
  delivery_zone = this.customer_location_type;
  express_delivery_zone = this.customer_location_type;
  delivery: number = 1;
  expressDelivery: number = 2;
  pickup: number = 3;
  isSuperAdmin = false;
  orderModeShow = false;
  slotCutOffMethods: any = [
    { id: 1, name: "CLOCK_BASED" },
    { id: 2, name: "TIME_BASED" },
  ];
  BeforeCutoffTimeDays: any = [];
  AfterDeliveryCutoffTimeDays: any = [];
  AfterExpressDeliveryCutoffTimeDays: any = [];
  AfterPickupCutoffTimeDays: any = [];
  deliveryareas = [];
  expressDeliveryAreas = [];
  paymentArray: UntypedFormArray;
  pincodeArray: UntypedFormArray;
  expressPincodeArray: UntypedFormArray;
  deliveryTimesArray: UntypedFormArray;
  expressDeliveryTimesArray: UntypedFormArray;
  pickupTimesArray: UntypedFormArray;
  areaCityPopupType: number;
  panelid = 1;
  @ViewChild('cursor') cursor
  allow_alphanumeric_pincode: number;
  disabledData;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  helpDetailsDeliverySetting: any;
  helpDetailsExprsDeliverySetting: any;
  helpDetailsPickupSetting: any;
  helpDetailsslotCutOff: any;
  skipShow: boolean = true;
  pos_allowed: any;

  constructor(
    public translate: TranslateService,
    public manageStoreService: ManageStoreService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private formBuilder: UntypedFormBuilder,
    private modalService: NgbModal,
    private cryptoService: CryptoService,
    private router: Router,
    private _helpService: BannerService,
    private spinner: SpinnerService,
    public commonService: CommonService,

  ) {
    translate.addLangs(["it", "en", "de"]);
    translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadForm();
    this.getDeliveryChargeType();
    for (var i = 0; i <= 10; i++) {
      var data = { id: i, name: i };
      this.BeforeCutoffTimeDays.push(data);
    }

    this.platform_setting =
      this.platform_setting == null
        ? this.main.platform_setting
        : this.platform_setting;

    this.paymentSettingShow =
      this.order_settings == 1
        ? true
        : this.isFullAccessSetting == true
          ? true
          : false;

    this.orderModeShow = this.order_settings == 2 ? true : false;
    if (
      this.main.LoggedUserInfo.role_id == this.main.UserRole.SuperAdmin ||
      this.main.LoggedUserInfo.role_id == this.main.UserRole.Admin
    ) {
      this.isSuperAdmin = true;
      if (location.href.indexOf("/order-settings") > -1) {
        this.orderSettingId = this.cryptoService.decryptIdValue(
          "lookup_orderSetting_Id" +
          this.main.LoggedUserInfo.role_id?.toString(),
          this.main.CryptoKey
        );
        if (this.orderSettingId == undefined) {
          this.router.navigate(["/order-setting-list"]);
        }
      }
    } else {
      this.paymentSettingShow = true;
      this.orderModeShow = true;
      this.orderModeDisabled =
        this.order_settings == 1 && this.subscription_model == 1
          ? false
          : this.order_settings == 2
            ? true
            : false;
      this.paymentSettingDisabled = this.subscription_model != 1 ? true : false;
    }

    if (this.isSuperAdmin == true) {
      this.delivery_form.value.isDelivery = false;
      this.delivery_form.value.isExpressDelivery = false;
      this.delivery_form.value.isPickUp = false;
      this.delivery_form.value.delivery_charge_type = 1;
      this.delivery_form.value.delivery_time_type = 0;
      this.delivery_form.value.pickup_time_type = 0;
      this.delivery_form.value.delivery_times = [];
      this.delivery_form.value.pickup_times = [];
      this.delivery_form.value.pincode_range = [];
      this.delivery_form.value.express_delivery_charge_type = 1;
      this.delivery_form.value.express_delivery_time_type = 0;
      this.delivery_form.value.express_pincode_range = [];
      this.delivery_form.value.is_active = true;
      this.delivery_form.value.delivery_radius = "";
      this.delivery_form.value.delivery_times.push({
        from_time: "",
        to_time: "",
        max_order: "",
      });
      this.delivery_form.value.pickup_times.push({
        from_time: "",
        to_time: "",
        max_order: "",
      });
      this.delivery_form.value.pincode_range.push({
        from_pincode: "",
        to_pincode: "",
      });
      this.delivery_form.value.express_pincode_range.push({
        from_pincode: "",
        to_pincode: "",
      });

      if (this.orderSettingId > 0) {
        this.GetDeliverySettings();
      }
      else {
        this.deliverydetails.store_count = 0;
        this.GetPlatformPaymentMethods();
      }
    }
    else {
      this.GetDeliverySettings();
    }
    this.allow_alphanumeric_pincode = parseInt(
      this.general_setting.allow_alphanumeric_pincode
    );
    this.type = this.allow_alphanumeric_pincode == 1 ? "text" : "number";
    this.disabledData = this.isSuperAdmin == true && this.order_settings == 2 ? false :
      this.order_settings == 2 && this.isSuperAdmin == false ? true : false;
    this.pos_allowed = this.seller_details.pos == 1 ? 1 : 0;
    this.getHelpDetails();
    this.getHelpDetailsDeliverySetting();
    this.getHelpDetailsExprsDeliverySetting();
    this.getHelpDetailsPickupSetting();
    this.getHelpDetailsslotCutOff();
  }

  /** Open DeliveryInfoModelComponent modal */
  openinfo() {
    const modalRef = this.modalService.open(DeliveryInfoModelComponent, {
      size: "lg-600",
    });
    modalRef.componentInstance.generalSetting = this.general_setting;
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }

  openslotCutOffMethodinfo() {
    const modalRef = this.modalService.open(
      SlotCutoffMethodinfoModelComponent,
      {
        size: "lg-600",
      }
    );
    modalRef.componentInstance.generalSetting = this.general_setting;
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  /** Open CityAreaModelComponent modal */
  openSelectCityArea(deliverytype: any) {
    this.areaCityPopupType = deliverytype;
    const modalRef = this.modalService.open(CityAreaModelComponent, {
      size: "xl",
      backdrop: 'static',
    });
    modalRef.componentInstance.deliveryareas = this.deliveryareas;
    modalRef.componentInstance.expressDeliveryAreas = this.expressDeliveryAreas;
    modalRef.componentInstance.areaCityPopupType = this.areaCityPopupType;
    modalRef.componentInstance.store_id = this.seller_details.store_id;
    modalRef.componentInstance.isSuperAdmin = this.isSuperAdmin;
    modalRef.result.then(
      (result) => {
        this.GetDeliveryAreaList(deliverytype);
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
    modalRef.componentInstance.totalareacitycount.subscribe(
      (receivedEntry: any) => {
        this.deliveryareas = receivedEntry;
        this.areacitycount = receivedEntry.length;
      }
    );
    modalRef.componentInstance.totalexpressAreaCityCount.subscribe(
      (receivedEntry: any) => {
        this.expressDeliveryAreas = receivedEntry;
        this.expressAreaCityCount = receivedEntry.length;
      }
    );
  }

  loadForm() {
    this.delivery_form = this.formBuilder.group({
      order_setting_name: new UntypedFormControl(),
      isDelivery: new UntypedFormControl(false),
      isExpressDelivery: new UntypedFormControl(false),
      isPickUp: new UntypedFormControl(false),
      allow_cancellation: new UntypedFormControl(),
      isAcceptAfterClose: new UntypedFormControl(),
      packaging_per_order: new UntypedFormControl(),
      delivery_radius: new UntypedFormControl(),
      min_order_amount: new UntypedFormControl(),
      delivery_charge_type: new UntypedFormControl(1),
      delivery_charge_id: new UntypedFormControl(),
      delivery_charges: new UntypedFormControl(),
      upto_distance: new UntypedFormControl(),
      additional_charges: new UntypedFormControl(),
      per_distance: new UntypedFormControl(),
      delivery_time_type: new UntypedFormControl(0),
      from_min: new UntypedFormControl(),
      to_min: new UntypedFormControl(),
      DeliveryTimeFormateType: new UntypedFormControl(),
      from_time: new UntypedFormControl(),
      to_time: new UntypedFormControl(),
      delivery_slot_count: new UntypedFormControl(),
      selectedDeliverySlotCutoffMethod: new UntypedFormControl(),
      SelectedDeliveryBeforeCutoffTimeDays: new UntypedFormControl(),
      SelectdDeliveryAfterCutoffTimeDays: new UntypedFormControl(),
      allowScheduling: new UntypedFormControl(),
      delivery_gap: new UntypedFormControl(),
      pincode_type: new UntypedFormControl(1),
      pincode_list: new UntypedFormControl(),
      delivery_cut_off_time: new UntypedFormControl(),
      express_delivery_radius: new UntypedFormControl(),
      express_pincode_type: new UntypedFormControl(),
      express_pincode_list: new UntypedFormControl(),
      from_pincode: new UntypedFormControl(),
      to_pincode: new UntypedFormControl(),
      detail_charge_type: new UntypedFormControl(),
      express_delivery_charge_type: new UntypedFormControl(1),
      express_delivery_charge_id: new UntypedFormControl(),
      express_additional_charges: new UntypedFormControl(),
      express_delivery_charges: new UntypedFormControl(),
      express_upto_distance: new UntypedFormControl(),
      delivery_times: this.formBuilder.array([]),
      express_delivery_times: this.formBuilder.array([]),
      pickup_times: this.formBuilder.array([]),
      payment_methods: this.formBuilder.array([]),
      pincode_range: this.formBuilder.array([]),
      express_pincode_range: this.formBuilder.array([]),
      express_per_distance: new UntypedFormControl(),
      express_delivery_time_type: new UntypedFormControl(0),
      express_from_min: new UntypedFormControl(),
      express_to_min: new UntypedFormControl(),
      express_delivery_time_formate_type: new UntypedFormControl(),
      express_delivery_min_order_amount: new UntypedFormControl(0),
      SelectedExpressDeliveryBeforeCutoffTimeDays: new UntypedFormControl(),
      SelectdExpressDeliveryAfterCutoffTimeDays: new UntypedFormControl(),
      express_delivery_cut_off_time: new UntypedFormControl(),
      selectdExpressDeliverySlotCutoffMethod: new UntypedFormControl(),
      max_order: new UntypedFormControl(0),
      express_delivery_slot_count: new UntypedFormControl(),
      pickup_time_type: new UntypedFormControl(0),
      pickup_from: new UntypedFormControl(),
      pickup_to: new UntypedFormControl(),
      pickup_gap: new UntypedFormControl(),
      allowPickupScheduling: new UntypedFormControl(),
      selectedPickupAfterCutoffTimeDays: new UntypedFormControl(),
      selectedPickupBeforeCutoffTimeDays: new UntypedFormControl(),
      pickup_cut_off_time: new UntypedFormControl(),
      selectedPickupSlotCutoffMethod: new UntypedFormControl(),
      pickup_slot_count: new UntypedFormControl(),
      PickupTimeFormateType: new UntypedFormControl(),
      is_active: new UntypedFormControl(true),
    });
  }

  onPreviousButton() {
    if (this.general_setting.allow_khata) {
      this.router.navigate([`/khatasettings`])
    } else {
      this.router.navigate([`/payment-setting`])
    }
  }

  onNextButton() {
    if (this.general_setting.pos_module && this.pos_allowed == '1') {
      this.router.navigate([`/possetting`])
    } else if (this.general_setting.dinein_module && this.main.LoggedUserStoreInfo.iseatery == '1') {
      this.router.navigate([`/dine-in-setting`])
    } else {
      this.router.navigate([`/storeholidays`])
    }
  }

  getSelectdBeforeCutoffTimeDays(item: any, type: any) {
    if (type == 1) {
      this.AfterDeliveryCutoffTimeDays = [];
      for (let i = item; i <= item + 9; i++) {
        var data = { id: i, name: i };
        this.AfterDeliveryCutoffTimeDays.push(data);
      }
      this.delivery_form.controls["SelectdDeliveryAfterCutoffTimeDays"].setValue(this.delivery_form.value.SelectedDeliveryBeforeCutoffTimeDays);
    } else if (type == 2) {
      this.AfterExpressDeliveryCutoffTimeDays = [];
      for (let i = item; i <= item + 9; i++) {
        var data = { id: i, name: i };
        this.AfterExpressDeliveryCutoffTimeDays.push(data);
        this.delivery_form.controls["SelectdExpressDeliveryAfterCutoffTimeDays"].setValue(this.delivery_form.value.SelectedExpressDeliveryBeforeCutoffTimeDays);
      }
    } else if (type == 3) {
      this.AfterPickupCutoffTimeDays = [];
      for (let i = item; i <= item + 9; i++) {
        var data = { id: i, name: i };
        this.AfterPickupCutoffTimeDays.push(data);
      }
      this.delivery_form.controls["selectedPickupAfterCutoffTimeDays"].setValue(this.delivery_form.value.selectedPickupBeforeCutoffTimeDays);
    }
  }

  zeroNotValid(event: any, Type: any) {
    if (event.target.name == "max_order") {
      event.max_order = event.target.value;
      if (event.max_order != "") {
        if (Number(event.max_order) <= 0) {
          this.toastr.error(
            this.translate.instant("MAX_ORDER_VALUE_TO_BE_GREATER_ZERO")
          );
          event.target.value = "";
          return false;
        }
      }
    }
    if (
      event.target.name == "delivery_slot_count" ||
      event.target.name == "express_delivery_slot_count" ||
      event.target.name == "pickup_slot_count"
    ) {
      if (event.target.value != "") {
        if (Number(event.target.value) <= 0) {
          this.toastr.error(
            this.translate.instant("SHOW_UPCOMING_SLOTS_SHOULD_BE_GRATER_0")
          );
          event.target.value = "";
          return false;
        }
        if (event.target.value > 99) {
          event.target.value = event.target.value.slice(0, -1);
        }
      }
    }
  }

  validateFloatNumber(price: any) {
    if (price.split(".").length > 1 && price.split(".")[0] == "") {
      price = "";
    }
    if (price.split(".").length > 2) {
      price = price.split(".")[0] + "." + price.split(".")[1];
    }

    if (price.split(".").length > 1 && price.split(".")[1] > 99) {
      price = Number(price).toFixed(2);
    }

    return price;
  }

  GetPlatformPaymentMethods() {
    var data = {};
    this.manageStoreService.getPlatformPaymentMethods(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach((payment) => {
            if (payment.is_added == 1) {
              payment.is_added = false
            }
            payment.is_agree = payment.is_agree == 1 ? true : false;
            payment.allow_order_above_khata_limit =
              payment.allow_order_above_khata_limit == 1 ? true : false;
          });

          this.deliverydetails.store_payments = response.data;
          this.deliverydetails.store_payments.forEach(
            (responseDataForPaymentMethod, i) => {
              this.addPaymentItem(responseDataForPaymentMethod);
            }
          );
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        //error
        this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  GetDeliveryAreaList(deliveryType: any) {
    var data1 = {
      store_id: this.seller_details.store_id,
      delivery_type: deliveryType,
    };
    this.manageStoreService.getStoreDeliveryAreaList(data1).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (deliveryType == 1) {
            this.deliveryareas = response.data;
            this.areacitycount = response.data.length;
          } else {
            this.expressDeliveryAreas = response.data;
            this.expressAreaCityCount = response.data.length;
          }
        } else {
          if (deliveryType == 1) {
            this.deliveryareas = [];
            this.areacitycount = 0;
          } else {
            this.expressDeliveryAreas = [];
            this.expressAreaCityCount = 0;
          }
        }
      },
      error: (error: any) => {
        if (deliveryType == 1) {
          this.deliveryareas = [];
          this.areacitycount = 0;
        } else {
          this.expressDeliveryAreas = [];
          this.expressAreaCityCount = 0;
        }
      },
    });
  }

  getDeliveryChargeType() {
    var data = {};
    this.manageStoreService.getDeliveryChargeType(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.deliveryChargeTypeList = response.data;
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      },
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
    return this.delivery_form.get("payment_methods") as UntypedFormArray;
  }

  pincodeRows(data?) {
    return this.formBuilder.group({
      from_pincode: [data && data.from_pincode ? data.from_pincode : ""],
      to_pincode: [data && data.to_pincode ? data.to_pincode : ""],
    });
  }

  get pincodeFormArr() {
    return this.delivery_form.get("pincode_range") as UntypedFormArray;
  }

  newPincodeRange() {
    this.pincodeFormArr.push(this.pincodeRows());
  }

  deletePincodeRow(index: number) {
    this.pincodeFormArr.removeAt(index);
  }

  get expresspPincodeFormArr() {
    return this.delivery_form.get("express_pincode_range") as UntypedFormArray;
  }

  newExpressPincodeRange() {
    this.expresspPincodeFormArr.push(this.pincodeRows());
  }

  deleteExpressPincodeRow(index: number) {
    this.expresspPincodeFormArr.removeAt(index);
  }

  initRows(data?) {
    return this.formBuilder.group({
      from_time: [data && data.from_time ? data.from_time : ""],
      to_time: [data && data.to_time ? data.to_time : ""],
      max_order: [data && data.max_order ? data.max_order : ""],
    });
  }

  get deliveryFormArr() {
    return this.delivery_form.get("delivery_times") as UntypedFormArray;
  }

  newDeliveryRange() {
    var validation = 0;
    if (this.delivery_form.value.delivery_times.length > 0) {
      this.delivery_form.value.delivery_times.forEach((element: any) => {
        if (element.from_time == "") {
          validation = 1;
        } else if (element.to_time == "") {
          validation = 2;
        }
      });
    }
    if (validation == 1) {
      this.toastr.error(
        this.translate.instant("ADD_THE_SLOT_START_TIME_FOR_DELIVERY")
      );
      return;
    } else if (validation == 2) {
      this.toastr.error(
        this.translate.instant("ADD_THE_SLOT_END_TIME_FOR_DELIVERY")
      );
      return;
    } else {
      this.deliveryFormArr.push(this.initRows());
    }
  }

  deleteDeliveryRow(index: number) {
    this.deliveryFormArr.removeAt(index);
  }

  get expressDeliveryFormArr() {
    return this.delivery_form.get("express_delivery_times") as UntypedFormArray;
  }

  newExpressDeliveryRange() {
    var validation = 0;
    if (this.delivery_form.value.express_delivery_times.length > 0) {
      this.delivery_form.value.express_delivery_times.forEach(
        (element: any) => {
          if (element.from_time == "") {
            validation = 1;
          } else if (element.to_time == "") {
            validation = 2;
          }
        }
      );
    }
    if (validation == 1) {
      this.toastr.error(
        this.translate.instant("ADD_THE_SLOT_START_TIME_FOR_EXPRESS_DELIVERY")
      );
      return;
    } else if (validation == 2) {
      this.toastr.error(
        this.translate.instant("ADD_THE_SLOT_END_TIME_FOR_EXPRESS_DELIVERY")
      );
      return;
    } else {
      this.expressDeliveryFormArr.push(this.initRows());
    }
  }

  deleteExpressDeliveryRow(index: number) {
    this.expressDeliveryFormArr.removeAt(index);
  }

  get pickupTimesFormArr() {
    return this.delivery_form.get("pickup_times") as UntypedFormArray;
  }

  newpickupTimesRange() {
    this.pickupTimesFormArr.push(this.initRows());
  }

  deletepickupTimesRow(index: number) {
    this.pickupTimesFormArr.removeAt(index);
  }
  orderSettingIdData;
  GetDeliverySettings() {
    if (this.isSuperAdmin == true) {
      var fd = new FormData();
      this.orderSettingIdData = this.orderSettingId;
      fd.append("order_setting_id", this.orderSettingId);
      var data = fd;
      this.manageStoreService.editOrderSettings(data).subscribe({
        next: (response: any) => {
          this.orderSettingId = undefined;
          this.setFormDataAtLoad(response);
        },
        error: (error: any) => {
          this.toastr.error(this.translate.instant(error.message));
          //error
        },
      });
    } else {
      let data = {
        store_id: this.seller_details.store_id,
      };

      this.manageStoreService.getDeliverySettings(data).subscribe({
        next: (response: any) => {
          this.setFormDataAtLoad(response);
        },
        error: (error: any) => {
          this.toastr.error(this.translate.instant(error.message));
          //error
        },
      });
    }
  }

  setFormDataAtLoad(response) {
    if (response.status == 1) {
      this.deliverydetails = response.data;
      response.data.store_payments.forEach((payment) => {
        payment.is_added = payment.is_added == 1 ? true : false;
        payment.is_agree = payment.is_agree == 1 ? true : false;
        payment.allow_order_above_khata_limit =
          payment.allow_order_above_khata_limit == 1 ? true : false;
      });
      this.deliverydetails.store_payments.forEach(
        (responseDataForPaymentMethod, i) => {
          this.addPaymentItem(responseDataForPaymentMethod);
        }
      );

      this.delivery_form.controls["is_active"].setValue(
        this.deliverydetails.is_active == 1 ? true : false
      );
      this.delivery_form.controls["isDelivery"].setValue(
        this.deliverydetails.delivery == 1 ? true : false
      );
      this.delivery_form.controls["delivery_slot_count"].setValue(
        this.deliverydetails.delivery_slot_count == 0
          ? ""
          : this.deliverydetails.delivery_slot_count
      );
      this.delivery_form.controls["delivery_charge_type"].setValue(
        this.deliverydetails.delivery_charge_type != 0
          ? this.deliverydetails.delivery_charge_type
          : 1
      );
      this.delivery_form.controls["selectedDeliverySlotCutoffMethod"].setValue(
        Number(
          this.deliverydetails.delivery_cut_off_method == 0
            ? 1
            : this.deliverydetails.delivery_cut_off_method
        )
      );
      this.delivery_form.controls["DeliveryTimeFormateType"].setValue(
        this.deliverydetails.delivery_duration == 0 ||
          this.deliverydetails.delivery_duration == undefined ?
          this.PickupTimeFormate[0].id :
          this.deliverydetails.delivery_duration
      );
      this.delivery_form.controls[
        "SelectedDeliveryBeforeCutoffTimeDays"
      ].setValue(
        this.deliverydetails.delivery_before_cut_off == 0
          ? 1
          : this.deliverydetails.delivery_before_cut_off
      );
      this.getSelectdBeforeCutoffTimeDays(
        this.delivery_form.value.SelectedDeliveryBeforeCutoffTimeDays,
        this.delivery
      );
      this.delivery_form.controls[
        "SelectdDeliveryAfterCutoffTimeDays"
      ].setValue(
        this.deliverydetails.delivery_after_cut_off == 0
          ? 1
          : this.deliverydetails.delivery_after_cut_off
      );

      if (
        this.deliverydetails.delivery_times == null ||
        this.deliverydetails.delivery_times.length == 0
      ) {
        this.deliverydetails.delivery_times = [];
        this.deliverydetails.delivery_times.push({
          from_time: "",
          to_time: "",
          max_order: 8,
        });
      }
      this.deliverydetails.delivery_times.forEach(
        (responseDataForDeliveryTimes, i) => {
          this.addDeliveryTimes(responseDataForDeliveryTimes);
        }
      );
      if (
        this.deliverydetails.pincode_range == null ||
        this.deliverydetails.pincode_range.length == 0
      ) {
        this.deliverydetails.pincode_range = [];
        this.deliverydetails.pincode_range.push({
          from_pincode: "",
          to_pincode: "",
        });
      }
      this.deliverydetails.pincode_range.forEach(
        (responseDataForPincode, i) => {
          this.addPincode(responseDataForPincode);
        }
      );
      if (
        this.deliverydetails.express_pincode_range == null ||
        this.deliverydetails.express_pincode_range.length == 0
      ) {
        this.deliverydetails.express_pincode_range = [];
        this.deliverydetails.express_pincode_range.push({
          from_pincode: "",
          to_pincode: "",
        });
      }
      this.deliverydetails.express_pincode_range.forEach(
        (responseDataForExpressPincode, i) => {
          this.addExpressPincode(responseDataForExpressPincode);
        }
      );

      this.delivery_form.controls["pincode_list"].setValue(
        this.deliverydetails.pincode_list == "undefined" ||
          this.deliverydetails.pincode_list == undefined
          ? ""
          : this.deliverydetails.pincode_list
      );
      this.delivery_form.controls["isExpressDelivery"].setValue(
        this.deliverydetails.express_delivery == 1 ? true : false
      );

      this.delivery_form.controls["express_delivery_slot_count"].setValue(
        this.deliverydetails.express_delivery_slot_count == 0
          ? ""
          : this.deliverydetails.express_delivery_slot_count
      );

      this.delivery_form.controls["express_delivery_charge_type"].setValue(
        this.deliverydetails.express_delivery_charge_type != 0
          ? this.deliverydetails.express_delivery_charge_type
          : 1
      );
      this.deliverydetails.express_to_min =
        this.deliverydetails.express_to_min == 0
          ? ""
          : this.deliverydetails.express_to_min;
      this.delivery_form.controls["express_delivery_time_formate_type"].setValue(
        this.deliverydetails.express_delivery_duration
          == 0 ||
          this.deliverydetails.express_delivery_duration == undefined ?
          this.PickupTimeFormate[0].id : this.deliverydetails.express_delivery_duration);
      // )
      this.delivery_form.controls[
        "selectdExpressDeliverySlotCutoffMethod"
      ].setValue(
        Number(
          this.deliverydetails.express_delivery_cut_off_method == 0
            ? 1
            : this.deliverydetails.express_delivery_cut_off_method
        )
      );
      this.delivery_form.controls[
        "SelectedExpressDeliveryBeforeCutoffTimeDays"
      ].setValue(
        this.deliverydetails.express_delivery_before_cut_off == 0
          ? 1
          : this.deliverydetails.express_delivery_before_cut_off
      );
      this.getSelectdBeforeCutoffTimeDays(
        this.delivery_form.value.SelectedExpressDeliveryBeforeCutoffTimeDays,
        this.expressDelivery
      );
      this.delivery_form.controls[
        "SelectdExpressDeliveryAfterCutoffTimeDays"
      ].setValue(
        this.deliverydetails.express_delivery_after_cut_off == 0
          ? 1
          : this.deliverydetails.express_delivery_after_cut_off
      );
      if (
        this.deliverydetails.express_delivery_times == null ||
        this.deliverydetails.express_delivery_times.length == 0
      ) {
        this.deliverydetails.express_delivery_times = [];
        this.deliverydetails.express_delivery_times.push({
          from_time: "",
          to_time: "",
          max_order: "",
        });
      }
      this.deliverydetails.express_delivery_times.forEach(
        (responseDataForExpressDeliveryTimes, i) => {
          this.addExpressDeliveryTimes(responseDataForExpressDeliveryTimes);
        }
      );
      if (
        this.deliverydetails.express_pincode_list == "undefined" ||
        this.deliverydetails.express_pincode_list == undefined ||
        this.deliverydetails.express_pincode_list == null
      ) {
        this.deliverydetails.express_pincode_list = "";
      }
      this.delivery_form.controls["express_pincode_list"].setValue(
        this.deliverydetails.express_pincode_list
      );
      this.delivery_form.controls["isPickUp"].setValue(
        this.deliverydetails.pickup == 1 ? true : false
      );
      this.delivery_form.controls["PickupTimeFormateType"].setValue(
        this.deliverydetails.pickup_duration == undefined ? this.PickupTimeFormate[0].id :
          this.deliverydetails.pickup_duration
      );

      this.delivery_form.controls["selectedPickupSlotCutoffMethod"].setValue(
        Number(
          this.deliverydetails.pickup_cut_off_method == 0
            ? 1
            : this.deliverydetails.pickup_cut_off_method
        )
      );
      this.delivery_form.controls[
        "selectedPickupBeforeCutoffTimeDays"
      ].setValue(
        this.deliverydetails.pickup_before_cut_off == 0
          ? 1
          : this.deliverydetails.pickup_before_cut_off
      );
      this.getSelectdBeforeCutoffTimeDays(
        this.delivery_form.value.selectedPickupBeforeCutoffTimeDays,
        this.pickup
      );
      this.delivery_form.controls["selectedPickupAfterCutoffTimeDays"].setValue(
        this.deliverydetails.pickup_after_cut_off == 0
          ? 1
          : this.deliverydetails.pickup_after_cut_off
      );
      if (
        this.deliverydetails.pickup_times == null ||
        this.deliverydetails.pickup_times.length == 0
      ) {
        this.deliverydetails.pickup_times = [];
        this.deliverydetails.pickup_times.push({
          from_time: "",
          to_time: "",
          max_order: "",
        });
      }
      this.deliverydetails.pickup_times.forEach(
        (responseDataForPickupTimes, i) => {
          this.addPickupTimes(responseDataForPickupTimes);
        }
      );

      this.delivery_form.controls["allowScheduling"].setValue(
        this.deliverydetails.allow_scheduling == 1 ? true : false
      );
      this.delivery_form.controls["allowPickupScheduling"].setValue(
        this.deliverydetails.pickup_scheduling == 1 ? true : false
      );
      this.delivery_form.controls["allow_cancellation"].setValue(
        this.deliverydetails.allow_cancellation == 1 ? true : false
      );
      this.delivery_form.controls["isAcceptAfterClose"].setValue(
        this.deliverydetails.accept_after_close == 1 ? true : false
      );
      this.delivery_form.controls["packaging_per_order"].setValue(
        this.deliverydetails.packaging_per_order
      );
      this.delivery_form.controls["delivery_radius"].setValue(
        this.deliverydetails.delivery_radius
      );
      this.delivery_form.controls["min_order_amount"].setValue(
        this.deliverydetails.min_order_amount
      );
      this.delivery_form.controls["delivery_charge_id"].setValue(
        this.deliverydetails.delivery_charge_id == undefined ||
          this.deliverydetails.delivery_charge_id == 0 ?
          this.deliveryChargeTypeList[0].delivery_charge_id :
          this.deliverydetails.delivery_charge_id
      );


      this.delivery_form.controls["delivery_charges"].setValue(
        this.deliverydetails.delivery_charges
      );
      this.delivery_form.controls["delivery_time_type"].setValue(
        this.deliverydetails.delivery_time_type
      );
      this.delivery_form.controls["delivery_gap"].setValue(
        this.deliverydetails.delivery_gap
      );
      this.delivery_form.controls["express_delivery_radius"].setValue(
        this.deliverydetails.express_delivery_radius
      );
      this.delivery_form.controls["express_delivery_min_order_amount"].setValue(
        this.deliverydetails.express_delivery_min_order_amount
      );
      this.delivery_form.controls["express_delivery_charge_id"].setValue(
        this.deliverydetails.express_delivery_charge_id == 0 ||
          this.deliverydetails.express_delivery_charge_id == undefined ?
          this.deliveryChargeTypeList[0]?.delivery_charge_id :
          this.deliverydetails.express_delivery_charge_id
      );


      this.delivery_form.controls["express_from_min"].setValue(
        this.deliverydetails.express_from_min
      );
      this.delivery_form.controls["express_to_min"].setValue(
        this.deliverydetails.express_to_min
      );
      this.delivery_form.controls["express_delivery_time_type"].setValue(
        this.deliverydetails.express_delivery_time_type
      );
      this.delivery_form.controls["express_delivery_cut_off_time"].setValue(
        this.deliverydetails.express_delivery_cut_off_time
      );
      this.delivery_form.controls["pickup_time_type"].setValue(
        this.deliverydetails.pickup_time_type
      );
      this.delivery_form.controls["pickup_slot_count"].setValue(
        this.deliverydetails.pickup_slot_count
      );
      this.delivery_form.controls["pickup_cut_off_time"].setValue(
        this.deliverydetails.pickup_cut_off_time
      );
      this.delivery_form.controls["pickup_gap"].setValue(
        this.deliverydetails.pickup_gap
      );
      this.delivery_form.controls["order_setting_name"].setValue(
        this.deliverydetails.order_setting_name
      );
      this.delivery_form.controls["pincode_type"].setValue(
        this.deliverydetails.pincode_type
      );
      this.delivery_form.controls["upto_distance"].setValue(
        this.deliverydetails.upto_distance
      );
      this.delivery_form.controls["additional_charges"].setValue(
        this.deliverydetails.additional_charges
      );
      this.delivery_form.controls["per_distance"].setValue(
        this.deliverydetails.per_distance
      );
      this.delivery_form.controls["from_min"].setValue(
        this.deliverydetails.from_min
      );
      this.delivery_form.controls["to_min"].setValue(
        this.deliverydetails.to_min == 0 ? "" : this.deliverydetails.to_min
      );
      this.delivery_form.controls["delivery_cut_off_time"].setValue(
        this.deliverydetails.delivery_cut_off_time
      );
      this.delivery_form.controls["express_pincode_type"].setValue(
        this.deliverydetails.express_pincode_type
      );
      this.delivery_form.controls["express_delivery_charges"].setValue(
        this.deliverydetails.express_delivery_charges
      );
      this.delivery_form.controls["express_upto_distance"].setValue(
        this.deliverydetails.express_upto_distance
      );
      this.delivery_form.controls["express_additional_charges"].setValue(
        this.deliverydetails.express_additional_charges
      );
      this.delivery_form.controls["express_per_distance"].setValue(
        this.deliverydetails.express_per_distance
      );
      this.delivery_form.controls["pickup_from"].setValue(
        this.deliverydetails.pickup_from
      );
      this.delivery_form.controls["pickup_to"].setValue(
        this.deliverydetails.pickup_to
      );

      if (this.isSuperAdmin == true) {
        this.deliveryareas = this.deliverydetails.delivery_areas;
        this.areacitycount = this.deliverydetails.delivery_areas.length;
        this.expressDeliveryAreas = this.deliverydetails.express_delivery_areas;
        this.expressAreaCityCount =
          this.deliverydetails.express_delivery_areas.length;
      } else {
        this.GetDeliveryAreaList(1);
        this.GetDeliveryAreaList(2);
      }
      this.getDeliveryChargeType();
    }
  }

  addPaymentItem(responseDataForPaymentMethod) {
    this.paymentArray = this.delivery_form.get("payment_methods") as UntypedFormArray;
    this.paymentArray.push(this.paymentRows(responseDataForPaymentMethod));
    this.delivery_form.updateValueAndValidity();
  }

  addPincode(responseDataForPincode) {
    this.pincodeArray = this.delivery_form.get("pincode_range") as UntypedFormArray;
    this.pincodeArray.push(this.pincodeRows(responseDataForPincode));
    this.delivery_form.updateValueAndValidity();
  }
  addExpressPincode(responseDataForExpressPincode) {
    this.expressPincodeArray = this.delivery_form.get(
      "express_pincode_range"
    ) as UntypedFormArray;
    this.expressPincodeArray.push(
      this.pincodeRows(responseDataForExpressPincode)
    );
    this.delivery_form.updateValueAndValidity();
  }
  addDeliveryTimes(responseDataForDeliveryTimes) {
    this.deliveryTimesArray = this.delivery_form.get(
      "delivery_times"
    ) as UntypedFormArray;
    this.deliveryTimesArray.push(this.initRows(responseDataForDeliveryTimes));
    this.delivery_form.updateValueAndValidity();
  }
  addExpressDeliveryTimes(responseDataForExpressDeliveryTimes) {
    this.expressDeliveryTimesArray = this.delivery_form.get(
      "express_delivery_times"
    ) as UntypedFormArray;
    this.expressDeliveryTimesArray.push(
      this.initRows(responseDataForExpressDeliveryTimes)
    );
    this.delivery_form.updateValueAndValidity();
  }
  addPickupTimes(responseDataForPickupTimes) {
    this.pickupTimesArray = this.delivery_form.get("pickup_times") as UntypedFormArray;
    this.pickupTimesArray.push(this.initRows(responseDataForPickupTimes));
    this.delivery_form.updateValueAndValidity();
  }
  prepareData() {
    var fd = new FormData();
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("delivery", this.delivery_form.value.isDelivery ? "1" : "0");
    fd.append(
      "express_delivery",
      this.delivery_form.value.isExpressDelivery ? "1" : "0"
    );
    fd.append("pickup", this.delivery_form.value.isPickUp ? "1" : "0");
    fd.append(
      "accept_after_close",
      this.delivery_form.value.isAcceptAfterClose ? "1" : "0"
    );
    fd.append(
      "delivery_time_type",
      this.delivery_form.value.delivery_time_type
    );
    fd.append(
      "express_delivery_time_type",
      this.delivery_form.value.express_delivery_time_type
    );
    fd.append(
      "packaging_per_order",
      this.delivery_form.value.packaging_per_order
    );
    fd.append("pickup_time_type", this.delivery_form.value.pickup_time_type);
    fd.append(
      "allow_scheduling",
      this.delivery_form.value.allowScheduling ? "1" : "0"
    );
    fd.append(
      "pickup_scheduling",
      this.delivery_form.value.allowPickupScheduling ? "1" : "0"
    );
    fd.append(
      "allow_cancellation",
      this.delivery_form.value.allow_cancellation ? "1" : "0"
    );

    fd.append(
      "delivery_slot_count",
      this.delivery_form.value.delivery_slot_count
    );
    fd.append(
      "delivery_cut_off_method",
      this.delivery_form.value.selectedDeliverySlotCutoffMethod
    );
    fd.append(
      "delivery_cut_off_time",
      this.delivery_form.value.delivery_cut_off_time
    );
    fd.append(
      "delivery_charge_id",
      this.delivery_form.value.delivery_charge_id == undefined
        ? 1
        : this.delivery_form.value.delivery_charge_id
    );
    if (this.delivery_form.value.selectedDeliverySlotCutoffMethod == 1) {
      fd.append(
        "delivery_before_cut_off",
        this.delivery_form.value.SelectedDeliveryBeforeCutoffTimeDays
      );
      fd.append(
        "delivery_after_cut_off",
        this.delivery_form.value.SelectdDeliveryAfterCutoffTimeDays
      );
    }

    fd.append(
      "express_delivery_slot_count",
      this.delivery_form.value.express_delivery_slot_count
    );
    fd.append(
      "express_delivery_cut_off_method",
      this.delivery_form.value.selectdExpressDeliverySlotCutoffMethod
    );
    fd.append(
      "express_delivery_cut_off_time",
      this.delivery_form.value.express_delivery_cut_off_time
    );

    fd.append(
      "express_delivery_charge_id",
      this.delivery_form.value.express_delivery_charge_id == undefined
        ? 1
        : this.delivery_form.value.express_delivery_charge_id
    );
    if (this.delivery_form.value.isExpressDelivery) {
      if (
        this.delivery_form.value.selectdExpressDeliverySlotCutoffMethod == 1
      ) {
        fd.append(
          "express_delivery_before_cut_off",
          this.delivery_form.value.SelectedExpressDeliveryBeforeCutoffTimeDays
        );
        fd.append(
          "express_delivery_after_cut_off",
          this.delivery_form.value.SelectdExpressDeliveryAfterCutoffTimeDays
        );
      }
    }

    fd.append("pickup_slot_count", this.delivery_form.value.pickup_slot_count);
    fd.append(
      "pickup_cut_off_method",
      this.delivery_form.value.selectedPickupSlotCutoffMethod
    );
    fd.append(
      "pickup_cut_off_time",
      this.delivery_form.value.pickup_cut_off_time
    );

    if (this.delivery_form.value.selectedPickupSlotCutoffMethod == 1) {
      fd.append(
        "pickup_before_cut_off",
        this.delivery_form.value.selectedPickupBeforeCutoffTimeDays
      );
      fd.append(
        "pickup_after_cut_off",
        this.delivery_form.value.selectedPickupAfterCutoffTimeDays
      );
    }

    if (this.delivery_form.value.isDelivery) {
      fd.append(
        "delivery_charge_type",
        this.delivery_form.value.delivery_charge_type
      );
      fd.append(
        "min_order_amount",
        this.delivery_form.value.min_order_amount == ""
          ? 0
          : this.delivery_form.value.min_order_amount
      );
      fd.append(
        "delivery_charges",
        this.delivery_form.value.delivery_charges == ""
          ? 0
          : this.delivery_form.value.delivery_charges
      );

      if (
        this.delivery_form.value.delivery_charge_id == 2 ||
        this.delivery_form.value.delivery_charge_id == 3
      ) {
        fd.append(
          "upto_distance",
          this.delivery_form.value.upto_distance == ""
            ? 0
            : this.delivery_form.value.upto_distance
        );
        fd.append(
          "additional_charges",
          this.delivery_form.value.additional_charges == ""
            ? 0
            : this.delivery_form.value.additional_charges
        );
      }

      if (
        this.delivery_form.value.delivery_charge_id == 3 ||
        this.delivery_form.value.delivery_charge_id == 4
      ) {
        fd.append(
          "per_distance",
          this.delivery_form.value.per_distance == ""
            ? 0
            : this.delivery_form.value.per_distance
        );
      }

      fd.append("delivery_radius", this.delivery_form.value.delivery_radius);
      if (this.delivery_form.value.delivery_time_type == 1) {
        fd.append(
          "delivery_times",
          JSON.stringify(this.delivery_form.value.delivery_times)
        );
      }
      if (this.delivery_form.value.delivery_time_type == 0) {
        fd.append("from_min", this.delivery_form.value.from_min);
        fd.append("to_min", this.delivery_form.value.to_min);
        fd.append(
          "delivery_duration",
          this.delivery_form.value.DeliveryTimeFormateType
        );
      }

      if (this.delivery_zone == 3) {
        fd.append("pincode_type", this.delivery_form.value.pincode_type);
      }

      if (
        this.delivery_zone == 3 &&
        this.delivery_form.value.pincode_type == 1
      ) {
        fd.append("pincode_list", this.delivery_form.value.pincode_list);
      }

      if (
        this.delivery_zone == 3 &&
        this.delivery_form.value.pincode_type == 2
      ) {
        fd.append(
          "pincode_range",
          JSON.stringify(this.delivery_form.value.pincode_range)
        );
      }
    }
    else {
      fd.append(
        "from_min",
        this.delivery_form.value.from_min == ""
          ? 0
          : this.delivery_form.value.from_min
      );
      fd.append(
        "to_min",
        this.delivery_form.value.to_min == ""
          ? ""
          : this.delivery_form.value.to_min
      );
    }

    if (this.delivery_form.value.isExpressDelivery) {
      fd.append(
        "express_delivery_charge_type",
        this.delivery_form.value.express_delivery_charge_type
      );
      fd.append(
        "express_delivery_min_order_amount",
        this.delivery_form.value.express_delivery_min_order_amount == ""
          ? 0
          : this.delivery_form.value.express_delivery_min_order_amount
      );
      fd.append(
        "express_delivery_charges",
        this.delivery_form.value.express_delivery_charges == ""
          ? 0
          : this.delivery_form.value.express_delivery_charges
      );

      if (
        this.delivery_form.value.express_delivery_charge_id == 2 ||
        this.delivery_form.value.express_delivery_charge_id == 3
      ) {
        fd.append(
          "express_upto_distance",
          this.delivery_form.value.express_upto_distance == ""
            ? 0
            : this.delivery_form.value.express_upto_distance
        );
        fd.append(
          "express_additional_charges",
          this.delivery_form.value.express_additional_charges == ""
            ? 0
            : this.delivery_form.value.express_additional_charges
        );
      }

      if (
        this.delivery_form.value.express_delivery_charge_id == 3 ||
        this.delivery_form.value.express_delivery_charge_id == 4
      ) {
        fd.append(
          "express_per_distance",
          this.delivery_form.value.express_per_distance == ""
            ? 0
            : this.delivery_form.value.express_per_distance
        );
      }

      fd.append(
        "express_delivery_radius",
        this.delivery_form.value.express_delivery_radius
      );
      if (this.delivery_form.value.express_delivery_time_type == 1) {
        fd.append(
          "express_delivery_times",
          JSON.stringify(this.delivery_form.value.express_delivery_times)
        );
      }
      if (this.delivery_form.value.express_delivery_time_type == 0) {
        fd.append(
          "express_from_min",
          this.delivery_form.value.express_from_min
        );
        fd.append("express_to_min", this.delivery_form.value.express_to_min);
        fd.append(
          "express_delivery_duration",
          this.delivery_form.value.express_delivery_time_formate_type
        );
      }

      if (this.express_delivery_zone == 3) {
        fd.append(
          "express_pincode_type",
          this.delivery_form.value.express_pincode_type
        );
      }

      if (
        this.express_delivery_zone == 3 &&
        this.delivery_form.value.express_pincode_type == 1
      ) {
        fd.append(
          "express_pincode_list",
          this.delivery_form.value.express_pincode_list
        );
      }

      if (
        this.express_delivery_zone == 3 &&
        this.delivery_form.value.express_pincode_type == 2
      ) {
        fd.append(
          "express_pincode_range",
          JSON.stringify(this.delivery_form.value.express_pincode_range)
        );
      }
    }


    if (this.delivery_form.value.isPickUp) {
      if (this.delivery_form.value.pickup_time_type == 1) {
        fd.append(
          "pickup_times",
          JSON.stringify(this.delivery_form.value.pickup_times)
        );
      }
      if (this.delivery_form.value.pickup_time_type == 0) {
        fd.append("pickup_from", this.delivery_form.value.pickup_from);
        fd.append("pickup_to", this.delivery_form.value.pickup_to);
        fd.append(
          "pickup_duration",
          this.delivery_form.value.PickupTimeFormateType
        );
      }
    } else {
      fd.append(
        "pickup_from",
        this.delivery_form.value.pickup_from == ""
          ? 0
          : this.delivery_form.value.pickup_from
      );
      fd.append(
        "pickup_to",
        this.delivery_form.value.pickup_to == ""
          ? ""
          : this.delivery_form.value.pickup_to
      );
    }

    var pays = [];
    this.delivery_form.value.payment_methods.forEach((element: any) => {
      if (element.is_added == true) {
        element.is_added = 1;
        (element.max_order_value = Number(element.max_order_value).toFixed(2)),
          pays.push(element);
      }
    });
    fd.append("payment_methods", JSON.stringify(pays));

    if (this.delivery_form.value.allowScheduling) {
      fd.append("delivery_gap", this.delivery_form.value.delivery_gap);
    }

    if (this.delivery_form.value.allowPickupScheduling) {
      fd.append("pickup_gap", this.delivery_form.value.pickup_gap);
    }

    fd.append("delivery_zone", String(this.delivery_zone));
    fd.append("express_delivery_zone", String(this.express_delivery_zone));

    if (this.isSuperAdmin == true) {
      if (this.deliverydetails.isDelivery) {
        if (this.deliverydetails.delivery_zone == 2) {
          var areaIds = [];
          var cityIds = [];

          this.deliveryareas.forEach((detail) => {
            if (detail.country_id == "101") {
              areaIds.push(parseInt(detail.area_id));
            } else {
              cityIds.push(parseInt(detail.city_id));
            }
          });
          if (areaIds.length > 0) {
            fd.append("area_ids", areaIds.toString());
          }

          if (cityIds.length > 0) {
            fd.append("city_ids", cityIds.toString());
          }
        }
      }
      if (this.deliverydetails.isExpressDelivery) {
        if (this.deliverydetails.delivery_zone == 2) {
          var areaIds = [];
          var cityIds = [];

          this.expressDeliveryAreas.forEach((detail) => {
            if (detail.country_id == "101") {
              areaIds.push(parseInt(detail.area_id));
            } else {
              cityIds.push(parseInt(detail.city_id));
            }
          });
          if (areaIds.length > 0) {
            fd.append("express_area_ids", areaIds.toString());
          }

          if (cityIds.length > 0) {
            fd.append("express_city_ids", cityIds.toString());
          }
        }
      }

      fd.append(
        "order_setting_id",
        this.dupliacte_ordersetting == "true" ? undefined : this.orderSettingIdData
      );
      fd.append(
        "is_active",
        this.delivery_form.value.is_active == true ? "1" : "0"
      );
      fd.append(
        "order_setting_name",
        this.delivery_form.value.order_setting_name
      );
    } else {
      fd.append("store_id", this.seller_details.store_id);
    }
    this.submitData = fd;
  }

  async submitSetting() {
    this.spinner.show()
    this.prepareData();
    if (this.delivery_form.valid) {
      if (this.isSuperAdmin) {
        await this.manageStoreService
          .saveAdminDeliverySettings(this.submitData)
          .subscribe({
            next: (response: any) => {
              this.spinner.hide()
              if (response.status == 1) {
                this.toastr.success(response.message);
                if (this.isSuperAdmin == true) {
                  localStorage.removeItem("dupliacte_order");
                  this.router.navigate(["/order-setting-list"]);
                }
              } else {
                this.toastr.error(response.message);
              }
            },
            error: (error: any) => {
              this.toastr.error(error.message);
              this.spinner.hide()
            },
            complete: () => { },
          });
      } else {
        await this.manageStoreService
          .saveDeliverySettings(this.submitData)
          .subscribe({
            next: (response: any) => {
              this.spinner.hide()
              if (response.status == 1) {
                this.skipShow = false;
                localStorage.setItem('setup_steps', '6');
                this.toastr.success(response.message);
              } else {
                this.toastr.error(response.message);
              }
            },
            error: (error: any) => {
              this.spinner.hide()
              this.toastr.error(error.message);
            },
            complete: () => { },
          });
      }
    } else {
      this.spinner.hide()
    }
  }

  controlHasError(validation, controlName): boolean {
    const control = this.delivery_form.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  submitDeliverySettings() {
    var deliveryData = this.delivery_form.value.isDelivery;
    var ExpressDeliveryData = this.delivery_form.value.isExpressDelivery;
    var PickUpData = this.delivery_form.value.isPickUp;

    if (deliveryData == false &&
      ExpressDeliveryData == false &&
      PickUpData == false
    ) {
      this.toastr.error(
        this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_DELIVERY_TYPE")
      );
      return;
    }

    if (this.delivery_form.value.isDelivery == true) {
      if (
        this.delivery_zone == 1 &&
        this.delivery_form.value.delivery_radius <= 0
      ) {
        this.toastr.error(this.translate.instant("PLEASE_ENTER_RADIUS"));
        return;
      }

      if (this.delivery_form.value.delivery_charge_id == 1) {
        if (
          this.delivery_form.value.delivery_charges == undefined ||
          this.delivery_form.value.delivery_charges == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_DELIVERY_CHARGES")
          );
          return;
        }
      }

      if (
        this.delivery_form.value.delivery_charge_type == undefined ||
        this.delivery_form.value.delivery_charge_type == ""
      ) {
        this.toastr.error(
          this.translate.instant("PLEASE_SELECT_DELIVERY_CHARGE_SETTING")
        );
        return;
      }

      if (this.delivery_zone == 2 && this.areacitycount == 0) {
        this.toastr.error(
          this.translate.instant("PLEASE_ENTER_STATE_CITY_AREA_FOR_DELIVERY")
        );
        return;
      }

      if (this.delivery_form.value.delivery_charge_id == undefined) {
        this.toastr.error(
          this.translate.instant("PLEASE_SELECT_DELIVERY_CHARGE_TYPE")
        );
        return;
      }

      if (
        this.delivery_form.value.delivery_charge_id == 2 ||
        this.delivery_form.value.delivery_charge_id == 3
      ) {
        if (
          this.delivery_form.value.upto_distance == undefined ||
          this.delivery_form.value.upto_distance == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_FOR_DISTANCE")
          );
          return;
        } else {
          if (Number(this.delivery_form.value.upto_distance) <= 0) {
            this.toastr.error(
              this.translate.instant("1PLEASE_ENTER_FOR_DISTANCE_GREATER_THAN_0 1")
            );
            return;
          }
        }

        if (this.delivery_form.value.delivery_charge_id == 3) {
          if (
            this.delivery_form.value.per_distance == undefined ||
            this.delivery_form.value.per_distance == ""
          ) {
            this.toastr.error(
              this.translate.instant("PLEASE_ENTER_PER_DISTANCE")
            );
            return;
          } else {
            if (Number(this.delivery_form.value.per_distance) <= 0) {
              this.toastr.error(
                this.translate.instant(
                  "PLEASE_ENTER_PER_DISTANCE_GREATER_THAN_0"
                )
              );
              return;
            }
          }
        }

        if (
          this.delivery_form.value.additional_charges == undefined ||
          this.delivery_form.value.additional_charges == null ||
          this.delivery_form.value.additional_charges == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_ADDITIONAL_CHARGES")
          );
          return;
        } else {
          if (Number(this.delivery_form.value.additional_charges) <= 0) {
            this.toastr.error(
              this.translate.instant(
                "PLEASE_ENTER_ADDITIONAL_CHARGES_GREATER_THAN_0"
              )
            );
            return;
          }
        }
      }

      if (this.delivery_form.value.delivery_charge_id == 4) {
        if (
          this.delivery_form.value.per_distance == undefined ||
          this.delivery_form.value.per_distance == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_PER_DISTANCE")
          );
          return;
        } else {
          if (Number(this.delivery_form.value.per_distance) <= 0) {
            this.toastr.error(
              this.translate.instant("PLEASE_ENTER_PER_DISTANCE_GREATER_THAN_0")
            );
            return;
          }
        }
      }

      if (this.delivery_form.value.delivery_time_type == 0) {
        if (
          this.delivery_form.value.from_min == undefined ||
          this.delivery_form.value.from_min == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_FROM") +
            (this.delivery_form.value.DeliveryTimeFormateType == 1
              ? this.translate.instant("MINS")
              : this.delivery_form.value.DeliveryTimeFormateType == 2
                ? this.translate.instant("HOURS")
                : this.translate.instant("DAYS"))
          );
          return;
        } else {
          if (this.delivery_form.value.DeliveryTimeFormateType == 1) {
            if (Number(this.delivery_form.value.from_min) == 0) {
              this.toastr.error(
                this.translate.instant(
                  "PLEASE_DELIVERY_ENTER_FROM_MIN_GREATER_THAN_0"
                )
              );
              return;
            }
          }
        }
        if (
          this.delivery_form.value.to_min == undefined ||
          this.delivery_form.value.to_min == ""
        ) {
        } else {
          if (
            Number(this.delivery_form.value.from_min) >=
            Number(this.delivery_form.value.to_min)
          ) {
            this.toastr.error(
              this.translate.instant("PLEASE_ENTER_VALID_FROM_AND_TO") +
              (this.delivery_form.value.DeliveryTimeFormateType == 1
                ? this.translate.instant("MINS")
                : this.delivery_form.value.DeliveryTimeFormateType == 2
                  ? this.translate.instant("HOURS")
                  : this.translate.instant("DAYS")) + ' ' +
              this.translate.instant("RANGE")
            );
            return;
          }
        }
      }

      if (this.delivery_form.value.delivery_time_type == 1) {
        if (this.delivery_form.value.delivery_times.length == 0) {
          this.toastr.error(
            this.translate.instant("PLEASE_SELECT_DELIVERY_SLOTS")
          );
          return;
        }

        if (this.delivery_form.value.delivery_slot_count == "") {
          this.toastr.error(
            this.translate.instant("SHOW_UPCOMING_DELIVERY_SLOTS")
          );
          return;
        }

        var slottime = 1;
        for (
          var i = 0;
          i < this.delivery_form.value.delivery_times.length;
          i++
        ) {
          if (
            this.delivery_form.value.delivery_times[i].from_time == undefined ||
            this.delivery_form.value.delivery_times[i].to_time == undefined ||
            this.delivery_form.value.delivery_times[i].from_time == "" ||
            this.delivery_form.value.delivery_times[i].to_time == ""
          ) {
            slottime = 0;
            break;
          }
        }

        for (
          var i = 0;
          i < this.delivery_form.value.delivery_times.length;
          i++
        ) {
          if (
            this.delivery_form.value.delivery_times[i].from_time >=
            this.delivery_form.value.delivery_times[i].to_time
          ) {
            slottime = 0;
            break;
          }
        }

        if (slottime == 0) {
          this.toastr.error(
            this.translate.instant("PLEASE_SELECT_VALID_DELIVERY_SLOTS")
          );
          return;
        }

        if (this.delivery_form.value.delivery_cut_off_time == undefined) {
          this.toastr.error(
            this.translate.instant("DELIVERY_CUTOFF_TIME_IS_MENDATORY")
          );
          return;
        }
      }

      if (
        this.delivery_zone == 3 &&
        this.delivery_form.value.pincode_type == 2
      ) {
        var slotpin = 1;
        for (
          var i = 0;
          i < this.delivery_form.value.pincode_range.length;
          i++
        ) {
          if (
            this.delivery_form.value.pincode_range[i].from_pincode ==
            undefined ||
            this.delivery_form.value.pincode_range[i].to_pincode == undefined ||
            this.delivery_form.value.pincode_range[i].from_pincode == "" ||
            this.delivery_form.value.pincode_range[i].to_pincode == ""
          ) {
            slotpin = 0;
            break;
          }
        }
        if (slotpin == 0) {
          this.toastr.error(
            this.translate.instant(
              "Please enter " + this.pincode_label + " range"
            )
          );
          return;
        }
      }

      if (
        this.delivery_zone == 3 &&
        this.delivery_form.value.pincode_type == 1
      ) {
        if (
          this.delivery_form.value.pincode_list == undefined ||
          this.delivery_form.value.pincode_list == null ||
          this.delivery_form.value.pincode_list == ""
        ) {
          this.toastr.error(
            this.translate.instant(
              "Please enter " + this.pincode_label + " value(s)"
            )
          );
          return;
        }
      }

      if (this.deliverydetails.allowScheduling) {
        if (
          this.delivery_form.value.delivery_gap == undefined ||
          this.delivery_form.value.delivery_gap == null ||
          this.delivery_form.value.delivery_gap == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_DELIVERY_GAP_TIME")
          );
          return;
        }
      }
    }

    if (this.delivery_form.value.isExpressDelivery) {
      if (
        this.express_delivery_zone == 1 &&
        this.delivery_form.value.express_delivery_radius <= 0
      ) {
        this.toastr.error(
          this.translate.instant("ENTER_EXPRESS_DELIVERY_RADIUS")
        );
        return;
      }

      if (this.delivery_form.value.express_delivery_charge_id == 1) {
        if (
          this.delivery_form.value.express_delivery_charges == undefined ||
          this.delivery_form.value.express_delivery_charges == ""
        ) {
          this.toastr.error(
            this.translate.instant("ENTER_EXPRESS_DELIVERY_CHARGES")
          );
          return;
        }
      }

      if (
        this.delivery_form.value.express_delivery_charge_type == undefined ||
        this.delivery_form.value.express_delivery_charge_type == ""
      ) {
        this.toastr.error(
          this.translate.instant("SELECT_EXPRESS_DELIVERY_CHARGE_SETTING")
        );
        return;
      }

      if (this.express_delivery_zone == 2 && this.expressAreaCityCount == 0) {
        this.toastr.error(
          this.translate.instant(
            "PLEASE_ENTER_STATE_CITY_AREA_EXPRESS_DELIVERY"
          )
        );
        return;
      }

      if (this.delivery_form.value.express_delivery_charge_id == undefined) {
        this.toastr.error(
          this.translate.instant("SELECT_EXPRESS_DELIVERY_CHARGE_TYPE")
        );
        return;
      }

      if (
        this.delivery_form.value.express_delivery_charge_id == 2 ||
        this.delivery_form.value.express_delivery_charge_id == 3
      ) {
        if (
          this.delivery_form.value.express_upto_distance == undefined ||
          this.delivery_form.value.express_upto_distance == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_FOR_DISTANCE")
          );
          return;
        } else {
          if (Number(this.delivery_form.value.express_upto_distance) <= 0) {
            this.toastr.error(
              this.translate.instant("2PLEASE_ENTER_FOR_DISTANCE_GREATER_THAN_0")
            );
            return;
          }
        }

        if (
          this.delivery_form.value.express_delivery_charge_id == 3 ||
          this.delivery_form.value.express_delivery_charge_id == 4
        ) {
          if (
            this.delivery_form.value.express_per_distance == undefined ||
            this.delivery_form.value.express_per_distance == ""
          ) {
            this.toastr.error(
              this.translate.instant("PLEASE_ENTER_PER_DISTANCE")
            );
            return;
          } else {
            if (Number(this.delivery_form.value.express_per_distance) <= 0) {
              this.toastr.error(
                this.translate.instant(
                  "PLEASE_ENTER_PER_DISTANCE_GREATER_THAN_0"
                )
              );
              return;
            }
          }
        }

        if (
          this.delivery_form.value.express_additional_charges == undefined ||
          this.delivery_form.value.express_additional_charges == null ||
          this.deliverydetails.express_additional_charges == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_ADDITIONAL_CHARGES")
          );
          return;
        } else {
          if (
            Number(this.delivery_form.value.express_additional_charges) <= 0
          ) {
            this.toastr.error(
              this.translate.instant(
                "PLEASE_ENTER_ADDITIONAL_CHARGES_GREATER_THAN_0"
              )
            );
            return;
          }
        }
      }

      if (this.delivery_form.value.express_delivery_time_type == 0) {
        if (
          this.delivery_form.value.express_from_min == undefined ||
          this.delivery_form.value.express_from_min == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_FROM") +
            (this.delivery_form.value.express_delivery_time_formate_type == 1
              ? this.translate.instant("MINS")
              : this.delivery_form.value.express_delivery_time_formate_type == 2
                ? this.translate.instant("HOURS")
                : this.translate.instant("DAYS"))
          );
          return;
        } else {
          if (this.delivery_form.value.express_delivery_time_formate_type == 1) {
            if (Number(this.delivery_form.value.express_from_min) == 0) {
              this.toastr.error(
                this.translate.instant(
                  "PLEASE_EXPRESS_DELIVERY_ENTER_FROM_MIN_GREATER_THAN_0"
                )
              );
              return;
            }
          }
        }
        if (
          this.delivery_form.value.express_to_min == undefined ||
          this.delivery_form.value.express_to_min == ""
        ) {
        } else {
          if (
            Number(this.delivery_form.value.express_from_min) >=
            Number(this.delivery_form.value.express_to_min)
          ) {
            this.toastr.error(
              this.translate.instant("PLEASE_ENTER_VALID_FROM_AND_TO") +
              (this.delivery_form.value.express_delivery_time_formate_type == 1
                ? this.translate.instant("MINS")
                : this.delivery_form.value.express_delivery_time_formate_type == 2
                  ? this.translate.instant("HOURS")
                  : this.translate.instant("DAYS")) + ' ' +
              this.translate.instant("RANGE")
            );
            return;
          }
        }
      }

      if (this.delivery_form.value.express_delivery_time_type == 1) {
        if (this.delivery_form.value.express_delivery_times.length == 0) {
          this.toastr.error(
            this.translate.instant("PLEASE_SELECT_EXPRESS_DELIVERY_SLOTS")
          );
          return;
        }

        if (this.delivery_form.value.express_delivery_slot_count == "") {
          this.toastr.error(
            this.translate.instant("SHOW_UPCOMING_EXPRESS_DELIVERY_SLOTS")
          );
          return;
        }

        var slottime = 1;
        for (
          var i = 0;
          i < this.delivery_form.value.express_delivery_times.length;
          i++
        ) {
          if (
            this.delivery_form.value.express_delivery_times[i].from_time ==
            undefined ||
            this.delivery_form.value.express_delivery_times[i].to_time ==
            undefined ||
            this.delivery_form.value.express_delivery_times[i].from_time == "" ||
            this.delivery_form.value.express_delivery_times[i].to_time == ""
          ) {
            slottime = 0;
            break;
          }
        }

        for (
          var i = 0;
          i < this.delivery_form.value.express_delivery_times.length;
          i++
        ) {
          if (
            this.delivery_form.value.express_delivery_times[i].from_time >=
            this.delivery_form.value.express_delivery_times[i].to_time
          ) {
            slottime = 0;
            break;
          }
        }

        if (slottime == 0) {
          this.toastr.error(
            this.translate.instant("PLEASE_SELECT_VALID_EXPRESS_DELIVERY_SLOTS")
          );
          return;
        }

        if (this.deliverydetails.express_delivery_cut_off_time == undefined) {
          this.toastr.error(
            this.translate.instant("EXPRESS_DELIVERY_CUTOFF_TIME_IS_MENDATORY")
          );
          return;
        }
      }

      if (
        this.deliverydetails.express_delivery_zone == 3 &&
        this.deliverydetails.express_pincode_type == 2
      ) {
        var slotpin = 1;
        for (
          var i = 0;
          i < this.deliverydetails.express_pincode_range.length;
          i++
        ) {
          if (
            this.deliverydetails.express_pincode_range[i].from_pincode ==
            undefined ||
            this.deliverydetails.express_pincode_range[i].to_pincode ==
            undefined ||
            this.deliverydetails.express_pincode_range[i].from_pincode == "" ||
            this.deliverydetails.express_pincode_range[i].to_pincode == ""
          ) {
            slotpin = 0;
            break;
          }
        }
        if (slotpin == 0) {
          this.toastr.error(
            this.translate.instant(
              "Please enter " + this.pincode_label + " range"
            )
          );
          return;
        }
      }

      if (
        this.express_delivery_zone == 3 &&
        this.delivery_form.value.express_pincode_type == 1
      ) {
        if (
          this.delivery_form.value.express_pincode_list == undefined ||
          this.delivery_form.value.express_pincode_list == null ||
          this.delivery_form.value.express_pincode_list == ""
        ) {
          this.toastr.error(
            this.translate.instant(
              "Please enter " + this.pincode_label + " value(s)"
            )
          );
          return;
        }
      }

      if (this.deliverydetails.express_allowScheduling) {
        if (
          this.delivery_form.value.express_delivery_gap == undefined ||
          this.delivery_form.value.express_delivery_gap == null ||
          this.delivery_form.value.express_delivery_gap == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_DELIVERY_GAP_TIME")
          );
          return;
        }
      }
    }

    if (this.delivery_form.value.isPickUp) {
      if (this.delivery_form.value.pickup_time_type == 0) {
        if (
          this.delivery_form.value.pickup_from == undefined ||
          this.delivery_form.value.pickup_from == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_FROM") +
            (this.delivery_form.value.PickupTimeFormateType == 1
              ? this.translate.instant("MINS")
              : this.delivery_form.value.PickupTimeFormateType == 2
                ? this.translate.instant("HOURS")
                : this.translate.instant("DAYS"))
          );
          return;
        } else {
          if (this.delivery_form.value.PickupTimeFormateType == 1) {
            if (Number(this.delivery_form.value.pickup_from) == 0) {
              this.toastr.error(
                this.translate.instant(
                  this.iseatery == 1
                    ? "PLEASE_TAKE_AWAY_ENTER_FROM_MIN_GREATER_THAN_0"
                    : "PLEASE_PICKUP_ENTER_FROM_MIN_GREATER_THAN_0"
                )
              );
              return;
            }
          }
        }
        if (
          this.delivery_form.value.pickup_to == undefined ||
          this.delivery_form.value.pickup_to == ""
        ) {
        } else {
          if (
            Number(this.delivery_form.value.pickup_from) >=
            Number(this.delivery_form.value.pickup_to)
          ) {
            this.toastr.error(
              this.translate.instant("PLEASE_ENTER_VALID_FROM_AND_TO") +
              (this.delivery_form.value.PickupTimeFormateType == 1
                ? this.translate.instant("MINS")
                : this.delivery_form.value.PickupTimeFormateType == 2
                  ? this.translate.instant("HOURS")
                  : this.translate.instant("DAYS")) + ' ' +
              this.translate.instant("RANGE")
            );
            return;
          }
        }
      }

      if (this.delivery_form.value.pickup_time_type == 1) {
        if (this.delivery_form.value.pickup_times.length == 0) {
          if (this.iseatery == 1) {
            this.toastr.error(this.translate.instant("SELECT_TAKE_AWAY_SLOT"));
          } else {
            this.toastr.error(this.translate.instant("SELECT_PICKUP_SLOTS"));
          }
          return;
        }        
        if (this.delivery_form.value.pickup_slot_count == "" || this.delivery_form.value.pickup_slot_count == null) {
          if (this.iseatery == 1) {
            this.toastr.error(
              this.translate.instant("SHOW_UPCOMING_TAKE_AWAY_SLOTS")
            );
          } else {
            this.toastr.error(
              this.translate.instant("SHOW_UPCOMING_PICKUP_SLOTS")
            );
          }
          return;
        }

        var slottime = 1;
        for (var i = 0; i < this.delivery_form.value.pickup_times.length; i++) {
          if (
            this.delivery_form.value.pickup_times[i].from_time == undefined ||
            this.delivery_form.value.pickup_times[i].to_time == undefined ||
            this.delivery_form.value.pickup_times[i].from_time == "" ||
            this.delivery_form.value.pickup_times[i].to_time == ""
          ) {
            slottime = 0;
            break;
          }
        }

        for (var i = 0; i < this.delivery_form.value.pickup_times.length; i++) {
          if (
            this.delivery_form.value.pickup_times[i].from_time >=
            this.delivery_form.value.pickup_times[i].to_time
          ) {
            slottime = 0;
            break;
          }
        }

        if (slottime == 0) {
          this.toastr.error(
            this.translate.instant("PLEASE_SELECT_VALID_PICKUP_SLOTS")
          );
          return;
        }

        if (this.delivery_form.value.pickup_cut_off_time == undefined) {
          this.toastr.error(
            this.translate.instant("PICKUP_CUTOFF_TIME_IS_MENDATORY")
          );
          return;
        }
      }

      if (this.delivery_form.value.pickup_scheduling) {
        if (
          this.delivery_form.value.pickup_gap == undefined ||
          this.delivery_form.value.pickup_gap == null ||
          this.delivery_form.value.pickup_gap == ""
        ) {
          this.toastr.error(
            this.translate.instant("PLEASE_ENTER_PICKUP_GAP_TIME")
          );
          return;
        }
      }
    }

    if (this.isSuperAdmin == true) {
      if (
        this.delivery_form.value.order_setting_name == undefined ||
        this.delivery_form.value.order_setting_name == ""
      ) {
        this.toastr.error(this.translate.instant("ENTER_SETTING_NAME"));
        return;
      }
    }


    if (this.paymentSettingShow == true) {
      var paymentselected = 0;
      for (
        var i = 0;
        i < this.delivery_form.value.payment_methods.length;
        i++
      ) {
        if (this.delivery_form.value.payment_methods[i].is_added == true) {
          paymentselected = 1;
          break;
        }
      }
      if (paymentselected == 0) {
        this.toastr.error(
          this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_PAYMENT_METHOD")
        );
        return;
      }
    }

    this.submitSetting();
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  cancelClick() {
    history.back();
  }

  type: any;
  restrictNumeric(event: any) {
    if (!this.allow_alphanumeric_pincode) {
      var charCode = event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    }
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;

    if (inputValue.length >= this.pincode_length) {
      event.preventDefault(); // Prevent adding more characters when the maximum length is reached
    }
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    if (selected == 'dashboard') {
      modalRef.componentInstance.helpDetails = this.help_details;
    } else if (selected == 'deliverySetting') {
      modalRef.componentInstance.helpDetails = this.helpDetailsDeliverySetting;
    } else if (selected == 'expressDeliverySetting') {
      modalRef.componentInstance.helpDetails = this.helpDetailsExprsDeliverySetting;
    } else if (selected == 'PickupSetting') {
      modalRef.componentInstance.helpDetails = this.helpDetailsPickupSetting;
    } else if (selected == 'slotCutOffMethod') {
      modalRef.componentInstance.helpDetails = this.helpDetailsslotCutOff;
    }
    modalRef.componentInstance.selected = selected;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '96'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '96'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '96'
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

  getHelpDetailsDeliverySetting(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '97'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '97'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '97'
    }


    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetailsDeliverySetting = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  getHelpDetailsExprsDeliverySetting(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '98'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '98'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '98'
    }


    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetailsExprsDeliverySetting = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  getHelpDetailsPickupSetting(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '99'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '99'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '99'
    }


    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetailsPickupSetting = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  getHelpDetailsslotCutOff(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '138'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '138'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '138'
    }


    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetailsslotCutOff = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }
}
