import { Component } from "@angular/core";
import * as CryptoJS from "crypto-js";
import { UsersService } from "src/app/services/users.service";
import { Router, RoutesRecognized } from "@angular/router";
import * as $ from "jquery";
import { CommonService } from "./services/common.service";
import { UserRoles } from "./enums/user-roles";
import { filter, pairwise } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { MessagingService } from "./push-notification-service/messaging-service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  PlatformSetting: any;
  business_model: any;
  isOrderBalanceShowPlatForm: boolean;
  text: any = '&#127829;&#127829;&#127829;&#127829;&#127829;&#127829;&#127829;&#127829;&#127829;&#127829;&#127829;&#127829;&#127829;&#127829;&#127829;'
  styleObj: any;
  constructor(
    private toastr: ToastrService,
    private router: Router,
    public commonService: CommonService,
    private translate: TranslateService,
    private messagingService: MessagingService
  ) {
    router.events
      .pipe(
        filter((evt: any) => evt instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((events: RoutesRecognized[]) => {
        localStorage.setItem("Previous_URL", events[0].urlAfterRedirects);
        window.scroll({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      });
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }
  title = "argon-dashboard-angular";
  main: any;
  userRolesEnum = UserRoles;
  message: any;
  ngOnInit() {
    localStorage.setItem('sidebarOpen', 'false');
    this.messagingService.requestPermission();
    this.messagingService.receiveMessaging();
    this.message = this.messagingService.currentMessage;
    this.getCommonConfigurationDetails();
    this.main = {
      Token: "",
      ActivationKey: "",
      LiveMapUrl:
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyAhTBsfWHTaMfq7Ta9SRgnL48ddzAPfMpQ&callback=initMap",
      LiveMapKey: "AIzaSyAhTBsfWHTaMfq7Ta9SRgnL48ddzAPfMpQ",
      LocalMapKey: "AIzaSyBl7e1RZLvPc7IJ1qk7spYzq1wRmQm-46o",
      LoggedUserInfo: [],
      LanguageList: [],
      SelectedLang: "",
      IsloggedIn: false,
      page_title_tooltip: [],
      DateFormate: "DD-MM-YYYY",
      DateFormateSmall: "dd-MM-yyyy",
      UserRole: this.userRolesEnum,
      PreferedLanguageList: [
        { language_id: 1, language_name: "Deutsch", language_code: "DE" },
        { language_id: 2, language_name: "English", language_code: "EN" },
      ],
      Source: "web",
      CryptoKey: "localyapp",
      AllItems: "1000000000",
      ItemsPerPage: "20",
      ItemsPerPages: [
        { id: "5", name: "5" },
        { id: "10", name: "10" },
        { id: "20", name: "20" },
        { id: "50", name: "50" },
        { id: "100", name: "100" },
        { id: "1000000000", name: "ALL" },
      ],
      RecordWithIssueItemsPerPage: "10",
      RecordWithIssueItemsPerPages: [
        { id: "5", name: "5" },
        { id: "10", name: "10" },
        { id: "20", name: "20" },
        { id: "50", name: "50" },
        { id: "100", name: "100" },
        { id: "1000000000", name: "ALL" },
      ],

      platform_name: "Lokaly",
      platform_slogan: "Buy Locally, By Lokaly",
      platform_page_title:
        "Food, Restaurants, Grocery, Fruits, Vegetables & more. Buy Locally, By Lokaly | Lokaly Order Karo!!",
      contact_email: "business@lokaly.in",
      logo: "https://apitest.lokaly.in/uploads/store/logo/platform_logo.svg",
      favicon_icon:
        "https://apitest.lokaly.in/uploads/store/favicon_icon/image-2088522258-.ico",
      mobile_logo:
        "https://apitest.lokaly.in/uploads/store/mobile_logo/image-1851887588-.svg",
      logo_black_white:
        "https://apitest.lokaly.in/uploads/store/logo_black_white/image-86920729-.png",
      currency_name: "US Dollar",
      currency_short_name: "USD",
      currency_symbol: "$",
      delivery_radius_type: "KM",
      delivery_radius: "10",
      date_format: "dd-MM-yyyy HH:mm:ss",
      khata_label: "Credit Account",
      deliveryboy_label: "Rider",
      css_color: "",
      font_face: "null",
      customer_app_url_android:
        "https://play.google.com/store/apps/details?id=com.lokaly.customer",
      business_app_url_android:
        "https://play.google.com/store/apps/details?id=com.lokaly.business",
      pos_app_url_android: "null",
      customer_app_url_ios:
        "https://itunes.apple.com/us/app/lokaly-buy-locally-by-lokaly/id1457312656?ls=1&mt=8",
      business_app_url_ios:
        "https://itunes.apple.com/us/app/lokaly-business/id1457310858?ls=1&mt=8",
      pos_app_url_ios: "null",
      driver_app_url_android: "",
      driver_app_url_ios: "",
      driver_app_short_link: "",
      pos_app_short_link: "null",
      website_url: "https://shoptest.lokaly.in",
      faq_link: "https://www.lokaly.in/faq",
      timezone: "Asia/Kolkata",
      chat_module: 1,
      allow_khata: 1,
      allow_wholeseller: 1,
      livetracking: 1,
      livetracking_sec: "180",
      default_location_text: "Mumbai Mumbai MH IN  ",
      default_location_lat: "19.0759837",
      default_location_long: "72.8776559",
      country: "101,231",
      google_map_key: "AIzaSyCgrh6LueaEKfpoobObglbr0X6vlXPhouw",
      footer_copyright: "© Copyright 2021 www.lokaly.in | All Right Reserved",
      css_footer: "#000000",
      css_footer_font: "#ffffff",
      css_button_customer_default: "#C10230",
      css_button_customer_default_font: "#ffffff",
      css_button_customer_hover: "#F1DBDD",
      css_button_customer_hover_font: "#000000",
      css_button_business_default: "#24C9FC",
      css_button_business_alternative: "#AEDEFF",
      default_rating_color_code_bg: "#3f0a8f",
      default_rating_color_code_text: "#b7fbd1",
      css_button_business_font: "#ffffff",
      css_button_pos_default: "#0400ff",
      css_button_pos_alternative: "#0c8825",
      css_button_pos_font: "#ffffff",
      pincode_label: "Zipcode",
      pincode_length: 6,
      allow_alphanumeric_pincode: 0,
      fcm_key:
        "***REMOVED_FCM_SERVER_KEY***",
      payment_gateway_id: "5V6phAIIUJ9aBlNaxtuNTVMb",
      payment_gateway_key: "rzp_test_exL9YiGT4kVoiE",
      terms_of_use_url: "https://business.lokaly.in/terms-of-use/",
      store_tax_label: "GST",
      business_app_short_link: "https://cutt.ly/ajRiRDN",
      customer_app_short_link: "https://cutt.ly/ijRiQ8A",
      show_billing_address: 1,
      chat_notification_customer: 1,
      chat_notification_seller: 1,
      chat_notification_deliveryboy: 1,
      refund_module: 1,
      eatery_module: 1,
      giftcard_module: 1,
      driver_module: 1,
      is_pod_mandatory: 1,
      use_google_map: 1,
      use_sms: 1,
      login_using: 1,
      payment_gateway_type: 1,
      item_approval_shop_type: "21,22,23,24,7,8",
      stock_mgmt: 0,
      wishlist: 1,
      customer_location_type: 1,
      customer_location_value: "380015",
      pwa: 1,
      about_platform:
        "Lokaly is the App for you as a Seller to avail the maximum benefit of the Digital India movement. Using this App, you will start a journey with your trusted Buyers and create the WOW factor for them. Your business operations will surge towards a structured and simpler approach to relationship building a beat the competition. The Lokaly App will show you early returns on the investment and that is the key to digital business process today!",
      offer_color_code: "#F6AF33,#99C33D,#735797",
      marketing_tool: 1,
      review_rating_module: "1",
      show_review_rating: "1",
      offer_validity: "180",
      refund_validity: "2",
      business_splash_screen:
        "https://apitest.lokaly.in/uploads/store/splash_screen/business_splash.jpg",
      business_help_screen_1:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-282904949-1205.jpg",
      business_help_screen_2:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-1489869585-1205.jpg",
      business_help_screen_3:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-998520968-1205.jpg",
      business_help_screen_4: "",
      customer_splash_screen:
        "https://apitest.lokaly.in/uploads/store/splash_screen/customer_splash.jpg",
      customer_help_screen_1:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-740332923-1205.jpg",
      customer_help_screen_2:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-1840959544-1205.jpg",
      customer_help_screen_3:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-2107276639-1205.jpg",
      customer_help_screen_4:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-1621194434-1205.gif",
      deliveryboy_splash_screen:
        "https://apitest.lokaly.in/uploads/store/splash_screen/driver_splash.jpg",
      deliveryboy_help_screen_1:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-1467306721-1205.jpg",
      deliveryboy_help_screen_2:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-346080384-1205.jpg",
      deliveryboy_help_screen_3:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-2019452993-1205.jpg",
      deliveryboy_help_screen_4: "",
      pos_splash_screen:
        "https://apitest.lokaly.in/uploads/store/splash_screen/pos_splash.jpg",
      pos_help_screen_1:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-487373579-1205.jpeg",
      pos_help_screen_2:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-1354236521-1205.jpeg",
      pos_help_screen_3:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-1756369548-1205.jpeg",
      pos_help_screen_4:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-1874402618-1205.jpeg",
      whats_new_pos: "",
      customer_loading_screen:
        "https://apitest.lokaly.in/uploads/store/help_screens/image-241690208-1205.gif",
      show_store_business_hours: 1,
      show_store_address: 1,
      store_label: "Store",
      online_payment_max_order: 100,
      top_purchase_count: 200,
      order_no_format: "{OD}{{DDmmyy}}{{SID}}{{{0001}}}",
      payment_order_no_format: "{PE}{{DDmmyy}}{{SID}}{{{56897}}}",
      refund_no_format: "ODMMYYDD003",
      cancellation_order_no_format: "ODMMYYDD005",
      eatery_import_file:
        "https://apitest.lokaly.in/uploads/store/import_items/file-43008469-1205.xlsx",
      non_eatery_import_file:
        "https://apitest.lokaly.in/uploads/store/import_items/https://apitest.lokaly.in/uploads/store/import_items/file-43008469-1205.xlsx",
      refund_manual:
        "https://apitest.lokaly.in/uploads/store/import_items/Lokaly_Refund_Manual_v1.0.pdf",
      payment_gateway_url: "null",
      offers_module: 1,
      deliveryboy_btn_color: "",
      deliveryboy_alter_btn_color: "",
      deliveryboy_font_color: "",
      show_out_of_stock_items: 1,
      show_rating: 1,
      show_price_same_font: 1,
      show_driver_order_detail: 3,
      show_driver_item_detail: 1,
      force_update_customer: 0,
      current_app_version_customer: "",
      force_update_business: 0,
      current_app_version_business: "",
      force_update_driver: 0,
      current_app_version_driver: "",
      show_price_inclusive_tax: 1,
      show_price_inclusive_packaging: 1,
      submit_order_before_online_payment_confirmation: 1,
      webadmin_url: "https://watest.lokaly.in/",
      default_status_store_registration: "0",
      show_customer_details_to_store: "1",
      refund_voucher_applicable_on: "1",
      show_rating_different_color_code: 4,
      alternate_color_code_bg: "#540303",
      alternate_color_code_text: "#f2eb07",
      subscription_model: 1,
      delivery_model: 1,
      business_model: 1,
      store_display_model: 1,
      delivery_business: 3,
      customer_buying: 1,
      item_display: 1,
      offer_settings: 1,
      date_format_web: "DD-MM-YYYY HH:mm:ss",
      country_codes: "IN,US",
      store_areas: [],
      allow_wallet: 0,
      platform_setting: {
        business_model: 1,
        customer_buying: 1,
        delivery_business: 1,
        delivery_model: 1,
        item_display: 1,
        offer_settings: 1,
        store_display_model: 1,
        subscription_model: 1,
      },
      tax_calculation_address: 1,
      item_tax_type: 1,
    };
    return {
      main: this.main,
    };
  }

  getCommonConfigurationDetails = function () {
    this.commonService.getCommonConfigurationDetails().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.main = response.data;
          this.main.UserRole = this.userRolesEnum;
            this.main.CryptoKey = "localyapp";
          var loginUser: any = localStorage.getItem("loginUser") ? localStorage.getItem("loginUser") : '';
          this.main.LoggedUserInfo = loginUser ? JSON.parse(loginUser) : [];
          this.main.LoggedUserStoreInfo = localStorage.getItem("loginUserStore");
          this.GetPlatFormSetting();
          this.styleObj = {
            "--css_button_business_default": response.data.css_button_business_default,
            "--css_button_business_font": response.data.css_button_business_font,
            "--css_button_business_alternative": response.data.css_button_business_alternative,
            "--default_rating_color_code_text": response.data.default_rating_color_code_text,
            "--default_rating_color_code_bg": response.data.default_rating_color_code_bg,
            "--alternate_color_code_text": response.data.alternate_color_code_text,
            "--alternate_color_code_bg": response.data.alternate_color_code_bg
          }

          $(
            "<style>.accordion-item { box-shadow:0 5px 5px 0 rgba(0, 0, 0, 0.25) !important}</style>"
          ).appendTo("body");
          $("#favicon").attr("href", response.data.favicon_icon);
          $("title").text(response.data.platform_page_title);
          $(".termsOfUse").attr("href", response.data.terms_of_use_url);
          $(".copyright").children("p").text(response.data.footer_copyright);
          localStorage.setItem(
            "LoggedUserSettings",
            JSON.stringify(response.data)
          );
          $("#LoginPageLogo").attr("src", response.data.logo);
          $("#LoginPageLogoSideMenu").attr("src", response.data.logo);
          this.main.DateFormate = response.data.date_format_web;

          document.documentElement.style.setProperty('--some-var', response.data.css_button_business_default);
          document.documentElement.style.setProperty('--font', response.data.css_button_business_font);

          //   .bg-gradient-danger {
          //     background: linear-gradient(87deg, #f5365c 0, #f56036 100%) !important;
          // }
          $(
            "<style>a.fc-timegrid-event.fc-v-event.fc-event.fc-event-start.fc-event-end.fc-event-future { border:none!important}</style>"
          ).appendTo("body");
          $(
            "<style>a.fc-timegrid-event.fc-v-event.fc-event.fc-event-start.fc-event-end.fc-event-past { border:none!important}</style>"
          ).appendTo("body");

          $(
            "<style>button.fc-dayGridMonth-button.fc-button.fc-button-primary.fc-button-active { background-color: " +
            response.data.css_button_business_default +
            " !important; color:" + response.data?.css_button_business_font + "!important;border:none!important }</style>"
          ).appendTo("body");
          $(
            "<style>button.fc-timeGridWeek-button.fc-button.fc-button-primary.fc-button-active { background-color: " +
            response.data.css_button_business_default +
            " !important; color:" + response.data?.css_button_business_font + "!important;border:none!important }</style>"
          ).appendTo("body");
          $(
            "<style>button.fc-timeGridDay-button.fc-button.fc-button-primary.fc-button-active { background-color: " +
            response.data.css_button_business_default +
            " !important; color:" + response.data?.css_button_business_font + "!important;border:none!important }</style>"
          ).appendTo("body");
          $(
            "<style>button.fc-next-button.fc-button.fc-button-primary { background-color: " +
            response.data.css_button_business_default +
            " !important; color:" + response.data?.css_button_business_font + "!important;border:none!important }</style>"
          ).appendTo("body");
          $(
            "<style>button.fc-today-button.fc-button.fc-button-primary { background-color: " +
            response.data.css_button_business_default +
            " !important; color:" + response.data?.css_button_business_font + "!important;border:none!important }</style>"
          ).appendTo("body");
          $(
            "<style>button.fc-prev-button.fc-button.fc-button-primary { background-color: " +
            response.data.css_button_business_default +
            " !important; color:" + response.data?.css_button_business_font + "!important;border:none!important }</style>"
          ).appendTo("body");
          $(
            "<style>.fc .fc-button-primary { background-color: " +
            response.data.css_button_business_alternative +
            " !important; color:" + response.data?.css_button_business_font + "!important;border:none!important }</style>"
          ).appendTo("body");
          $(
            "<style>.header.bg-gradient-danger { background: linear-gradient(87deg," +
            response.data.css_button_business_default +
            " 0," +
            response.data.css_button_business_alternative +
            " 100%)!important;}</style>"
          ).appendTo("body");
          $(
            "<style>.top-nav { background: linear-gradient(87deg," +
            response.data.css_button_business_default +
            " 0," +
            response.data.css_button_business_alternative +
            " 100%)!important;}</style>"
          ).appendTo("body");
          $(
            "<style>.sa-confirm-button-container .confirm { color: " +
            response.data?.css_button_business_font +
            " !important;background-color: " +
            response.data.css_button_business_default +
            " !important;border-color: " +
            response.data.css_button_business_default +
            " !important; }</style>"
          ).appendTo("body");
          $(".globleSVGColorButtonChnage svg path").css({
            fill: response.data?.css_button_business_font,
          });
          $(
            "<style>.nav.nav-tabs > li.active > a { border-top: 2px solid " +
            response.data.css_button_business_default +
            " !important;}</style>"
          ).appendTo("body");
          $(
            "<style>.nav-tabs .nav-link.active { border-top: 2px solid " +
            response.data.css_button_business_default +
            " !important;}</style>"
          ).appendTo("body");
          $(
            "<style>li.current.ng-star-inserted { background-color: " +
            response.data.css_button_business_default +
            " !important;}</style>"
          ).appendTo("body");
          $(
            "<style>button.accordion-button.ng-star-inserted { background-color: " +
            response.data.css_button_business_default +
            " !important;border-color: " +
            response.data.css_button_business_default +
            " !important; }</style>"
          ).appendTo("body");
          $(".defaultRatingColor svg path").css({
            fill: response.data.default_rating_color_code_text,
          });
          $(".defaultRatingColor svg circle").css({
            fill: response.data.default_rating_color_code_text,
          });
          $(".alternateRatingColor svg path").css({
            fill: response.data.alternate_color_code_text,
          });
          $(".alternateRatingColor svg circle").css({
            fill: response.data.alternate_color_code_text,
          });

          $(
            "<style>.ngx-slider-selection {background: " +
            response.data.css_button_business_default +
            " !important; }" +
            ".ngx-slider-pointer {background-color: " +
            response.data.css_button_business_default +
            " !important; }" +
            "</style>"
          ).appendTo("body");
          this.show_rating_different_color_code =
            response.data.show_rating_different_color_code;
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
      },
    });
  };

  GetPlatFormSetting() {
    this.commonService.getPlatformSettings().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.main.platform_setting = response.data;
          this.PlatformSetting = JSON.parse(
            localStorage.getItem("_platform_setting")
          );
          this.PlatformSetting =
            this.PlatformSetting == null
              ? this.main.platform_setting
              : this.PlatformSetting;
          this.business_model = this.PlatformSetting.business_model;
          if (this.business_model == 3) {
            this.isOrderBalanceShowPlatForm =
              this.business_model == 1
                ? true
                : this.business_model == 2
                  ? true
                  : false;
            this.isOrderBalanceShowPlatForm =
              this.main.LoggedUserInfo.role_id == 6 ? true : this.isOrderBalanceShowPlatForm;
          }
          localStorage.setItem(
            "_platform_setting",
            JSON.stringify(response.data)
          );
        } else {

          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        // handle error

      },
      complete: () => {


      },
    });
  }

  sessionConfig() {
    // isLogin Set Get Clear
    var getSessionLogin = function () {
      var isLogin = "";
      if (typeof Storage !== "undefined") {
        isLogin = localStorage.getItem("isLogin");
      } else {
        // Sorry! No Web Storage support..
        isLogin = getCookie("isLogin");
      }
      return isLogin;
    };
    var setSessionLogin = function (isLogin) {
      if (typeof Storage !== "undefined") {
        localStorage.setItem("isLogin", isLogin);
      } else {
        // Sorry! No Web Storage support..
        setCookie("isLogin", isLogin, 365);
      }
    };
    var clearSessionLogin = function () {
      localStorage.removeItem("isLogin");
      var fcm_token = localStorage.getItem("fcmToken");
      var deviceId = localStorage.getItem("deviceId");
      var LoggedUserSettings = localStorage.getItem("LoggedUserSettings");
      localStorage.clear();
      localStorage.setItem("fcmToken", fcm_token);
      localStorage.setItem("deviceId", deviceId);
      localStorage.setItem("LoggedUserSettings", LoggedUserSettings);
    };

    // Token Set Get Clear
    var setSessionToken = function (token) {
      if (typeof Storage !== "undefined") {
        localStorage.setItem("accessToken", token);
      } else {
        // Sorry! No Web Storage support..
        setCookie("accessToken", token, 365);
      }
    };

    var getSessionToken = function () {
      var token = "";
      if (typeof Storage !== "undefined") {
        token = localStorage.getItem("accessToken");
      } else {
        // Sorry! No Web Storage support..
        token = getCookie("accessToken");
      }
      return token;
    };

    var getSessionDeviceId = function () {
      var deviceId = "";
      if (typeof Storage !== "undefined") {
        deviceId = localStorage.getItem("deviceId");
      } else {
        // Sorry! No Web Storage support..
        deviceId = getCookie("deviceId");
      }
      return deviceId;
    };

    var clearSessionToken = function () {
      if (typeof Storage !== "undefined") {
        localStorage.removeItem("accessToken");
      } else {
        // Sorry! No Web Storage support..
        setCookie("accessToken", "", 0);
      }
    };

    // Login user Set Get Clear
    var getSessionLoginUser = function () {
      var loginUser = new Object();
      if (typeof Storage !== "undefined") {
        loginUser = localStorage.getItem("loginUser");
      } else {
        // Sorry! No Web Storage support..
        loginUser = getCookie("loginUser");
      }
      return JSON.parse(JSON.stringify(loginUser));
    };

    var setSessionLoginUser = function (loginUser) {
      if (typeof Storage !== "undefined") {
        localStorage.setItem("loginUser", JSON.stringify(loginUser));
        localStorage.setItem("isSessionLogout", "false");
      } else {
        // Sorry! No Web Storage support..
        setCookie("loginUser", loginUser, 365);
      }
    };

    var clearSessionLoginUser = function () {
      if (typeof Storage !== "undefined") {
        localStorage.removeItem("loginUser");
      } else {
        // Sorry! No Web Storage support..
        setCookie("loginUser", new Object(), 0);
      }
    };

    // Login user Store Set Get Clear
    var getSessionLoginUserStore = function () {
      var loginUserStore = new Object();
      if (typeof Storage !== "undefined") {
        loginUserStore = localStorage.getItem("loginUserStore");
      } else {
        // Sorry! No Web Storage support..
        loginUserStore = getCookie("loginUserStore");
      }
      return JSON.parse(JSON.stringify(loginUserStore));
    };

    var setSessionLoginUserStore = function (loginUserStore) {
      if (typeof Storage !== "undefined") {
        localStorage.setItem("loginUserStore", JSON.stringify(loginUserStore));
        localStorage.setItem("isSessionLogout", "false");
      } else {
        // Sorry! No Web Storage support..
        setCookie("loginUserStore", loginUserStore, 365);
      }
    };

    var clearSessionLoginUserStore = function () {
      if (typeof Storage !== "undefined") {
        localStorage.removeItem("loginUserStore");
      } else {
        // Sorry! No Web Storage support..
        setCookie("loginUserStore", new Object(), 0);
      }
    };

    // Language  Set Get Clear
    var getSessionLanguageList = function () {
      var languageList = new Object();
      if (typeof Storage !== "undefined") {
        languageList = localStorage.getItem("languageList");
      } else {
        // Sorry! No Web Storage support..
        languageList = getCookie("languageList");
      }
      return JSON.parse(JSON.stringify(languageList));
    };

    var setSessionLanguageList = function (languageList) {
      if (typeof Storage !== "undefined") {
        localStorage.setItem("languageList", JSON.stringify(languageList));
      } else {
        // Sorry! No Web Storage support..
        setCookie("languageList", languageList, 365);
      }
    };

    var clearSessionLanguageList = function () {
      if (typeof Storage !== "undefined") {
        localStorage.removeItem("languageList");
      } else {
        // Sorry! No Web Storage support..
        setCookie("languageList", new Object(), 0);
      }
    };

    var clearCookie = function (name) {
      setCookie(name, new Object(), 0);
    };

    function deleteAllCookies() {
      var cookies = document.cookie.split(";");

      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }

    var encryptIdValue = function (val, cookiename, key) {
      var encryption = CryptoJS.AES.encrypt(val, key).toString();
      setCookie(cookiename, encryption, 365);
    };

    var decryptIdValue = function (cookiename, key) {
      var val = getCookie(cookiename);
      if (val != "") {
        var decryption = CryptoJS.AES.decrypt(val, key).toString(
          CryptoJS.enc.Utf8
        );
        return decryption;
      }
      return undefined;
    };

    // Cookie Set Get
    function getCookie(cname) {
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1);
        if (c.indexOf(cname) == 0) return c.split("=")[1];
      }
      return "";
    }

    function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      var expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    return {
      getSessionLogin: getSessionLogin,
      setSessionLogin: setSessionLogin,
      clearSessionLogin: clearSessionLogin,

      getSessionToken: getSessionToken,
      getSessionDeviceId: getSessionDeviceId,
      setSessionToken: setSessionToken,
      clearSessionToken: clearSessionToken,

      getSessionLoginUser: getSessionLoginUser,
      setSessionLoginUser: setSessionLoginUser,
      clearSessionLoginUser: clearSessionLoginUser,

      getSessionLoginUserStore: getSessionLoginUserStore,
      setSessionLoginUserStore: setSessionLoginUserStore,
      clearSessionLoginUserStore: clearSessionLoginUserStore,

      getSessionLanguageList: getSessionLanguageList,
      setSessionLanguageList: setSessionLanguageList,
      clearSessionLanguageList: clearSessionLanguageList,

      encryptIdValue: encryptIdValue,
      decryptIdValue: decryptIdValue,
      clearCookie: clearCookie,
      deleteAllCookies: deleteAllCookies,
    };
  }
}
