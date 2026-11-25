import {
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import * as $ from "jquery";
import { AppComponent } from "src/app/app.component";
import { CommonConfigurationService } from "src/app/services/configuration/common-configuration.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { CommonService } from "src/app/services/common.service";
import { AngularEditorConfig } from "@kolkov/angular-editor";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AddEditCityAreaComponent } from "./add-edit-city-area/add-edit-city-area.component";
import { GenerateCodeComponent } from "./generate-code/generate-code.component";
import { MapsAPILoader } from "@agm/core";
import { find, pull } from "lodash";
import { ConfirmPasswordComponent } from "src/app/modules/pages-module/model/confirm-password/confirm-password.component";
import { DownloadCommonComponent } from "../../model/download-common/download-common.component";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

declare var google: any;

@Component({
  selector: "app-common-configuration",
  templateUrl: "./common-configuration.component.html",
  styleUrls: ["./common-configuration.component.scss"],
})
export class CommonConfigurationComponent implements OnInit, OnDestroy, AfterViewInit {
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  business_model = this.PlatformSetting.business_model;
  main: any = { LoggedUserInfo: {} };
  userData = JSON.parse(localStorage.getItem("loginUser"));
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  isCommonConfiguration =
    this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
      ? true
      : this.business_model == 2
        ? true
        : this.business_model == 3
          ? true
          : false;
  isWalletConfiguration =
    this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
      ? true
      : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
        ? true
        : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : false;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  tempStockDuringStatus: any[];
  commonConfiguration_form: FormGroup;
  default_location_lat: any;
  default_location_long: any;
  module_config: any;
  is_logo = true;
  is_favicon = true;
  is_mobile_logo = true;
  Islogo_black_white = true;
  logo: any;
  favicon_icon: any;
  mobile_logo: any;
  logo_black_white: any;
  seoLogo: any;
  isSeoLogo: boolean = false;
  file: any;
  imageUploadType: string;
  timezone: any;
  timezonelist = [];
  currencyList: any = [];
  countryList: any = [];
  languageList: any = [];
  dateFormatList = [
    { label: "dd-MM-yyyy HH:mm:ss", value: 1 },
    { label: "MM-dd-yyyy HH:mm:ss", value: 2 },
  ];
  //Second Accordion href
  customer_splash_screen: any;
  customer_help_screen_1: any;
  customer_help_screen_2: any;
  customer_help_screen_3: any;
  customer_help_screen_4: any;
  customer_loading_screen: any;
  whats_new_customer: any;
  business_splash_screen: any;
  business_help_screen_1: any;
  business_help_screen_2: any;
  business_help_screen_3: any;
  business_help_screen_4: any;
  whats_new_business: any;
  deliveryboy_splash_screen: any;
  deliveryboy_help_screen_1: any;
  deliveryboy_help_screen_2: any;
  deliveryboy_help_screen_3: any;
  deliveryboy_help_screen_4: any;
  whats_new_driver: any;
  // newly added
  splash_screen_picker: any;
  help_screen_picker_1: any;
  help_screen_picker_2: any;
  help_screen_picker_3: any;
  help_screen_picker_4: any;
  whats_new_picker: any;
  pos_splash_screen: any;
  pos_help_screen_1: any;
  pos_help_screen_2: any;
  pos_help_screen_3: any;
  pos_help_screen_4: any;
  whats_new_pos: any;
  dinein_splash_screen: any;
  dinein_tablet_splash_screen: any;
  dinein_help_screen_1: any;
  dinein_help_screen_2: any;
  dinein_help_screen_3: any;
  dinein_help_screen_4: any;
  whats_new_dinein: any;
  best_seller_category_image: any;
  past_purchase_category_image: any;
  combo_category_image: any;
  collection_category_image: any;
  item_tag_image: any;
  //Second Accordion Id
  Iscustomer_splash = true;
  Iscustomer_help_1 = true;
  Iscustomer_help_2 = true;
  Iscustomer_help_3 = true;
  Iscustomer_help_4 = true;
  Iscustomer_loading = true;
  Iswhats_new_customer = true;
  Isbusiness_splash = true;
  Isbusiness_help_1 = true;
  Isbusiness_help_2 = true;
  Isbusiness_help_3 = true;
  Isbusiness_help_4 = true;
  Iswhats_new_business = true;
  Isdelivery_splash = true;
  Isdelivery_help_1 = true;
  Isdelivery_help_2 = true;
  Isdelivery_help_3 = true;
  Isdelivery_help_4 = true;
  Iswhats_new_driver = true;
  Issplash_screen_picker = true;
  Ishelp_screen_picker_1 = true;
  Ishelp_screen_picker_2 = true;
  Ishelp_screen_picker_3 = true;
  Ishelp_screen_picker_4 = true;
  Iswhats_new_picker = true;
  Ispos_splash_screen = true;
  Ispos_help_screen_1 = true;
  Ispos_help_screen_2 = true;
  Ispos_help_screen_3 = true;
  Ispos_help_screen_4 = true;
  Iswhats_new_pos = true;
  Isdinein_splash_screen = true;
  Isdinein_tablet_splash_screen = true;
  Isdinein_help_screen_1 = true;
  Isdinein_help_screen_2 = true;
  Isdinein_help_screen_3 = true;
  Isdinein_help_screen_4 = true;
  Iswhats_new_dinein = true;
  Isbest_seller_category_image = true;
  Ispast_purchase_category_image = true;
  Iscombo_category_image = true;
  Iscollection_category_image = true;
  Isitem_tag_image = true;
  is_default_location_text: boolean = false
  //third Accordion
  urlRegEx =
    "[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}(.[a-z]{2,4})?\b(/[-a-zA-Z0-9@:%_+.~#?&//=]*)?";
  //sixth accordion globalpayment method
  paymentGatewayList: any = [];
  paymentData: any = [];
  tempOrderStatusIds = [];
  storeTypeList = [];
  tempOrderDuringStatus = [];
  //9th Accordion
  loginMethodList = [
    { label: "Mobile", value: "1" },
    { label: "Email", value: "2" },
  ];
  customer_location_Type = [
    { label: "Google Map Location", value: "1" },
    { label: "Area + City", value: "2" },
    { label: this.generalSetting.pincode_label, value: "3" },
  ];
  savingItemList = [
    // { label: "None", value: 1 },
    { label: "In Percentage", value: 2 },
    { label: "In Currency", value: 3 },
  ];
  categorizationList = [
    { label: "Category", value: 1 },
    { label: "Location", value: 2 },
  ];
  default_status_store = [
    { label: "Application", value: 0 },
    { label: "In Process", value: 1 },
    { label: "Approved", value: 2 },
  ];

  all_eatery: false;
  all_wholesale: false;
  all_store: false;
  TempstoreType = [];
  excelUpload2: any;
  IsRefundfile = true;
  IsEateryfile = true;
  IsNonEateryfile = true;
  eatery_import_file: any;
  non_eatery_import_file: any;
  refund_manual: any;
  latitude: any = parseFloat(this.generalSetting.default_location_lat);
  longitude: any = parseFloat(this.generalSetting.default_location_long);
  use_google_map = parseInt(this.generalSetting.use_google_map);
  zoom: number;
  private geoCoder;
  address: string;
  @ViewChild("search") public searchElementRef: ElementRef;
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: "15rem",
    minHeight: "5rem",
    placeholder: "Enter text here...",
    translate: "no",
    defaultParagraphSeparator: "p",
    defaultFontName: "Arial",
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: "redText",
        class: "redText",
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ],
    toolbarHiddenButtons: [
      [],
      [
        "fontSize",
        "textColor",
        "backgroundColor",
        "customClasses",
        "link",
        "unlink",
        "insertImage",
        "insertVideo",
        "insertHorizontalRule",
        "removeFormat",
        "toggleEditorMode",
      ],
    ],
  };
  receivedModalData: any;
  receivedCodeModalData: any;
  date_formatData: any;
  @ViewChild('cursor') cursor
  show_driver: any = true;
  show_picker: any = true;
  show_pos: any = true;
  show_dinein: any = true;
  show_chat: any = true;
  show_livetracking: any = true;
  show_refund: any = true;
  max_length: any = 59;
  //CKEditor configuration
  ckeConfig: any = {
    extraPlugins: 'uploadimage,pastefromword,filebrowser',
    uploadUrl:
      'https://apilocal.lokaly.in/store/ckeditor',
    filebrowserBrowseUrl:
      'uploads/ckeditor',
    filebrowserImageBrowseUrl:
      'uploads/ckeditor',
    filebrowserUploadUrl:
      'https://apilocal.lokaly.in/store/ckeditor',
    filebrowserImageUploadUrl:
      'https://apilocal.lokaly.in/store/ckeditor',
    editable: true,
    spellcheck: true,
    sanitize: false,
    script: true,
    allowedContent: true,
    toolbar: [
      ['Source', 'Templates', 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'],
      ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'],
      ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'],
      ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'],
      ['Link', 'Unlink', 'Anchor'],
      ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak'],
      ['Styles', 'Format', 'Font', 'FontSize'],
      ['TextColor', 'BGColor'],
      ['Maximize', 'ShowBlocks']
    ],
    font_names: 'Arial/Arial, Helvetica, sans-serif;' +
      'Celias/Celias-Light;' +
      'Times New Roman/Times New Roman, Times, serif;' +
      'Verdana;',
    font_style: {
      element: 'span',
      styles: { 'font-family': '#(family)' },
      verrides: [{ element: 'font', attributes: { 'face': null } }]
    },
    fontSize: {
      options: [
        'default',
        '8pt',
        '9pt',
        '10pt',
        '11pt',
        '12pt',
        '14pt',
        '18pt',
        '24pt',
        '36pt'
      ]
    },
    font_defaultLabel: 'Celias',
    fontSize_defaultLabel: '16',
    height: 300
  };
  city_id_area_city: any;
  sessionConfig: any;
  loginUserId: any;
  global_currency: any;
  global_timezone: any;
  pincode_label: any;
  pincode_length: any;
  allow_alphanumeric_pincode: number;
  geocoder: any;
  map: any;
  accActiveId: any;
  marker: any;
  orderCode = {
    order_text: "",
    store_ID: "SID",
    sequence: "",
  };

  expressCode = {
    order_text: "",
    store_ID: "SID",
    sequence: "",
  };

  pickupCode = {
    order_text: "",
    store_ID: "SID",
    sequence: "",
  };

  POSCode = {
    order_text: "",
    store_ID: "SID",
    sequence: "",
  };

  DineINCode = {
    order_text: "",
    store_ID: "SID",
    sequence: "",
  };

  paymentCode = {
    order_text: "",
    store_ID: "SID",
    sequence: "",
  };

  refundCode = {
    order_text: "",
    store_ID: "SID",
    sequence: "",
  };

  cancelCode = {
    order_text: "",
    store_ID: "SID",
    sequence: "",
  };

  region = {
    country_id: "",
    state_id: "",
    city_id: "",
    area_id: "",
  };
  addSID = false;
  type: any;
  value: any;
  //first Icon Accordion
  @ViewChild("platformLogo") _PlatFromLogo!: ElementRef;
  @ViewChild("seoImage") _SeoImageRef!: ElementRef;
  @ViewChild("favicon") _Favicon!: ElementRef;
  @ViewChild("mobile_logo") _Mobile_Logo!: ElementRef;
  @ViewChild("logo_black_white") _Logo_Black_White!: ElementRef;

  //second Accordion Viewchild
  @ViewChild("customer_splash") _customer_splash!: ElementRef;
  @ViewChild("customer_help_1") _customer_help_1!: ElementRef;
  @ViewChild("customer_help_2") _customer_help_2!: ElementRef;
  @ViewChild("customer_help_3") _customer_help_3!: ElementRef;
  @ViewChild("customer_help_4") _customer_help_4!: ElementRef;
  @ViewChild("customer_loading") _customer_loading!: ElementRef;
  @ViewChild("whats_new_customer") _whats_new_customer!: ElementRef;
  @ViewChild("business_splash") _business_splash!: ElementRef;
  @ViewChild("business_help_1") _business_help_1!: ElementRef;
  @ViewChild("business_help_2") _business_help_2!: ElementRef;
  @ViewChild("business_help_3") _business_help_3!: ElementRef;
  @ViewChild("business_help_4") _business_help_4!: ElementRef;
  @ViewChild("whats_new_business") _whats_new_business!: ElementRef;
  @ViewChild("delivery_splash") _delivery_splash!: ElementRef;
  @ViewChild("delivery_help_1") _delivery_help_1!: ElementRef;
  @ViewChild("delivery_help_2") _delivery_help_2!: ElementRef;
  @ViewChild("delivery_help_3") _delivery_help_3!: ElementRef;
  @ViewChild("delivery_help_4") _delivery_help_4!: ElementRef;
  @ViewChild("whats_new_driver") _whats_new_driver!: ElementRef;

  // newly added
  @ViewChild("splash_screen_picker") _splash_screen_picker!: ElementRef;
  @ViewChild("help_screen_picker_1") _help_screen_picker_1!: ElementRef;
  @ViewChild("help_screen_picker_2") _help_screen_picker_2!: ElementRef;
  @ViewChild("help_screen_picker_3") _help_screen_picker_3!: ElementRef;
  @ViewChild("help_screen_picker_4") _help_screen_picker_4!: ElementRef;
  @ViewChild("whats_new_picker") _whats_new_picker!: ElementRef;

  @ViewChild("pos_splash_screen") _pos_splash_screen!: ElementRef;
  @ViewChild("pos_help_screen_1") _pos_help_screen_1!: ElementRef;
  @ViewChild("pos_help_screen_2") _pos_help_screen_2!: ElementRef;
  @ViewChild("pos_help_screen_3") _pos_help_screen_3!: ElementRef;
  @ViewChild("pos_help_screen_4") _pos_help_screen_4!: ElementRef;
  @ViewChild("whats_new_pos") _whats_new_pos!: ElementRef;
  @ViewChild("dinein_splash_screen") _dinein_splash_screen!: ElementRef;
  @ViewChild("dinein_tablet_splash_screen")
  _dinein_tablet_splash_screen!: ElementRef;
  @ViewChild("dinein_help_screen_1") _dinein_help_screen_1!: ElementRef;
  @ViewChild("dinein_help_screen_2") _dinein_help_screen_2!: ElementRef;
  @ViewChild("dinein_help_screen_3") _dinein_help_screen_3!: ElementRef;
  @ViewChild("dinein_help_screen_4") _dinein_help_screen_4!: ElementRef;
  @ViewChild("whats_new_dinein") _whats_new_dinein!: ElementRef;
  @ViewChild("best_seller_category_image")
  _best_seller_category_image!: ElementRef;
  @ViewChild("past_purchase_category_image")
  _past_purchase_category_image!: ElementRef;
  @ViewChild("combo_category_image") _combo_category_image!: ElementRef;
  @ViewChild("collection_category_image")
  _collection_category_image!: ElementRef;
  @ViewChild("item_tag_image")
  _item_tag_image!: ElementRef;

  //9th Accordion
  @ViewChild("excelUpload") _ExcelUpload!: ElementRef;
  @ViewChild("excelUpload1") _ExcelUpload1!: ElementRef;
  @ViewChild("excelUpload2") _ExcelUpload2!: ElementRef;

  SelectedFileRefund: any;
  NewExcelRows = [];
  SelectedZipFile: any;
  SelectedFileNonEat: any;
  SelectedFile: any;
  @ViewChild("tagInput") tagInputRef: ElementRef;
  tags: string[] = [];
  colorCode: any = [];
  orderStatusList = [{ label: "All", value: 0 }];

  constructor(
    public translate: TranslateService,
    public formbuilder: FormBuilder,
    private appComponent: AppComponent,
    private spinner: SpinnerService,
    private commonConfigurationServices: CommonConfigurationService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    public commonService: CommonService,
    private modalService: NgbModal,
    private mapsAPILoader: MapsAPILoader,
    private _helpService: BannerService,
    private router: Router,
    private el: ElementRef,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    this.accActiveId = localStorage.getItem('pannel_id') ? localStorage.getItem('pannel_id') : 0
    this.ckeConfig.contentsCss = [window.location.origin + "/assets/ckEditor-font.css"];
    this.main = this.appComponent.main;
    this.sessionConfig = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(this.sessionConfig.getSessionLoginUser());
    this.PlatformSetting =
      this.PlatformSetting == null
        ? this.main.platform_setting
        : this.PlatformSetting;
    this.business_model = this.PlatformSetting.business_model;
    this.loginUserId = this.main.LoggedUserInfo.user_id;
    this.generalSetting =
      this.generalSetting == null ? this.main : this.generalSetting;
    this.global_currency = this.generalSetting.currency_symbol;
    this.global_timezone = this.generalSetting.timezone;
    this.timezone = this.generalSetting.timezone;
    this.pincode_label = this.generalSetting.pincode_label;
    this.main.DateFormate = this.generalSetting.date_format_web;
    this.pincode_length = this.generalSetting.pincode_length;
    this.allow_alphanumeric_pincode = parseInt(
      this.generalSetting.allow_alphanumeric_pincode
    );
    this.use_google_map = parseInt(this.generalSetting.use_google_map);
    this.default_location_lat = parseFloat(
      this.generalSetting.default_location_lat
    );
    this.default_location_long = parseFloat(
      this.generalSetting.default_location_long
    );
    $(
      "<style>button.accordion-button.ng-star-inserted { background-color: " +
      this.generalSetting.css_button_business_default +
      " !important;border-color: " +
      this.generalSetting.css_button_business_default +
      " !important; border-radius:5px 5px 0px 0px !important;} </style>"
    ).appendTo("body");

    $(
      "<style>.accordion-item { box-shadow:0 5px 5px 0 rgba(0, 0, 0, 0.25) !important}</style>"
    ).appendTo("body");

    if (this.main.LoggedUserInfo.role_id == 1 && this.generalSetting.driver_module == 0) {
      this.show_driver = false;
    }
    if (this.main.LoggedUserInfo.role_id == 1 && this.generalSetting.picker_module == 0) {
      this.show_picker = false;
    }
    if (this.main.LoggedUserInfo.role_id == 1 && this.generalSetting.pos_module == 0) {
      this.show_pos = false;
    }
    if (this.main.LoggedUserInfo.role_id == 1 && this.generalSetting.dinein_module == 0) {
      this.show_dinein = false;
    }
    if (this.main.LoggedUserInfo.role_id == 1 && this.generalSetting.chat_module == 0) {
      this.show_chat = false;
    }
    if (this.main.LoggedUserInfo.role_id == 1 && this.generalSetting.livetracking == 0) {
      this.show_livetracking = false;
    }
    if (this.main.LoggedUserInfo.role_id == 1 && this.generalSetting.refund_module == 0) {
      this.show_refund = false;
    }
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadPlatform();
    this.GetTimezone();
    this.GetCurrency();
    this.getCountryList();
    this.getMasterLanguage();
    this.GetPaymentMethodlist();
    this.GetStoreTypeList();
    this.getHelpDetails();
    // this.downloadcommon();
  }

  loadPlatform() {
    this.commonConfiguration_form = this.formbuilder.group({
      platform_name: new FormControl(null),
      // first Accordion
      platform_slogan: new FormControl(null),
      platform_page_title: new FormControl(null),
      about_platform: new FormControl(null),
      logo: new FormControl(null),
      platform_meta_logo: new FormControl(null),
      platform_keywords: new FormControl(null),
      favicon_icon: new FormControl(null),
      mobile_logo: new FormControl(null),
      logo_black_white: new FormControl(null),
      selectedDateFormat: new FormControl(null),
      delivery_radius_type: new FormControl(null),
      delivery_radius: new FormControl(null),
      amount_seperator: new FormControl(null),
      timezone: new FormControl(this.timezone, [Validators.required]),
      selectedcurrency: [""],
      currency_symbol: [],
      currency_short_name: [],
      currency_name: [],
      currency_code: [],
      selectedCountry: new FormControl(null),
      selectedlanguage: new FormControl(null),
      contact_name: new FormControl(null),
      footer_copyright: new FormControl(null),
      //second Accordion FormControl
      customer_splash_screen: new FormControl(null),
      customer_help_screen_1: new FormControl(null),
      customer_help_screen_2: new FormControl(null),
      customer_help_screen_3: new FormControl(null),
      customer_help_screen_4: new FormControl(null),
      customer_loading_screen: new FormControl(null),
      whats_new_customer: new FormControl(null),
      business_splash_screen: new FormControl(null),
      business_help_screen_1: new FormControl(null),
      business_help_screen_2: new FormControl(null),
      business_help_screen_3: new FormControl(null),
      business_help_screen_4: new FormControl(null),
      whats_new_business: new FormControl(null),
      deliveryboy_splash_screen: new FormControl(null),
      deliveryboy_help_screen_1: new FormControl(null),
      deliveryboy_help_screen_2: new FormControl(null),
      deliveryboy_help_screen_3: new FormControl(null),
      deliveryboy_help_screen_4: new FormControl(null),
      whats_new_driver: new FormControl(null),
      // newly added
      splash_screen_picker: new FormControl(null),
      help_screen_picker_1: new FormControl(null),
      help_screen_picker_2: new FormControl(null),
      help_screen_picker_3: new FormControl(null),
      help_screen_picker_4: new FormControl(null),
      whats_new_picker: new FormControl(null),
      pos_splash_screen: new FormControl(null),
      pos_help_screen_1: new FormControl(null),
      pos_help_screen_2: new FormControl(null),
      pos_help_screen_3: new FormControl(null),
      pos_help_screen_4: new FormControl(null),
      whats_new_pos: new FormControl(null),
      dinein_splash_screen: new FormControl(null),
      dinein_tablet_splash_screen: new FormControl(null),
      dinein_help_screen_1: new FormControl(null),
      dinein_help_screen_2: new FormControl(null),
      dinein_help_screen_3: new FormControl(null),
      dinein_help_screen_4: new FormControl(null),
      whats_new_dinein: new FormControl(null),
      best_seller_category_image: new FormControl(null),
      past_purchase_category_image: new FormControl(null),
      combo_category_image: new FormControl(null),
      collection_category_image: new FormControl(null),
      item_tag_image: new FormControl(null),
      //third url accordion
      website_url: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      webadmin_url: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      faq_link: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      terms_of_use_url: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      customer_app_url_ios: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      customer_app_url_android: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      customer_app_short_link: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      business_app_url_ios: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      business_app_url_android: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      business_app_short_link: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      driver_app_url_ios: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      driver_app_url_android: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      driver_app_short_link: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),

      picker_app_ios: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      picker_app_android: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),

      picker_app_shortlink: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),

      pos_app_url_ios: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      pos_app_url_android: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      pos_app_short_link: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      dinein_app_url_ios: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      dinein_app_url_android: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),
      dinein_app_short_link: new FormControl("", [
        Validators.required,
        Validators.pattern(this.urlRegEx),
      ]),

      //Fourth Accordion
      eatery_module: new FormControl(null),
      allow_wholeseller: new FormControl(null),
      driver_module: new FormControl(null),
      offers_module: new FormControl(null),
      allow_wallet: new FormControl(null),
      giftcard_module: new FormControl(null),
      wishlist: new FormControl(null),
      review_rating_module: new FormControl(null),
      marketing_tool: new FormControl(null),
      allow_khata: new FormControl(null),
      module_config: new FormControl(null),
      chat_module: new FormControl(null),
      livetracking: new FormControl(null),
      pwa: new FormControl(null),
      refund_module: new FormControl(null),
      stock_mgmt: new FormControl(null),
      pos_module: new FormControl(null),
      picker_module: new FormControl(null),
      dinein_module: new FormControl(null),
      visualization_module: new FormControl(null),

      // fifth Accordion
      khata_label: new FormControl(null),
      deliveryboy_label: new FormControl(null),
      pincode_label: new FormControl(null),
      store_tax_label: new FormControl(null),
      store_label: new FormControl(null),

      //sixth Accordion
      google_map_key: new FormControl(null),
      fcm_key: new FormControl(null),
      selectedPaymentGateway: new FormControl(null),
      payment_gateway_url: new FormControl(null),
      payment_gateway_id: new FormControl(null),
      payment_gateway_key: new FormControl(null),
      online_payment_max_order: new FormControl(null),

      //seventth Accordion
      contact_email: new FormControl(null),
      smtp_from_email: new FormControl(null),
      smtp_from_name: new FormControl(null),
      smtp_host: new FormControl(null),
      smtp_password: new FormControl(null),
      smtp_port: new FormControl(null),
      smtp_reply_name: new FormControl(null),
      smtp_reply_to: new FormControl(null),
      smtp_username: new FormControl(null),
      email_header: [null],
      email_footer_customer: new FormControl(null),
      email_footer_business: new FormControl(null),

      //8th Accordion
      css_footer: new FormControl(null),
      css_footer_font: new FormControl(null),
      css_button_customer_default: new FormControl(null),
      css_button_customer_default_font: new FormControl(null),
      css_button_customer_hover: new FormControl(null),
      css_button_customer_hover_font: new FormControl(null),
      offer_color_code: new FormControl(null),
      default_rating_color_code_bg: new FormControl(null),
      default_rating_color_code_text: new FormControl(null),
      show_rating_different_color_code: new FormControl(null),
      alternate_color_code_bg: new FormControl(null),
      alternate_color_code_text: new FormControl(null),
      css_button_business_default: new FormControl(null),
      css_button_business_alternative: new FormControl(null),
      css_button_business_font: new FormControl(null),
      deliveryboy_btn_color: new FormControl(null),
      deliveryboy_alter_btn_color: new FormControl(null),
      deliveryboy_font_color: new FormControl(null),
      css_button_pos_default: new FormControl(null),
      css_button_pos_alternative: new FormControl(null),
      css_button_pos_font: new FormControl(null),
      css_button_dinein_default: new FormControl(null),
      css_button_dinein_alternative: new FormControl(null),
      css_button_dinein_font: new FormControl(null),

      //9th Accordion
      recommended_items_list: new FormControl(null),
      top_selling_items_limit: new FormControl(null),
      top_purchase_count: new FormControl(null),
      abandon_cart_email: new FormControl(null),
      abandon_cart_hour: new FormControl(null, Validators.required),
      abandon_cart_min: new FormControl('', [Validators.required, this.validateShadowMinMaxValue()]),
      chat_destroy_hour: new FormControl(null, Validators.required),
      chat_destroy_min: new FormControl('', [Validators.required, this.validateShadowMinMaxValue()]),
      download_center_destroy_hour: new FormControl(null, Validators.required),
      download_center_destroy_min: new FormControl('', [Validators.required, this.validateShadowMinMaxValue()]),
      livetracking_sec: new FormControl(null),
      pincode_length: new FormControl(null),
      allow_alphanumeric_pincode: new FormControl(null),
      offer_validity: new FormControl(null),
      refund_validity: new FormControl(null),
      show_billing_address: new FormControl(null),
      chat_notification_customer: new FormControl(null),
      chat_notification_seller: new FormControl(null),
      chat_notification_deliveryboy: new FormControl(null),
      use_google_map: new FormControl(null),
      use_sms: new FormControl(null),
      is_pod_mandatory: new FormControl(null),
      show_review_rating: new FormControl(null),
      show_store_business_hours: new FormControl(null),
      show_store_address: new FormControl(null),
      show_out_of_stock_items: new FormControl(null),
      show_rating: new FormControl(null),
      show_price_same_font: new FormControl(null),
      show_driver_item_detail: new FormControl(null),
      show_driver_order_detail: new FormControl(null),
      force_update_customer: new FormControl(null),
      current_app_version_customer: new FormControl(null),
      force_update_business: new FormControl(null),
      current_app_version_business: new FormControl(null),
      force_update_driver: new FormControl(null),
      force_update_pos_android: new FormControl(null),
      force_update_dinein_android: new FormControl(null),
      force_update_business_ios: new FormControl(null),
      force_update_customer_ios: new FormControl(null),
      force_update_driver_ios: new FormControl(null),
      force_update_pos_ios: new FormControl(null),
      force_update_dinein_ios: new FormControl(null),
      current_app_version_driver: new FormControl(null),
      current_app_version_pos_android: new FormControl(null),
      current_app_version_dinein_android: new FormControl(null),
      current_app_version_business_ios: new FormControl(null),
      current_app_version_customer_ios: new FormControl(null),
      current_app_version_driver_ios: new FormControl(null),
      current_app_version_pos_ios: new FormControl(null),
      current_app_version_dinein_ios: new FormControl(null),
      show_price_inclusive_tax: new FormControl(null),
      show_price_inclusive_packaging: new FormControl(null),
      submit_order_before_online_payment_confirmation: new FormControl(null),
      selectedLoginMethod: new FormControl(null),
      storeType: new FormControl(),
      all_store: new FormControl(false),
      all_eatery: new FormControl(false),
      all_wholesale: new FormControl(false),
      selectedCustomerLocation: new FormControl(null),
      selected_default_status_store: new FormControl(null),
      show_customer_details_to_store: new FormControl(null),
      refund_voucher_applicable_on: new FormControl(null),
      check_deliveryboy_before_order: new FormControl(null),
      deliveryboy_criteria: new FormControl(null),
      orderStatusIds: new FormControl(null),
      selected_picker_order_categories: new FormControl(null),
      items_displayed_variant: new FormControl(null),
      item_tax_type: new FormControl(null),
      tax_calculation_address: new FormControl(null),
      tax_recalculation_offer: new FormControl(null),
      selected_show_save_item: new FormControl(null),
      search_bar_at_top: new FormControl(null),
      payment_hold_process_accepted: new FormControl(null),
      allow_order_tip: new FormControl(null),
      order_process_on_less_stock: new FormControl(null),
      orderDuringStatusIds: new FormControl(null),
      stock_order_update_status: new FormControl(null),
      default_location_text: new FormControl("", Validators.required),
      global_area_name: new FormControl("", Validators.required),
      order_no_format: new FormControl(null),
      express_delivery_order_no_format: new FormControl(null),
      pickup_order_no_format: new FormControl(null),
      pos_order_no_format: new FormControl(null),
      dinein_order_no_format: new FormControl(null),
      payment_order_no_format: new FormControl(null),
      refund_no_format: new FormControl(null),
      cancellation_order_no_format: new FormControl(null),
      refund_manual: new FormControl(null),
      non_eatery_import_file: new FormControl(null),
      eatery_import_file: new FormControl(null),
    });

  }

  /** Fixed this code for mapsAPILoader */
  beforeChange(event) {
    localStorage.setItem("pannel_id", event.panelId)
    if (event.panelId == 10) {
      this.geocoder = new google.maps.Geocoder();
      this.mapsAPILoader.load().then(() => {
        this.initMap();
      });
    }
  }
  /** Implement map function */
  initMap() {
    let that = this
    that.cdr.detectChanges()
    that.map = new google.maps.Map(document.getElementById("area-input"));
    var input = document.getElementById("area-input");
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", that.map);
    var latLng = new google.maps.LatLng(that.latitude, that.longitude);
    that.marker = new google.maps.Marker({
      position: latLng,
      title: "Point A",
      map: that.map,
      draggable: true,
    });
    google.maps.event.addListener(autocomplete, "place_changed", function () {
      var place = autocomplete.getPlace();
      that.latitude = place.geometry.location.lat();
      that.longitude = place.geometry.location.lng();
    });
  }

  show_rating_different_color_codeChnage() { }

  zeroNotValid(event) {
    if (event.content_limit != "") {
      if (Number(event.content_limit) <= 0) {
        this.toastr.error(this.translate.instant("COUNT_TO_BE_GREATER_ZERO"));
        event.content_limit = "";
        return false;
      }
    }
  }
  changeLoginMethod(item) {
    this.commonConfiguration_form.controls["selectedLoginMethod"].setValue(
      item
    );
  }

  changeCustomerLocation(item) {
    this.commonConfiguration_form.value.selectedCustomerLocation = item;
    this.commonConfiguration_form.controls["default_location_text"].setValue(
      ""
    );
    if (item == 1) {
      this.cdr.detectChanges(); // works without the set timeout
      this.geocoder = new google.maps.Geocoder();
      this.mapsAPILoader.load().then(() => {
        this.initMap();
      });
    }
  }

  addareaModel() {
    const modalRef = this.modalService.open(AddEditCityAreaComponent, {
      size: "lg-600",
      // backdrop: "static",
      // keyboard: false,
    });

    modalRef.componentInstance.locationModal.subscribe((receivedEntry) => {
      if (receivedEntry) {
        this.city_id_area_city = Number(receivedEntry.city_id?.id);
        this.commonConfiguration_form.controls.global_area_name.setValue(
          receivedEntry?.area_id?.name + ", " + receivedEntry?.city_id?.name
        );
        this.commonConfiguration_form.controls.default_location_text.setValue(
          receivedEntry?.area_id?.id
        );
      }
    });
  }

  someFunc($event) {
    if ($event.keyCode == 13) {
      $event.preventDefault();
      return false;
    }
  }

  generate_code_model(type: any, value: any) {
    this.type = type;
    this.value = value;
    const modalRef = this.modalService.open(GenerateCodeComponent, {
      size: "lg-600",
      // backdrop: "static",
      // keyboard: false,
    });
    this.cdr.detectChanges();
    if (value == 3) {
      this.addSID = true;
    }

    var Codedata = {
      label: type,
      value: value,
    };
    modalRef.componentInstance.receivedCodeData = Codedata;
    modalRef.componentInstance.SendOrderCode = this.orderCode;
    modalRef.componentInstance.SendexpressCode = this.expressCode;
    modalRef.componentInstance.SendpickupCode = this.pickupCode;
    modalRef.componentInstance.SendPOSCode = this.POSCode;
    modalRef.componentInstance.SendDineINCode = this.DineINCode;
    modalRef.componentInstance.SendpaymentCode = this.paymentCode;
    modalRef.componentInstance.SendrefundCode = this.refundCode;
    modalRef.componentInstance.SendcancelCode = this.cancelCode;
    if ((type = "Order")) {
      modalRef.componentInstance.order_no_format =
        this.commonConfiguration_form.value.order_no_format;
    }
    if (this.addSID) {
      modalRef.componentInstance.addSID = true;
    }

    modalRef.componentInstance.modalCodeData.subscribe((receivedEntry) => {
      if (receivedEntry) {
        this.addcodeInField(receivedEntry);
      }
    });
  }

  addcodeInField(rE) {
    if (this.type == "Order") {
      if (this.value == "1") {
        this.commonConfiguration_form.controls.order_no_format.setValue(
          this.commonConfiguration_form.value.order_no_format +
          "{" +
          rE.order_text +
          "}"
        );
      } else if (this.value == "2") {
        this.commonConfiguration_form.controls.order_no_format.setValue(
          this.commonConfiguration_form.value.order_no_format +
          "{{" +
          rE.selectedDateFormatOrderCode +
          "}}"
        );
      } else if (this.value == "3") {
        this.commonConfiguration_form.controls.order_no_format.setValue(
          this.commonConfiguration_form.value.order_no_format +
          "{{" +
          rE.store_ID +
          "}}"
        );
      } else {
        this.commonConfiguration_form.controls.order_no_format.setValue(
          this.commonConfiguration_form.value.order_no_format +
          "{{{" +
          rE.sequence +
          "}}}"
        );
      }
    }
    if (this.type == "Express") {
      if (this.value == "1") {
        this.commonConfiguration_form.controls.express_delivery_order_no_format.setValue(
          this.commonConfiguration_form.value.express_delivery_order_no_format +
          "{" +
          rE.expressCodeText +
          "}"
        );
      } else if (this.value == "2") {
        this.commonConfiguration_form.controls.express_delivery_order_no_format.setValue(
          this.commonConfiguration_form.value.express_delivery_order_no_format +
          "{{" +
          rE.selectedDateFormatExpressCode +
          "}}"
        );
      } else if (this.value == "3") {
        this.commonConfiguration_form.controls.express_delivery_order_no_format.setValue(
          this.commonConfiguration_form.value.express_delivery_order_no_format +
          "{{" +
          rE.expressCodeStore +
          "}}"
        );
      } else {
        this.commonConfiguration_form.controls.express_delivery_order_no_format.setValue(
          this.commonConfiguration_form.value.express_delivery_order_no_format +
          "{{{" +
          rE.expressCodeSequence +
          "}}}"
        );
      }
    }
    if (this.type == "Pickup") {
      if (this.value == "1") {
        this.commonConfiguration_form.controls.pickup_order_no_format.setValue(
          this.commonConfiguration_form.value.pickup_order_no_format +
          "{" +
          rE.pickupCodeText +
          "}"
        );
      } else if (this.value == "2") {
        this.commonConfiguration_form.controls.pickup_order_no_format.setValue(
          this.commonConfiguration_form.value.pickup_order_no_format +
          "{{" +
          rE.selectedDateFormatpickupCode +
          "}}"
        );
      } else if (this.value == "3") {
        this.commonConfiguration_form.controls.pickup_order_no_format.setValue(
          this.commonConfiguration_form.value.pickup_order_no_format +
          "{{" +
          rE.pickupCodeStore +
          "}}"
        );
      } else {
        this.commonConfiguration_form.controls.pickup_order_no_format.setValue(
          this.commonConfiguration_form.value.pickup_order_no_format +
          "{{{" +
          rE.pickupCodeSequence +
          "}}}"
        );
      }
    }
    if (this.type == "POS") {
      if (this.value == "1") {
        this.commonConfiguration_form.controls.pos_order_no_format.setValue(
          this.commonConfiguration_form.value.pos_order_no_format +
          "{" +
          rE.POSCodeText +
          "}"
        );
      } else if (this.value == "2") {
        this.commonConfiguration_form.controls.pos_order_no_format.setValue(
          this.commonConfiguration_form.value.pos_order_no_format +
          "{{" +
          rE.selectedDateFormatPOSCode +
          "}}"
        );
      } else if (this.value == "3") {
        this.commonConfiguration_form.controls.pos_order_no_format.setValue(
          this.commonConfiguration_form.value.pos_order_no_format +
          "{{" +
          rE.POSCodestore +
          "}}"
        );
      } else {
        this.commonConfiguration_form.controls.pos_order_no_format.setValue(
          this.commonConfiguration_form.value.pos_order_no_format +
          "{{{" +
          rE.POSCodeSequence +
          "}}}"
        );
      }
    }
    if (this.type == "Dine-IN") {
      if (this.value == "1") {
        this.commonConfiguration_form.controls.dinein_order_no_format.setValue(
          this.commonConfiguration_form.value.dinein_order_no_format +
          "{" +
          rE.DineINCode_text +
          "}"
        );
      } else if (this.value == "2") {
        this.commonConfiguration_form.controls.dinein_order_no_format.setValue(
          this.commonConfiguration_form.value.dinein_order_no_format +
          "{{" +
          rE.selectedDateFormatDineINCode +
          "}}"
        );
      } else if (this.value == "3") {
        this.commonConfiguration_form.controls.dinein_order_no_format.setValue(
          this.commonConfiguration_form.value.dinein_order_no_format +
          "{{" +
          rE.DineINCodeStore +
          "}}"
        );
      } else {
        this.commonConfiguration_form.controls.dinein_order_no_format.setValue(
          this.commonConfiguration_form.value.dinein_order_no_format +
          "{{{" +
          rE.DineINCodeSequence +
          "}}}"
        );
      }
    }
    if (this.type == "Payment") {
      if (this.value == "1") {
        this.commonConfiguration_form.controls.payment_order_no_format.setValue(
          this.commonConfiguration_form.value.payment_order_no_format +
          "{" +
          rE.paymentCodetext +
          "}"
        );
      } else if (this.value == "2") {
        this.commonConfiguration_form.controls.payment_order_no_format.setValue(
          this.commonConfiguration_form.value.payment_order_no_format +
          "{{" +
          rE.selectedDateFormatPaymentCode +
          "}}"
        );
      } else if (this.value == "3") {
        this.commonConfiguration_form.controls.payment_order_no_format.setValue(
          this.commonConfiguration_form.value.payment_order_no_format +
          "{{" +
          rE.paymentCodeStore +
          "}}"
        );
      } else {
        this.commonConfiguration_form.controls.payment_order_no_format.setValue(
          this.commonConfiguration_form.value.payment_order_no_format +
          "{{{" +
          rE.paymentCodesequence +
          "}}}"
        );
      }
    }
    if (this.type == "Refund") {
      if (this.value == "1") {
        this.commonConfiguration_form.controls.refund_no_format.setValue(
          this.commonConfiguration_form.value.refund_no_format +
          "{" +
          rE.refundCodetext +
          "}"
        );
      } else if (this.value == "2") {
        this.commonConfiguration_form.controls.refund_no_format.setValue(
          this.commonConfiguration_form.value.refund_no_format +
          "{{" +
          rE.selectedDateFormatRefundCode +
          "}}"
        );
      } else if (this.value == "3") {
        this.commonConfiguration_form.controls.refund_no_format.setValue(
          this.commonConfiguration_form.value.refund_no_format +
          "{{" +
          rE.refundCodestore +
          "}}"
        );
      } else {
        this.commonConfiguration_form.controls.refund_no_format.setValue(
          this.commonConfiguration_form.value.refund_no_format +
          "{{{" +
          rE.refundCodesequence +
          "}}}"
        );
      }
    }
    if (this.type == "Cancel") {
      if (this.value == "1") {
        this.commonConfiguration_form.controls.cancellation_order_no_format.setValue(
          this.commonConfiguration_form.value.cancellation_order_no_format +
          "{" +
          rE.cancelCodetext +
          "}"
        );
      } else if (this.value == "2") {
        this.commonConfiguration_form.controls.cancellation_order_no_format.setValue(
          this.commonConfiguration_form.value.cancellation_order_no_format +
          "{{" +
          rE.selectedDateFormatCancelCode +
          "}}"
        );
      } else if (this.value == "3") {
        this.commonConfiguration_form.controls.cancellation_order_no_format.setValue(
          this.commonConfiguration_form.value.cancellation_order_no_format +
          "{{" +
          rE.cancelCodestore +
          "}}"
        );
      } else {
        this.commonConfiguration_form.controls.cancellation_order_no_format.setValue(
          this.commonConfiguration_form.value.cancellation_order_no_format +
          "{{{" +
          rE.cancelCodesequence +
          "}}}"
        );
      }
    }
  }

  changecodefield(value: any) {
    if (value == 1) {
      this.commonConfiguration_form.controls["order_no_format"].setValue("");
    }
    if (value == 2) {
      this.commonConfiguration_form.controls[
        "payment_order_no_format"
      ].setValue("");
    }
    if (value == 3) {
      this.commonConfiguration_form.controls["refund_no_format"].setValue("");
    }
    if (value == 4) {
      this.commonConfiguration_form.controls[
        "cancellation_order_no_format"
      ].setValue("");
    }
    if (value == 5) {
      this.commonConfiguration_form.controls["pickup_order_no_format"].setValue(
        ""
      );
    }
    if (value == 6) {
      this.commonConfiguration_form.controls["pos_order_no_format"].setValue(
        ""
      );
    }
    if (value == 7) {
      this.commonConfiguration_form.controls[
        "express_delivery_order_no_format"
      ].setValue("");
    }
    if (value == 8) {
      this.commonConfiguration_form.controls["dinein_order_no_format"].setValue(
        ""
      );
    }
  }

  ChangeOrderStatus(item: any) {
    let len = item.length - 1;
    if (this.commonConfiguration_form.value.orderStatusIds[len] == 0) {
      this.tempOrderStatusIds = [];
      this.orderStatusList.forEach((element) => {
        if (element.value != 0) {
          this.tempOrderStatusIds.push(element.value);
        }
      });
      this.commonConfiguration_form.controls["orderStatusIds"].setValue(
        this.tempOrderStatusIds
      );
    }
  }

  ChangeOrderDuringStatus() {
    let len =
      this.commonConfiguration_form.value.orderDuringStatusIds.length - 1;
    if (this.commonConfiguration_form.value.orderDuringStatusIds[len] == 0) {
      this.tempOrderDuringStatus = [];
      this.orderStatusList.forEach((element) => {
        if (element.value != 0) {
          this.tempOrderDuringStatus.push(element.value);
        }
      });
      this.commonConfiguration_form.controls["orderDuringStatusIds"].setValue(
        this.tempOrderDuringStatus
      );
    }
  }

  ChangeStockDuringStatus() {
    let len =
      this.commonConfiguration_form.value.stock_order_update_status.length - 1;
    if (this.commonConfiguration_form.value.stock_order_update_status[len] == 0) {
      this.tempStockDuringStatus = [];
      this.orderStatusList.forEach((element) => {
        if (element.value != 0) {
          this.tempStockDuringStatus.push(element.value);
        }
      });
      this.commonConfiguration_form.controls["stock_order_update_status"].setValue(
        this.tempStockDuringStatus
      );
    }
  }

  change_show_save_item(item) { }

  colorCodeChange(value, label) {
    this.commonConfiguration_form.controls[label].setValue(value.target.value);
    this.cdr.detectChanges();
  }

  changeColor() {
    this.cdr.detectChanges();
  }

  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }

  onKeyUp(event: KeyboardEvent): void {
    const inputValue: string =
      this.commonConfiguration_form.controls.offer_color_code.value;
    if (event.code === "Backspace" && !inputValue) {
      this.removeTag();
      return;
    } else {
      if (event.code === "Comma" || event.code === "Enter") {
        this.addTag(inputValue);
        this.commonConfiguration_form.controls.offer_color_code.setValue("");
      }
    }
  }

  addTag(tag: string): void {
    if (tag[tag.length - 1] === "," || tag[tag.length - 1] === " ") {
      tag = tag.slice(0, -1);
    }
    if (tag.length > 0 && !find(this.tags, tag)) {
      this.colorCode.push(tag);
    }
  }

  removeTag(tag?: string): void {
    if (!!tag) {
      pull(this.colorCode, tag);
    } else {
      this.colorCode.splice(-1);
    }
  }

  controlHasError(validation, controlName): boolean {
    const control = this.commonConfiguration_form.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  clearPaymentgateway = function () {
    this.commonConfiguration_form.controls["selectedPaymentGateway"].reset();
  };
  /**
  * get Address code using geocode
  */
  getAddress(latitude, longitude) {
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            this.zoom = 17;
            this.address = results[0].formatted_address;
          } else {
            window.alert("No results found");
          }
        } else {
          window.alert("Geocoder failed due to: " + status);
        }
      }
    );
  }
  /**
   * get timezone using service
   */
  async GetTimezone() {
    //
    await this.commonService.getTimeZone().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.timezonelist = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  changetimezone(event: any) {
    this.commonConfiguration_form.controls["timezone"].setValue(event);
  }
  /**
   * get county list using service
   */
  async getCountryList() {
    await this.commonService.getCountryList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.countryList = response.data;
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }
  /**
   * get language using service
   */
  async getMasterLanguage() {
    var data = {};
    await this.commonConfigurationServices.getMasterLanguages(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.languageList = response.data;
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  /** get payment method list using service */
  async GetPaymentMethodlist() {
    await this.commonConfigurationServices.getGlobalPaymentMethods().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.paymentData = response.data;
          this.paymentData.forEach((element) => {
            var data = {
              label: element.name,
              value: element.id
            };
            // value: element.id.toString(),
            this.paymentGatewayList.push(data);
          });
        }
      },
    });
  }

  async GetStoreTypeList() {
    await this.commonConfigurationServices.getStoreType().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.storeTypeList = response.data;
        }
      },
    });
  }

  stateChanged(event: any, type: any) {
    this.all_eatery = type == "all_eatery" ? event : this.all_eatery;
    this.all_wholesale = type == "all_wholesale" ? event : this.all_wholesale;
    this.all_store = type == "all_store" ? event : this.all_store;
    this.TempstoreType = [];

    if (this.commonConfiguration_form.value.all_store == true) {
      this.storeTypeList.forEach((element) => {
        this.TempstoreType.push(element.category_id);
      });
      this.commonConfiguration_form.controls["storeType"].setValue(
        this.TempstoreType
      );
    }
    if (this.commonConfiguration_form.value.all_eatery == true) {
      this.storeTypeList.forEach((element) => {
        if (element.iseatery == 1) {
          this.TempstoreType.push(element.category_id);
        }
      });
      this.commonConfiguration_form.controls["storeType"].setValue(
        this.TempstoreType
      );
    }
    if (this.commonConfiguration_form.value.all_wholesale == true) {
      this.storeTypeList.forEach((element) => {
        if (element.is_whole_seller == 1) {
          this.TempstoreType.push(element.category_id);
        }
      });
      this.commonConfiguration_form.controls["storeType"].setValue(
        this.TempstoreType
      );
    }
    if (
      this.commonConfiguration_form.value.all_store == false &&
      this.commonConfiguration_form.value.all_eatery == false &&
      this.commonConfiguration_form.value.all_wholesale == false
    ) {
      this.commonConfiguration_form.controls["storeType"].setValue(null);
    }
  }

  changeDateFormat(item) {
    this.commonConfiguration_form.controls["selectedDateFormat"].setValue(item);
  }

  DownloadCommonData: any;
  myCurrency: any = null; // holds the current currency object
  /** get common configuration data by using it's service  */
  async getCommonConfigData() {
    this.myCurrency == null;
    await this.commonConfigurationServices.getCommonConfigurationDetails().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (!response.data.currency_name) {
            this.commonConfiguration_form.controls['selectedcurrency'].setValue(this.currencyList[0].id)
            this.myCurrency = this.currencyList[0];
          } else {
            this.currencyList.forEach((currency) => {
              if (currency.name.toString() == response.data.currency_name.toString()) {
                this.myCurrency = currency;
                this.commonConfiguration_form.controls.selectedcurrency.setValue(
                  currency.id
                );
              }
            });
          }

          this.commonConfiguration_form.controls["platform_name"].setValue(
            response.data.platform_name
          );
          this.commonConfiguration_form.controls["platform_slogan"].setValue(
            response.data.platform_slogan
          );
          this.commonConfiguration_form.controls[
            "platform_page_title"
          ].setValue(response.data.platform_page_title);
          this.commonConfiguration_form.controls["about_platform"].setValue(
            response.data.about_platform
          );
          this.commonConfiguration_form.controls["platform_keywords"].setValue(
            response.data.platform_keywords
          );
          if (response.data.platform_meta_logo == "") {
            this.isSeoLogo = true;
          } else {
            this.isSeoLogo = false;
            this.seoLogo = response.data.platform_meta_logo;
          }
          if (response.data.logo == "") {
            this.is_logo = true;
          } else {
            this.logo = response.data.logo;
            this.is_logo = false;
          }
          if (response.data.favicon_icon == "") {
            this.is_favicon = true;
          } else {
            this.favicon_icon = response.data.favicon_icon;
            this.is_favicon = false;
          }
          if (response.data.mobile_logo == "") {
            this.is_mobile_logo = true;
          } else {
            this.mobile_logo = response.data.mobile_logo;
            this.is_mobile_logo = false;
          }
          if (response.data.logo_black_white == "") {
            this.Islogo_black_white = true;
          } else {
            this.logo_black_white = response.data.logo_black_white;
            this.Islogo_black_white = false;
          }

          this.commonConfiguration_form.controls["selectedDateFormat"].setValue(
            response.data.date_format
          );
          this.commonConfiguration_form.controls[
            "delivery_radius_type"
          ].setValue(response.data.delivery_radius_type);
          this.commonConfiguration_form.controls[
            "amount_seperator"
          ].setValue(response.data.amount_seperator);
          this.commonConfiguration_form.controls["delivery_radius"].setValue(
            response.data.delivery_radius
          );
          this.commonConfiguration_form.controls["timezone"].setValue(
            response.data.timezone
          );

          this.commonConfiguration_form.controls["selectedCountry"].setValue(
            response.data.country.toString().split(",")
          );
          var languageId = response.data.languages.split(",");
          var tempLanguage = [];
          languageId.forEach((element) => {
            tempLanguage.push(Number(element));
          });
          this.commonConfiguration_form.controls["selectedlanguage"].setValue(
            tempLanguage
          );
          this.commonConfiguration_form.controls["contact_name"].setValue(
            response.data.contact_name
          );
          this.commonConfiguration_form.controls["footer_copyright"].setValue(
            response.data.footer_copyright
          );

          if (response.data.customer_splash_screen == "") {
            this.Iscustomer_splash = true;
          } else {
            this.customer_splash_screen = response.data.customer_splash_screen;
            this.Iscustomer_splash = false;
          }
          if (response.data.customer_help_screen_1 == "") {
            this.Iscustomer_help_1 = true;
          } else {
            this.customer_help_screen_1 = response.data.customer_help_screen_1;
            this.Iscustomer_help_1 = false;
          }
          if (response.data.customer_help_screen_2 == "") {
            this.Iscustomer_help_2 = true;
          } else {
            this.customer_help_screen_2 = response.data.customer_help_screen_2;
            this.Iscustomer_help_2 = false;
          }
          if (response.data.customer_help_screen_3 == "") {
            this.Iscustomer_help_3 = true;
          } else {
            this.customer_help_screen_3 = response.data.customer_help_screen_3;
            this.Iscustomer_help_3 = false;
          }
          if (
            response.data.customer_help_screen_4 == "" ||
            response.data.customer_help_screen_4 == null
          ) {
            this.Iscustomer_help_4 = true;
          } else {
            this.customer_help_screen_4 = response.data.customer_help_screen_4;
            this.Iscustomer_help_4 = false;
          }
          if (response.data.customer_loading_screen == "") {
            this.Iscustomer_loading = true;
          } else {
            this.customer_loading_screen =
              response.data.customer_loading_screen;
            this.Iscustomer_loading = false;
          }

          if (
            response.data.whats_new_customer == "" ||
            response.data.whats_new_customer == null
          ) {
            this.Iswhats_new_customer = true;
          } else {
            this.whats_new_customer = response.data.whats_new_customer;
            this.Iswhats_new_customer = false;
          }

          if (response.data.business_splash_screen == "") {
            this.Isbusiness_splash = true;
          } else {
            this.business_splash_screen = response.data.business_splash_screen;
            this.Isbusiness_splash = false;
          }
          if (response.data.business_help_screen_1 == "") {
            this.Isbusiness_help_1 = true;
          } else {
            this.business_help_screen_1 = response.data.business_help_screen_1;
            this.Isbusiness_help_1 = false;
          }
          if (response.data.business_help_screen_2 == "") {
            this.Isbusiness_help_2 = true;
          } else {
            this.business_help_screen_2 = response.data.business_help_screen_2;
            this.Isbusiness_help_2 = false;
          }

          if (response.data.business_help_screen_3 == "") {
            this.Isbusiness_help_3 = true;
          } else {
            this.business_help_screen_3 = response.data.business_help_screen_3;
            this.Isbusiness_help_3 = false;
          }
          if (response.data.business_help_screen_4 == "") {
            this.Isbusiness_help_4 = true;
          } else {
            this.business_help_screen_4 = response.data.business_help_screen_4;
            this.Isbusiness_help_4 = false;
          }
          if (response.data.deliveryboy_splash_screen == "") {
            this.Isdelivery_splash = true;
          } else {
            this.deliveryboy_splash_screen =
              response.data.deliveryboy_splash_screen;
            this.Isdelivery_splash = false;
          }

          // newly added as per requirement
          if (response.data.splash_screen_picker == "" || response.data.splash_screen_picker == undefined) {
            this.Issplash_screen_picker = true
          } else {
            this.splash_screen_picker = response.data.splash_screen_picker;
            this.Issplash_screen_picker = false;
          }
          if (response.data.help_screen_picker_1 == "" || response.data.help_screen_picker_1 == undefined) {
            this.Ishelp_screen_picker_1 = true;
          } else {
            this.help_screen_picker_1 = response.data.help_screen_picker_1;
            this.Ishelp_screen_picker_1 = false;
          }
          if (response.data.help_screen_picker_2 == "" || response.data.help_screen_picker_2 == undefined) {
            this.Ishelp_screen_picker_2 = true;
          } else {
            this.help_screen_picker_2 = response.data.help_screen_picker_2;
            this.Ishelp_screen_picker_2 = false;
          }
          if (response.data.help_screen_picker_3 == "" || response.data.help_screen_picker_3 == undefined) {
            this.Ishelp_screen_picker_3 = true;
          } else {
            this.help_screen_picker_3 = response.data.help_screen_picker_3;
            this.Ishelp_screen_picker_3 = false;
          }
          if (response.data.help_screen_picker_4 == "" || response.data.help_screen_picker_4 == undefined) {
            this.Ishelp_screen_picker_4 = true;
          } else {
            this.help_screen_picker_4 = response.data.help_screen_picker_4;
            this.Ishelp_screen_picker_4 = false;
          }
          if (response.data.whats_new_picker == "" || response.data.whats_new_picker == undefined) {
            this.Iswhats_new_picker = true;
          } else {
            this.whats_new_picker = response.data.whats_new_picker;
            this.Iswhats_new_picker = false;
          }

          if (response.data.pos_splash_screen == "") {
            this.Ispos_splash_screen = true;
          } else {
            this.pos_splash_screen = response.data.pos_splash_screen;
            this.Ispos_splash_screen = false;
          }
          if (response.data.dinein_splash_screen == "") {
            this.Isdinein_splash_screen = true;
          } else {
            this.dinein_splash_screen = response.data.dinein_splash_screen;
            this.Isdinein_splash_screen = false;
          }
          if (response.data.dinein_tablet_splash_screen == "") {
            this.Isdinein_tablet_splash_screen = true;
          } else {
            this.dinein_tablet_splash_screen =
              response.data.dinein_tablet_splash_screen;
            this.Isdinein_tablet_splash_screen = false;
          }
          if (response.data.dinein_help_screen_1 == "") {
            this.Isdinein_help_screen_1 = true;
          } else {
            this.dinein_help_screen_1 = response.data.dinein_help_screen_1;
            this.Isdinein_help_screen_1 = false;
          }
          if (response.data.dinein_help_screen_2 == "") {
            this.Isdinein_help_screen_2 = true;
          } else {
            this.dinein_help_screen_2 = response.data.dinein_help_screen_2;
            this.Isdinein_help_screen_2 = false;
          }
          if (response.data.dinein_help_screen_3 == "") {
            this.Isdinein_help_screen_3 = true;
          } else {
            this.dinein_help_screen_3 = response.data.dinein_help_screen_3;
            this.Isdinein_help_screen_3 = false;
          }
          if (response.data.dinein_help_screen_4 == "") {
            this.Isdinein_help_screen_4 = true;
          } else {
            this.dinein_help_screen_4 = response.data.dinein_help_screen_4;
            this.Isdinein_help_screen_4 = false;
          }

          if (response.data.whats_new_dinein == "") {
            this.Iswhats_new_dinein = true;
          } else {
            this.whats_new_dinein = response.data.whats_new_dinein;
            this.Iswhats_new_dinein = false;
          }

          if (response.data.best_seller_category_image == "") {
            this.Isbest_seller_category_image = true;
          } else {
            this.best_seller_category_image =
              response.data.best_seller_category_image;
            this.Isbest_seller_category_image = false;
          }

          if (response.data.past_purchase_category_image == "") {
            this.Ispast_purchase_category_image = true;
          } else {
            this.past_purchase_category_image =
              response.data.past_purchase_category_image;
            this.Ispast_purchase_category_image = false;
          }

          if (response.data.combo_category_image == "") {
            this.Iscombo_category_image = true;
          } else {
            this.combo_category_image = response.data.combo_category_image;
            this.Iscombo_category_image = false;
          }

          if (response.data.collection_category_image == "") {
            this.Iscollection_category_image = true;
          } else {
            this.collection_category_image =
              response.data.collection_category_image;
            this.Iscollection_category_image = false;
          }

          if (response.data.item_tag_image == "") {
            this.Isitem_tag_image = true;
          } else {
            this.item_tag_image =
              response.data.item_tag_image;
            this.Isitem_tag_image = false;
          }

          this.Iswhats_new_business =
            response.data.whats_new_business == "" ||
              response.data.whats_new_business == null
              ? true
              : false;
          this.Isdelivery_help_1 =
            response.data.deliveryboy_help_screen_1 == "" ||
              response.data.deliveryboy_help_screen_1 == null
              ? true
              : false;
          this.Isdelivery_help_2 =
            response.data.deliveryboy_help_screen_2 == "" ||
              response.data.deliveryboy_help_screen_2 == null
              ? true
              : false;
          this.Isdelivery_help_3 =
            response.data.deliveryboy_help_screen_3 == "" ||
              response.data.deliveryboy_help_screen_3 == null
              ? true
              : false;
          this.Isdelivery_help_4 =
            response.data.deliveryboy_help_screen_4 == "" ||
              response.data.deliveryboy_help_screen_4 == null
              ? true
              : false;
          this.Iswhats_new_driver =
            response.data.whats_new_driver == "" ||
              response.data.whats_new_driver == null
              ? true
              : false;
          this.Ispos_help_screen_1 =
            response.data.pos_help_screen_1 == "" ||
              response.data.pos_help_screen_1 == null
              ? true
              : false;
          this.Ispos_help_screen_2 =
            response.data.pos_help_screen_2 == "" ||
              response.data.pos_help_screen_2 == null
              ? true
              : false;
          this.Ispos_help_screen_3 =
            response.data.pos_help_screen_3 == "" ||
              response.data.pos_help_screen_3 == null
              ? true
              : false;
          this.Ispos_help_screen_4 =
            response.data.pos_help_screen_4 == "" ||
              response.data.pos_help_screen_4 == null
              ? true
              : false;
          this.Iswhats_new_pos =
            response.data.whats_new_pos == "" ||
              response.data.whats_new_pos == null
              ? true
              : false;

          //third Accordion Data
          this.commonConfiguration_form.controls["website_url"].setValue(
            response.data.website_url
          );
          this.commonConfiguration_form.controls["webadmin_url"].setValue(
            response.data.webadmin_url
          );
          this.commonConfiguration_form.controls["faq_link"].setValue(
            response.data.faq_link
          );
          this.commonConfiguration_form.controls["terms_of_use_url"].setValue(
            response.data.terms_of_use_url
          );
          this.commonConfiguration_form.controls[
            "customer_app_url_ios"
          ].setValue(response.data.customer_app_url_ios);
          this.commonConfiguration_form.controls[
            "customer_app_url_android"
          ].setValue(response.data.customer_app_url_android);
          this.commonConfiguration_form.controls[
            "customer_app_short_link"
          ].setValue(response.data.customer_app_short_link);
          this.commonConfiguration_form.controls[
            "business_app_url_ios"
          ].setValue(response.data.business_app_url_ios);
          this.commonConfiguration_form.controls[
            "business_app_url_android"
          ].setValue(response.data.business_app_url_android);
          this.commonConfiguration_form.controls[
            "business_app_short_link"
          ].setValue(response.data.business_app_short_link);
          this.commonConfiguration_form.controls["driver_app_url_ios"].setValue(
            response.data.driver_app_url_ios
          );
          this.commonConfiguration_form.controls[
            "driver_app_url_android"
          ].setValue(response.data.driver_app_url_android);
          this.commonConfiguration_form.controls[
            "driver_app_short_link"
          ].setValue(response.data.driver_app_short_link);

          this.commonConfiguration_form.controls["picker_app_ios"].setValue(
            response.data.picker_app_ios
          );
          this.commonConfiguration_form.controls["picker_app_android"].setValue(
            response.data.picker_app_android

          );
          this.commonConfiguration_form.controls["picker_app_shortlink"].setValue(
            response.data.picker_app_shortlink

          );

          this.commonConfiguration_form.controls["pos_app_url_ios"].setValue(
            response.data.pos_app_url_ios
          );
          this.commonConfiguration_form.controls[
            "pos_app_url_android"
          ].setValue(response.data.pos_app_url_android);
          this.commonConfiguration_form.controls["pos_app_short_link"].setValue(
            response.data.pos_app_short_link
          );
          this.commonConfiguration_form.controls["dinein_app_url_ios"].setValue(
            response.data.dinein_app_url_ios
          );
          this.commonConfiguration_form.controls[
            "dinein_app_url_android"
          ].setValue(response.data.dinein_app_url_android);
          this.commonConfiguration_form.controls[
            "dinein_app_short_link"
          ].setValue(response.data.dinein_app_short_link);

          //Fourth Accordion Data
          this.commonConfiguration_form.controls["eatery_module"].setValue(
            response.data.eatery_module == 1
          );
          this.commonConfiguration_form.controls["allow_wholeseller"].setValue(
            response.data.allow_wholeseller == 1
          );
          this.commonConfiguration_form.controls["driver_module"].setValue(
            response.data.driver_module == 1
          );
          this.commonConfiguration_form.controls["offers_module"].setValue(
            response.data.offers_module == 1
          );
          this.commonConfiguration_form.controls["allow_wallet"].setValue(
            response.data.allow_wallet == 1
          );
          this.commonConfiguration_form.controls["giftcard_module"].setValue(
            response.data.giftcard_module == 1
          );
          this.commonConfiguration_form.controls["wishlist"].setValue(
            response.data.wishlist == 1
          );
          this.commonConfiguration_form.controls[
            "review_rating_module"
          ].setValue(response.data.review_rating_module == 1);
          this.commonConfiguration_form.controls["marketing_tool"].setValue(
            response.data.marketing_tool == 1
          );
          this.commonConfiguration_form.controls["allow_khata"].setValue(
            response.data.allow_khata == 1
          );
          this.commonConfiguration_form.controls["module_config"].setValue(
            response.data.module_config == 1
          );
          this.commonConfiguration_form.controls["chat_module"].setValue(
            response.data.chat_module == 1
          );
          this.commonConfiguration_form.controls["livetracking"].setValue(
            response.data.livetracking == 1
          );
          this.commonConfiguration_form.controls["pwa"].setValue(
            response.data.pwa == 1
          );
          this.commonConfiguration_form.controls["refund_module"].setValue(
            response.data.refund_module == 1
          );
          this.commonConfiguration_form.controls["stock_mgmt"].setValue(
            response.data.stock_mgmt == 1
          );
          this.commonConfiguration_form.controls["pos_module"].setValue(
            response.data.pos_module == 1
          );
          this.commonConfiguration_form.controls["picker_module"].setValue(
            response.data.picker_module == 1
          );
          this.commonConfiguration_form.controls["dinein_module"].setValue(
            response.data.dinein_module == 1
          );
          this.commonConfiguration_form.controls["visualization_module"].setValue(
            response.data.visualization_module == 1 ? true : false
          );

          //fifth Accordion
          this.commonConfiguration_form.controls["khata_label"].setValue(
            response.data.khata_label
          );
          this.commonConfiguration_form.controls["deliveryboy_label"].setValue(
            response.data.deliveryboy_label
          );
          this.commonConfiguration_form.controls["pincode_label"].setValue(
            response.data.pincode_label
          );
          this.commonConfiguration_form.controls["store_tax_label"].setValue(
            response.data.store_tax_label
          );
          this.commonConfiguration_form.controls["store_label"].setValue(
            response.data.store_label
          );

          //sixth Accordion
          this.commonConfiguration_form.controls["google_map_key"].setValue(
            response.data.google_map_key
          );
          this.commonConfiguration_form.controls["fcm_key"].setValue(
            response.data.fcm_key
          );
          if (response.data.payment_gateway_type != 0) {
            this.commonConfiguration_form.controls[
              "selectedPaymentGateway"
            ].setValue(response.data.payment_gateway_type);
          }
          this.commonConfiguration_form.controls[
            "payment_gateway_url"
          ].setValue(response.data.payment_gateway_url);
          this.commonConfiguration_form.controls["payment_gateway_id"].setValue(
            response.data.payment_gateway_id
          );
          this.commonConfiguration_form.controls[
            "payment_gateway_key"
          ].setValue(response.data.payment_gateway_key);
          this.commonConfiguration_form.controls[
            "online_payment_max_order"
          ].setValue(response.data.online_payment_max_order);

          //seventh Accordion
          this.commonConfiguration_form.controls["contact_email"].setValue(
            response.data.contact_email
          );
          this.commonConfiguration_form.controls["smtp_from_email"].setValue(
            response.data.email_smtp.smtp_from_email
          );
          this.commonConfiguration_form.controls["smtp_from_name"].setValue(
            response.data.email_smtp.smtp_from_name
          );
          this.commonConfiguration_form.controls["smtp_host"].setValue(
            response.data.email_smtp.smtp_host
          );
          this.commonConfiguration_form.controls["smtp_password"].setValue(
            response.data.email_smtp.smtp_password
          );
          this.commonConfiguration_form.controls["smtp_port"].setValue(
            response.data.email_smtp.smtp_port
          );
          this.commonConfiguration_form.controls["smtp_reply_name"].setValue(
            response.data.email_smtp.smtp_reply_name
          );
          this.commonConfiguration_form.controls["smtp_reply_to"].setValue(
            response.data.email_smtp.smtp_reply_to
          );
          this.commonConfiguration_form.controls["smtp_username"].setValue(
            response.data.email_smtp.smtp_username
          );
          this.commonConfiguration_form.controls["email_header"].setValue(
            response.data.email_header
          );
          this.commonConfiguration_form.controls[
            "email_footer_customer"
          ].setValue(response.data.email_footer_customer);
          this.commonConfiguration_form.controls[
            "email_footer_business"
          ].setValue(response.data.email_footer_business);

          //8th Accordion
          this.commonConfiguration_form.controls["css_footer"].setValue(
            response.data.css_footer
          );
          this.commonConfiguration_form.controls["css_footer_font"].setValue(
            response.data.css_footer_font
          );
          this.commonConfiguration_form.controls[
            "css_button_customer_default"
          ].setValue(response.data.css_button_customer_default);
          this.commonConfiguration_form.controls[
            "css_button_customer_default_font"
          ].setValue(response.data.css_button_customer_default_font);
          this.commonConfiguration_form.controls[
            "css_button_customer_hover"
          ].setValue(response.data.css_button_customer_hover);
          this.commonConfiguration_form.controls[
            "css_button_customer_hover_font"
          ].setValue(response.data.css_button_customer_hover_font);

          this.colorCode = response.data.offer_color_code.split(",");

          this.commonConfiguration_form.controls[
            "default_rating_color_code_bg"
          ].setValue(response.data.default_rating_color_code_bg);
          this.commonConfiguration_form.controls[
            "default_rating_color_code_text"
          ].setValue(response.data.default_rating_color_code_text);
          this.commonConfiguration_form.controls[
            "show_rating_different_color_code"
          ].setValue(response.data.show_rating_different_color_code);
          this.commonConfiguration_form.controls[
            "alternate_color_code_bg"
          ].setValue(response.data.alternate_color_code_bg);
          this.commonConfiguration_form.controls[
            "alternate_color_code_text"
          ].setValue(response.data.alternate_color_code_text);
          this.commonConfiguration_form.controls[
            "css_button_business_default"
          ].setValue(response.data.css_button_business_default);
          this.commonConfiguration_form.controls[
            "css_button_business_alternative"
          ].setValue(response.data.css_button_business_alternative);
          this.commonConfiguration_form.controls[
            "css_button_business_font"
          ].setValue(response.data.css_button_business_font);
          this.commonConfiguration_form.controls[
            "deliveryboy_btn_color"
          ].setValue(response.data.deliveryboy_btn_color);
          this.commonConfiguration_form.controls[
            "deliveryboy_alter_btn_color"
          ].setValue(response.data.deliveryboy_alter_btn_color);
          this.commonConfiguration_form.controls[
            "deliveryboy_font_color"
          ].setValue(response.data.deliveryboy_font_color);
          this.commonConfiguration_form.controls[
            "css_button_pos_default"
          ].setValue(response.data.css_button_pos_default);
          this.commonConfiguration_form.controls[
            "css_button_pos_alternative"
          ].setValue(response.data.css_button_pos_alternative);
          this.commonConfiguration_form.controls[
            "css_button_pos_font"
          ].setValue(response.data.css_button_pos_font);
          this.commonConfiguration_form.controls[
            "css_button_dinein_default"
          ].setValue(response.data.css_button_dinein_default);
          this.commonConfiguration_form.controls[
            "css_button_dinein_alternative"
          ].setValue(response.data.css_button_dinein_alternative);
          this.commonConfiguration_form.controls[
            "css_button_dinein_font"
          ].setValue(response.data.css_button_dinein_font);

          //9th Accordion
          this.commonConfiguration_form.controls[
            "recommended_items_list"
          ].setValue(response.data.recommended_items_list);
          this.commonConfiguration_form.controls[
            "top_selling_items_limit"
          ].setValue(response.data.top_selling_items_limit);
          this.commonConfiguration_form.controls["top_purchase_count"].setValue(
            response.data.top_purchase_count
          );
          this.commonConfiguration_form.controls["abandon_cart_email"].setValue(
            response.data.abandon_cart_email == 1 ? true : false
          );

          var abandon_time = response.data.abandon_cart_hours.split(":");
          this.commonConfiguration_form.controls["abandon_cart_hour"].setValue(
            abandon_time[0]
          );
          this.commonConfiguration_form.controls["abandon_cart_min"].setValue(
            abandon_time[1]
          );

          var chat_destroy_time = response.data.chat_destroy_hours.split(":");
          this.commonConfiguration_form.controls["chat_destroy_hour"].setValue(
            chat_destroy_time[0]
          );
          this.commonConfiguration_form.controls["chat_destroy_min"].setValue(
            chat_destroy_time[1]
          );

          var download_center_destroy_time = response.data.download_center_destroy_hours.split(":");
          this.commonConfiguration_form.controls["download_center_destroy_hour"].setValue(
            download_center_destroy_time[0]
          );
          this.commonConfiguration_form.controls["download_center_destroy_min"].setValue(
            download_center_destroy_time[1]
          );
          this.commonConfiguration_form.controls["livetracking_sec"].setValue(
            response.data.livetracking_sec
          );
          this.commonConfiguration_form.controls["pincode_length"].setValue(
            response.data.pincode_length
          );
          this.commonConfiguration_form.controls[
            "allow_alphanumeric_pincode"
          ].setValue(
            response.data.allow_alphanumeric_pincode == 1 ? true : false
          );
          this.commonConfiguration_form.controls["offer_validity"].setValue(
            response.data.offer_validity
          );
          this.commonConfiguration_form.controls["refund_validity"].setValue(
            response.data.refund_validity
          );
          this.commonConfiguration_form.controls[
            "show_billing_address"
          ].setValue(response.data.show_billing_address == 1 ? true : false);
          this.commonConfiguration_form.controls[
            "chat_notification_customer"
          ].setValue(
            response.data.chat_notification_customer == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "chat_notification_seller"
          ].setValue(
            response.data.chat_notification_seller == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "chat_notification_deliveryboy"
          ].setValue(
            response.data.chat_notification_deliveryboy == 1 ? true : false
          );
          this.commonConfiguration_form.controls["use_google_map"].setValue(
            response.data.use_google_map == 1 ? true : false
          );
          this.commonConfiguration_form.controls["use_sms"].setValue(
            response.data.use_sms == 1 ? true : false
          );
          this.commonConfiguration_form.controls["is_pod_mandatory"].setValue(
            response.data.is_pod_mandatory == 1 ? true : false
          );
          this.commonConfiguration_form.controls["show_review_rating"].setValue(
            response.data.show_review_rating == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "show_store_business_hours"
          ].setValue(
            response.data.show_store_business_hours == 1 ? true : false
          );
          this.commonConfiguration_form.controls["show_store_address"].setValue(
            response.data.show_store_address == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "show_out_of_stock_items"
          ].setValue(response.data.show_out_of_stock_items == 1 ? true : false);
          this.commonConfiguration_form.controls["show_rating"].setValue(
            response.data.show_rating == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "show_price_same_font"
          ].setValue(response.data.show_price_same_font == 1 ? true : false);
          this.commonConfiguration_form.controls[
            "show_driver_order_detail"
          ].setValue(response.data.show_driver_order_detail.toString());
          this.commonConfiguration_form.controls[
            "show_driver_item_detail"
          ].setValue(response.data.show_driver_item_detail.toString());
          this.commonConfiguration_form.controls[
            "force_update_customer"
          ].setValue(response.data.force_update_customer == 1 ? true : false);
          this.commonConfiguration_form.controls[
            "force_update_business"
          ].setValue(response.data.force_update_business == 1 ? true : false);
          this.commonConfiguration_form.controls[
            "force_update_driver"
          ].setValue(response.data.force_update_driver == 1 ? true : false);
          this.commonConfiguration_form.controls[
            "force_update_pos_android"
          ].setValue(
            response.data.force_update_pos_android == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "force_update_dinein_android"
          ].setValue(
            response.data.force_update_dinein_android == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "force_update_business_ios"
          ].setValue(
            response.data.force_update_business_ios == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "force_update_customer_ios"
          ].setValue(
            response.data.force_update_customer_ios == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "force_update_driver_ios"
          ].setValue(response.data.force_update_driver_ios == 1 ? true : false);
          this.commonConfiguration_form.controls[
            "force_update_pos_ios"
          ].setValue(response.data.force_update_pos_ios == 1 ? true : false);
          this.commonConfiguration_form.controls[
            "force_update_dinein_ios"
          ].setValue(response.data.force_update_dinein_ios == 1 ? true : false);
          this.commonConfiguration_form.controls[
            "show_price_inclusive_tax"
          ].setValue(
            response.data.show_price_inclusive_tax == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "show_price_inclusive_packaging"
          ].setValue(
            response.data.show_price_inclusive_packaging == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "submit_order_before_online_payment_confirmation"
          ].setValue(
            response.data.submit_order_before_online_payment_confirmation == 1
              ? true
              : false
          );
          this.commonConfiguration_form.controls[
            "current_app_version_customer"
          ].setValue(response.data.current_app_version_customer);
          this.commonConfiguration_form.controls[
            "current_app_version_business"
          ].setValue(response.data.current_app_version_business);
          this.commonConfiguration_form.controls[
            "current_app_version_driver"
          ].setValue(response.data.current_app_version_driver);
          this.commonConfiguration_form.controls[
            "current_app_version_pos_android"
          ].setValue(response.data.current_app_version_pos_android);
          this.commonConfiguration_form.controls[
            "current_app_version_dinein_android"
          ].setValue(response.data.current_app_version_dinein_android);
          this.commonConfiguration_form.controls[
            "current_app_version_business_ios"
          ].setValue(response.data.current_app_version_business_ios);
          this.commonConfiguration_form.controls[
            "current_app_version_customer_ios"
          ].setValue(response.data.current_app_version_customer_ios);
          this.commonConfiguration_form.controls[
            "current_app_version_driver_ios"
          ].setValue(response.data.current_app_version_driver_ios);
          this.commonConfiguration_form.controls[
            "current_app_version_pos_ios"
          ].setValue(response.data.current_app_version_pos_ios);
          this.commonConfiguration_form.controls[
            "current_app_version_dinein_ios"
          ].setValue(response.data.current_app_version_dinein_ios);
          this.commonConfiguration_form.controls[
            "selectedLoginMethod"
          ].setValue(
            response.data.login_using == 0 ? null : response.data.login_using.toString()
          );

          if (response.data.customer_location_type == 2) {
            this.commonConfiguration_form.controls["global_area_name"].setValue(
              response.data.global_area_name
            );
          } else {
            this.commonConfiguration_form.controls[
              "default_location_text"
            ].setValue(response.data.default_location_text);
          }

          if (response.data.item_approval_shop_type != "") {
            var category_id = response.data.item_approval_shop_type.split(",");
            var tempStore = [];
            category_id.forEach((element) => {
              tempStore.push(Number(element));
            });
            this.commonConfiguration_form.controls["storeType"].setValue(
              tempStore
            );
          }

          this.commonConfiguration_form.controls[
            "selectedCustomerLocation"
          ].setValue(response.data.customer_location_type.toString());

          this.commonConfiguration_form.controls[
            "selected_default_status_store"
          ].setValue(response.data.default_status_store_registration);
          this.commonConfiguration_form.controls[
            "selected_default_status_store"
          ].setValue(Number(response.data.default_status_store_registration));
          this.commonConfiguration_form.controls[
            "show_customer_details_to_store"
          ].setValue(response.data.show_customer_details_to_store.toString());
          this.commonConfiguration_form.controls[
            "refund_voucher_applicable_on"
          ].setValue(response.data.refund_voucher_applicable_on.toString());
          this.commonConfiguration_form.controls[
            "check_deliveryboy_before_order"
          ].setValue(
            response.data.check_deliveryboy_before_order == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "deliveryboy_criteria"
          ].setValue(response.data.deliveryboy_criteria);

          var order_status_list = response.data.order_status_list;
          order_status_list.forEach((objOrderStatus) => {
            var objDetail = {
              label: objOrderStatus.name,
              value: Number(objOrderStatus.id),
            };
            this.orderStatusList.push(objDetail);
          });
          var selectedPickerOrderDisplay = response.data.picker_order_display
            .toString()
            .split(",");
          var newselectedPickerOrderDisplay = [];
          selectedPickerOrderDisplay.forEach((orderStatus) => {
            if (orderStatus != "") {
              newselectedPickerOrderDisplay.push(Number(orderStatus));
            }
          });
          this.commonConfiguration_form.controls["orderStatusIds"].setValue(
            newselectedPickerOrderDisplay
          );

          this.commonConfiguration_form.controls[
            "selected_picker_order_categories"
          ].setValue(Number(response.data.picker_order_categories));
          this.commonConfiguration_form.controls[
            "items_displayed_variant"
          ].setValue(response.data.items_displayed_variant == 1 ? true : false);
          this.commonConfiguration_form.controls["item_tax_type"].setValue(
            response.data.item_tax_type.toString()
          );
          this.commonConfiguration_form.controls[
            "tax_calculation_address"
          ].setValue(response.data.tax_calculation_address.toString());
          this.commonConfiguration_form.controls[
            "tax_recalculation_offer"
          ].setValue(response.data.tax_recalculation_offer == 1 ? true : false);
          this.commonConfiguration_form.controls[
            "selected_show_save_item"
          ].setValue(
            response.data.show_save_item == 0
              ? null
              : response.data.show_save_item
          );
          this.commonConfiguration_form.controls["search_bar_at_top"].setValue(
            response.data.search_bar_at_top == 1 ? true : false
          );
          this.commonConfiguration_form.controls[
            "payment_hold_process_accepted"
          ].setValue(
            response.data.payment_hold_process_accepted == 1 ? true : false
          );
          this.commonConfiguration_form.controls["allow_order_tip"].setValue(
            response.data.allow_order_tip == 1 ? true : false
          );
          this.commonConfiguration_form.controls["order_process_on_less_stock"].setValue(
            response.data.order_process_on_less_stock == 1 ? true : false
          );

          var selectedDuringStatusDisplay =
            response.data.order_allowed_update_statuses.toString().split(",");
          var newselectedDuringStatusDisplay = [];
          selectedDuringStatusDisplay.forEach((orderStatus) => {
            if (orderStatus != "") {
              newselectedDuringStatusDisplay.push(Number(orderStatus));
            }
          });
          this.commonConfiguration_form.controls[
            "orderDuringStatusIds"
          ].setValue(newselectedDuringStatusDisplay);

          var selectedDuringStatusDisplayStock =
            response.data.stock_order_update_status.toString().split(",");
          var newselectedDuringStatusDisplayStock = [];
          selectedDuringStatusDisplayStock.forEach((orderStatus) => {
            if (orderStatus != "") {
              newselectedDuringStatusDisplayStock.push(Number(orderStatus));
            }
          });
          this.commonConfiguration_form.controls[
            "stock_order_update_status"
          ].setValue(newselectedDuringStatusDisplayStock);
          this.commonConfiguration_form.controls["order_no_format"].setValue(
            response.data.order_no_format
          );
          this.commonConfiguration_form.controls[
            "express_delivery_order_no_format"
          ].setValue(response.data.express_delivery_order_no_format);
          this.commonConfiguration_form.controls[
            "pickup_order_no_format"
          ].setValue(response.data.pickup_order_no_format);
          this.commonConfiguration_form.controls[
            "pos_order_no_format"
          ].setValue(response.data.pos_order_no_format);
          this.commonConfiguration_form.controls[
            "dinein_order_no_format"
          ].setValue(response.data.dinein_order_no_format);
          this.commonConfiguration_form.controls[
            "payment_order_no_format"
          ].setValue(response.data.payment_order_no_format);
          this.commonConfiguration_form.controls["refund_no_format"].setValue(
            response.data.refund_no_format
          );
          this.commonConfiguration_form.controls[
            "cancellation_order_no_format"
          ].setValue(response.data.cancellation_order_no_format);

          if (response.data.eatery_import_file == "") {
            this.IsEateryfile = true;
          } else {
            this.eatery_import_file = response.data.eatery_import_file;
            this.IsEateryfile = false;
          }

          if (response.data.non_eatery_import_file == "") {
            this.IsNonEateryfile = true;
          } else {
            this.non_eatery_import_file = response.data.non_eatery_import_file;
            this.IsNonEateryfile = false;
          }

          if (response.data.refund_manual == "") {
            this.IsRefundfile = true;
          } else {
            this.refund_manual = response.data.refund_manual;
            this.IsRefundfile = false;
          }
        }
      },
    });
  }


  SelectFile(event) {
    var file = event.target.files[0];
    if (file) {
      if (file.name.indexOf(".") > -1) {
        var extension = file.name.split(".").pop().toLowerCase();
      } else {
        var extension = file.name.split("/").pop().toLowerCase();
      }

      if ($.inArray(extension, ["xls", "xlsx"]) == -1) {
        this.SelectedZipFile = null;
        this._ExcelUpload.nativeElement.value = null;
        this.toastr.error(this.translate.instant("PLEASE_UPLOAD_A_VALID_FILE"));
      } else {
        this.NewExcelRows = [];
        this.SelectedFile = file;
      }
    }
  }

  SelectFileNonEatery(event) {
    var file = event.target.files[0];
    if (file) {
      if (file.name.indexOf(".") > -1) {
        var extension = file.name.split(".").pop().toLowerCase();
      } else {
        var extension = file.name.split("/").pop().toLowerCase();
      }
      if ($.inArray(extension, ["xls", "xlsx"]) == -1) {
        this.SelectedZipFile = null;
        this._ExcelUpload1.nativeElement.value = null;
        this.toastr.error(this.translate.instant("PLEASE_UPLOAD_A_VALID_FILE"));
      } else {
        this.NewExcelRows = [];
        this.SelectedFileNonEat = file;
      }
    }
  }

  SelectFileRefund(event) {
    var file = event.target.files[0];
    if (file) {
      if (file.name.indexOf(".") > -1) {
        var extension = file.name.split(".").pop().toLowerCase();
      } else {
        var extension = file.name.split("/").pop().toLowerCase();
      }
      if ($.inArray(extension, ["xls", "xlsx", "pdf"]) == -1) {
        this.SelectedZipFile = null;
        this._ExcelUpload2.nativeElement.value = null;
        this.toastr.error(this.translate.instant("PLEASE_UPLOAD_A_VALID_FILE"));
      } else {
        this.NewExcelRows = [];
        this.SelectedFileRefund = file;
      }
    }
  }

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
      if (this.file.size / 1024 >= 2048) {
        this.toastr.error(
          this.translate.instant("IMAGE_SIZE_SHOULD_BE_LESS_THAN_2_MB")
        );
        this.file = null;
        return false;
      } else if (
        $.inArray(extension, [
          "png",
          "PNG",
          "jpg",
          "jpeg",
          "pdf",
          "svg+xml",
          "x-icon",
          "gif",
          "vnd.microsoft.icon",
          "svg",
          "ico"
        ]) == -1
      ) {
        if (this.imageUploadType == "logo") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_ADDRESS"
          ));
          this._PlatFromLogo.nativeElement.value = null;
          this.cdr.detectChanges();
        } else if (this.imageUploadType == "seo_img") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_ADDRESS"
          ));
          this._SeoImageRef.nativeElement.value = null;
        } else if (this.imageUploadType == "favicon") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_ICO_FORMAT"
          ));
          this._Favicon.nativeElement.value = null;
        } else if (this.imageUploadType == "mobile_logo") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._Mobile_Logo.nativeElement.value = null;
        } else if (this.imageUploadType == "logo_black_white") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._Logo_Black_White.nativeElement.value = null;
        }

        //Second icon Accordion
        else if (this.imageUploadType == "customer_splash") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._customer_splash.nativeElement.value = null;
        } else if (this.imageUploadType == "customer_help_1") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._customer_help_1.nativeElement.value = null;
        } else if (this.imageUploadType == "customer_help_2") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._customer_help_2.nativeElement.value = null;
        } else if (this.imageUploadType == "customer_help_3") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._customer_help_3.nativeElement.value = null;
        } else if (this.imageUploadType == "customer_help_4") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._customer_help_4.nativeElement.value = null;
        } else if (this.imageUploadType == "customer_loading") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._customer_loading.nativeElement.value = null;
        } else if (this.imageUploadType == "whats_new_customer") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._whats_new_customer.nativeElement.value = null;
        } else if (this.imageUploadType == "business_splash") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._business_splash.nativeElement.value = null;
        } else if (this.imageUploadType == "business_help_1") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._business_help_1.nativeElement.value = null;
        } else if (this.imageUploadType == "business_help_2") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._business_help_2.nativeElement.value = null;
        } else if (this.imageUploadType == "business_help_3") {
          //business_help_screen_3 (replaced)
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._business_help_3.nativeElement.value = null;
        } else if (this.imageUploadType == "business_help_4") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._business_help_4.nativeElement.value = null;
        } else if (this.imageUploadType == "whats_new_business") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._whats_new_business.nativeElement.value = null;
        } else if (this.imageUploadType == "delivery_splash") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._delivery_splash.nativeElement.value = null;
        } else if (this.imageUploadType == "delivery_help_1") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._delivery_help_1.nativeElement.value = null;
        } else if (this.imageUploadType == "delivery_help_2") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._delivery_help_2.nativeElement.value = null;
        } else if (this.imageUploadType == "delivery_help_3") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._delivery_help_3.nativeElement.value = null;
        } else if (this.imageUploadType == "delivery_help_4") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._delivery_help_4.nativeElement.value = null;
        } else if (this.imageUploadType == "whats_new_driver") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._whats_new_driver.nativeElement.value = null;
        }

        // newly added 
        else if (this.imageUploadType == "splash_screen_picker") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._splash_screen_picker.nativeElement.value = null;
        }
        else if (this.imageUploadType == "help_screen_picker_1") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._help_screen_picker_1.nativeElement.value = null;
        } else if (this.imageUploadType == "help_screen_picker_2") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._help_screen_picker_2.nativeElement.value = null;
        } else if (this.imageUploadType == "help_screen_picker_3") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._help_screen_picker_3.nativeElement.value = null;
        } else if (this.imageUploadType == "help_screen_picker_4") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._help_screen_picker_4.nativeElement.value = null;
        } else if (this.imageUploadType == "whats_new_picker") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._whats_new_picker.nativeElement.value = null;
        }
        // kkk

        else if (this.imageUploadType == "pos_splash_screen") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._pos_splash_screen.nativeElement.value = null;
        } else if (this.imageUploadType == "pos_help_screen_1") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._pos_help_screen_1.nativeElement.value = null;
        } else if (this.imageUploadType == "pos_help_screen_2") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._pos_help_screen_2.nativeElement.value = null;
        } else if (this.imageUploadType == "pos_help_screen_3") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._pos_help_screen_3.nativeElement.value = null;
        } else if (this.imageUploadType == "pos_help_screen_4") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._pos_help_screen_4.nativeElement.value = null;
        } else if (this.imageUploadType == "whats_new_pos") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._whats_new_pos.nativeElement.value = null;
        } else if (this.imageUploadType == "dinein_splash_screen") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._dinein_splash_screen.nativeElement.value = null;
        } else if (this.imageUploadType == "dinein_tablet_splash_screen") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._dinein_tablet_splash_screen.nativeElement.value = null;
        } else if (this.imageUploadType == "dinein_help_screen_1") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._dinein_help_screen_1.nativeElement.value = null;
        } else if (this.imageUploadType == "dinein_help_screen_2") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._dinein_help_screen_2.nativeElement.value = null;
        } else if (this.imageUploadType == "dinein_help_screen_3") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._dinein_help_screen_3.nativeElement.value = null;
        } else if (this.imageUploadType == "dinein_help_screen_4") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._dinein_help_screen_4.nativeElement.value = null;
        } else if (this.imageUploadType == "whats_new_dinein") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._whats_new_dinein.nativeElement.value = null;
        } else if (this.imageUploadType == "best_seller_category_image") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._best_seller_category_image.nativeElement.value = null;
        } else if (this.imageUploadType == "past_purchase_category_image") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._past_purchase_category_image.nativeElement.value = null;
        } else if (this.imageUploadType == "combo_category_image") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._combo_category_image.nativeElement.value = null;
        } else if (this.imageUploadType == "collection_category_image") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._collection_category_image.nativeElement.value = null;
        } else if (this.imageUploadType == "item_tag_image") {
          this.toastr.error(this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"
          ));
          this._collection_category_image.nativeElement.value = null;
        } else {
          this.toastr.error(this.translate.instant("PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT"));
        }
        return false;
      } else {
        if (this.imageUploadType == "logo") {
          this.commonConfiguration_form.controls["logo"].setValue(this.file);
        } else if (this.imageUploadType == "favicon") {
          this.commonConfiguration_form.controls["favicon_icon"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "mobile_logo") {
          this.commonConfiguration_form.controls["mobile_logo"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "logo_black_white") {
          this.commonConfiguration_form.controls["logo_black_white"].setValue(
            this.file
          );
        }
        else if (this.imageUploadType == 'seo_img') {
          this.commonConfiguration_form.controls["platform_meta_logo"].setValue(this.file);
        }
        //Second SetIcon value Accordion
        else if (this.imageUploadType == "customer_splash") {
          this.commonConfiguration_form.controls[
            "customer_splash_screen"
          ].setValue(this.file);
        } else if (this.imageUploadType == "customer_help_1") {
          this.commonConfiguration_form.controls[
            "customer_help_screen_1"
          ].setValue(this.file);
        } else if (this.imageUploadType == "customer_help_2") {
          this.commonConfiguration_form.controls[
            "customer_help_screen_2"
          ].setValue(this.file);
        } else if (this.imageUploadType == "customer_help_3") {
          this.commonConfiguration_form.controls[
            "customer_help_screen_3"
          ].setValue(this.file);
        } else if (this.imageUploadType == "customer_help_4") {
          this.commonConfiguration_form.controls[
            "customer_help_screen_4"
          ].setValue(this.file);
        } else if (this.imageUploadType == "customer_loading") {
          this.commonConfiguration_form.controls[
            "customer_loading_screen"
          ].setValue(this.file);
        } else if (this.imageUploadType == "whats_new_customer") {
          this.commonConfiguration_form.controls["whats_new_customer"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "business_splash") {
          this.commonConfiguration_form.controls[
            "business_splash_screen"
          ].setValue(this.file);
        } else if (this.imageUploadType == "business_help_1") {
          this.commonConfiguration_form.controls[
            "business_help_screen_1"
          ].setValue(this.file);
        } else if (this.imageUploadType == "business_help_2") {
          this.commonConfiguration_form.controls[
            "business_help_screen_2"
          ].setValue(this.file);
        } else if (this.imageUploadType == "business_help_3") {
          this.commonConfiguration_form.controls[
            "business_help_screen_3"
          ].setValue(this.file);
        } else if (this.imageUploadType == "business_help_4") {
          this.commonConfiguration_form.controls[
            "business_help_screen_4"
          ].setValue(this.file);
        } else if (this.imageUploadType == "whats_new_business") {
          this.commonConfiguration_form.controls["whats_new_business"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "delivery_splash") {
          this.commonConfiguration_form.controls[
            "deliveryboy_splash_screen"
          ].setValue(this.file);
        } else if (this.imageUploadType == "delivery_help_1") {
          this.commonConfiguration_form.controls[
            "deliveryboy_help_screen_1"
          ].setValue(this.file);
        } else if (this.imageUploadType == "delivery_help_2") {
          this.commonConfiguration_form.controls[
            "deliveryboy_help_screen_2"
          ].setValue(this.file);
        } else if (this.imageUploadType == "delivery_help_3") {
          this.commonConfiguration_form.controls[
            "deliveryboy_help_screen_3"
          ].setValue(this.file);
        } else if (this.imageUploadType == "delivery_help_4") {
          this.commonConfiguration_form.controls[
            "deliveryboy_help_screen_4"
          ].setValue(this.file);
        } else if (this.imageUploadType == "whats_new_driver") {
          this.commonConfiguration_form.controls["whats_new_driver"].setValue(
            this.file
          );
        }

        // newly added
        else if (this.imageUploadType == "splash_screen_picker") {
          this.commonConfiguration_form.controls["splash_screen_picker"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "help_screen_picker_1") {
          this.commonConfiguration_form.controls["help_screen_picker_1"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "help_screen_picker_2") {
          this.commonConfiguration_form.controls["help_screen_picker_2"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "help_screen_picker_3") {
          this.commonConfiguration_form.controls["help_screen_picker_3"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "help_screen_picker_4") {
          this.commonConfiguration_form.controls["help_screen_picker_4"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "whats_new_picker") {
          this.commonConfiguration_form.controls["whats_new_picker"].setValue(
            this.file
          );
        }

        else if (this.imageUploadType == "pos_splash_screen") {
          this.commonConfiguration_form.controls["pos_splash_screen"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "pos_help_screen_1") {
          this.commonConfiguration_form.controls["pos_help_screen_1"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "pos_help_screen_2") {
          this.commonConfiguration_form.controls["pos_help_screen_2"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "pos_help_screen_3") {
          this.commonConfiguration_form.controls["pos_help_screen_3"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "pos_help_screen_4") {
          this.commonConfiguration_form.controls["pos_help_screen_4"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "whats_new_pos") {
          this.commonConfiguration_form.controls["whats_new_pos"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "dinein_splash_screen") {
          this.commonConfiguration_form.controls[
            "dinein_splash_screen"
          ].setValue(this.file);
        } else if (this.imageUploadType == "dinein_tablet_splash_screen") {
          this.commonConfiguration_form.controls[
            "dinein_tablet_splash_screen"
          ].setValue(this.file);
        } else if (this.imageUploadType == "dinein_help_screen_1") {
          this.commonConfiguration_form.controls[
            "dinein_help_screen_1"
          ].setValue(this.file);
        } else if (this.imageUploadType == "dinein_help_screen_2") {
          this.commonConfiguration_form.controls[
            "dinein_help_screen_2"
          ].setValue(this.file);
        } else if (this.imageUploadType == "dinein_help_screen_3") {
          this.commonConfiguration_form.controls[
            "dinein_help_screen_3"
          ].setValue(this.file);
        } else if (this.imageUploadType == "dinein_help_screen_4") {
          this.commonConfiguration_form.controls[
            "dinein_help_screen_4"
          ].setValue(this.file);
        } else if (this.imageUploadType == "whats_new_dinein") {
          this.commonConfiguration_form.controls["whats_new_dinein"].setValue(
            this.file
          );
        } else if (this.imageUploadType == "best_seller_category_image") {
          this.commonConfiguration_form.controls[
            "best_seller_category_image"
          ].setValue(this.file);
        } else if (this.imageUploadType == "past_purchase_category_image") {
          this.commonConfiguration_form.controls[
            "past_purchase_category_image"
          ].setValue(this.file);
        } else if (this.imageUploadType == "combo_category_image") {
          this.commonConfiguration_form.controls[
            "combo_category_image"
          ].setValue(this.file);
        } else if (this.imageUploadType == "collection_category_image") {
          this.commonConfiguration_form.controls[
            "collection_category_image"
          ].setValue(this.file);
        } else if (this.imageUploadType == "item_tag_image") {
          this.commonConfiguration_form.controls[
            "item_tag_image"
          ].setValue(this.file);
        }
      }
    }
  }

  uploadPicture(uploadType) {
    this.imageUploadType = uploadType;
  }

  removeImage(uploadType) {
    if (uploadType == "logo") {
      this.commonConfiguration_form.controls["logo"].setValue(0);
      this.is_logo = true;
    } else if (uploadType == "favicon") {
      this.commonConfiguration_form.controls["favicon_icon"].setValue(0);
      this.is_favicon = true;
    } else if (uploadType == "mobile_logo") {
      this.commonConfiguration_form.controls["mobile_logo"].setValue(0);
      this.is_mobile_logo = true;
    } else if (uploadType == "logo_black_white") {
      this.commonConfiguration_form.controls["logo_black_white"].setValue(0);
      this.Islogo_black_white = true;
    }
    else if (uploadType == "seo_img") {
      this.commonConfiguration_form.controls["platform_meta_logo"].setValue(0);
      this.isSeoLogo = true;
    }
    //second icon remove Accordion
    else if (uploadType == "customer_splash") {
      this.commonConfiguration_form.controls["customer_splash_screen"].setValue(0);
      this.Iscustomer_splash = true;
    } else if (uploadType == "customer_help_1") {
      this.commonConfiguration_form.controls["customer_help_screen_1"].setValue(0);
      this.Iscustomer_help_1 = true;
    } else if (uploadType == "customer_help_2") {
      this.commonConfiguration_form.controls["customer_help_screen_2"].setValue(0);
      this.Iscustomer_help_2 = true;
    } else if (uploadType == "customer_help_3") {
      this.commonConfiguration_form.controls["customer_help_screen_3"].setValue(0);
      this.Iscustomer_help_3 = true;
    } else if (uploadType == "customer_help_4") {
      this.commonConfiguration_form.controls["customer_help_screen_4"].setValue(0);
      this.Iscustomer_help_4 = true;
    } else if (uploadType == "customer_loading") {
      this.commonConfiguration_form.controls["customer_loading_screen"].setValue(0);
      this.Iscustomer_loading = true;
    } else if (uploadType == "whats_new_customer") {
      this.commonConfiguration_form.controls["whats_new_customer"].setValue(0);
      this.Iswhats_new_customer = true;
    } else if (uploadType == "business_splash") {
      this.commonConfiguration_form.controls["business_splash_screen"].setValue(0);
      this.Isbusiness_splash = true;
    } else if (uploadType == "business_help_1") {
      this.commonConfiguration_form.controls["business_help_screen_1"].setValue(0);
      this.Isbusiness_help_1 = true;
    } else if (uploadType == "business_help_2") {
      this.commonConfiguration_form.controls["business_help_screen_2"].setValue(0);
      this.Isbusiness_help_2 = true;
    } else if (uploadType == "business_help_3") {
      //business_help_screen_3 (changed)
      this.commonConfiguration_form.controls["business_help_screen_3"].setValue(0);
      this.Isbusiness_help_3 = true;
    } else if (uploadType == "business_help_4") {
      this.commonConfiguration_form.controls["business_help_screen_4"].setValue(0);
      this.Isbusiness_help_4 = true;
    } else if (uploadType == "whats_new_business") {
      this.commonConfiguration_form.controls["whats_new_business"].setValue(0);
      this.Iswhats_new_business = true;
    } else if (uploadType == "delivery_splash") {
      this.commonConfiguration_form.controls[
        "deliveryboy_splash_screen"
      ].setValue(0);
      this.Isdelivery_splash = true;
    } else if (uploadType == "delivery_help_1") {
      this.commonConfiguration_form.controls[
        "deliveryboy_help_screen_1"
      ].setValue(0);
      this.Isdelivery_help_1 = true;
    } else if (uploadType == "delivery_help_2") {
      this.commonConfiguration_form.controls[
        "deliveryboy_help_screen_2"
      ].setValue(0);
      this.Isdelivery_help_2 = true;
    } else if (uploadType == "delivery_help_3") {
      this.commonConfiguration_form.controls[
        "deliveryboy_help_screen_3"
      ].setValue(0);
      this.Isdelivery_help_3 = true;
    } else if (uploadType == "delivery_help_4") {
      this.commonConfiguration_form.controls[
        "deliveryboy_help_screen_4"
      ].setValue(0);
      this.Isdelivery_help_4 = true;
    } else if (uploadType == "whats_new_driver") {
      this.commonConfiguration_form.controls["whats_new_driver"].setValue(0);
      this.Iswhats_new_driver = true;
    }

    // newly added
    else if (uploadType == "splash_screen_picker") {
      this.commonConfiguration_form.controls["splash_screen_picker"].setValue(0);
      this.Issplash_screen_picker = true;
    } else if (uploadType == "help_screen_picker_1") {
      this.commonConfiguration_form.controls["help_screen_picker_1"].setValue(0);
      this.Ishelp_screen_picker_1 = true;
    } else if (uploadType == "help_screen_picker_2") {
      this.commonConfiguration_form.controls["help_screen_picker_2"].setValue(0);
      this.Ishelp_screen_picker_2 = true;
    } else if (uploadType == "help_screen_picker_3") {
      this.commonConfiguration_form.controls["help_screen_picker_3"].setValue(0);
      this.Ishelp_screen_picker_3 = true;
    } else if (uploadType == "help_screen_picker_4") {
      this.commonConfiguration_form.controls["help_screen_picker_4"].setValue(0);
      this.Ishelp_screen_picker_4 = true;
    } else if (uploadType == "whats_new_picker") {
      this.commonConfiguration_form.controls["whats_new_picker"].setValue(0);
      this.Iswhats_new_picker = true;
    }


    else if (uploadType == "pos_splash_screen") {
      this.commonConfiguration_form.controls["pos_splash_screen"].setValue(0);
      this.Ispos_splash_screen = true;
    } else if (uploadType == "pos_help_screen_1") {
      this.commonConfiguration_form.controls["pos_help_screen_1"].setValue(0);
      this.Ispos_help_screen_1 = true;
    } else if (uploadType == "pos_help_screen_2") {
      this.commonConfiguration_form.controls["pos_help_screen_2"].setValue(0);
      this.Ispos_help_screen_2 = true;
    } else if (uploadType == "pos_help_screen_3") {
      this.commonConfiguration_form.controls["pos_help_screen_3"].setValue(0);
      this.Ispos_help_screen_3 = true;
    } else if (uploadType == "pos_help_screen_4") {
      this.commonConfiguration_form.controls["pos_help_screen_4"].setValue(0);
      this.Ispos_help_screen_4 = true;
    } else if (uploadType == "whats_new_pos") {
      this.commonConfiguration_form.controls["whats_new_pos"].setValue(0);
      this.Iswhats_new_pos = true;
    } else if (uploadType == "dinein_splash_screen") {
      this.commonConfiguration_form.controls["dinein_splash_screen"].setValue(0);
      this.Isdinein_splash_screen = true;
    } else if (uploadType == "dinein_tablet_splash_screen") {
      this.commonConfiguration_form.controls[
        "dinein_tablet_splash_screen"
      ].setValue(0);
      this.Isdinein_tablet_splash_screen = true;
    } else if (uploadType == "dinein_help_screen_1") {
      this.commonConfiguration_form.controls["dinein_help_screen_1"].setValue(0);
      this.Isdinein_help_screen_1 = true;
    } else if (uploadType == "dinein_help_screen_2") {
      this.commonConfiguration_form.controls["dinein_help_screen_2"].setValue(0);
      this.Isdinein_help_screen_2 = true;
    } else if (uploadType == "dinein_help_screen_3") {
      this.commonConfiguration_form.controls["dinein_help_screen_3"].setValue(0);
      this.Isdinein_help_screen_3 = true;
    } else if (uploadType == "dinein_help_screen_4") {
      this.commonConfiguration_form.controls["dinein_help_screen_4"].setValue(0);
      this.Isdinein_help_screen_4 = true;
    } else if (uploadType == "whats_new_dinein") {
      this.commonConfiguration_form.controls["whats_new_dinein"].setValue(0);
      this.Iswhats_new_dinein = true;
    } else if (uploadType == "best_seller_category_image") {
      this.commonConfiguration_form.controls[
        "best_seller_category_image"
      ].setValue(0);
      this.Isbest_seller_category_image = true;
    } else if (uploadType == "past_purchase_category_image") {
      this.commonConfiguration_form.controls[
        "past_purchase_category_image"
      ].setValue(0);
      this.Ispast_purchase_category_image = true;
    } else if (uploadType == "combo_category_image") {
      this.commonConfiguration_form.controls["combo_category_image"].setValue(0);
      this.Iscombo_category_image = true;
    } else if (uploadType == "collection_category_image") {
      this.commonConfiguration_form.controls[
        "collection_category_image"
      ].setValue(0);
      this.Iscollection_category_image = true;
    } else if (uploadType == "item_tag_image") {
      this.commonConfiguration_form.controls[
        "item_tag_image"
      ].setValue(0);
      this.Isitem_tag_image = true;
    } else if (uploadType == "Eatery") {
      this.commonConfiguration_form.controls["eatery_import_file"].setValue(0);
      this.IsEateryfile = true;
    } else if (uploadType == "NonEatery") {
      this.commonConfiguration_form.controls["non_eatery_import_file"].setValue(0);
      this.IsNonEateryfile = true;
    } else if (uploadType == "refund") {
      this.commonConfiguration_form.controls["refund_manual"].setValue(0);
      this.IsRefundfile = true;
    }
  }

  conformloginpassword() {
    if (this.getFormControlValue("abandon_cart_min") == "" || this.getFormControlValue("abandon_cart_min") > 59 || this.getFormControlValue("abandon_cart_hour") == "") {
      return
    }
    if (this.getFormControlValue("chat_destroy_min") == "" || this.getFormControlValue("chat_destroy_min") > 59 || this.getFormControlValue("chat_destroy_hour") == "") {
      return
    }
    if (this.getFormControlValue("download_center_destroy_min") > 59 || this.getFormControlValue("download_center_destroy_min") == "" || this.getFormControlValue("download_center_destroy_hour") == "") {
      return
    }
    if (this.commonConfiguration_form.value.selectedCustomerLocation != 2) {
      if (this.getFormControlValue("default_location_text") == "") {
        this.is_default_location_text = true;
        return;
      } else {
        this.is_default_location_text = false;
      }
    }

    if (this.commonConfiguration_form.value.selectedCustomerLocation == 2) {
      if (this.getFormControlValue("global_area_name") == "") {
        this.is_default_location_text = true;
        return;
      } else {
        this.is_default_location_text = false;
      }
    }


    const modalRef = this.modalService.open(ConfirmPasswordComponent, {
      size: "md",
      // backdrop: "static",
      // keyboard: false,
    });
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.submitCommonConfiguration(receivedEntry);
    });
  }

  async GetCurrency() {
    await this.commonConfigurationServices.getCurrencyList().subscribe({
      next: (response: any) => {
        this.getCommonConfigData();
        if (response.status == 1) {
          this.currencyList = response.data;
        }
      },
      error: (error) => { this.getCommonConfigData(); },
      complete: () => { },
    });
  }

  changeCurrency(item) {
    this.currencyList.forEach((currency) => {
      if (currency.id == item) {
        this.myCurrency = currency;
      }
    });
  }

  boolToString(obj) {
    return obj ? "1" : "0";
  }

  getFormControlValue(property) {
    var data = this.commonConfiguration_form.value[property];
    if (data == null) {
      return '';
    }
    else {
      return data;
    }
  }

  locationChange(event) {
    var inputValue = (<HTMLInputElement>document.getElementById("area-input"))
      .value;
  }

  submitCommonConfiguration(item) {
    var fd = new FormData();
    //First Accordian Data
    fd.append("currency_symbol", !this.myCurrency?.symbol ? '' : this.myCurrency?.symbol);
    fd.append("currency_short_name", !this.myCurrency?.code ? '' : this.myCurrency?.code);
    fd.append("currency_name", !this.myCurrency?.name ? '' : this.myCurrency?.name);
    fd.append("currency_code", !this.myCurrency?.html_entity ? '' : this.myCurrency?.html_entity);
    fd.append("platform_name", this.getFormControlValue("platform_name"));
    fd.append("platform_slogan", this.getFormControlValue("platform_slogan"));
    fd.append("platform_keywords", this.getFormControlValue("platform_keywords"));
    fd.append(
      "platform_page_title",
      this.getFormControlValue("platform_page_title")
    );
    fd.append("about_platform", this.getFormControlValue("about_platform"));
    if (this.getFormControlValue("logo") || this.getFormControlValue("logo") == '0') {
      fd.append("logo", this.getFormControlValue("logo"));
    }
    if (this.getFormControlValue("platform_meta_logo") || this.getFormControlValue("platform_meta_logo") == '0') {
      fd.append("platform_meta_logo", this.getFormControlValue("platform_meta_logo"));
    }
    if (this.getFormControlValue("favicon_icon") || this.getFormControlValue("favicon_icon") == '0') {
      fd.append("favicon_icon", this.getFormControlValue("favicon_icon"));
    }
    if (this.getFormControlValue("mobile_logo") || this.getFormControlValue("mobile_logo") == '0') {
      fd.append("mobile_logo", this.getFormControlValue("mobile_logo"));
    }
    if (this.getFormControlValue("logo_black_white") || this.getFormControlValue("logo_black_white") == '0') {
      fd.append("logo_black_white", this.getFormControlValue("logo_black_white"));
    }
    this.date_formatData = this.commonConfiguration_form.get('selectedDateFormat').value

    var date_formatData = this.commonConfiguration_form.get('selectedDateFormat').value
    fd.append("date_format", date_formatData?.label ? date_formatData?.label : date_formatData);

    fd.append(
      "delivery_radius_type",
      this.getFormControlValue("delivery_radius_type")
    );
    fd.append(
      "amount_seperator",
      this.getFormControlValue("amount_seperator")
    );
    fd.append("delivery_radius", this.getFormControlValue("delivery_radius"));
    fd.append("timezone", this.getFormControlValue("timezone"));
    fd.append("contact_name", this.getFormControlValue("contact_name"));
    fd.append(
      "footer_copyright",
      this.getFormControlValue("footer_copyright")
    );
    fd.append(
      "country",
      this.commonConfiguration_form.value.selectedCountry.toString()
    );
    fd.append("languages", this.getFormControlValue("selectedlanguage"));

    if (this.getFormControlValue("customer_splash_screen") || this.getFormControlValue("customer_splash_screen") == '0') {
      fd.append("customer_splash_screen", this.getFormControlValue("customer_splash_screen"));
    }
    if (this.getFormControlValue("customer_help_screen_1") || this.getFormControlValue("customer_help_screen_1") == '0') {
      fd.append(
        "customer_help_screen_1",
        this.getFormControlValue("customer_help_screen_1")
      );
    }
    if (this.getFormControlValue("customer_help_screen_2") || this.getFormControlValue("customer_help_screen_2") == '0') {
      fd.append(
        "customer_help_screen_2",
        this.getFormControlValue("customer_help_screen_2")
      );
    }
    if (this.getFormControlValue("customer_help_screen_3") || this.getFormControlValue("customer_help_screen_3") == '0') {
      fd.append(
        "customer_help_screen_3",
        this.getFormControlValue("customer_help_screen_3")
      );
    }
    if (this.getFormControlValue("customer_help_screen_4") || this.getFormControlValue("customer_help_screen_4") == '0') {
      fd.append(
        "customer_help_screen_4",
        this.getFormControlValue("customer_help_screen_4")
      );
    }

    if (this.getFormControlValue("customer_loading_screen") || this.getFormControlValue("customer_loading_screen") == '0') {
      fd.append("customer_loading_screen", this.getFormControlValue("customer_loading_screen"));
    }
    if (this.getFormControlValue("whats_new_customer") || this.getFormControlValue("whats_new_customer") == '0') {
      fd.append("whats_new_customer", this.getFormControlValue("whats_new_customer"));
    }
    if (this.getFormControlValue("business_splash_screen") || this.getFormControlValue("business_splash_screen") == '0') {
      fd.append("business_splash_screen", this.getFormControlValue("business_splash_screen"));
    }
    if (this.getFormControlValue("business_help_screen_1") || this.getFormControlValue("business_help_screen_1") == '0') {
      fd.append("business_help_screen_1", this.getFormControlValue("business_help_screen_1"));
    }

    if (this.getFormControlValue("business_help_screen_2") || this.getFormControlValue("business_help_screen_2") == '0') {
      fd.append("business_help_screen_2", this.getFormControlValue("business_help_screen_2"));
    }

    if (this.getFormControlValue("business_help_screen_3") || this.getFormControlValue("business_help_screen_3") == '0') {
      fd.append("business_help_screen_3", this.getFormControlValue("business_help_screen_3"));
    }

    if (this.getFormControlValue("business_help_screen_4") || this.getFormControlValue("business_help_screen_4") == '0') {
      fd.append("business_help_screen_4", this.getFormControlValue("business_help_screen_4"));
    }

    if (this.getFormControlValue("whats_new_business") || this.getFormControlValue("whats_new_business") == '0') {
      fd.append("whats_new_business", this.getFormControlValue("whats_new_business"));
    }

    if (this.getFormControlValue("deliveryboy_splash_screen") || this.getFormControlValue("deliveryboy_splash_screen") == '0') {
      fd.append("deliveryboy_splash_screen", this.getFormControlValue("deliveryboy_splash_screen"));
    }

    if (this.getFormControlValue("deliveryboy_help_screen_1") || this.getFormControlValue("deliveryboy_help_screen_1") == '0') {
      fd.append("deliveryboy_help_screen_1", this.getFormControlValue("deliveryboy_help_screen_1"));
    }

    if (this.getFormControlValue("deliveryboy_help_screen_2") || this.getFormControlValue("deliveryboy_help_screen_2") == '0') {
      fd.append("deliveryboy_help_screen_2", this.getFormControlValue("deliveryboy_help_screen_2"));
    }

    if (this.getFormControlValue("deliveryboy_help_screen_3") || this.getFormControlValue("deliveryboy_help_screen_3") == '0') {
      fd.append("deliveryboy_help_screen_3", this.getFormControlValue("deliveryboy_help_screen_3"));
    }

    if (this.getFormControlValue("deliveryboy_help_screen_4") || this.getFormControlValue("deliveryboy_help_screen_4") == '0') {
      fd.append("deliveryboy_help_screen_4", this.getFormControlValue("deliveryboy_help_screen_4"));
    }
    if (this.getFormControlValue("whats_new_driver") || this.getFormControlValue("whats_new_driver") == '0') {
      fd.append("whats_new_driver", this.getFormControlValue("whats_new_driver"));
    }

    if (this.getFormControlValue("splash_screen_picker") || this.getFormControlValue("splash_screen_picker") == '0') {
      fd.append("splash_screen_picker", this.getFormControlValue("splash_screen_picker"));
    }

    if (this.getFormControlValue("help_screen_picker_1") || this.getFormControlValue("help_screen_picker_1") == '0') {
      fd.append("help_screen_picker_1", this.getFormControlValue("help_screen_picker_1"));
    }

    if (this.getFormControlValue("help_screen_picker_2") || this.getFormControlValue("help_screen_picker_2") == '0') {
      fd.append("help_screen_picker_2", this.getFormControlValue("help_screen_picker_2"));
    }

    if (this.getFormControlValue("help_screen_picker_3") || this.getFormControlValue("help_screen_picker_3") == '0') {
      fd.append("help_screen_picker_3", this.getFormControlValue("help_screen_picker_3"));
    }

    if (this.getFormControlValue("help_screen_picker_4") || this.getFormControlValue("help_screen_picker_4") == '0') {
      fd.append("help_screen_picker_4", this.getFormControlValue("help_screen_picker_4"));
    }

    if (this.getFormControlValue("whats_new_picker") || this.getFormControlValue("whats_new_picker") == '0') {
      fd.append("whats_new_picker", this.getFormControlValue("whats_new_picker"));
    }

    if (this.getFormControlValue("pos_splash_screen") || this.getFormControlValue("pos_splash_screen") == '0') {
      fd.append("pos_splash_screen", this.getFormControlValue("pos_splash_screen"));
    }

    if (this.getFormControlValue("pos_help_screen_1") || this.getFormControlValue("pos_help_screen_1") == '0') {
      fd.append("pos_help_screen_1", this.getFormControlValue("pos_help_screen_1"));
    }

    if (this.getFormControlValue("pos_help_screen_2") || this.getFormControlValue("pos_help_screen_2") == '0') {
      fd.append("pos_help_screen_2", this.getFormControlValue("pos_help_screen_2"));
    }

    if (this.getFormControlValue("pos_help_screen_3") || this.getFormControlValue("pos_help_screen_3") == '0') {
      fd.append("pos_help_screen_3", this.getFormControlValue("pos_help_screen_3"));
    }

    if (this.getFormControlValue("pos_help_screen_4") || this.getFormControlValue("pos_help_screen_4") == '0') {
      fd.append("pos_help_screen_4", this.getFormControlValue("pos_help_screen_4"));
    }
    if (this.getFormControlValue("whats_new_pos") || this.getFormControlValue("whats_new_pos") == '0') {
      fd.append("whats_new_pos", this.getFormControlValue("whats_new_pos"));
    }

    if (this.getFormControlValue("dinein_splash_screen") || this.getFormControlValue("dinein_splash_screen") == '0') {
      fd.append("dinein_splash_screen", this.getFormControlValue("dinein_splash_screen"));
    }

    if (this.getFormControlValue("dinein_tablet_splash_screen") || this.getFormControlValue("dinein_tablet_splash_screen") == '0') {
      fd.append("dinein_tablet_splash_screen", this.getFormControlValue("dinein_tablet_splash_screen"));
    }

    if (this.getFormControlValue("dinein_help_screen_1") || this.getFormControlValue("dinein_help_screen_1") == '0') {
      fd.append("dinein_help_screen_1", this.getFormControlValue("dinein_help_screen_1"));
    }

    if (this.getFormControlValue("dinein_help_screen_2") || this.getFormControlValue("dinein_help_screen_2") == '0') {
      fd.append("dinein_help_screen_2", this.getFormControlValue("dinein_help_screen_2"));
    }

    if (this.getFormControlValue("dinein_help_screen_3") || this.getFormControlValue("dinein_help_screen_3") == '0') {
      fd.append("dinein_help_screen_3", this.getFormControlValue("dinein_help_screen_3"));
    }

    if (this.getFormControlValue("dinein_help_screen_4") || this.getFormControlValue("dinein_help_screen_4") == '0') {
      fd.append("dinein_help_screen_4", this.getFormControlValue("dinein_help_screen_4"));
    }
    if (this.getFormControlValue("whats_new_dinein") || this.getFormControlValue("whats_new_dinein") == '0') {
      fd.append("whats_new_dinein", this.getFormControlValue("whats_new_dinein"));
    }

    if (this.getFormControlValue("best_seller_category_image") || this.getFormControlValue("best_seller_category_image") == '0') {
      fd.append("best_seller_category_image", this.getFormControlValue("best_seller_category_image"));
    }

    if (this.getFormControlValue("past_purchase_category_image") || this.getFormControlValue("past_purchase_category_image") == '0') {
      fd.append("past_purchase_category_image", this.getFormControlValue("past_purchase_category_image"));
    }

    if (this.getFormControlValue("combo_category_image") || this.getFormControlValue("combo_category_image") == '0') {
      fd.append("combo_category_image", this.getFormControlValue("combo_category_image"));
    }

    if (this.getFormControlValue("collection_category_image") || this.getFormControlValue("collection_category_image") == '0') {
      fd.append("collection_category_image", this.getFormControlValue("collection_category_image"));
    }
    if (this.getFormControlValue("item_tag_image") || this.getFormControlValue("item_tag_image") == '0') {
      fd.append("item_tag_image", this.getFormControlValue("item_tag_image"));
    }

    //third Accordian Data  (completed)
    fd.append("website_url", this.getFormControlValue("website_url"));
    fd.append("webadmin_url", this.getFormControlValue("webadmin_url"));
    fd.append("faq_link", this.getFormControlValue("faq_link"));
    fd.append("terms_of_use_url", this.getFormControlValue("terms_of_use_url"));
    fd.append(
      "customer_app_url_ios",
      this.getFormControlValue("customer_app_url_ios")
    );
    fd.append(
      "customer_app_url_android",
      this.getFormControlValue("customer_app_url_android")
    );
    fd.append(
      "customer_app_short_link",
      this.getFormControlValue("customer_app_short_link")
    );
    fd.append(
      "business_app_url_ios",
      this.getFormControlValue("business_app_url_ios")
    );
    fd.append(
      "business_app_url_android",
      this.getFormControlValue("business_app_url_android")
    );
    fd.append(
      "business_app_short_link",
      this.getFormControlValue("business_app_short_link")
    );
    fd.append(
      "driver_app_url_ios",
      this.getFormControlValue("driver_app_url_ios")
    );
    fd.append(
      "driver_app_url_android",
      this.getFormControlValue("driver_app_url_android")
    );
    fd.append(
      "driver_app_short_link",
      this.getFormControlValue("driver_app_short_link")
    );

    fd.append("picker_app_ios", this.getFormControlValue("picker_app_ios") == undefined ? '' : this.getFormControlValue("picker_app_ios"));
    fd.append("picker_app_android", this.getFormControlValue("picker_app_android") == undefined ? '' : this.getFormControlValue("picker_app_android"));
    fd.append("picker_app_shortlink", this.getFormControlValue("picker_app_shortlink") == undefined ? '' : this.getFormControlValue("picker_app_shortlink"));

    fd.append("pos_app_url_ios", this.getFormControlValue("pos_app_url_ios"));
    fd.append(
      "pos_app_url_android",
      this.getFormControlValue("pos_app_url_android")
    );
    fd.append(
      "pos_app_short_link",
      this.getFormControlValue("pos_app_short_link")
    );
    fd.append(
      "dinein_app_url_ios",
      this.getFormControlValue("dinein_app_url_ios")
    );
    fd.append(
      "dinein_app_url_android",
      this.getFormControlValue("dinein_app_url_android")
    );
    fd.append(
      "dinein_app_short_link",
      this.getFormControlValue("dinein_app_short_link")
    );

    //fourth accordian data (completed)
    fd.append(
      "eatery_module",
      this.boolToString(this.getFormControlValue("eatery_module"))
    );
    fd.append(
      "allow_wholeseller",
      this.boolToString(this.getFormControlValue("allow_wholeseller"))
    );
    fd.append(
      "driver_module",
      this.boolToString(this.getFormControlValue("driver_module"))
    );
    fd.append(
      "offers_module",
      this.boolToString(this.getFormControlValue("offers_module"))
    );
    fd.append(
      "allow_wallet",
      this.boolToString(this.getFormControlValue("allow_wallet"))
    );
    fd.append(
      "giftcard_module",
      this.boolToString(this.getFormControlValue("giftcard_module"))
    );
    fd.append(
      "wishlist",
      this.boolToString(this.getFormControlValue("wishlist"))
    );
    fd.append(
      "review_rating_module",
      this.boolToString(this.getFormControlValue("review_rating_module"))
    );
    fd.append(
      "marketing_tool",
      this.boolToString(this.getFormControlValue("marketing_tool"))
    );
    fd.append(
      "allow_khata",
      this.boolToString(this.getFormControlValue("allow_khata"))
    );
    fd.append(
      "module_config",
      this.boolToString(this.getFormControlValue("module_config"))
    );
    fd.append(
      "chat_module",
      this.boolToString(this.getFormControlValue("chat_module"))
    );
    fd.append(
      "livetracking",
      this.boolToString(this.getFormControlValue("livetracking"))
    );
    fd.append("pwa", this.boolToString(this.getFormControlValue("pwa")));
    fd.append(
      "refund_module",
      this.boolToString(this.getFormControlValue("refund_module"))
    );
    fd.append(
      "stock_mgmt",
      this.boolToString(this.getFormControlValue("stock_mgmt"))
    );
    fd.append(
      "pos_module",
      this.boolToString(this.getFormControlValue("pos_module"))
    );
    fd.append(
      "picker_module",
      this.boolToString(this.getFormControlValue("picker_module"))
    );
    fd.append(
      "dinein_module",
      this.boolToString(this.getFormControlValue("dinein_module"))
    );
    fd.append(
      "visualization_module",
      this.boolToString(this.getFormControlValue("visualization_module"))
    );

    //fifth accordian data (completed)
    fd.append("khata_label", this.getFormControlValue("khata_label"));
    fd.append(
      "deliveryboy_label",
      this.getFormControlValue("deliveryboy_label")
    );
    fd.append("pincode_label", this.getFormControlValue("pincode_label"));
    fd.append("store_tax_label", this.getFormControlValue("store_tax_label"));
    fd.append("store_label", this.getFormControlValue("store_label"));

    // sixth accordian data(keys) (done) (null values ask if undefined)
    fd.append("google_map_key_new", this.getFormControlValue("google_map_key"));
    fd.append("fcm_key", this.getFormControlValue("fcm_key"));
    fd.append(
      "payment_gateway_type",
      this.getFormControlValue("selectedPaymentGateway")
    );
    fd.append(
      "payment_gateway_url",
      this.getFormControlValue("payment_gateway_url")
    ); // sending null if empty
    fd.append(
      "payment_gateway_id",
      this.getFormControlValue("payment_gateway_id")
    );
    fd.append(
      "payment_gateway_key",
      this.getFormControlValue("payment_gateway_key")
    );
    fd.append(
      "online_payment_max_order",
      this.getFormControlValue("online_payment_max_order")
    );

    //seventh accordian data (email config) (done)
    var email_smtp: any = {
      smtp_host: this.getFormControlValue("smtp_host"),
      smtp_username: this.getFormControlValue("smtp_username"),
      smtp_password: this.getFormControlValue("smtp_password"),
      smtp_from_email: this.getFormControlValue("smtp_from_email"),
      smtp_from_name: this.getFormControlValue("smtp_from_name"),
      smtp_port: this.getFormControlValue("smtp_port"),
      smtp_reply_to: this.getFormControlValue("smtp_reply_to"),
      smtp_reply_name: this.getFormControlValue("smtp_reply_name"),
    };
    fd.append("contact_email", this.getFormControlValue("contact_email"));
    fd.append("email_smtp", JSON.stringify(email_smtp));
    fd.append("email_header", this.getFormControlValue("email_header"));
    fd.append(
      "email_footer_customer",
      this.getFormControlValue("email_footer_customer")
    );
    fd.append(
      "email_footer_business",
      this.getFormControlValue("email_footer_business")
    );

    //eighth Accordion (style) (done)
    fd.append("css_footer", this.getFormControlValue("css_footer"));
    fd.append("css_footer_font", this.getFormControlValue("css_footer_font"));
    fd.append(
      "css_button_customer_default",
      this.getFormControlValue("css_button_customer_default")
    );
    fd.append(
      "css_button_customer_default_font",
      this.getFormControlValue("css_button_customer_default_font")
    );
    fd.append(
      "css_button_customer_hover",
      this.getFormControlValue("css_button_customer_hover")
    );
    fd.append(
      "css_button_customer_hover_font",
      this.getFormControlValue("css_button_customer_hover_font")
    );
    fd.append(
      "default_rating_color_code_bg",
      this.getFormControlValue("default_rating_color_code_bg")
    );
    fd.append(
      "default_rating_color_code_text",
      this.getFormControlValue("default_rating_color_code_text")
    );
    fd.append(
      "show_rating_different_color_code",
      this.getFormControlValue("show_rating_different_color_code")
    );
    fd.append(
      "alternate_color_code_bg",
      this.getFormControlValue("alternate_color_code_bg")
    );
    fd.append(
      "alternate_color_code_text",
      this.getFormControlValue("alternate_color_code_text")
    );
    fd.append(
      "css_button_business_default",
      this.getFormControlValue("css_button_business_default")
    );
    fd.append(
      "css_button_business_alternative",
      this.getFormControlValue("css_button_business_alternative")
    );
    fd.append(
      "css_button_business_font",
      this.getFormControlValue("css_button_business_font")
    );
    fd.append(
      "deliveryboy_btn_color",
      this.getFormControlValue("deliveryboy_btn_color")
    ); //
    fd.append(
      "deliveryboy_alter_btn_color",
      this.getFormControlValue("deliveryboy_alter_btn_color")
    ); //
    fd.append(
      "deliveryboy_font_color",
      this.getFormControlValue("deliveryboy_font_color")
    ); //
    fd.append(
      "css_button_pos_default",
      this.getFormControlValue("css_button_pos_default")
    );
    fd.append(
      "css_button_pos_alternative",
      this.getFormControlValue("css_button_pos_alternative")
    );
    fd.append(
      "css_button_pos_font",
      this.getFormControlValue("css_button_pos_font")
    );
    fd.append(
      "css_button_dinein_default",
      this.getFormControlValue("css_button_dinein_default")
    );
    fd.append(
      "css_button_dinein_alternative",
      this.getFormControlValue("css_button_dinein_alternative")
    );
    fd.append(
      "css_button_dinein_font",
      this.getFormControlValue("css_button_dinein_font")
    );
    fd.append("offer_color_code", this.colorCode.toString());

    //ninth accordian (Others)
    if (<HTMLInputElement>document.getElementById("area-input") != null) {
      var inputValue = (<HTMLInputElement>document.getElementById("area-input"))
        .value;
    }
    fd.append(
      "recommended_items_list",
      this.getFormControlValue("recommended_items_list")
    );
    fd.append(
      "top_selling_items_limit",
      this.getFormControlValue("top_selling_items_limit")
    );
    fd.append(
      "top_purchase_count",
      this.getFormControlValue("top_purchase_count")
    );
    fd.append(
      "abandon_cart_email",
      this.boolToString(this.getFormControlValue("abandon_cart_email"))
    );
    fd.append(
      "abandon_cart_hours",
      this.leftFillNum(this.getFormControlValue("abandon_cart_hour"), 2) + ":" + this.leftFillNum(this.getFormControlValue("abandon_cart_min"), 2)
    );

    fd.append(
      "chat_destroy_hours",
      this.leftFillNum(this.getFormControlValue("chat_destroy_hour"), 2) + ":" + this.leftFillNum(this.getFormControlValue("chat_destroy_min"), 2)
    );


    fd.append(
      "download_center_destroy_hours",
      this.leftFillNum(this.getFormControlValue("download_center_destroy_hour"), 2) + ":" + this.leftFillNum(this.getFormControlValue("download_center_destroy_min"), 2)
    );

    fd.append("livetracking_sec", this.getFormControlValue("livetracking_sec"));
    fd.append("pincode_length", this.getFormControlValue("pincode_length"));
    fd.append(
      "allow_alphanumeric_pincode",
      this.boolToString(this.getFormControlValue("allow_alphanumeric_pincode"))
    );
    fd.append("offer_validity", this.getFormControlValue("offer_validity"));
    fd.append("refund_validity", this.getFormControlValue("refund_validity"));
    fd.append(
      "show_billing_address",
      this.boolToString(this.getFormControlValue("show_billing_address"))
    );
    fd.append(
      "chat_notification_customer",
      this.boolToString(this.getFormControlValue("chat_notification_customer"))
    );
    fd.append(
      "chat_notification_seller",
      this.boolToString(this.getFormControlValue("chat_notification_seller"))
    );
    fd.append(
      "chat_notification_deliveryboy",
      this.boolToString(
        this.getFormControlValue("chat_notification_deliveryboy")
      )
    );
    fd.append(
      "use_google_map",
      this.boolToString(this.getFormControlValue("use_google_map"))
    );
    fd.append(
      "use_sms",
      this.boolToString(this.getFormControlValue("use_sms"))
    );
    fd.append(
      "is_pod_mandatory",
      this.boolToString(this.getFormControlValue("is_pod_mandatory"))
    );
    fd.append(
      "show_review_rating",
      this.boolToString(this.getFormControlValue("show_review_rating"))
    );
    fd.append(
      "show_store_business_hours",
      this.boolToString(this.getFormControlValue("show_store_business_hours"))
    );
    fd.append(
      "show_store_address",
      this.boolToString(this.getFormControlValue("show_store_address"))
    );
    fd.append(
      "show_out_of_stock_items",
      this.boolToString(this.getFormControlValue("show_out_of_stock_items"))
    );
    fd.append(
      "show_rating",
      this.boolToString(this.getFormControlValue("show_rating"))
    );
    fd.append(
      "show_price_same_font",
      this.boolToString(this.getFormControlValue("show_price_same_font"))
    );
    fd.append(
      "show_driver_item_detail",
      this.getFormControlValue("show_driver_item_detail")
    );
    fd.append(
      "show_driver_order_detail",
      this.getFormControlValue("show_driver_order_detail")
    );
    fd.append(
      "force_update_customer",
      this.boolToString(this.getFormControlValue("force_update_customer"))
    );
    fd.append(
      "current_app_version_customer",
      this.getFormControlValue("current_app_version_customer")
    ); // ''
    fd.append(
      "force_update_business",
      this.boolToString(this.getFormControlValue("force_update_business"))
    );
    fd.append(
      "current_app_version_business",
      this.getFormControlValue("current_app_version_business")
    ); // ''
    fd.append(
      "force_update_driver",
      this.boolToString(this.getFormControlValue("force_update_driver"))
    );
    fd.append(
      "force_update_pos_android",
      this.boolToString(this.getFormControlValue("force_update_pos_android"))
    );
    fd.append(
      "force_update_dinein_android",
      this.boolToString(this.getFormControlValue("force_update_dinein_android"))
    );
    fd.append(
      "force_update_business_ios",
      this.boolToString(this.getFormControlValue("force_update_business_ios"))
    );
    fd.append(
      "force_update_customer_ios",
      this.boolToString(this.getFormControlValue("force_update_customer_ios"))
    );
    fd.append(
      "force_update_driver_ios",
      this.boolToString(this.getFormControlValue("force_update_driver_ios"))
    );
    fd.append(
      "force_update_pos_ios",
      this.boolToString(this.getFormControlValue("force_update_pos_ios"))
    );
    fd.append(
      "force_update_dinein_ios",
      this.boolToString(this.getFormControlValue("force_update_dinein_ios"))
    );
    fd.append(
      "current_app_version_driver",
      this.getFormControlValue("current_app_version_driver")
    ); // ''
    fd.append(
      "current_app_version_pos_android",
      this.getFormControlValue("current_app_version_pos_android")
    ); // ''
    fd.append(
      "current_app_version_dinein_android",
      this.getFormControlValue("current_app_version_dinein_android")
    ); // ''
    fd.append(
      "current_app_version_business_ios",
      this.getFormControlValue("current_app_version_business_ios")
    ); // ''
    fd.append(
      "current_app_version_customer_ios",
      this.getFormControlValue("current_app_version_customer_ios")
    ); // ''
    fd.append(
      "current_app_version_driver_ios",
      this.getFormControlValue("current_app_version_driver_ios")
    ); // ''
    fd.append(
      "current_app_version_pos_ios",
      this.getFormControlValue("current_app_version_pos_ios")
    ); // ''
    fd.append(
      "current_app_version_dinein_ios",
      this.getFormControlValue("current_app_version_dinein_ios")
    ); // ''
    fd.append(
      "show_price_inclusive_tax",
      this.boolToString(this.getFormControlValue("show_price_inclusive_tax"))
    );
    fd.append(
      "show_price_inclusive_packaging",
      this.boolToString(
        this.getFormControlValue("show_price_inclusive_packaging")
      )
    );
    fd.append(
      "submit_order_before_online_payment_confirmation",
      this.boolToString(
        this.getFormControlValue(
          "submit_order_before_online_payment_confirmation"
        )
      )
    );
    fd.append("login_using", this.getFormControlValue("selectedLoginMethod"));
    fd.append(
      "item_approval_shop_type",
      this.commonConfiguration_form.value.storeType == null || this.commonConfiguration_form.value.storeType?.length == 0
        ? ''
        : this.commonConfiguration_form.value.storeType.toString()
    ); //Shop type which needs Item Approval By Platform
    fd.append(
      "customer_location_type",
      this.getFormControlValue("selectedCustomerLocation")
    ); //customer_location_type

    if (
      this.getFormControlValue("selectedCustomerLocation") == 2
    ) {
      fd.append(
        "customer_location_value", this.city_id_area_city);
    }

    if (
      this.getFormControlValue("selectedCustomerLocation") == 2 ||
      this.getFormControlValue("selectedCustomerLocation") == 3
    ) {
      fd.append(
        "default_location_text",
        this.getFormControlValue("default_location_text")
      );
    } else {
      if (inputValue) {
        fd.append("default_location_text", inputValue);
      } else {
        fd.append(
          "default_location_text",
          this.getFormControlValue("default_location_text")
        );
      }
    }

    fd.append("default_location_lat", this.latitude);
    fd.append("default_location_long", this.longitude);
    fd.append(
      "default_status_store_registration",
      this.getFormControlValue("selected_default_status_store")
    );
    fd.append(
      "show_customer_details_to_store",
      this.getFormControlValue("show_customer_details_to_store")
    );
    fd.append(
      "refund_voucher_applicable_on",
      this.getFormControlValue("refund_voucher_applicable_on")
    );
    fd.append(
      "check_deliveryboy_before_order",
      this.boolToString(
        this.getFormControlValue("check_deliveryboy_before_order")
      )
    );
    fd.append(
      "deliveryboy_criteria",
      this.getFormControlValue("deliveryboy_criteria")
    );
    fd.append(
      "picker_order_display",
      this.getFormControlValue("orderStatusIds")?.toString()
    );
    fd.append(
      "picker_order_categories",
      this.getFormControlValue("selected_picker_order_categories")
    );
    fd.append(
      "items_displayed_variant",
      this.boolToString(this.getFormControlValue("items_displayed_variant"))
    );
    fd.append("item_tax_type", this.getFormControlValue("item_tax_type"));
    fd.append(
      "tax_calculation_address",
      this.getFormControlValue("tax_calculation_address")
    );
    fd.append(
      "tax_recalculation_offer",
      this.boolToString(this.getFormControlValue("tax_recalculation_offer"))
    );
    fd.append(
      "show_save_item",
      this.getFormControlValue("selected_show_save_item")
    ); //
    fd.append(
      "search_bar_at_top",
      this.boolToString(this.getFormControlValue("search_bar_at_top"))
    );
    fd.append(
      "order_allowed_update_statuses",
      this.getFormControlValue("orderDuringStatusIds")?.toString()
    );
    fd.append(
      "stock_order_update_status",
      this.getFormControlValue("stock_order_update_status")?.toString()
    );
    fd.append(
      "payment_hold_process_accepted",
      this.boolToString(
        this.getFormControlValue("payment_hold_process_accepted")
      )
    );
    fd.append(
      "allow_order_tip",
      this.boolToString(this.getFormControlValue("allow_order_tip"))
    );
    fd.append(
      "order_process_on_less_stock",
      this.boolToString(this.getFormControlValue("order_process_on_less_stock"))
    );
    fd.append("order_no_format", this.getFormControlValue("order_no_format"));
    fd.append(
      "express_delivery_order_no_format",
      this.getFormControlValue("express_delivery_order_no_format")
    );
    fd.append(
      "pickup_order_no_format",
      this.getFormControlValue("pickup_order_no_format")
    );
    fd.append(
      "pos_order_no_format",
      this.getFormControlValue("pos_order_no_format")
    );
    fd.append(
      "dinein_order_no_format",
      this.getFormControlValue("dinein_order_no_format")
    );
    fd.append(
      "payment_order_no_format",
      this.getFormControlValue("payment_order_no_format")
    );
    fd.append("refund_no_format", this.getFormControlValue("refund_no_format"));
    fd.append(
      "cancellation_order_no_format",
      this.getFormControlValue("cancellation_order_no_format")
    );
    if (this.SelectedFile != undefined || this.SelectedFile == '0') {
      fd.append("eatery_import_file", this.SelectedFile);
    }
    if (this.SelectedFileNonEat != undefined || this.SelectedFileNonEat == '0') {
      fd.append("non_eatery_import_file", this.SelectedFileNonEat);
    }
    if (this.SelectedFileRefund != undefined || this.SelectedFileRefund == '0') {
      fd.append("refund_manual", this.SelectedFileRefund);
    }
    fd.append("password", item.pas);
    fd.append("user_id", this.userData.user_id);
    this.commonConfigurationServices.manageGlobalSettings(fd).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(response.message)
          item.model.dismiss();
          location.reload();
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => { },
    });
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      // backdrop: "static",
      // keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '31'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '31'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '31'
    }
    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  omit_special_char(event) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    // return (this.doubleDigit((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)));
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
  }

  validateShadowMinMaxValue() {
    return (control: AbstractControl) => {
      if (control.value) {
        var minute = control.value.split(" ")
        for (var i = 0; i < minute.length; i++) {
          var num = parseInt(minute[i], 10);
          if (num > 59) {
            return { greaterThan: true };
          }
        }
        return null;
      }
      return null; // Validation successful
    };
  }

  async downloadConfig() {
    this.spinner.show()
    var data = {
      type: 1
    }
    await this.commonConfigurationServices.downloadGlobalSetting(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          setTimeout(() => {
            this.spinner.show()
          }, 500);
          setTimeout(() => {
            window.open(response.data.zipFileUrl)
            this.spinner.hide()
          }, 5000);
          this.toastr.success(response.message)
          this.spinner.show()
        } else {
          this.spinner.hide()
          this.toastr.error(response.message)
        }
      },
      error: (error) => {
        this.spinner.hide()
      },
      complete: () => {
        console.log("completed")
      },
    });
  }

  leftFillNum(num, targetLength) {
    return num.toString().padStart(targetLength, '0');
  }

  ngOnDestroy() {
    localStorage.removeItem("pannel_id")
    $(
      "<style>button.accordion-button.ng-star-inserted { background-color: " +
      this.generalSetting.css_button_business_default +
      " !important;border-color: " +
      this.generalSetting.css_button_business_default +
      " !important; border-radius:5px 5px 0px 0px !important;} </style>"
    ).appendTo("body");
  }
}

