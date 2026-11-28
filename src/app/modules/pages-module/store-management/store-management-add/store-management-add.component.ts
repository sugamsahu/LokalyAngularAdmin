import { CommonService } from "src/app/services/common.service";
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { StoreService } from "src/app/services/store.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GoogleMapsLoader } from "src/app/services/google-maps-loader.service";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { crop_rectangleComponent } from "../../model/crop-rectangle/crop-rectangle.component";
import { subscriptionAddComponent } from "../../model/subscription-add/subscription-add.component";
import Swal from "sweetalert2";
import { shareURLComponent } from "../../model/share-url/share-url.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ToastrService } from "ngx-toastr";
import { ItemService } from "src/app/services/item.service";
import { NgxSpinnerService } from "ngx-spinner";
declare var google: any;

@Component({
  selector: "app-store-management-add",
  templateUrl: "./store-management-add.component.html",
  styleUrls: ["./store-management-add.component.scss"],
})
export class StoreManagementAddComponent implements OnInit, AfterViewInit {
  @ViewChild('cursor') cursor: ElementRef;
  @ViewChild("addressUploadFile") someInput!: ElementRef;
  @ViewChild("gstUploadFile") gstUploadFile!: ElementRef;
  public store_mgmt: UntypedFormGroup;
  public store_subscription: UntypedFormGroup;
  page: number = 1;
  count: number = 0;
  tableSize: number = 20;
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  adminDetails = JSON.parse(localStorage.getItem("loginUser"));
  ph_numbr = /^\+?\d{10}$/;
  main: any = { LoggedUserInfo: {} };
  unitTypeId: any = 0;
  business_model: any;
  subscription_model: any;
  order_settings: any;
  isOrderBalanceShowPlatForm: boolean;
  isShowOrderSetting: boolean;
  notShowSubscription: boolean;
  loginUserId: any;
  iseatery: any;
  countryList = [];
  stateList = [];
  categoryList = [];
  areaList = [];
  subscriptionsList = [];
  cuisinesList = [];
  subscriptionHistoryList = [];
  global_currency: any;
  global_timezone: any;
  pincode_label: any;
  pincode_length: any;
  allow_alphanumeric_pincode: number;
  use_google_map: number;
  default_location_lat: number;
  default_location_long: number;
  store_tax_label: any;
  terms_of_use_url: any;
  store_label: any;
  timezone: any;
  offers_module: any;
  chat_module: any;
  livetracking: any;
  refund_module: any;
  pos_module: any;
  dinein_module: any;
  picker_module: any;
  stock_mgmt: any;
  isCroppedImage = false;
  IsAddressFileUploaded = true;
  IsGSTFileUploaded = true;
  subscriptionDurationList = [];
  subscriptionPayTypeList = [];
  timezonelist = [];
  IsSubscriptionHistoryVisible = false;
  format = "dd-MMMM-yyyy";
  dashstartdate: string;
  dashenddate: string;
  tempLat: number;
  tempLng: number;
  storeManage_Behalf: string;
  dateOptions: { minDate: Date; maxDate: Date };
  startDateOptions: { minDate: Date; maxDate: Date };
  map: any;
  infoWindow: any;
  marker: any;
  geocoder: any;
  myImage: string;
  myCroppedImage: string;
  sellerid: any;
  cityList: any[];
  imageUploadType: string;
  file: any;
  orderSettingsList: any;
  subscriptionDetail: any;
  isSubscriptionDesabled: boolean;
  isSubscriptionEndDateChnage: boolean;
  isStartDateDisable: boolean;
  totalDays: number;
  tempSellerid: string;
  storeid: string;
  fullAddress: string;
  myCroppedImageShow: string;
  cropped_store_logo: any;
  newseller: any;
  selectedcategory: any;
  address_proof: any;
  gst_certificate: any;
  gst_certi: any;
  sessionConfig: any;
  apifunction: string;
  latitude: any;
  longitude: any;
  croppedImages: any;
  cropFiles: any;
  editdetails: any
  UrL: string;
  whatsappURL: string;
  eateryfordinein = 1
  disabledData;
  inputPinocodeType: string = "text";
  displayModule: any = true;
  customer_User_Id: any = 0;
  superAdmin: any;
  location: any = window.location.pathname;
  phone_list: any = [];
  store_image: any;
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private storeservice: StoreService,
    public commonService: CommonService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private modalService: NgbModal,
    private mapsAPILoader: GoogleMapsLoader,
    private formBuilder: UntypedFormBuilder,
    private el: ElementRef,
    public spinner: NgxSpinnerService,
    private cryptoService: CryptoService,
    private itemService: ItemService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;

    if (location.href.indexOf("/sellers/edit") > -1) {
      this.unitTypeId = this.cryptoService.decryptIdValue(
        "storeManage_sellerid" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.unitTypeId == undefined) {
        this.router.navigate(["/sellers"]);
      }
    }
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var admin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 2 ? true : false
    if (!admin) {
      this.router.navigate(['/dashboard']);
    }
    this.superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    this.sessionConfig = this.appComponent.sessionConfig();
    if (location.href.indexOf("sellers/add") > -1) {
      this.sessionConfig.clearCookie(
        "storeManage_sellerid" + this.main.LoggedUserInfo.role_id.toString()
      );
    }
    this.unitTypeId = this.sessionConfig.decryptIdValue(
      "storeManage_sellerid" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );

    this.main.LoggedUserInfo = JSON.parse(
      this.sessionConfig.getSessionLoginUser()
    );
    this.PlatformSetting =
      this.PlatformSetting == null
        ? this.main.platform_setting
        : this.PlatformSetting;
    this.business_model = this.PlatformSetting.business_model;
    this.subscription_model = this.PlatformSetting.subscription_model;
    this.order_settings = this.PlatformSetting.order_settings;
    this.isOrderBalanceShowPlatForm = true;
    this.isShowOrderSetting =
      this.order_settings == 1 && this.subscription_model == 1 ? false : true;
    if (this.business_model == 1) {
      this.isShowOrderSetting = false
    }
    if (this.business_model == 3) {
      this.isShowOrderSetting = false
      this.isOrderBalanceShowPlatForm =
        this.business_model == 1
          ? true
          : this.business_model == 2
            ? true
            : false;
      this.isOrderBalanceShowPlatForm =
        this.main.LoggedUserInfo.role_id == 6
          ? true
          : this.isOrderBalanceShowPlatForm;
    }
    this.notShowSubscription =
      this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
        ? false
        : true;
    this.loginUserId = this.main.LoggedUserInfo.user_id;
    this.generalSetting =
      this.generalSetting == null ? this.main : this.generalSetting;
    this.iseatery = this.main.LoggedUserStoreInfo.iseatery;
    this.global_currency = this.generalSetting.currency_symbol;
    this.global_timezone = this.generalSetting.timezone;
    this.pincode_label = this.generalSetting.pincode_label;
    this.main.DateFormate = this.generalSetting.date_format_web;
    this.pincode_length = this.generalSetting.pincode_length;
    this.allow_alphanumeric_pincode = parseInt(
      this.generalSetting.allow_alphanumeric_pincode
    );
    this.inputPinocodeType = this.allow_alphanumeric_pincode == 1 ? "text" : "number"
    this.use_google_map = parseInt(this.generalSetting.use_google_map);
    this.default_location_lat = parseFloat(
      this.generalSetting.default_location_lat
    );
    this.default_location_long = parseFloat(
      this.generalSetting.default_location_long
    );
    this.store_tax_label = this.generalSetting.store_tax_label;
    this.terms_of_use_url = this.generalSetting.terms_of_use_url;
    this.store_label = this.generalSetting.store_label;
    this.timezone = this.generalSetting.timezone;
    this.offers_module = this.generalSetting.offers_module;
    this.chat_module = this.generalSetting.chat_module;
    this.livetracking = this.generalSetting.livetracking;
    this.refund_module = this.generalSetting.refund_module;
    this.pos_module = this.generalSetting.pos_module;
    this.dinein_module = this.generalSetting.dinein_module;
    this.picker_module = this.generalSetting.picker_module;
    this.stock_mgmt = this.generalSetting.stock_mgmt;

    this.loadform();
    var dashstartdate = new Date();

    this.dashstartdate = moment(dashstartdate).format(
      this.main.DateFormate.split(" ")[0]
    );
    var enddDateee = new Date();
    var enddDate = new Date(enddDateee.setMonth(enddDateee.getMonth() + 1));
    var dashenddate = new Date(enddDate.setDate(enddDate.getDate() - 1));
    this.dashenddate = moment(dashenddate).format(
      this.main.DateFormate.split(" ")[0]
    );
    this.tempLat = this.default_location_lat;
    this.tempLng = this.default_location_long;
    this.storeManage_Behalf = "false";
    this.dateOptions = {
      minDate: new Date(),
      maxDate: new Date(), // restrict maximum date to today
    };
    this.startDateOptions = {
      minDate: new Date(),
      maxDate: new Date(),
    };

    this.mapsAPILoader.load().then(() => {
      // Created only once the Maps script has loaded (see store details).
      this.geocoder = new google.maps.Geocoder();
      this.initMap();
    });

    if (this.unitTypeId && this.unitTypeId != 0) {
      this.tempSellerid = this.sessionConfig.decryptIdValue(
        "storeManage_sellerid" + this.main.LoggedUserInfo.role_id.toString(),
        this.main.CryptoKey
      );
      this.sellerid = this.sessionConfig.decryptIdValue(
        "storeManage_sellerid" + this.main.LoggedUserInfo.role_id.toString(),
        this.main.CryptoKey
      );
      this.storeid = this.sessionConfig.decryptIdValue(
        "storeManage_storeID" + this.main.LoggedUserInfo.role_id.toString(),
        this.main.CryptoKey
      );
      this.disabledData = JSON.parse(localStorage.getItem("DisabledLokalyBusiness"))
      this.storeManage_Behalf = this.sessionConfig.decryptIdValue(
        "storeManage_Behalf" + this.main.LoggedUserInfo.role_id.toString(),
        this.main.CryptoKey
      );
      if (this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1) {
        this.displayModule = false;
      }
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      this.displayModule = false;
    }
    if (this.sellerid == undefined) {
      this.subscriptionsListRecord();
      this.categoryListRecord();
      this.getCuisinesList();
      this.GetOrderSettingsList(0);
      this.GetTimezone();
      this.countryListRecord();
    } else {
      this.getCuisinesList();
      this.subscriptionsListRecord();
      this.categoryListRecord();
      this.GetOrderSettingsList(0);
      this.GetTimezone();
      this.countryListRecord();
    }

    if (this.location != '/sellers/edit') {
      this.getPhoneList();
    }

    this.cdr.detectChanges();
  }

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

  loadform() {
    this.store_mgmt = this.formBuilder.group({
      manager_name: new UntypedFormControl(null, [Validators.required]),
      phone: new UntypedFormControl(null, [Validators.required]),
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(
            "[a-zA-Z0-9.-_--]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}"
          ),
        ]),
      ],
      store_name: new UntypedFormControl(null, [Validators.required]),
      store_logo: new UntypedFormControl("assets/icons/no_image.svg"),
      address1: new UntypedFormControl(null, [Validators.required]),
      address2: new UntypedFormControl(null),
      country_id: new UntypedFormControl(null, [Validators.required]),
      state_id: new UntypedFormControl(null, [Validators.required]),
      city_id: new UntypedFormControl(null, [Validators.required]),
      area_id: new UntypedFormControl(null),
      zipcode: new UntypedFormControl(null, [Validators.required]),
      store_category_id: new UntypedFormControl(null, [Validators.required]),
      category_id: new UntypedFormControl(null),
      store_description: new UntypedFormControl(null),
      timezone: new UntypedFormControl(this.timezone, [Validators.required]),
      gst_certificate: new UntypedFormControl(null),
      filename: new UntypedFormControl(null),
      gst_number: new UntypedFormControl(null),
      demo_user: new UntypedFormControl(null),
      order_setting_id: new UntypedFormControl(null),
      reference_by: new UntypedFormControl(null),
      offer_module: new UntypedFormControl(null),
      chat: new UntypedFormControl(null),
      live_tracking: new UntypedFormControl(null),
      refund: new UntypedFormControl(null),
      inventory: new UntypedFormControl(null),
      pos: new UntypedFormControl(null),
      dine_in: new UntypedFormControl(null),
      picker: new UntypedFormControl(null),
      is_verified: new UntypedFormControl(null),
      is_importable: new UntypedFormControl(false),
      is_searchable: new UntypedFormControl(null),
      is_sponsored: new UntypedFormControl(null),
      is_agree: new UntypedFormControl(false),
      existing_user: new UntypedFormControl(false),
      user_id: new UntypedFormControl(0),
    });
  }


  /** For google map */
  initMap() {
    // The map container is only rendered when Google Maps is enabled for the platform.
    const mapElement = document.getElementById("google-maps");
    if (!mapElement) {
      return;
    }
    let that = this;
    var latLng = new google.maps.LatLng(that.tempLat, that.tempLng);
    var mapOptions = {
      zoom: 17,
      center: latLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      draggable: true,
    };
    that.map = new google.maps.Map(mapElement, mapOptions);
    that.infoWindow = new google.maps.InfoWindow();
    that.marker = new google.maps.Marker({
      position: latLng,
      title: "Point A",
      map: that.map,
      draggable: true,
    });

    google.maps.event.addListener(that.marker, 'dragend', function () {
      that.map.setCenter(that.marker.position);
      that.marker.setMap(that.map);
      that.geocodePosition(that.marker.getPosition());
    });

    var input = document.getElementById("pac-input");
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", that.map);

    var locationButton = document.getElementById("currentLocation");
    that.latitude = that.marker.getPosition().lat();
    that.longitude = that.marker.getPosition().lng();

    autocomplete.addListener("place_changed", function () {
      that.marker.setVisible(false);
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      if (place.geometry.viewport) {
        that.map.fitBounds(place.geometry.viewport);
      } else {
        that.map.setCenter(place.geometry.location);
        that.map.setZoom(17); // Why 17? Because it looks good.
      }
      that.marker.setPosition(place.geometry.location);
      that.marker.setVisible(true);

      var address = "";
      if (place.address_components) {
        address = [
          (place.address_components[0] &&
            place.address_components[0].short_name) ||
          "",
          (place.address_components[1] &&
            place.address_components[1].short_name) ||
          "",
          (place.address_components[2] &&
            place.address_components[2].short_name) ||
          "",
          (place.address_components[3] &&
            place.address_components[3].short_name) ||
          "",
          (place.address_components[4] &&
            place.address_components[4].short_name) ||
          "",
          (place.address_components[5] &&
            place.address_components[5].short_name) ||
          "",
        ].join(" ");
      }


      that.latitude = that.marker.getPosition().lat();
      that.longitude = that.marker.getPosition().lng();
    });

    locationButton.addEventListener("click", () => {
      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            that.infoWindow.setPosition(pos);
            that.map.setCenter(pos);
            that.map.setZoom(17); // Why 17? Because it looks good.
            that.marker.setPosition(pos);
            that.geocodePosition(pos);
          },
          () => {
            that.handleLocationError(
              true,
              that.infoWindow,
              that.map.getCenter()
            );
          }
        );
      } else {
        // Browser doesn't support Geolocation
        that.handleLocationError(false, that.infoWindow, that.map.getCenter());
      }
    });

    google.maps.event.addListenerOnce(that.map, "idle", function () {
      google.maps.event.trigger(that.map, "resize");
    });

    google.maps.event.addListener(that.map, "drag", function () {
      that.marker.setPosition(that.map.getCenter());
      that.latitude = that.marker.getPosition().lat();
      that.longitude = that.marker.getPosition().lng();
    });

    google.maps.event.addListener(that.map, "dragend", function () {
      that.map.setZoom(17); // Why 17? Because it looks good.
      that.geocodePosition(that.marker.getPosition());
    });

    google.maps.event.trigger(that.marker, "click");
  }

  geocodePosition(pos) {
    let that = this;
    this.geocoder.geocode(
      {
        latLng: pos,
      },
      function (responses) {
        if (responses && responses.length > 0) {
          that.marker.formatted_address = responses[0].formatted_address;
        } else {
          this.marker.formatted_address =
            "Cannot determine address at this location.";
        }
        var latitude = that.marker.getPosition().lat();
        var longitude = that.marker.getPosition().lng();

        that.latitude = latitude;
        that.longitude = longitude;
      }
    );
  }

  handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(this.map);
  }

  editTimeSetLatitudeLongitude(lat, lng) {
    var latLng = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
    this.marker = new google.maps.Marker({
      map: this.map,
      position: latLng,
    });
    this.geocodePosition(latLng);
    this.map.setCenter(latLng);
    this.map.setZoom(17);
  }


  async categoryListRecord() {
    var data = {
      token_type: 1,
    };
    await this.commonService.getMasterCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.categoryList = response.data;
          this.categoryList.forEach((category:any)=>{
            category.category_id = category.category_id.toString()
          })
        }
        if (
          this.business_model == 1 ||
          (this.business_model == 3 && this.isShowOrderSetting == true)
        ) {
          this.GetOrderSettingsList(0);
        }
      },
      error: () => {
      },
      complete: () => {
        ;
      },
    });
  }

  async getCuisinesList() {
    var data = {};
    await this.commonService.getCuisinesList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.cuisinesList = response.data;
          if (this.sellerid != undefined) {
            this.editSaller();
          }
        }
      },
      error: () => {
      },
      complete: () => {
        ;
      },
    });
  }

  RemoveAddressProof() {
    this.store_mgmt.controls["filename"].setValue("");
    this.address_proof = "";
    this.IsAddressFileUploaded = true;
  }

  RemoveGSTCirtificate() {
    this.store_mgmt.controls["gst_certificate"].setValue("");
    this.gst_certificate = ""
    this.IsGSTFileUploaded = true;
  }

  store_category_change(item) {
    this.selectedcategory = item;
    this.selectedcategory = this.categoryList.filter(
      (element) => Number(element.category_id) === Number(item)
    )[0];
    if (this.selectedcategory.iseatery == 1) {
      this.store_mgmt.get('category_id').setValidators(Validators.required)
    } else {
      this.store_mgmt.get('category_id').clearValidators();
    }
    this.eateryfordinein = this.selectedcategory.iseatery
  }

  async editSaller() {
    await this.subscriptionHistoryRecord();
    var data = {
      store_id: parseInt(this.storeid),
    };
    this.storeservice.getSellerDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.show();
          this.editdetails = response.data;
          this.eateryfordinein = this.editdetails.iseatery;
          if (this.storeManage_Behalf == "false") {
            this.store_mgmt.controls["manager_name"].setValue(
              response.data.manager_name
            );
            this.store_mgmt.controls["phone"].setValue(response.data.phone);
            this.store_mgmt.controls["email"].setValue(response.data.email);
            this.store_mgmt.controls["store_name"].setValue(
              response.data.store_name
            );
            if (response.data.store_logo == '') {
              this.store_mgmt.controls["store_logo"].setValue(
                this.store_mgmt.value.store_logo
              );
            }
            else {
              this.store_mgmt.controls["store_logo"].setValue(
                response.data.store_logo
              );
            }

            this.store_mgmt.controls["address1"].setValue(
              response.data.address1
            );
            this.store_mgmt.controls["address2"].setValue(
              response.data.address2
            );
            this.store_mgmt.controls["country_id"].setValue(
              response.data.country_id
            );
            this.stateListRecord();
            this.store_mgmt.controls["state_id"].setValue(
              response.data.state_id
            );
            this.cityListRecord();
            this.store_mgmt.controls["city_id"].setValue(response.data.city_id);
            this.areaListRecord();
            this.store_mgmt.controls["area_id"].setValue(response.data.area_id);
            this.store_mgmt.controls["zipcode"].setValue(response.data.zipcode);
            this.selectedcategory = this.categoryList.filter(
              (element) => element.category_id == Number(response.data.store_category_id))[0];
            this.store_mgmt.controls["store_category_id"].setValue(
              response.data.store_category_id);
            var ids = response.data.cuisine_ids?.split(",");
            var temp = [];
            ids?.forEach((element) => {
              temp.push(Number(element));
            });
            this.store_mgmt.controls["category_id"].setValue(temp);
            this.store_mgmt.controls["store_description"].setValue(
              response.data.store_description
            );
            this.store_mgmt.controls["timezone"].setValue(
              response.data.timezone
            );
            this.store_mgmt.controls["gst_number"].setValue(
              response.data.gst_number
            );
            this.store_mgmt.controls["demo_user"].setValue(
              response.data.demo_user == 1 ? true : false
            );
            this.store_mgmt.controls["order_setting_id"].setValue(
              response.data.order_setting_id
            );
            this.store_mgmt.controls["reference_by"].setValue(
              response.data.reference_by
            );
            this.store_mgmt.controls["offer_module"].setValue(
              response.data.offer_module == 1 ? true : false
            );
            this.store_mgmt.controls["chat"].setValue(
              response.data.chat == 1 ? true : false
            );
            this.store_mgmt.controls["live_tracking"].setValue(
              response.data.live_tracking == 1 ? true : false
            );
            this.store_mgmt.controls["refund"].setValue(
              response.data.refund == 1 ? true : false
            );
            this.store_mgmt.controls["inventory"].setValue(
              response.data.inventory == 1 ? true : false
            );
            this.store_mgmt.controls["pos"].setValue(
              response.data.pos == 1 ? true : false
            );
            this.store_mgmt.controls["dine_in"].setValue(
              response.data.dine_in == 1 ? true : false
            );
            this.store_mgmt.controls["picker"].setValue(
              response.data.picker == 1 ? true : false
            );
            this.store_mgmt.controls["is_verified"].setValue(
              Number(response.data.is_store_verified)
            );
            this.store_mgmt.controls["is_searchable"].setValue(
              response.data.is_searchable == 1 ? true : false
            );
            this.store_mgmt.controls["is_sponsored"].setValue(
              response.data.is_sponsored == 1 ? true : false
            );
            this.store_mgmt.controls["user_id"].setValue(
              this.main.LoggedUserInfo.user_id
            );
            this.myCroppedImageShow = response.data.store_logo;
            if (response.data.is_verified == "0") {
              this.store_mgmt.controls["is_verified"].setValue(Number(this.store_mgmt.value.is_verified));
            }
            if (response.data.is_verified == "2") {
              this.IsSubscriptionHistoryVisible = true;
            }
            if (response.data.address_proof == "") {
              if (this.business_model != 3) {
                this.IsAddressFileUploaded = true;
                this.toastr.error("Address proof field is required.");
                return;
              }
            } else {
              this.address_proof = response.data.address_proof;
              this.IsAddressFileUploaded = false;
            }

            if (response.data.gst_certificate == "") {
              this.IsGSTFileUploaded = true;
            } else {
              this.gst_certificate = response.data.gst_certificate;
              this.IsGSTFileUploaded = false;
            }

            this.fullAddress = [
              this.store_mgmt.value.address1,
              this.store_mgmt.value.address2,
            ]
              .filter(Boolean)
              .join(", ");

            this.cdr.detectChanges();
            this.latitude = response.data.latitude;
            this.longitude = response.data.longitude;
            this.editTimeSetLatitudeLongitude(
              response.data.latitude == null
                ? "23.0120"
                : response.data.latitude,
              response.data.longitude == null
                ? "72.5108"
                : response.data.longitude
            );
          }
          else {
            this.sellerid = undefined;
            this.store_mgmt.controls["manager_name"].setValue(
              response.data.manager_name
            );
            this.store_mgmt.controls["phone"].setValue(response.data.phone);
            this.store_mgmt.controls["email"].setValue(response.data.email);
            this.subscriptionsListRecord();
          }
        }
      },
      error: () => {
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  async countryListRecord() {
    await this.commonService.getCountryList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.countryList = [];
          var commonCountry =
            this.generalSetting.country != undefined
              ? this.generalSetting.country.split(",")
              : null;
          if (commonCountry) {
            commonCountry.forEach((country) => {
              var objCountry = response.data.filter((s) =>
                s.id.includes(country.toString())
              );
              if (objCountry) {
                this.countryList.push(objCountry[0]);
              }
            });
          } else {
            this.main.country.split(",").forEach((country) => {
              var objCountry = response.data.filter((s) =>
                s.id.includes(country.toString())
              );
              if (objCountry) {
                this.countryList.push(objCountry);
              }
            });
          }
        }
      },
      error: () => {
      },
      complete: () => {
        ;
      },
    });
  }

  CountryChange() {
    this.store_mgmt.controls["state_id"].reset();
    this.store_mgmt.controls["city_id"].reset();
    this.store_mgmt.controls["area_id"].reset();
    this.stateListRecord();
  }

  StateChange() {
    this.store_mgmt.controls["city_id"].reset();
    this.store_mgmt.controls["area_id"].reset();
    this.cityListRecord();
  }

  CityChange() {
    this.store_mgmt.controls["area_id"].reset();
    this.areaListRecord();
  }

  async stateListRecord() {
    await this.commonService
      .getStateList(this.store_mgmt.value.country_id)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.stateList = [];
            this.stateList = response.data;
          }
        },
        error: () => {
        },
        complete: () => {
          ;
        },
      });
  }

  async cityListRecord() {
    await this.commonService
      .getCityList(this.store_mgmt.value.state_id)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.cityList = [];
            this.areaList = [];
            this.cityList = response.data;
          }
        },
        error: () => {
        },
        complete: () => {
          ;
        },
      });
  }

  async areaListRecord() {
    await this.commonService
      .getAreaList(this.store_mgmt.value.city_id)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.areaList = [];
            this.areaList = response.data;
          }
        },
        error: () => {
        },
        complete: () => {
          ;
        },
      });
  }

  async GetTimezone() {
    //
    await this.commonService.getTimeZone().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.timezonelist = response.data;
        }
      },
      error: () => {
      },
      complete: () => {
        ;
      },
    });
  }
  /** For change image file */
  fileChange(event): any {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file = fileList[0];
      this.file = fileList[0];
      if (file.name.indexOf(".") > -1) {
        var extension = file.name.split(".").pop().toLowerCase();
      } else {
        var extension = file.name.split("/").pop().toLowerCase();
      }
      if (
        $.inArray(extension, ["png", "PNG", "jpg", "jpeg"]) == -1 &&
        this.imageUploadType == "storeLogoPicture"
      ) {
        this.toastr.error(this.translate.instant("PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO"));
        return false;
      } else if (
        $.inArray(extension, [
          "png",
          "PNG",
          "jpg",
          "jpeg",
          "pdf",
          "doc",
          "docx",
          "DOC",
          "DOCX",
        ]) == -1
      ) {
        if (this.imageUploadType == "filename") {
          this.toastr.error(this.translate.instant("PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_ADDRESS"));
          this.someInput.nativeElement.value = null;
          this.cdr.detectChanges();
        } else if (this.imageUploadType == "gstPicture") {
          this.toastr.error(this.translate.instant("PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_GST"));
          this.gstUploadFile.nativeElement.value = null;
        } else if (this.imageUploadType == "storeLogoPicture") {
          this.toastr.error(this.translate.instant("PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO"));
          this.gstUploadFile.nativeElement.value = null;
        } else {
          this.toastr.error(this.translate.instant("PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"));

        }
        return false;
      } else if (this.file.size / 1024 >= 2048) {
        this.toastr.error(this.translate.instant("IMAGE_SIZE_SHOULD_BE_LESS_THAN_2_MB"));
        return false;
      } else {
        if (this.imageUploadType == "userPicture") {
        } else if (this.imageUploadType == "filename") {
          this.address_proof = this.file;
        } else if (this.imageUploadType == "gstPicture") {
          // this.store_mgmt.controls["gst_certificate"].setValue(this.file);
          this.gst_certificate = this.file;
        } else if (this.imageUploadType == "storeLogoPicture") {
          // this.store_image = this.file;
          this.store_mgmt.controls["store_logo"].setValue(this.file);
        }
      }
    } else {
      this.address_proof = "";
    }
  }

  uploadPicture = function (uploadType) {
    this.imageUploadType = uploadType;
    var fileInput;
    if (this.imageUploadType == "userPicture") {
      fileInput = document.getElementById("userUploadFile");
    } else if (this.imageUploadType == "filename") {
      fileInput = document.getElementById("addressUploadFile");
    } else if (this.imageUploadType == "gstPicture") {
      fileInput = document.getElementById("gstUploadFile");
    } else if (this.imageUploadType == "storeLogoPicture") {
      fileInput = document.getElementById("storeLogoUploadFile");
    }
  };

  async GetOrderSettingsList(item) {
    var data = {
      page: item,
    };
    await this.storeservice.getOrderSettingsList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.orderSettingsList = response.data;
        }
      },
      error: () => {
      },
      complete: () => {
        ;
      },
    });
  }

  async subscriptionsListRecord() {
    var data = {}
    await this.storeservice.getsubscriptionsListRecord(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.subscriptionsList = response.data;
        }
      },
      error: () => {
      },
      complete: () => {
        ;
      },
    });
  }

  async subscriptionHistoryRecord() {

    var data = {
      store_id: parseInt(this.storeid),
    };

    await this.storeservice.getSubscriptionHistoryDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.subscriptionHistoryList = response.data;
          console.log(this.subscriptionHistoryList, "this.subscriptionHistoryList");
          
          this.subscriptionHistoryList.forEach((subsc) => {
            subsc.isFuture = false;
            subsc.isRunning = false;
            subsc.isExpire = false;
          });

          this.cdr.detectChanges();
          if (this.main.DateFormate.split(" ")[0] == "DD-MM-YYYY") {
            var subScriptionStartDate = this.subscriptionHistoryList[0].subscription_startdate
            var newStartDate = Number(subScriptionStartDate.split('-').reverse().join("-").slice(0, 10).split('-').join(''))

            var toDayDate = moment(new Date().getTime()).format(
              this.DateFormateFromServerSide().split(" ")[0]
            );

            var subScriptionEndDate = this.subscriptionHistoryList[0].subscription_enddate != null ? toDayDate : toDayDate
            var newEndDate = Number(subScriptionEndDate.split('-').reverse().join("-").slice(0, 10).split('-').join(''))

            var newDate = Number(toDayDate.split('-').reverse().join("-").slice(0, 10).split('-').join(''))

          }

          if (this.subscriptionHistoryList.length > 0) {
            if (newStartDate > newDate) {
              this.subscriptionHistoryList[0].isFuture = true;
            }
            var todate;
            if (newDate >= newDate) {
              todate = newDate
            }

            var tempdata
            if (newEndDate != null) {
              tempdata = newEndDate
            }
            else {
              tempdata = todate
            }

            if (newStartDate <= newDate && tempdata) {
              this.subscriptionHistoryList[0].isRunning = true;
              if (
                this.subscriptionHistoryList[0].subscription_id == "1" &&
                this.subscriptionHistoryList[0].subscription_duration != "5"
              ) {
                this.subscriptionHistoryList[0].isExpire = true;
              }
            }

            if (newEndDate) {
              if (newEndDate < newDate) {
                this.subscriptionHistoryList[0].isExpire = true;
              }
            }

          }
        }
      },
      error: () => {
      },
      complete: () => {
        ;
      },
    });
  }
  //edit subscription
  EditsubscriptionDetails: any;
  editSubscriptionDetail(item) {
    this.EditsubscriptionDetails = item;
    this.viewSubscriptionAdd();
  }
  //delete subscription
  deleteSubscriptionDetail(seller_subscription_id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_SUBSCRIPTION"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteSubscriptionConfirm(seller_subscription_id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }
  deleteSubscriptionConfirm(seller_subscription_id) {
    let data = {
      user_id: this.adminDetails.user_id,
      seller_subscription_id: seller_subscription_id,
      store_id: Number(this.editdetails.store_id)
    };

    this.storeservice.deleteSubscription(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.subscriptionHistoryRecord();
        } else {
        }
      },
      error: () => { },
      complete: () => {

      },
    });
  }
  addNewSubscription() {
    this.subscriptionDetail = undefined;
    this.EditsubscriptionDetails = null;
    this.viewSubscriptionAdd();
  }

  dates: any;
  packageName: any;
  payDetails: any;
  payId: any;
  duration_Id: any;

  /** Open subscriptionAddComponent modal */
  viewSubscriptionAdd() {
    this.isSubscriptionDesabled = false;
    this.isSubscriptionEndDateChnage = false;
    this.isStartDateDisable = false;

    const modalRef = this.modalService.open(subscriptionAddComponent, {
      size: "lg-950",
      centered: true,
    });    
    if (this.EditsubscriptionDetails) {
      modalRef.componentInstance.EditsubscriptionDetails = this.EditsubscriptionDetails;
    }
    modalRef.componentInstance.storeManage_Behalf = this.storeManage_Behalf
    modalRef.componentInstance.editdetails = this.editdetails;
    modalRef.componentInstance.subscriptionsList = this.subscriptionsList;
    modalRef.componentInstance.isSubscriptionDesabled = this.isSubscriptionDesabled;
    modalRef.componentInstance.isSubscriptionEndDateChnage = this.isSubscriptionEndDateChnage;
    modalRef.componentInstance.isStartDateDisable = this.isStartDateDisable;
    modalRef.componentInstance.subscriptionDurationList = this.subscriptionDurationList;
    modalRef.componentInstance.subscriptionPayTypeList = this.subscriptionPayTypeList;
    modalRef.componentInstance.subscriptionHistoryList = this.subscriptionHistoryList;
    modalRef.componentInstance.sellerid = this.sellerid;
    modalRef.componentInstance.storeid = this.storeid;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.adminDetails = this.adminDetails;
    modalRef.componentInstance.subscriptionDetail = this.subscriptionDetail;

    modalRef.componentInstance.subscriptionData.subscribe((receivedEntry) => {
      if (receivedEntry) {
        this.dates = receivedEntry;
      } else {
        this.subscriptionHistoryRecord();
      }
    });

    modalRef.componentInstance.passSubscription.subscribe(
      (receivedSubscription) => {

        if (receivedSubscription) {
          this.subscriptionsList.forEach((element) => {
            if (element.subscription_id == receivedSubscription) {
              this.packageName = element;
            }
          });
        } else {
          this.subscriptionHistoryRecord();
        }
      }
    );

    modalRef.componentInstance.fees.subscribe((details) => {

      this.payDetails = [];
      var payList = [
        { id: 1, name: this.translate.instant("FLAT") },
        { id: 2, name: this.translate.instant("PERCENT") },
      ];
      if (details) {
        if (details[0].nameID) {
          this.payId = details[0].nameID;
          payList.forEach((element) => {
            if (element.id == details[0].nameID) {
              this.payDetails.push({
                name: element.name,
                fees: details[0].subscriptionFees,
              });
            }
          });
        }
        if (details[0].duration) {
          this.payDetails.push({
            duration: details[0].duration,
            fees: details[0].subscriptionFees,
          });
        }
      } else {
        this.subscriptionHistoryRecord();
      }
    });

    modalRef.componentInstance.durationId.subscribe((receivedDurationId) => {

      if (receivedDurationId) {
        this.duration_Id = receivedDurationId;
      } else {
        this.subscriptionHistoryRecord();
      }
    });

  }

  DateFormateFromServerSide() {
    return this.main.DateFormate;
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
    return controlEl?.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.store_mgmt.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submitSeller() {    
    if (this.sellerid == undefined) {
      this.store_mgmt.get('is_verified').clearValidators()
    }
    if (!this.store_mgmt.valid) {
      const controls = this.store_mgmt.controls;

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
      return;
    }
    if (this.store_mgmt.value.zipcode != null) {
      if (this.store_mgmt.value.zipcode.length == this.pincode_length) {
      } else {
        this.toastr.error(
          "Please enter" +
          " " +
          this.pincode_length +
          " " +
          "length of" +
          " " +
          this.pincode_label
        );
        return;
      }
    }

    if (this.business_model != 3) {
      if (this.address_proof == "" || this.address_proof == undefined || this.address_proof == 'assets/icons/no_image.svg') {
        this.toastr.error(this.translate.instant("ADDRESS_PROOF_FIELD_IS_REQUIRED"));
        return;
      }
    }

    if (this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6) {
      if (this.store_mgmt.get('demo_user').value == false || this.store_mgmt.get('demo_user').value == null) {
        if (!this.packageName && (this.storeid == undefined || this.storeid == null)) {
          this.toastr.error(this.translate.instant("PLEASE_SELECT_SUBSCRIPTION"));
          return;
        }
      }
    }

    if (this.store_mgmt.value.is_agree == false && !this.sellerid) {
      this.toastr.error(this.translate.instant("PLEASE_READ_AND_ACCEPTED_THE_T_C"));
      return;
    }

    var fd = new FormData();
    fd.append("is_agree", this.store_mgmt.value.is_agree == true ? "true" : "false");
    fd.append(
      "offer_module",
      this.store_mgmt.value.offer_module == true ? "1" : "0"
    );
    fd.append("chat", this.store_mgmt.value.chat == true ? "1" : "0");
    fd.append(
      "live_tracking",
      this.store_mgmt.value.live_tracking == true ? "1" : "0"
    );
    fd.append("refund", this.store_mgmt.value.refund == true ? "1" : "0");
    fd.append("inventory", this.store_mgmt.value.inventory == true ? "1" : "0");
    fd.append("pos", this.store_mgmt.value.pos == true ? "1" : "0");
    fd.append("dine_in", this.store_mgmt.value.dine_in == true ? "1" : "0");
    fd.append("picker", this.store_mgmt.value.picker == true ? "1" : "0");

    if (this.store_mgmt.value.country_id == "101") {
      if (
        this.store_mgmt.value.area_id != undefined &&
        this.store_mgmt.value.area_id != null &&
        this.store_mgmt.value.area_id != ""
      ) {
        fd.append("area_id", this.store_mgmt.value.area_id);
      }
    }
    fd.append("city_id", this.store_mgmt.value.city_id);
    fd.append("country_id", this.store_mgmt.value.country_id);
    fd.append("email", this.store_mgmt.value.email);
    fd.append("address_proof", this.address_proof);
    if (this.gst_certificate == null && !this.gst_certificate) {
      fd.append("gst_certificate", "");
    } else {
      fd.append("gst_certificate", this.gst_certificate);
    }
    if (this.store_mgmt.value.store_logo == null || this.store_mgmt.value.store_logo == "assets/icons/no_image.svg") {
      fd.append("store_logo", "");
      fd.append("is_image_delete ", "1");
    } else {
      fd.append("store_logo", this.store_mgmt.value.store_logo);
    }
    fd.append(
      "gst_number",
      this.store_mgmt.value.gst_number != null
        ? this.store_mgmt.value.gst_number
        : ""
    );
    fd.append("manager_name", this.store_mgmt.value.manager_name);
    fd.append("phone", this.store_mgmt.value.phone);
    fd.append("state_id", this.store_mgmt.value.state_id);

    if (this.storeManage_Behalf == "false") {
      fd.append("store_category_id", this.store_mgmt.value.store_category_id);
      fd.append(
        "address1",
        this.store_mgmt.value.address1 != null
          ? this.store_mgmt.value.address1
          : ""
      );
      fd.append(
        "address2",
        this.store_mgmt.value.address2 != null
          ? this.store_mgmt.value.address2
          : ""
      );
    } else {
      fd.append("category_id", this.store_mgmt.value.store_category_id);
      fd.append(
        "store_address",
        this.store_mgmt.value.address1 != null
          ? this.store_mgmt.value.address1
          : ""
      );
      fd.append(
        "store_address2",
        this.store_mgmt.value.address2 != null
          ? this.store_mgmt.value.address2
          : ""
      );
    }

    fd.append(
      "store_description",
      this.store_mgmt.value.store_description != null
        ? this.store_mgmt.value.store_description
        : ""
    );
    fd.append("store_name", this.store_mgmt.value.store_name);

    if (this.main.LoggedUserInfo.role_id == 1) {
      var is_super_admin: any = 1;
      fd.append("is_super_admin", is_super_admin);
    }
    if (
      this.main.LoggedUserInfo.role_id == 1 ||
      this.main.LoggedUserInfo.role_id == 6
    ) {
      if (this.dates && this.packageName.subscription_id) {
        if (this.storeManage_Behalf == "true") {
          fd.append("user_id", this.tempSellerid);
        } else {
          fd.append("user_id", this.main.LoggedUserInfo.user_id);
        }

        if (
          !this.store_mgmt.value.demo_user &&
          this.packageName.subscription_id
        ) {
          fd.append("subscription_id", this.packageName.subscription_id);
          fd.append("subscription_startdate", this.dates[0].start_date);
          if (this.packageName.subscription_id == 1) {
            fd.append("subscription_enddate", this.dates[0].end_date);
            fd.append("subscription_duration", this.duration_Id);
          } else if (this.packageName.subscription_id == 5) {
            fd.append("pay_type", this.payId);
            fd.append("subscription_fees", this.payDetails[0].fees);
          } else if (this.packageName.subscription_id == 6) {
            fd.append("subscription_fees", this.payDetails[0].fees);
            fd.append("subscription_duration", this.duration_Id);
          }
        }
      }
      else {
        if (this.storeManage_Behalf == "true") {
          fd.append("user_id", this.tempSellerid);
        }
      }
    }
    else {
      fd.append("user_id", this.tempSellerid);
      fd.append("subscription_id", "1");
      fd.append(
        "subscription_startdate",
        moment(new Date()).format(this.DateFormateFromServerSideOnlyDateReturn())
      );
      var subscriptionenddateee = new Date();
      var subscription_enddateee = new Date(
        subscriptionenddateee.setMonth(subscriptionenddateee.getMonth() + 1)
      );
      if (this.dates != undefined) {
        var date: any = new Date(this.dates[0].end_date);
      }
      date = new Date(
        subscription_enddateee.setDate(subscription_enddateee.getDate() - 1)
      );
      fd.append("subscription_enddate", moment(date).format(this.DateFormateFromServerSideOnlyDateReturn()));
      fd.append("subscription_duration", "1");
    }

    if (this.store_mgmt.value.demo_user && !this.sellerid) {
      if (!this.storeManage_Behalf) {
        fd.append("user_id", this.adminDetails.user_id);
      }
      fd.append(
        "demo_user",
        this.store_mgmt.value.demo_user == true ? "1" : "0"
      );
    }

    fd.append("zipcode", this.store_mgmt.value.zipcode);
    fd.append("latitude", this.latitude);
    fd.append("longitude", this.longitude);
    fd.append("created_by_id", this.adminDetails.user_id);
    fd.append("source", "webadmin");
    if (this.business_model == 1 && this.isShowOrderSetting == true) {
      fd.append("order_setting_id", this.store_mgmt.value.order_setting_id);
    }
    fd.append(
      "reference_by",
      this.store_mgmt.value.reference_by != null
        ? this.store_mgmt.value.reference_by
        : ""
    );
    fd.append(
      "cuisine_ids",
      this.store_mgmt.value.category_id != null
        ? this.store_mgmt.value.category_id.toString()
        : ""
    );
    if (
      this.main.LoggedUserInfo.role_id == 1 ||
      this.main.LoggedUserInfo.role_id == 6
    ) {
      fd.append(
        "is_searchable",
        this.store_mgmt.value.is_searchable == true ? "1" : "0"
      );
    } else {
      fd.append("is_searchable", "1");
    }
    if (
      this.main.LoggedUserInfo.role_id == 1 ||
      this.main.LoggedUserInfo.role_id == 6
    ) {
      fd.append(
        "is_sponsored",
        this.store_mgmt.value.is_sponsored == true ? "1" : "0"
      );
    } else {
      fd.append("is_sponsored", "1");
    }

    fd.append("timezone", this.store_mgmt.value.timezone);

    if (this.sellerid) {
      fd.append("user_id", this.main.LoggedUserInfo.user_id);
      fd.append("is_verified", this.store_mgmt.value.is_verified);

      if (this.dates && this.duration_Id) {
        fd.append("subscription_startdate", this.dates[0].start_date);
        fd.append("subscription_enddate", this.dates[0].end_date);
        fd.append("subscription_duration", this.duration_Id);
      }
      fd.append(
        "demo_user",
        this.store_mgmt.value.demo_user == true ? "1" : "0"
      );
      fd.append("store_id", this.storeid);
    }

    if (this.storeManage_Behalf == "true" && (this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6)) {
      fd.append("is_super_admin", '1');
    }

    var data = fd;
    if (this.storeManage_Behalf == "false") {

      if (this.sellerid == undefined) {
        this.finalsubmit(data, "add");
      } else {
        this.finalsubmit(data, "edit");
      }
    } else {
      this.finalsubmit(data, "registration");
    }
  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.generalSetting.date_format_web.split(" ")[0];
  }

  /** Final submit of store management data  */
  finalsubmit(data, label) {
    this.storeservice.addSeller(data, label).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.sessionConfig.clearCookie(
            "storeManage_sellerid" + this.main.LoggedUserInfo.role_id.toString()
          );
          this.sessionConfig.clearCookie(
            "storeManage_storeID" + this.main.LoggedUserInfo.role_id.toString()
          );
          this.toastr.success(response.message);
          let storeAdmin = this.main.LoggedUserInfo.role_id == 2 ? true : false
          if (this.store_mgmt.value.is_importable && this.main.LoggedUserInfo.role_id == 6) {
            this.getMasterSubCategoryList(response.data)
          } else if (storeAdmin) {
            this.router.navigate([`/dashboard`])
              .then(() => {
                window.location.reload();
              });
          } else {
            this.router.navigate([`/sellers`]);
          }
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {
        ;
      },
    });
  }

  getMasterSubCategoryList(store_id: any) {
    this.spinner.show('home');
    let data: any = {
      category_id: this.store_mgmt.value.store_category_id,
      market_type: 1,
      store_id: store_id,
    };
    this.itemService.getDefaultStoreSubCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          let sub_category: any = [];
          response.data.forEach((element: any) => {
            sub_category.push(element.sub_category_id)
          });
          this.getMasterItemList(sub_category, store_id);
        }
      },
      error: () => { },
      complete: () => { },
    });
  }

  getMasterItemList(sub_category_ids: any, store_id: any) {
    this.spinner.show('home');
    let data: any = {
      sub_category_id: sub_category_ids.toString(),
      store_id: store_id,
    };
    this.itemService.getMasterItemList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          let selected_import_items: any = [];
          response.data.forEach((cat: any) => {
            cat.items.forEach((sub_cat: any) => {
              sub_cat.is_added = 1;
              sub_cat.store_id = sub_cat.seller_id
              selected_import_items.push(sub_cat);
            });
          });
          this.manageMasterImportItems(selected_import_items, store_id)
        } else {
          this.toastr.error(response.message);
        }
      },
      error: () => { },
      complete: () => { },
    });
  }

  manageMasterImportItems(selected_import_items: any, store_id: any) {
    this.spinner.show('home');
    let data: any = {
      item_ids: JSON.stringify(selected_import_items),
      seller_id: store_id,
      store_id: selected_import_items[0].seller_id,
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this.itemService.manageMasterImportItems(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(response.message);
          let storeAdmin = this.main.LoggedUserInfo.role_id == 2 ? true : false
          if (storeAdmin) {
            this.router.navigate([`/dashboard`])
              .then(() => {
                window.location.reload();
              });
          } else {
            this.router.navigate([`/sellers`]);
          }
        } else {
          this.toastr.error(response.message);
        }
      },
      error: () => { },
      complete: () => {
        this.spinner.hide('home');
      },
    });
  }

  /** checkSeller using service */
  async focusfn() {
    //
    if (!this.store_mgmt.value.phone) {
      return
    }
    var data = {
      phone: this.store_mgmt.value.phone,
    };
    await this.storeservice.checkSeller(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
        } else {
          this.toastr.error(response.message);
        }
      },
      error: () => {
      },
      complete: () => {
        ;
      },
    });
  }

  async blurfn() {
    if (!this.store_mgmt.value.phone) {
      return
    }
    var data = {
      phone: this.store_mgmt.value.phone,
    };
    await this.storeservice.checkSeller(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
        } else {
          this.toastr.error(response.message);
        }
      },
      error: () => {
      },
      complete: () => {
        ;
      },
    });
  }

  /** Open crop_rectangleComponent modal */
  openUpdateUserProfPicModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.myCroppedImageShow;
    modalRef.componentInstance.imageChangedEvent = this.myCroppedImage
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.cropFiles = this.cropFiles
    modalRef.componentInstance.newseller =
      this.cropped_store_logo == undefined
        ? this.store_mgmt.value.store_logo
        : this.cropped_store_logo;

    modalRef.componentInstance.isCroppedImage = this.isCroppedImage;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.editProfilePic(receivedEntry);
    });
  }

  editProfilePic(item) {
    if (item.crop_image_file != undefined) {
      this.isCroppedImage = true;
      this.cropFiles = item.cropFiles
      this.croppedImages = item.croppedImages
      this.cropped_store_logo = item.crop_image;
      this.store_mgmt.controls["store_logo"].setValue(item.crop_image_file);
      this.myCroppedImage = item.full_image;
    }
    this.cdr.detectChanges();
  }
  isImageDelete: boolean = false
  removeLogoImage() {
    this.myCroppedImageShow = undefined;
    this.myCroppedImage = undefined;
    this.croppedImages = undefined;
    this.cropped_store_logo = undefined
    this.store_mgmt.value.store_logo = "assets/icons/no_image.svg";
    this.cropFiles = undefined;
    this.isCroppedImage = false
  }

  controlHasError(validation, controlName): boolean {
    const control = this.store_mgmt.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  shareUrl() {
    var Url = this.generalSetting.website_url;
    this.UrL =
      Url + "/store/" + this.editdetails.store_slug + "/" + this.editdetails.store_id;
    this.whatsappURL =
      "https://api.whatsapp.com/send/?phone&text=" + this.UrL + "&app_absent=0";
    const modalRef = this.modalService.open(shareURLComponent);
    modalRef.componentInstance.UrL = this.UrL;
    modalRef.componentInstance.whatsappURL = this.whatsappURL;
  }

  @ViewChild('cursor2') cursor2: ElementRef

  ngAfterViewInit(): void {
    if (!this.sellerid) {
      this.cursor.nativeElement.focus();
    }
    else {
    }
  }

  cancelClick() {
    history.back();
  }

  isOrderBy: boolean = true;
  sortKey: any = "";
  sort(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
  }
  removeItem() {
    localStorage.removeItem("DisabledLokalyBusiness")
  }

  validateNumber(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  createFromExist() {
    this.store_mgmt.controls["manager_name"].setValue(null);
    this.store_mgmt.controls["phone"].setValue(null);
    this.store_mgmt.controls["email"].setValue(null);
    this.storeManage_Behalf = this.store_mgmt.value.existing_user.toString();
  }

  async getPhoneList() {
    var data = {};
    await this.storeservice.getStorePhoneList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.phone_list = response.data;
        }
      },
      error: () => {
      },
      complete: () => {
        ;
      },
    });
  }

  selectPhone(item: any) {
    var store: any = this.phone_list.filter((phone: any) => phone.phone_no == item)[0];
    this.tempSellerid = store.user_id;
    this.sellerid = store.user_id;
    this.storeid = store.store_id;
    this.storeManage_Behalf = 'true';
    this.editSaller()
  }
}
