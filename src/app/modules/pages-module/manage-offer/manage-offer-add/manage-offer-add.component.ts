import { ChangeDetectorRef, ViewChild, Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { SpinnerService } from 'src/app/services/custom/spinner.service';
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators, UntypedFormArray
} from "@angular/forms";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common.service';
import { OfferService } from 'src/app/services/offer.service';
import * as moment from 'moment';
import { SelectCategoryComponent } from '../../model/select-category/select-category.component';
import { SelectCityAreaComponent } from '../../model/select-city-area/select-city-area.component';
import Swal from 'sweetalert2';
import { AddSelectItemComponent } from '../../model/add-select-item/add-select-item.component';
import { cloneDeep } from "lodash";
import { crop_rectangleComponent } from '../../model/crop-rectangle/crop-rectangle.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-offer-add',
  templateUrl: './manage-offer-add.component.html',
  styleUrls: ['./manage-offer-add.component.scss']
})
export class ManageOfferAddComponent implements OnInit, AfterViewInit {
  main: any = { LoggedUserInfo: {} };
  public formGroup: UntypedFormGroup;
  remove_sub_cat: any;
  seller_details = JSON.parse(localStorage.getItem('loginUserStore'));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  pos_module = this.general_setting.pos_module;
  dinein_module = this.general_setting.dinein_module;
  is_offer_show = this.general_setting.offers_module;
  business_model = this.platform_setting.business_model;
  pincode_label = this.general_setting.pincode_label;
  global_currency = this.general_setting.currency_symbol;
  store_label = this.general_setting.store_label;
  categories = []
  sub_categories = []
  items = []
  item_variants = []
  selected_city_list = []
  selected_areas_list = []
  is_offer_setting_platForm = true
  @ViewChild('search')
  public searchElementRef: ElementRef;
  is_super_admin: boolean = false;
  store_id: string | Blob;
  is_confirm: any;
  verify: any;
  exist: any;
  offerId: string;
  orderApplicableOnList: any;
  is_image_delete: any;

  daysList = [
    { Name: 'All', value: 7, isActive: true },
    { Name: 'Monday', value: 0, isActive: true },
    { Name: 'Tuesday', value: 1, isActive: true },
    { Name: 'Wednesday', value: 2, isActive: true },
    { Name: 'Thursday', value: 3, isActive: true },
    { Name: 'Friday', value: 4, isActive: true },
    { Name: 'Saturday', value: 5, isActive: true },
    { Name: 'Sunday', value: 6, isActive: true },
  ];
  show_zone_applicable = false;
  show_applicable = false;
  offer_settings: any;
  offer_setting_show: boolean;
  offer_type: any;
  suboffertype: any;
  max_of_use_list: any
  selectedMaxofuse: any;
  frequency_list: any;
  offercode: any;
  payment_method_list: any = [];
  customer_list: any;
  stores: any = [];
  store_list: any = [];
  pincode_range: any[];
  is_area_show: boolean;
  search: any;
  page: any;
  admin_store_id: any;
  admin_seller_list: any;
  SelectedAdminSeller: any;
  admin_seller_count: any;
  paymentMethod: { name: any; id: any; };
  frequency: { name: any; id: any; };
  customer: any;
  selectdCustomerlist: any;
  itemlist: any;
  selected_items_count: number = 0;
  selected_items: any = [];
  send_notification: boolean;
  notify: number;
  showvariant: boolean;
  deliveryareas = [];
  orderList: any;
  order_type: any;
  buttonDisabled: boolean;
  minDate: Date = new Date();
  @ViewChild('cursor') cursor: ElementRef;
  pincode_length: any;
  allow_alphanumeric_pincode: number;
  type: string;
  offer_details: any;
  my_cropped_image_show: any;
  cropped_store_logo: any;
  is_cropped_image = false;
  my_cropped_image: string;
  cropFiles: any;
  croppedImages: any;
  min_discount = 1;
  max_discount = 100;
  min_cart_value = 1;
  storeIdForSuperAdmin;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private appComponent: AppComponent,
    private spinner: SpinnerService,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private modalService: NgbModal,
    private cryptoService: CryptoService,
    public commonService: CommonService,
    private offerService: OfferService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/manage-offer/edit") > -1) {
      this.offerId = this.cryptoService.decryptIdValue(
        "seller_offerId" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.cryptoService.clearCookie("seller_offerId" + this.main.LoggedUserInfo.role_id?.toString());

      if (this.offerId == undefined) {
        this.router.navigate(["/manage-offer"]);
      }
    }
  }

  ngOnInit(): void {
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.pincode_length = this.general_setting.pincode_length;
    this.allow_alphanumeric_pincode = parseInt(
      this.general_setting.allow_alphanumeric_pincode
    );
    this.type = this.allow_alphanumeric_pincode == 1 ? "text" : "number"
    this.is_area_show = false;
    var commonCountry = this.general_setting.country != undefined ? this.general_setting.country.split(',') : null;
    if (commonCountry) {
      commonCountry.forEach(country => {
        if (country == '101') {
          this.is_area_show = true;
        }
      })
    }
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.main.LoggedUserStoreInfo = JSON.parse(session.getSessionLoginUserStore());
    if (this.main.LoggedUserStoreInfo) {
      if (this.main.LoggedUserStoreInfo.pos == 0) {
        this.pos_module = 0
      }
      if (this.main.LoggedUserStoreInfo.dine_in == 0) {
        this.dinein_module = 0
      }
    }
    this.platform_setting = this.platform_setting == null ? this.main.platform_setting : this.platform_setting;
    this.offer_settings = this.platform_setting.offer_settings;
    this.orderApplicableOnList = [
      { Name: 'All', value: 1, isActive: true, isShow: true },
      { Name: 'Delivery', value: 2, isActive: true, isShow: true },
      { Name: 'Express Delivery', value: 5, isActive: true, isShow: true },
      { Name: 'Pickup / Take away', value: 3, isActive: true, isShow: true },
      { Name: 'POS', value: 4, isActive: true, isShow: this.pos_module == 1 ? true : false },
      { Name: 'Dine-In', value: 6, isActive: true, isShow: this.dinein_module == 1 ? true : false },
    ]


    if (Number(this.is_offer_show) == 1) {
      if (this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 1) {
        this.is_super_admin = true;

        if (Number(this.offer_settings) == 2) {
          this.offer_setting_show = (this.business_model == 1 && (this.main.LoggedUserInfo.role_id == 6)) ? true : (this.business_model == 2 && (this.main.LoggedUserInfo.role_id == 1)) ? true : (this.business_model == 3 && (this.main.LoggedUserInfo.role_id == 1)) ? true : false;
        }
        else {
          this.offer_setting_show = false;
        }

      }
      else {
        if (this.offer_settings != 1) {
          this.is_offer_setting_platForm = false;
        }
      }
    }
    this.loadform()

    this.getFrequencyList();
    if (this.offerId == undefined) {
      this.offer_type = this.cryptoService.decryptIdValue('add_offerId' + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
      this.suboffertype = this.cryptoService.decryptIdValue('add_subofferId' + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
      if (this.suboffertype == 15) {
        this.orderApplicableOnList = this.orderApplicableOnList.filter((item) => item.value != 4 && item.value != 3 && item.value != 6)
      }

      this.maxOfUserAppendData();

      var offerdetails: any;
      if (typeof (Storage) !== "undefined") {
        offerdetails = localStorage.getItem('offerdetail');
      }
      else {
        offerdetails = this.getCookie('offerdetail');
      }

      this.pincode_range = [];
      if (this.pincode_range?.length == 0) {
        this.pincode_range.push({ from_pincode: "", to_pincode: "" });
      }

      var offerde = JSON.parse(offerdetails);
      this.formGroup.controls['offertypename'].setValue(offerde.offer_name)
      this.formGroup.controls['suboffertypename'].setValue(offerde.suboffer_name)
      this.formGroup.controls['title'].setValue(offerde.offer_name + '(' + offerde.suboffer_name + ')')
      this.getOfferCode();
      if (this.suboffertype == 13) {
        if (this.is_super_admin == true) {
          this.getPlatformPaymentMethods();
        }
        else {
          this.getPaymentMethods();
        }
      }

      if (this.suboffertype == 7 || this.suboffertype == 10 || this.suboffertype == 12) {
        if (this.is_super_admin == true) {
        }
        else {
          this.getCustomerList(null);
        }
      }

      if (this.suboffertype == 15) {
        this.orderApplicableOnList.forEach(day => {
          if (day.isShow == true) {
            day.isShow = (day.value == 3 || day.value == 4) ? false : true;
          }
        })
      }
      this.showZoneApplicableOn();

      if (this.suboffertype != 7 && this.suboffertype != 12) {
        this.getStoreList();
      }

      if (this.is_super_admin == true) {
        this.getSellerList();
      }

    }
    else {
      if (this.is_super_admin == true) {
        this.getPlatformPaymentMethods();
      }
      else {
        if (this.suboffertype != 7 && this.suboffertype != 12) {
          this.getStoreList();
        }
        this.getPaymentMethods();
      }
    }
    if (this.suboffertype == 12 || this.suboffertype == 15) {
      this.formGroup.controls['mincartvalue'].setValidators([Validators.required, Validators.min(this.min_cart_value)]);
    } else if (this.suboffertype == 4) {
      this.formGroup.controls['mincartvalue'].setValidators([Validators.min(this.min_cart_value)])
    }

    if (this.suboffertype == 15) {
      this.formGroup.controls['refundamount'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 5) {
      this.formGroup.controls['cartrangfrom'].setValidators([Validators.required]);
      this.formGroup.controls['cartrangto'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 4 || this.suboffertype == 5 || this.suboffertype == 13) {
      this.formGroup.controls['discount'].setValidators([Validators.required, Validators.min(this.min_discount), Validators.max(this.max_discount)]);
    }

    if (this.suboffertype == 4 || this.suboffertype == 13) {
      this.formGroup.controls['maxdiscountvalue'].setValidators([Validators.min(this.min_cart_value)]);
    }

    if (this.suboffertype == 13) {
      this.formGroup.controls['paymentMethod'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 7 && this.is_super_admin == true) {
      this.formGroup.controls['SelectedAdminSeller'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 7) {
      this.formGroup.controls['customer'].setValidators([Validators.required]);
      this.formGroup.controls['customerorder'].setValidators([Validators.required]);
      this.formGroup.controls['refundamount'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 8 && this.formGroup.value.loyaltyoption == 1) {
      this.formGroup.controls['cartvalue'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 8 && this.formGroup.value.loyaltyoption == 2) {
      this.formGroup.controls['orderqty'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 8) {
      this.formGroup.controls['loyaltyamount'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 10) {
      this.formGroup.controls['rewardamount'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 7 || this.suboffertype == 8 || this.suboffertype == 10) {
      this.formGroup.controls['enddate'].setValidators([Validators.required]);
    }

    this.cdr.detectChanges();

  }

  loadform() {
    this.formGroup = this.formBuilder.group({
      offertypename: new UntypedFormControl(null),
      suboffertypename: new UntypedFormControl(null),
      title: new UntypedFormControl(null, [Validators.required]),
      offer_picture: new UntypedFormControl("assets/icons/no_image.svg"),
      paymentMethod: new UntypedFormControl(null),
      discount: new UntypedFormControl(null),
      mincartvalue: new UntypedFormControl(null),
      refundamount: new UntypedFormControl(null),
      maxdiscountvalue: new UntypedFormControl(null),
      cartrangfrom: new UntypedFormControl(null),
      cartrangto: new UntypedFormControl(null),
      offerZone: new UntypedFormControl('4'),
      pincode_type: new UntypedFormControl('1'),
      pincode_list: new UntypedFormControl(null),
      pincode_range: this.formBuilder.array(!this.offerId ? [this.initRows()] : []),
      on_item_type: new UntypedFormControl('5'),
      numberofuses: new UntypedFormControl(null),
      frequency: new UntypedFormControl(0),
      SelectedAdminSeller: new UntypedFormControl(null),
      customer: new UntypedFormControl(null),
      customerorder: new UntypedFormControl(null),
      ordervalue: new UntypedFormControl(null),
      loyaltyoption: new UntypedFormControl('2'),
      cartvalue: new UntypedFormControl(null),
      orderqty: new UntypedFormControl(null),
      selectdCustomerlist: new UntypedFormControl(null),
      rewardamount: new UntypedFormControl(null),
      max_uses: new UntypedFormControl(null),
      startdate: new UntypedFormControl(new Date()),
      enddate: new UntypedFormControl(null),
      remarks: new UntypedFormControl(''),
      offercode: new UntypedFormControl(null),
      is_all_store: new UntypedFormControl('0'),
      SelectedStore: new UntypedFormControl(null),
      selectedMaxofuse: new UntypedFormControl(null),
      notify_customers: new UntypedFormControl(true),
      loyaltyamount: new UntypedFormControl(null),
      user_id: new UntypedFormControl(this.main.LoggedUserInfo.user_id),
    });
    if (this.suboffertype == 12 || this.suboffertype == 15) {
      this.formGroup.controls['mincartvalue'].setValidators([Validators.required, Validators.min(this.min_cart_value)]);
    } else if (this.suboffertype == 4) {
      this.formGroup.controls['mincartvalue'].setValidators([Validators.min(this.min_cart_value)])
    }
  }

  initRows(dataFromEdit?: any) {
    return this.formBuilder.group({
      from_pincode: [dataFromEdit ? dataFromEdit.from_pincode : ""],
      to_pincode: [dataFromEdit ? dataFromEdit.to_pincode : ""],
    });
  }

  get formArr() {
    return this.formGroup.get("pincode_range") as UntypedFormArray;
  }

  newPinRange() {
    this.formArr.push(this.initRows());
  }

  deleteRow(index: number) {
    this.formArr.removeAt(index);
  }

  getCookie(cname) {
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(cname) == 0) {
        return c.split("=")[1];
      }
    }
    return "";
  }

  async getFrequencyList() {
    await this.offerService.getOfferTimePeriods().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var data = { id: 0, name: "Period of Use(Frequency)" };
          response.data.unshift(data);
          this.frequency_list = response.data
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
      },
    });
  }

  /**
 * get offer code using service
 */
  async getOfferCode() {
    var data = { store_id: this.seller_details.store_id };
    await this.offerService.getOfferCode(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.offercode = response.data;
          this.formGroup.controls['offercode'].setValue(this.offercode)
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  async getPlatformPaymentMethods() {
    var data = {};
    await this.offerService.getPlatformPaymentMethods(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(element => {
            var payoption = {
              id: element.payment_method_id,
              name: element.method_name
            };
            this.payment_method_list.push(payoption);
          });

          if (this.offerId != undefined) {
            this.getOfferDetails();
          }
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  async getOfferDetails() {

    var data = { offer_id: this.offerId };
    await this.offerService.getOfferDetailsById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.fillData(response.data);
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  loyaltychange() {
    if (this.suboffertype == 8 && this.formGroup.value.loyaltyoption == 1) {
      this.formGroup.controls['cartvalue'].setValidators([Validators.required]);
      this.formGroup.controls['orderqty'].clearValidators();
      this.formGroup.controls['orderqty'].updateValueAndValidity();

    } else if (this.suboffertype == 8 && this.formGroup.value.loyaltyoption == 2) {
      this.formGroup.controls['orderqty'].setValidators([Validators.required]);
      this.formGroup.controls['cartvalue'].clearValidators();
      this.formGroup.controls['cartvalue'].updateValueAndValidity();
    }
  }
  /** Fill data in the form group */

  custIds: any = [];
  fillData(data) {
    this.offer_details = data
    this.offerId = data.offer_id;
    this.storeIdForSuperAdmin = data.store_id
    if (data.offer_id) {
      this.formGroup.controls['offercode'].disable();
    }
    if (this.suboffertype != 8) {
      this.formGroup.controls['offercode'].setValidators([Validators.required])
    }

    this.offer_type = data.offer_type_id;
    this.suboffertype = data.sub_offer_type_id;

    if (data.total_cart_value > 0) {
      this.formGroup.controls['loyaltyoption'].setValue('1')
    }
    else {
      this.formGroup.controls['loyaltyoption'].setValue('2')
    }

    if (this.suboffertype == 12) {
      this.formGroup.controls['mincartvalue'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 15) {
      this.formGroup.controls['refundamount'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 5) {
      this.formGroup.controls['cartrangfrom'].setValidators([Validators.required]);
      this.formGroup.controls['cartrangto'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 4 || this.suboffertype == 5 || this.suboffertype == 13) {
      this.formGroup.controls['discount'].setValidators([Validators.required, Validators.min(this.min_discount), Validators.max(this.max_discount)]);
    }

    if (this.suboffertype == 4 || this.suboffertype == 13) {
      this.formGroup.controls['maxdiscountvalue'].setValidators([Validators.min(this.min_cart_value)]);
    }

    if (this.suboffertype == 13) {
      this.formGroup.controls['paymentMethod'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 7 && this.is_super_admin == true) {
      this.formGroup.controls['SelectedAdminSeller'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 7) {
      this.formGroup.controls['customer'].setValidators([Validators.required]);
      this.formGroup.controls['customerorder'].setValidators([Validators.required]);
      this.formGroup.controls['refundamount'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 8 && this.formGroup.value.loyaltyoption == 1) {
      this.formGroup.controls['cartvalue'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 8 && this.formGroup.value.loyaltyoption == 2) {
      this.formGroup.controls['orderqty'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 8) {
      this.formGroup.controls['loyaltyamount'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 10) {
      this.formGroup.controls['rewardamount'].setValidators([Validators.required]);
    }

    if (this.suboffertype == 7 || this.suboffertype == 8 || this.suboffertype == 10) {
      this.formGroup.controls['enddate'].setValidators([Validators.required]);
    }

    this.formGroup.controls['offertypename'].setValue(data.offer_type_name)
    this.formGroup.controls['suboffertypename'].setValue(data.sub_offer_type_name)
    this.formGroup.controls['title'].setValue(data.title)
    this.formGroup.controls["offer_picture"].setValue(
      data.offer_image == "" ? 'assets/icons/no_image.svg' : data.offer_img
    );
    this.maxOfUserAppendData();


    if (this.is_super_admin == true) {
      this.admin_store_id = data.store_id;
      if (this.suboffertype == 7 || this.suboffertype == 10 || this.suboffertype == 12) {
        this.getSellerList();
      }
    }
    else {
      if (this.suboffertype == 7 || this.suboffertype == 10) {
        this.custIds = [];
        data.customers.forEach(element => {
          this.custIds.push(element.customer_id)
        });
        this.getCustomerList(null);
      }
    }

    if (this.suboffertype == 13) {
      this.payment_method_list.forEach(element => {
        if (element.id == data.payment_method) {
          this.paymentMethod = { name: element.name, id: element.id };
        }
      });
      this.formGroup.controls['paymentMethod'].setValue(this.paymentMethod?.id)
    }
    this.formGroup.controls['discount'].setValue(data.discount)
    this.formGroup.controls['notify_customers'].setValue(data.notify_customers)
    this.formGroup.controls['mincartvalue'].setValue(data.min_cart_value)
    this.formGroup.controls['maxdiscountvalue'].setValue(data.max_discount_value)
    this.formGroup.controls['cartrangfrom'].setValue(data.cart_value_from)
    this.formGroup.controls['cartrangto'].setValue(data.cart_value_to)
    this.formGroup.controls['numberofuses'].setValue(data.number_of_uses == 0 ? undefined : data.number_of_uses)

    if (data.frequency) {
      this.frequency = { name: data.frequency, id: data.period_of_use };
      this.formGroup.controls['frequency'].setValue(this.frequency.id)

    }
    this.formGroup.controls['max_uses'].setValue(data.max_uses == 0 ? undefined : data.max_uses)
    if (data.use_restriction != null) {
      this.selectedMaxofuse = this.max_of_use_list.filter(elem => elem.id == data.use_restriction)[0];
      this.formGroup.controls['selectedMaxofuse'].setValue(this.selectedMaxofuse.id)
    }

    if (this.suboffertype == 7) {
      this.customer = {
        customer_id: data.customers[0].customer_id,
        name: data.customers[0].name
      };
      this.formGroup.controls['customer'].setValue(this.customer.customer_id)
      this.getCustomerOrderList(data.order_id);
    }
    if (this.suboffertype == 15) {
      this.orderApplicableOnList = this.orderApplicableOnList.filter((item) => item.value !== 4 && item.value != 3 && item.value != 6);
      if (this.orderApplicableOnList[1].isActive == true && this.orderApplicableOnList[2].isActive == true) {
        this.orderApplicableOnList[0].isActive = true;
      }
    }

    this.formGroup.controls['orderqty'].setValue(data.number_of_orders)
    this.formGroup.controls['cartvalue'].setValue(data.total_cart_value)
    this.formGroup.controls['refundamount'].setValue(data.offer_amount)
    this.formGroup.controls['loyaltyamount'].setValue(data.offer_amount)
    this.formGroup.controls['rewardamount'].setValue(data.offer_amount)

    this.itemlist = data.free_items;

    if (this.is_super_admin == true) {
      this.formGroup.controls['is_all_store'].setValue(data.is_platform == 1 ? '1' : '0')
    }
    else {
      this.formGroup.controls['is_all_store'].setValue((data.is_platform == 1 || data.is_all_store == 1) ? '1' : '0')
    }

    this.stores = data.stores
    this.formGroup.controls['notify_customers'].setValue(data.notify_customers == 1 ? true : false)
    this.minDate = new Date(moment(data.start_date, this.dateFormateFromServerSideOnlyDateReturn()).toDate())
    this.formGroup.controls["startdate"].setValue(moment(data.start_date, this.dateFormateFromServerSideOnlyDateReturn()).toDate())

    if (data.end_date) {
      this.formGroup.controls["enddate"].setValue(moment(data.end_date, this.dateFormateFromServerSideOnlyDateReturn()).toDate())
    }
    else {
    }

    if (this.suboffertype == 12) {
      data.items.forEach(item => {
        item.item_variants.forEach(variant => {
          if (variant.is_added == 1) {
            this.selected_items_count += parseInt(variant.quantity);
            this.selected_items.push({ item_variants_id: variant.item_variants_id, quantity: variant.quantity });
            this.item_variants = this.selected_items
          }
        });
      });

    }
    // applicable_days
    if (this.suboffertype == 4 || this.suboffertype == 5 || this.suboffertype == 12 || this.suboffertype == 13 || this.suboffertype == 15) {
      var dayVals = data.applicable_days.split(',');
      this.daysList.forEach(day => {
        if (dayVals?.length == 7) {
          day.isActive = true;
        }
        else {
          var result = dayVals?.filter(elem => elem == day.value.toString());
          if (result?.length == 0) {
            day.isActive = false;
          }
        }
      });

      if (data.offer_zone) {
        this.formGroup.controls['offerZone'].setValue(data.offer_zone.toString())
      }
      this.formGroup.controls['pincode_type'].setValue(data.pincode_type == 0 ? '1' : (data.pincode_type).toString())
      this.formGroup.controls['pincode_list'].setValue(data.pincode_list)
      if (data.pincode_range?.length != 0) {
        data.pincode_range.forEach(el => {
          this.formArr.push(this.initRows(el));
        })
      }

      if (this.formGroup.value.pincode_range?.length == 0) {
        this.formArr.push(this.initRows());
      }
      this.categories = data.categories
      this.sub_categories = data.sub_categories
      this.items = data.items

      this.items.forEach(item => {
        item.quantity = 1;
      });
      this.item_variants = data.item_variants
      this.item_variants?.forEach(item => {
        item.quantity = 1;
      });
      this.formGroup.controls['on_item_type'].setValue(data.on_item_type.toString())

      this.selected_city_list = data.cities;
      this.selected_areas_list = data.areas;
    }

    if (this.suboffertype == 4 || this.suboffertype == 5 || this.suboffertype == 15 || this.suboffertype == 12) {
      if (data.order_type) {

        this.order_type = data.order_type
      }
      var dayVals = data.order_type?.split(',');
      var oeder_applicable = this.orderApplicableOnList.filter((x) => x.isShow)

      this.orderApplicableOnList.forEach(day => {
        if (dayVals?.length == oeder_applicable.length - 1) {
          this.orderApplicableOnList[0].isActive = true
        }

        if (this.suboffertype == 15) {
          var result = dayVals?.filter(elem => elem == day.value.toString());
          if (result?.length == 0) {
            day.isActive = false;
          }
          if (day.isShow == true) {
            day.isShow = (day.value == 3 || day.value == 4) ? false : true;
          }
          var data = this.orderApplicableOnList.filter((item, index) => index != 0 && item.isActive == true && item.isShow == true)
          if (data.length == (this.orderApplicableOnList.length - 1)) {
            this.orderApplicableOnList[0].isActive = true
          }

        }
        else {
          var result = dayVals?.filter(elem => elem == day.value.toString());
          if (result?.length == 0) {
            day.isActive = false;
          }
        }

      })

      this.showZoneApplicableOn();
    }
    if (this.suboffertype == 13) {
      this.showZoneApplicableOn();
    }

    if (data.remarks != "null") {
      this.formGroup.controls['remarks'].setValue(data.remarks == null ? '' : data.remarks)
    }
    this.offercode = data.discount_code
    this.formGroup.controls['offercode'].setValue(data.discount_code)
    this.send_notification = false;
    this.notify = 0;
    this.getStoreList()


  }

  getSelectedCustomer(item) {
    this.customer = item;
    this.getCustomerOrderList(0);
  };

  getSelectedOrder(item) {
    this.orderList.forEach(element => {
      if (item == element.order_id) {
        this.formGroup.controls['ordervalue'].setValue(element.amount)
      }
    });
  };

  async getCustomerOrderList(orderid) {

    this.formGroup.controls['customerorder'].setValue(null)

    var data: any = {
      store_id: this.seller_details.store_id,
      is_offer: 1,
    };
    if (this.customer) {
      data.customer_id = this.customer
    }
    if (this.customer?.customer_id) {
      data.customer_id = this.customer.customer_id
    }
    if (this.is_super_admin == true) {
      data.store_id = this.storeIdForSuperAdmin
    }

    await this.offerService.getCustomerOrderList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orderList = response.data.khata == null ? this.formGroup.controls.customerorder.reset() : response.data.khata;
          if (orderid > 0) {
            this.orderList.forEach(value => {
              if (value['order_id'] == orderid) {
                this.formGroup.controls['customerorder'].setValue(value.order_id)
                this.formGroup.controls['ordervalue'].setValue(value['amount'])
              }
            });

          }
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  async getPaymentMethods() {
    var data = { store_id: this.seller_details.store_id };
    await this.offerService.getPaymentMethods(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.store_payments.forEach(value => {
            var payoption = {
              id: value.payment_method_id,
              name: value.method_name
            };
            if (value.is_added == 1) {
              this.payment_method_list.push(payoption);
            }
          });
          if (this.offerId != undefined) {
            this.getOfferDetails();
          }
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  async getCustomerList(sellerId) {
    var data = { store_id: this.is_super_admin == true ? sellerId : this.seller_details.store_id };
    await this.offerService.getCustomerListForOffers(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.customer_list = response.data;

          if (this.offerId) {

            var selectedCustomer = [];
            if (this.custIds.length > 0) {

              this.customer_list.forEach(element => {
                this.custIds.forEach(item => {
                  if (element.customer_id == item) {
                    selectedCustomer.push(element.customer_id)
                  }
                })
              })
            }
            else {
              this.customer_list.forEach(element => {
                selectedCustomer.push(element.customer_id)
              });
            }

            this.formGroup.controls['selectdCustomerlist'].setValue(selectedCustomer);
            this.getCustomerOrderList(selectedCustomer)
          }

        }
        else {
          this._snackbarService.error(response.message)
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  async getStoreList() {
    var data = { user_id: this.main.LoggedUserInfo.user_id };
    await this.offerService.getUserStoreRoles(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(st => {
            if (st.offer_module == 1) {
              if (st.role_id == 2 && st.khata_user == 0) {
                st.label = st.store_name + '(' + st.name + ')';

                if (this.seller_details.store_id == st.store_id) {
                  var data = {
                    store_id: st.store_id,
                    store_name: st.store_name,
                    area_name: st.area_name,
                    city_name: st.city_name,
                    category_name: st.category_name
                  };
                  if (this.offerId == undefined) {
                    this.stores.push(data)
                  }
                  this.store_list.push(st);

                }
                else {
                  this.store_list.push(st);
                }
              }
            }
          });

          this.store_list = this.store_list.sort((a, b) => a.store_name.localeCompare(b.store_name));
          const uniqueStoreIds = new Set<number>();
          const uniqueStoreList = this.store_list.filter((store) => {
            if (!uniqueStoreIds.has(store.store_id)) {
              uniqueStoreIds.add(store.store_id);
              return true;
            }
            return false;
          });

          this.store_list = cloneDeep(uniqueStoreList);

          if ((this.suboffertype == 4 || this.suboffertype == 8) && this.offerId) {
            var storeData = this.store_list.filter(x => x.store_id == this.storeIdForSuperAdmin)
            if (storeData?.length == 1) {
              this.formGroup.controls["SelectedStore"].setValue(storeData[0].store_name)
            }

          }


        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }
  getSelectedStore() {
    if (this.formGroup.value.SelectedStore != undefined) {
      var exist = this.stores.filter((x) => x.store_id == this.formGroup.value.SelectedStore.store_id)[0];
      if (exist != null && exist != undefined) {
        this._snackbarService.error('Store already exists')
        this.formGroup.controls['SelectedStore'].setValue(null)
        return;
      }

      var data = {
        store_id: this.formGroup.value.SelectedStore.store_id,
        store_name: this.formGroup.value.SelectedStore.store_name,
        area_name: this.is_super_admin == false ? this.formGroup.value.SelectedStore.area_name : this.formGroup.value.SelectedStore.store_area_name,
        city_name: this.is_super_admin == false ? this.formGroup.value.SelectedStore.city_name : this.formGroup.value.SelectedStore.store_city_name,
        category_name: this.formGroup.value.SelectedStore.category_name
      };
      this.stores.push(data);
      this.formGroup.value.SelectedStore = undefined;
    }
    else {
      this._snackbarService.error('Please select store')
      return;
    }
  }


  getSelectedAdminSeller(item) {
    this.storeIdForSuperAdmin = item
    this.customer_list = []
    this.formGroup.controls['selectdCustomerlist'].setValue(null);
    this.formGroup.controls['customer'].setValue(null);
    if (this.suboffertype == 12) {
      localStorage.setItem('adminselectedstore', this.formGroup.value.SelectedAdminSeller.store_id);
    }
    else {
      if (this.is_super_admin == true && this.offerId == undefined) {
        this.getCustomerList(item);
      }
      else {
        this.getCustomerList(this.formGroup.value.SelectedAdminSeller.store_id);

      }
    }
  }

  async getSellerList() {
    var data: any = {
      market_type: 2,
      is_verified: 2,
      khata_user: 0,
      search_query: this.search,
      page: this.search == '' || this.search == undefined ? this.page : 0
    };
    if (this.offerId != undefined) {
      data.store_id = this.search == '' || this.search == undefined ? this.admin_store_id : undefined;
    }

    await this.offerService.getSellerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (this.page > 1) {
            this.admin_seller_list = this.admin_seller_list.concat(response.data);

          }
          else {
            this.admin_seller_list = response.data;

          }

          if (this.offerId != undefined) {

            this.SelectedAdminSeller = this.admin_seller_list.filter((x) => x.store_id == this.admin_store_id)[0];
            this.formGroup.controls['SelectedAdminSeller'].setValue(this.SelectedAdminSeller?.store_id)

            if (this.is_super_admin == true) {
              this.getCustomerList(this.SelectedAdminSeller?.store_id);
            }
          }
          this.admin_seller_count = response.count;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  zeroNotValid(event, Type) {
    if (Type == "numberofuses") {
      event = this.validateFloatNumber(event);
      if (event != '') {
        if (Number(event) <= 0) {
          this._snackbarService.error(this.translate.instant('NUMBER_OF_USAGE_CUSTOMER_CAN_BE_BLANK_OR_GRATER_0'));
          this.formGroup.controls['numberofuses'].setValue(null);
          return false;
        }
      }
    }
    else if (Type == "max_uses") {
      event = this.validateFloatNumber(event);
      if (event != '') {
        if (Number(event) <= 0) {
          this._snackbarService.error(this.translate.instant('NUMBER_OF_MAX_OF_USES_CAN_BE_BLANK_OR_GRATER_0'));
          this.formGroup.controls['max_uses'].setValue(null);
          return false;
        }
      }
    }

  };

  validateFloatNumber(price) {
    if (price.split('.').length > 1 && price.split('.')[0] == '') {
      price = '';
    }
    if (price.split('.').length > 2) {
      price = price.split('.')[0] + '.' + price.split('.')[1];
    }

    if (price.split('.').length > 1 && price.split('.')[1] > 99) {
      price = Number(price).toFixed(2);
    }
    return price;
  }

  showZoneApplicableOn() {
    this.show_zone_applicable = false;
    this.show_applicable = false;
    this.orderApplicableOnList.forEach(day => {
      if (day.value == 1 || day.value == 2 || day.value == 5) {
        if (this.show_zone_applicable == false) {
          this.show_zone_applicable = day.isActive == true ? true : false;
        }
      }
      if (day.value == 1 || day.value == 2 || day.value == 5 || day.value == 3 || day.value == 4 || day.value == 6) {
        if (this.show_applicable == false) {
          this.show_applicable = day.isActive == true ? true : false;
        }
      }
    })
  }

  maxOfUserAppendData() {
    if (this.suboffertype == 12) {
      this.max_of_use_list = [
        { id: 1, name: 'Uses/ Store' }
      ]
    }
    else {
      this.max_of_use_list = [
        { id: 1, name: 'Uses/ Store' },
        { id: 2, name: 'Total Uses (Across All Store Applied)' },
      ]
    }
    this.formGroup.controls['selectedMaxofuse'].setValue(this.max_of_use_list[0].id)
    this.selectedMaxofuse = this.max_of_use_list[0];
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }

    }
    return invalid;
  }
  /** Submit method of edit/add manage offer */
  onSubmit() {
    if (this.suboffertype == 4 || this.suboffertype == 5 || this.suboffertype == 12 || this.suboffertype == 13 || this.suboffertype == 15) {
      this.formGroup.controls['numberofuses'].setValue(!this.formGroup.value.numberofuses ? undefined : this.formGroup.value.numberofuses)
      this.formGroup.controls['max_uses'].setValue(!this.formGroup.value.max_uses ? undefined : this.formGroup.value.max_uses)
      if (this.formGroup.value.numberofuses == null) {
        if (this.formGroup.value.frequency != 0) {
          this._snackbarService.error('Enter the Number of Usage/Customer')
          return;
        }
      }

      if (!this.formGroup.value.frequency) {
        if (this.formGroup.value.numberofuses) {
          this._snackbarService.error('Enter the Period of Use (Frequency)')
          return;
        }
      }
      else {
        if (this.formGroup.value.frequency == 0) {
          if (this.formGroup.value.numberofuses) {
            this._snackbarService.error('Enter the Period of Use (Frequency)')
            return;
          }
        }
      }

    }
    if (this.suboffertype == 15 && this.formGroup.value.refundamount == null) {
      this._snackbarService.error(this.translate.instant("PLEASE_REDUCED_DELIVERY_CHARGES"));
      return;
    }
    if (this.suboffertype == 10 && this.formGroup.value.selectdCustomerlist == null) {
      this._snackbarService.error(this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_CUSTOMER"));
      return;
    }

    if (this.suboffertype == 12 && this.item_variants?.length == 0) {
      this._snackbarService.error(this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_ITEM"));
      return;
    }
    if (this.suboffertype == 7 || this.suboffertype == 8 || this.suboffertype == 10) {
      if (this.formGroup.value.enddate == null || this.formGroup.value.enddate == undefined) {
        this._snackbarService.error(this.translate.instant("PLEASE_SELECT_TO_DATE"));
      }
    }

    if (this.formGroup.value.enddate != undefined || this.formGroup.value.enddate != null) {
      if (this.formGroup.value.startdate > this.formGroup.value.enddate) {
        this._snackbarService.error(this.translate.instant("START_END_DATE_VALIDATE"));
        return;
      }
    }
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
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
      var fd = new FormData();
      if (this.offerId != undefined) {
        fd.append('offer_id', this.offerId);
      }
      fd.append('user_id', this.main.LoggedUserInfo.user_id);
      fd.append('offer_type_id', this.offer_type);
      fd.append('sub_offer_type_id', this.suboffertype);
      fd.append('title', this.formGroup.value.title);
      if (this.is_cropped_image) {
        fd.append("offer_img", this.formGroup.value.offer_picture);

      }
      if (this.is_image_delete == 1 && !this.is_cropped_image) {
        fd.append("is_image_delete", this.is_image_delete);
      }
      if (this.suboffertype == 4 || this.suboffertype == 5 || this.suboffertype == 13) {
        fd.append('discount', this.formGroup.value.discount);
      }

      if (this.suboffertype == 4 || this.suboffertype == 12 || this.suboffertype == 13 || this.suboffertype == 15) {
        fd.append('min_cart_value', this.formGroup.value.mincartvalue);
      }
      if (this.suboffertype == 4 || this.suboffertype == 13) {
        fd.append('max_discount_value', this.formGroup.value.maxdiscountvalue);
      }

      if (Number(this.offerId) > 0) {
        fd.append('discount_code', this.offercode);
      }
      else {
        fd.append('discount_code', this.formGroup.value.offercode);
      }


      if (this.suboffertype == 4 || this.suboffertype == 5 || this.suboffertype == 12 || this.suboffertype == 13 || this.suboffertype == 15) {
        fd.append('number_of_uses', this.formGroup.value.numberofuses);
        if (this.formGroup.value.frequency) {
          fd.append('period_of_use', this.formGroup.value.frequency);
        }
        else {
          fd.append('period_of_use', '0');
        }

        fd.append('use_restriction', this.formGroup.value.selectedMaxofuse);
        fd.append('max_uses', this.formGroup.value.max_uses);
      }
      var sdate;

      if (this.formGroup.value.startdate == undefined) {
        var today = new Date();
        sdate = moment(today).format(this.main.DateFormate.split(' ')[0])
      }
      else {
        sdate = moment(this.formGroup.value.startdate).format(this.main.DateFormate.split(' ')[0])
      }
      fd.append('start_date', sdate);

      if (this.formGroup.value.enddate != undefined) {
        var edate = moment(this.formGroup.value.enddate).format(this.main.DateFormate.split(' ')[0])
        fd.append('end_date', edate);
      }
      //
      fd.append('remarks', this.formGroup.value.remarks);

      if (this.suboffertype == 5) {
        fd.append('cart_value_from', this.formGroup.value.cartrangfrom);
        fd.append('cart_value_to', this.formGroup.value.cartrangto);
      }

      if (this.suboffertype == 7) {
        fd.append('customer_id', this.formGroup.value.customer);
        fd.append('order_id', this.formGroup.value.customerorder);
      }

      if (this.suboffertype == 7 || this.suboffertype == 8 || this.suboffertype == 10 || this.suboffertype == 15) {
        if (this.suboffertype == 7 || this.suboffertype == 15) {
          fd.append('offer_amount', this.formGroup.value.refundamount);
        }
        if (this.suboffertype == 8) {
          fd.append('offer_amount', this.formGroup.value.loyaltyamount);
        }
        if (this.suboffertype == 10) {
          fd.append('offer_amount', this.formGroup.value.rewardamount);
        }
      }

      if (this.formGroup.value.loyaltyoption == 1 && this.suboffertype == 8) {
        fd.append('total_cart_value', this.formGroup.value.cartvalue);
      }

      if (this.formGroup.value.loyaltyoption == 2 && this.suboffertype == 8) {
        fd.append('number_of_orders', this.formGroup.value.orderqty);
      }

      if (this.suboffertype == 8) {
        fd.append('loyalty_type', this.formGroup.value.loyaltyoption);
      }

      if (this.suboffertype == 10) {
        fd.append('discount', '0');
        fd.append('period_of_use', '1');
        var customerIdlist = '';
        if (this.formGroup.value.selectdCustomerlist?.length >= 1) {
          customerIdlist = this.formGroup.value.selectdCustomerlist.join(',');
        } else {
          customerIdlist = this.formGroup.value.selectdCustomerlist[0]
        }

        fd.append('number_of_uses', this.formGroup.value.selectdCustomerlist.length.toString());
        fd.append('customer_id', customerIdlist);
      }
      if (this.suboffertype == 12) {
        var selectedItems = []
        this.item_variants.forEach(element => {
          var data = {
            item_id: element.item_id,
            item_variants_id: element.item_variants_id,
            quantity: element.quantity
          }
          selectedItems.push(data)
        });
        fd.append('items', JSON.stringify(selectedItems));
      }

      if (this.suboffertype == 13) {
        fd.append('payment_method', this.formGroup.value.paymentMethod);
      }

      if (this.suboffertype != 7 && this.suboffertype != 10) {
        fd.append('notify_customers', this.formGroup.value.notify_customers == true ? '1' : '0');
      }

      if (this.suboffertype == 4 || this.suboffertype == 5) {
        if (this.pos_module == 0) {
          if (this.order_type == '4') {
            this._snackbarService.error('Select Orders Applicable On')
            return;
          }
        }
      }


      if (this.offer_type == 1 || this.offer_type == 2 || this.offer_type == 3) {
        if (this.suboffertype != 7 && this.suboffertype != 12) {
          if (this.is_super_admin == true) {
            fd.append('is_platform', this.formGroup.value.is_all_store == true ? '1' : '0');
          }
          else {
            fd.append('is_all_store', this.formGroup.value.is_all_store == true ? '1' : '0');
          }

          if (this.formGroup.value.is_all_store == 0 && this.stores?.length > 0) {

            if (this.stores?.length == 0) {
              this._snackbarService.error('Select minimum one store')
              return;
            }

            var storeselection = [];
            for (var i = 0; i < this.stores?.length; i++) {
              this.stores[i].store_id
              storeselection.push(this.stores[i].store_id);
            }
            fd.append('store_id', storeselection.toString());
          }
          else {
            if (this.is_super_admin == true) {
              fd.append('store_id', this.SelectedAdminSeller == undefined ? '' : this.SelectedAdminSeller.store_id);
            }
            else {
              fd.append('store_id', this.seller_details.store_id == undefined ? '' : this.seller_details.store_id);
            }
          }
        }
        else {
          if (this.is_super_admin == true) {
            if (this.suboffertype == 7 && this.SelectedAdminSeller == undefined) {
              fd.append('store_id', this.storeIdForSuperAdmin);
            } else {
              fd.append('store_id', this.SelectedAdminSeller == undefined ? '' : this.SelectedAdminSeller.store_id);
            }
          }
          else {
            fd.append('store_id', this.seller_details.store_id == undefined ? '' : this.seller_details.store_id);
          }
        }
      }
      else {
        if (this.is_super_admin == true) {
          fd.append('store_id', this.SelectedAdminSeller == undefined ? '' : this.SelectedAdminSeller.store_id);
        }
        else {
          fd.append('store_id', this.seller_details.store_id == undefined ? '' : this.seller_details.store_id);
        }
      }

      if (this.suboffertype == 4 || this.suboffertype == 5 || this.suboffertype == 15) {
        var ordertypeIdslist = [];

        this.orderApplicableOnList.forEach(day => {

          if (day.value != 1 && day.isActive == true && day.isShow == true) {
            ordertypeIdslist.push(day.value);
          }
        })
        if (ordertypeIdslist?.length == 0) {
          this._snackbarService.error('Order type applicable on is mandatory')
          return;
        }
        fd.append('order_type', ordertypeIdslist.toString());
      }

      if (this.suboffertype == 4 || this.suboffertype == 5 || this.suboffertype == 12 || this.suboffertype == 13 || this.suboffertype == 15) {
        var dayIdlist = [];
        this.daysList.forEach(day => {
          if (day.value != 7 && day.isActive == true) {
            dayIdlist.push(day.value);
          }
        })
        if (dayIdlist?.length == 0) {
          this._snackbarService.error('Valid on is mandatory')
          return;
        }
        fd.append('applicable_days', dayIdlist.toString());

        if (this.is_area_show == false) {
          if (this.formGroup.value.offerZone == 2) {
            this._snackbarService.error('Select Zone Applicable on')
            return;
          }
        }

        if (this.show_zone_applicable == true || this.show_applicable == true) {
          fd.append('offer_zone', this.formGroup.value.offerZone);
          if (this.formGroup.value.offerZone == 1) {
            var cityIds = [];
            for (var i = 0; i < this.selected_city_list?.length; i++) {
              cityIds.push(parseInt(this.selected_city_list[i].city_id));
            }
            if (cityIds?.length == 0) {
              this._snackbarService.error('Select atleast one city')
              return;
            }
            fd.append('city_ids', cityIds.toString());
          }
          else if (this.formGroup.value.offerZone == 2) {
            var areaIds = [];
            for (var i = 0; i < this.selected_areas_list?.length; i++) {
              areaIds.push(parseInt(this.selected_areas_list[i].area_id));
            }
            if (areaIds.length == 0) {
              this._snackbarService.error('Select atleast one area')
              return;
            }
            fd.append('area_ids', areaIds.toString());
          }
          else if (this.formGroup.value.offerZone == 3) {
            fd.append('pincode_type', this.formGroup.value.pincode_type);
            if (this.formGroup.value.pincode_type == 1) {
              if (this.formGroup.value.pincode_list == undefined || this.formGroup.value.pincode_list == null ||
                this.formGroup.value.pincode_list == '') {
                this._snackbarService.error(
                  this.translate.instant(
                    "Please " + "Enter " + this.pincode_label + " value(s)"
                  )
                );
                return;
              }

              fd.append('pincode_list', this.formGroup.value.pincode_list);
            }

            if (this.formGroup.value.pincode_type == 2) {
              var slotpin = 1;
              for (var i = 0; i < this.formArr.value?.length; i++) {
                if (
                  this.formArr.value[i].from_pincode == undefined ||
                  this.formArr.value[i].to_pincode == undefined ||
                  this.formArr.value[i].from_pincode == "" ||
                  this.formArr.value[i].to_pincode == ""
                ) {
                  slotpin = 0;
                  break;
                }
              }
              if (slotpin == 0) {
                this._snackbarService.error(
                  this.translate.instant(
                    "Please enter " + this.pincode_label + " range"
                  )
                );
                return this.formGroup;
              }
              fd.append("pincode_range", JSON.stringify(this.formArr.value));
            }
          }
        }
        else {
          fd.append('offer_zone', '4');
        }
      }

      if (this.suboffertype != 7 && this.suboffertype != 8) {
        fd.append('on_item_type', this.formGroup.value.on_item_type);

        if (this.formGroup.value.on_item_type == 1) {
          var catIds = [];
          for (var i = 0; i < this.categories?.length; i++) {
            catIds.push(parseInt(this.categories[i].category_id));
          }
          if (catIds?.length == 0) {
            this._snackbarService.error('Select atleast one category')
            return;
          }

          fd.append('category_ids', catIds.toString());
        }
        else if (this.formGroup.value.on_item_type == 2) {
          var subcatIds = [];
          for (var i = 0; i < this.sub_categories?.length; i++) {
            subcatIds.push(parseInt(this.sub_categories[i].sub_category_id));
          }
          if (subcatIds?.length == 0) {
            this._snackbarService.error('Select atleast one sub category')
            return;
          }

          fd.append('sub_category_ids', subcatIds.toString());
        }
        else if (this.formGroup.value.on_item_type == 3) {
          var itemIds = [];
          this.items.forEach(value => {
            itemIds.push(value.item_id);
          });
          if (itemIds?.length == 0) {
            this._snackbarService.error('Select atleast one item')
            return;
          }
          fd.append('item_ids', itemIds.toString());
        }
        else if (this.formGroup.value.on_item_type == 4) {
          var variantIds = [];
          this.item_variants.forEach(value => {
            variantIds.push(value.item_variants_id);
          });
          if (variantIds?.length == 0) {
            this._snackbarService.error('Select atleast one variant')
            return;
          }
          fd.append('item_variant_ids', variantIds.toString());
        }
      }
      else {
        fd.append('on_item_type', '5');
      }

      this.offerService.saveOffer(fd).subscribe({

        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/manage-offer`]);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {
          this.spinner.hide();
          this._snackbarService.error(error);
        },
        complete: () => {
          this.spinner.hide();

        },
      });
    }
  }

  clearStartDate() {
    if (this.suboffertype == 4 || this.suboffertype == 5 || this.suboffertype == 6 || this.suboffertype == 8 || this.suboffertype == 9 || this.suboffertype == 10 || this.suboffertype == 11 || this.suboffertype == 12 || this.suboffertype == 13 || this.suboffertype == 15) {
      this._snackbarService.error('Start date is mandatory')
      return;
    }
    this.formGroup.controls['startdate'].setValue(null);
  }

  clearEndDate() {
    if (this.suboffertype == 7 || this.suboffertype == 8 || this.suboffertype == 9 || this.suboffertype == 10 || this.suboffertype == 11) {
      this._snackbarService.error('End date is mandatory')

      return;
    }
    this.formGroup.controls['enddate'].setValue(null);
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
  /** Open SelectCityAreaComponent modal */
  openSelectCityArea() {
    const modalRef = this.modalService.open(SelectCityAreaComponent, {
      size: "lg",
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.offerZone = this.formGroup.value.offerZone;
    modalRef.componentInstance.deliveryareas = this.formGroup.value.offerZone == 1 ? this.selected_city_list : this.selected_areas_list;
    modalRef.componentInstance.passEntry.subscribe((items) => {
      if (this.formGroup.value.offerZone == 1) {
        this.selected_city_list = items
      } else {
        this.selected_areas_list = items;
      }
    });
  }

  openSelectItemPopup() {
    var data = []
    if (this.offer_details?.items?.length > 0) {
      this.offer_details.items.forEach(category => {
        category.item_variants.forEach((varient, index) => {
          if (varient.is_added) {
            var itemdata = {
              item_images: category?.item_images,
              unit_quantity: parseFloat(varient.unit_quantity),
              quantity: parseFloat(varient.quantity),
              Selected: 0,
              SelectedQty: 0,
              item_image: category.item_image,
              item_type: category.item_type,
              category_id: category.category_id,
              category_name: category.category_name,
              sub_category_id: category.sub_category_id,
              sub_category_name: category.sub_category_name,
              brand_name: category.brand_name,
              item_name: category.item_name,
              item_id: category.item_id,
              item_variants_id: varient.item_variants_id,
              price: varient.item_price,
              discounted_price: varient.discounted_price,
              packaging_id: varient.packaging_id,
              packaging_name: varient.packaging_name,
              unit_id: varient.unit_id,
              unit_name: varient.unit_name,
              sku: varient.sku,
              out_of_stock: varient.out_of_stock,
              mask_price: varient.mask_price,
              min_qty: varient.min_qty,
              packaging: varient.packaging,
              tax: varient.tax,
              tax_price: Number(
                (Number(varient.discounted_price) * Number(varient.tax)) / 100
              ),
              max_qty: varient.max_qty,
              is_choice_addon: varient.is_choice_addon,
              ia_available_choice_addon:
                varient.is_choice_addon == 0
                  ? "Choices / Addons Available"
                  : varient.is_choice_addon == 1
                    ? "Choices Available"
                    : varient.is_choice_addon == 2
                      ? "Addons Available"
                      : "",
              choices: varient.choices,
              addons: varient.addons,
              prescription: category.prescription,
              is_combo: category.is_combo,
              stock_management_method: category?.stock_management_method,
              current_stock: category?.stock_management_method == 2 ? category?.current_stock : category?.stock_management_method == 3 ? varient?.current_stock : 0,
              out_stock_qty: varient?.out_stock_qty,
              stock_unit: category?.stock_management_method == 2 ? category?.unit_name : varient?.unit_name,
            };
            data.push(itemdata);
          }
        });
      });

    }
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
      centered: true,
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.forAddOrder = 1;
    modalRef.componentInstance.SelectedItems = data;
    modalRef.componentInstance.SelectedItemFromStore.subscribe(
      (selectedItem) => {
        this.item_variants = selectedItem
      }
    );
  }
  /** Open SelectItemsComponent modal. */
  openSelectApplicableOnItem(label) {
    var data = []
    if (this.offer_details?.item_variants?.length > 0) {
      this.offer_details.item_variants.forEach(category => {
        category.item_variants.forEach((varient, index) => {
          if (varient.Selected) {
            var itemdata = {
              item_images: category?.item_images, //may be change
              unit_quantity: parseFloat(varient.unit_quantity),
              Selected: 1,
              SelectedQty: 1,
              item_image: category.item_image,
              item_type: category.item_type,
              category_name: category.category_name,
              sub_category_name: category.sub_category_name,
              brand_name: category.brand_name,
              item_name: category.item_name,
              item_id: category.item_id,
              item_variants_id: varient.item_variants_id,
              item_price: varient.item_price,
              discounted_price: varient.discounted_price,
              packaging_id: varient.packaging_id,
              packaging_name: varient.packaging_name,
              unit_id: varient.unit_id,
              unit_name: varient.unit_name,
              sku: varient.sku,
              out_of_stock: varient.out_of_stock,
              mask_price: varient.mask_price,
              min_qty: varient.min_qty,
              packaging: varient.packaging,
              max_qty: varient.max_qty,
              is_choice_addon: varient.is_choice_addon,
              choices: varient.choices,
              addons: varient.addons,
              stock_management_method: category?.stock_management_method,
              current_stock: category?.stock_management_method == 2 ? category?.current_stock : category?.stock_management_method == 3 ? varient?.current_stock : 0
            };
            data.push(itemdata);
          }
        });
      });

    }

    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.isManageOffer = true;
    modalRef.componentInstance.showvariant = true;
    modalRef.componentInstance.offerAddedItem = data;

    if (label) {
      modalRef.componentInstance.initialSelectedItems = this.item_variants;

    } else {

      modalRef.componentInstance.initialSelectedItems = this.items;

    }

    modalRef.componentInstance.selectedPopupItems.subscribe((items) => {
      this.items = items
      if (label) {
        this.item_variants = items;

      } else {
        this.items = items;
      }
    });
  }
  /** Open SelectCategoryComponent modal */
  openSelectCatSubCat() {
    const modalRef = this.modalService.open(SelectCategoryComponent, {
      size: "lg",
    });
    modalRef.componentInstance.on_item_type = this.formGroup.value.on_item_type;
    modalRef.componentInstance.categories = this.categories;
    modalRef.componentInstance.sub_categories = this.sub_categories;
    modalRef.componentInstance.passEntry.subscribe((remove_sub_cat) => {
      if (remove_sub_cat == "removeAllValueConfirm") {
        this.sub_categories = [];
      }

    });
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      if (receivedEntry) {
      } else {
      }
    });
  }
  /** Open SelectItemsComponent modal */
  openSelectItem() {
    var data = []
    if (this.offer_details.items.length > 0) {
      this.offer_details.items.forEach(category => {
        category.item_variants.forEach((varient, index) => {
          if (varient.Selected) {
            var itemdata = {
              item_images: category?.item_images, //may be change
              unit_quantity: parseFloat(varient.unit_quantity),
              Selected: 1,
              SelectedQty: 1,
              item_image: category.item_image,
              item_type: category.item_type,
              category_name: category.category_name,
              sub_category_name: category.sub_category_name,
              brand_name: category.brand_name,
              item_name: category.item_name,
              item_id: category.item_id,
              item_variants_id: varient.item_variants_id,
              item_price: varient.item_price,
              discounted_price: varient.discounted_price,
              packaging_id: varient.packaging_id,
              packaging_name: varient.packaging_name,
              unit_id: varient.unit_id,
              unit_name: varient.unit_name,
              sku: varient.sku,
              out_of_stock: varient.out_of_stock,
              mask_price: varient.mask_price,
              min_qty: varient.min_qty,
              packaging: varient.packaging,
              max_qty: varient.max_qty,
              is_choice_addon: varient.is_choice_addon,
              choices: varient.choices,
              addons: varient.addons,
              stock_management_method: category?.stock_management_method,
              current_stock: category?.stock_management_method == 2 ? category?.current_stock : category?.stock_management_method == 3 ? varient?.current_stock : 0
            };
            data.push(itemdata);
          }
        });
      });

    }

    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
    });
    modalRef.componentInstance.isManageOffer = true;
    modalRef.componentInstance.showvariant = true;
    modalRef.componentInstance.offerAddedItem = data;
    modalRef.componentInstance.initialSelectedItems = this.selected_items;
    modalRef.componentInstance.selectedPopupItems.subscribe((items) => {
      this.selected_items = items;
      this.offer_details.items = items
      this.selected_items_count = 0;
      this.selected_items_count = items?.length
    });
  }

  dayChanged(objDay) {
    objDay.isActive = objDay.isActive == false ? true : false
    if (objDay.value == 7) {
      if (objDay.isActive == false) {
        this.daysList.forEach(element => {
          element.isActive = false
        });
      }
      else {
        this.daysList.forEach(element => {
          element.isActive = true
        });
      }
    }
    else {
      var InActiveDays = [];
      this.daysList.forEach(element => {
        if (element.isActive == false) {
          InActiveDays.push(element)
        }
      });
      if (InActiveDays?.length == 1) {
        if (InActiveDays[0].value == 7) {
          this.daysList.forEach(element => {
            element.isActive = true
          });

        }
        else {
          this.daysList.forEach(element => {
            if (element.value == 7) {
              element.isActive = false;
            }
          });
        }
      }
      else {
        this.daysList.forEach(element => {
          if (element.value == 7) {
            element.isActive = false;
          }
        });
      }
    }
  }

  orderApplicableOnChanged(objDay) {
    objDay.isActive = objDay.isActive == false ? true : false
    if (objDay.value == 1) {
      if (objDay.isActive == false) {
        this.orderApplicableOnList.forEach(element => {
          element.isActive = false
        });
      }
      else {
        this.orderApplicableOnList.forEach(element => {
          element.isActive = true
        });
      }
    }
    else {
      var InActiveDays = [];
      this.orderApplicableOnList.forEach(element => {
        if (element.isActive == false) {
          InActiveDays.push(element)
        }
      });
      if (InActiveDays?.length == 1) {
        if (InActiveDays[0].value == 1) {
          this.orderApplicableOnList.forEach(element => {
            element.isActive = true
          });
        }
        else {
          this.orderApplicableOnList.forEach(element => {
            if (element.value == 1) {
              element.isActive = false
            }
          });
        }
      }
      else {
        this.orderApplicableOnList.forEach(element => {
          if (element.value == 1) {
            element.isActive = false
          }
        });
      }
    }
    this.showZoneApplicableOn();
  }

  deleteStore(id) {
    if (this.stores?.length == 1) {
      this._snackbarService.error('Select minimum one store')
      return;
    }
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      cancelButtonText: this.translate.instant("CANCEL"),
      confirmButtonText: this.translate.instant("OK"),
    }).then((result) => {
      if (result.value) {
        this.deleteConfirm(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  deleteConfirm(id) {
    for (var i = 0; i < this.stores?.length; i++) {
      if (this.stores[i].store_id == id) {
        this.stores.splice(i, 1);
        break;
      }
    }
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  cancelClick() {
    history.back();
  }

  restrictNumeric(e) {
    if (this.type == "number") {
      var charCode = e.keyCode;
      if ((charCode < 48 || charCode > 57) && charCode != 46) {
        event.preventDefault();
      }
    }
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }
  DateFormateFromServerSide() {
    return this.main.DateFormate;
  }
  dateFormateFromServerSideOnlyDateReturn() {
    return this.general_setting.date_format_web.split(" ")[0];
  }

  openUpdateUserProfPicModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.my_cropped_image_show;
    modalRef.componentInstance.imageChangedEvent = this.my_cropped_image
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.cropFiles = this.cropFiles

    modalRef.componentInstance.newseller =
      this.cropped_store_logo == undefined
        ? this.formGroup.value.offer_picture
        : this.cropped_store_logo;
    modalRef.componentInstance.isCroppedImage = this.is_cropped_image;
    modalRef.componentInstance.isOfferImage = true;
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
      this.formGroup.controls["offer_picture"].setValue(item.crop_image_file);
      this.my_cropped_image = item.full_image;

    }

    this.cdr.detectChanges();
  }

  removeLogoImage() {
    this.formGroup.value.offer_picture = "assets/icons/no_image.svg";
    this.is_cropped_image = false;
    this.my_cropped_image = "";
    if (this.offerId) {
      this.is_image_delete = 1;
    }
  }

  omit_special_char(event) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
  }
}
