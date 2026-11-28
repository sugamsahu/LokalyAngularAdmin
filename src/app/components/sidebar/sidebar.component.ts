import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { renew_licenseComponent } from "src/app/modules/pages-module/model/renew-license/renew-license.component";
import { CategoryService } from "src/app/services/lookup/category.service";
import { BusinessModel } from "src/app/enums/business-model";
import { UserRoles } from "src/app/enums/user-roles";
import { DeliveryModel } from "src/app/enums/delivery-model";
import { OfferSettlingModel } from "src/app/enums/offer-setting-model";
import { SubscriptionModel } from "src/app/enums/subscription-model";
import { OrderSettingModel } from "src/app/enums/order-setting-model";
import { ItemService } from "src/app/services/item.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { CommonService } from "src/app/services/common.service";
import { Subject, takeUntil } from "rxjs";
import { NgEventBus } from "ng-event-bus";
import { SpinnerService } from "src/app/services/custom/spinner.service";
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: "ni-tv-2 text-primary",
    class: "",
  },
  { path: "/icons", title: "Icons", icon: "ni-planet text-blue", class: "" },
  { path: "/maps", title: "Maps", icon: "ni-pin-3 text-orange", class: "" },
  {
    path: "/user-profile",
    title: "User profile",
    icon: "ni-single-02 text-yellow",
    class: "",
  },
  {
    path: "/tables",
    title: "Tables",
    icon: "ni-bullet-list-67 text-red",
    class: "",
  },
  { path: "/login", title: "Login", icon: "ni-key-25 text-info", class: "" },
  {
    path: "/register",
    title: "Register",
    icon: "ni-circle-08 text-pink",
    class: "",
  },
];
export var isCollapsed = "flase";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit, AfterContentInit, OnDestroy {
  private destroy$ = new Subject();
  public menuItems: any[];
  public isCollapsed = true;
  main: any;
  subscriptionDetails = JSON.parse(localStorage.getItem("subscriptionDetails"));
  platformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  business_model: any;
  delivery_model: any;
  subscription_model: any;
  offer_settings: any;
  order_settings: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  User = JSON.parse(localStorage.getItem("LoginUserDetails"));
  loginStore = JSON.parse(localStorage.getItem("loginUserStore"));
  manageItemImport = JSON.parse(localStorage.getItem("allowItemImportData"));
  userRoleConfirm = localStorage.getItem("user_role_confirm");
  isAllowItemImport = 1;
  refund_module: any
  isOfferShow: any
  item_tax_type: any
  item_approval_shop_type: any
  giftcard_module: any
  label_khata: any
  store_label: any
  deliveryboy_label: any
  isdisplayChat: any
  pos_module: any
  stockManage: any
  show_customer_details_to_store: any
  allow_dinein: any;
  allow_pos: any;
  isSubscriptionModelPlatForm = true;
  allow_khata: any;
  isDeliveryModelPlatForm = true;
  add_refund_module: any = false;
  view_refund_module: any = false;
  ModuleHide: boolean;
  isSellerMenagemant: boolean;
  isAddSellerShow: any;
  isSubscription: boolean;
  isShowManageCustomer: boolean;
  isAdminMasterItems: boolean;
  isShowDeliveryBoy: boolean;
  isShowManageDB: any;
  isMiscellaneousShow: boolean;
  isOrderBalanceShowPlatForm: boolean;
  isdisplayWallet: any;
  isdisplayKhata: any;
  isItemMenagament: any;
  isdisplayWholeseller: any;
  isCampaignManagement: any;
  isCommunicationShow: any;
  isPlatformConfiguration: any;
  isCommonConfiguration: any;
  isHomeConfiguration: any;
  isWalletConfiguration: any;
  isBannerConfiguration: any;
  isDemoStoreConfiguration: any;
  isEasyScriptConfiguration: any;
  isLookups: any;
  isReporsShow: any;
  orderSettingShow: boolean;
  isDisplayisEatery: any;
  isUnitConversion: any;
  pos_allowed: any;
  iseatery: any;
  selectedItemCategoryID: any;
  current_url: string;
  LicenseInfo: any;
  isdisplayAuditLog: boolean;
  isdisplayCommunicationLog: boolean;
  isPageManagement: any = true;
  isHelpManagement: any = true;
  businessModelEnum = BusinessModel;
  userRoleEnum = UserRoles;
  deliveryModelEnum = DeliveryModel;
  offerSettingEnum = OfferSettlingModel;
  subscriptionModelEnum = SubscriptionModel;
  orderSettingModelEnum = OrderSettingModel;
  hideEmail_Notification = false;
  delivery_business: any;
  manageUserShow: any;
  isSubscriptionDetail: any = false;
  isDownloadCenter: boolean = true;
  savingItemList: any = [];
  selected_show_save_item: any;
  lngCodeWithId: any = [];
  sidebar_open: any = false;
  is_view: boolean;
  view_management: boolean;
  selected_view_details: any;
  view_item_list: any = [];
  view_list_count: any = 0;
  display_ask_lokaly: boolean;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private categoryservice: CategoryService,
    public translate: TranslateService,
    private itemService: ItemService,
    private appComponent: AppComponent,
    private cryptoService: CryptoService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private eventBus: NgEventBus,
    private spinner: SpinnerService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit() {
    console.log("this.userRoleEnum.Admin",this.userRoleEnum.Admin)
    this.subscriptionDetails = JSON.parse(localStorage.getItem("subscriptionDetails"));
    this.generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));

    this.User = JSON.parse(localStorage.getItem("LoginUserDetails"));
    this.loginStore = JSON.parse(localStorage.getItem("loginUserStore"));
    this.manageItemImport = JSON.parse(localStorage.getItem("allowItemImportData"));
    this.userRoleConfirm = localStorage.getItem("user_role_confirm");
    this.platformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
    this.delivery_business = this.platformSetting.delivery_business;
    this.business_model = this.platformSetting.business_model;
    this.delivery_model = this.platformSetting.delivery_model;
    this.subscription_model = this.platformSetting.subscription_model;
    this.offer_settings = this.platformSetting.offer_settings;
    this.order_settings = this.platformSetting.order_settings;
    this.current_url = this.router.url;
    this.refund_module = this.generalSetting.refund_module;
    this.isOfferShow = this.generalSetting.offers_module;
    this.item_tax_type = this.generalSetting.item_tax_type;
    this.item_approval_shop_type = this.generalSetting.item_approval_shop_type;
    this.giftcard_module = this.generalSetting.giftcard_module;
    this.label_khata = this.generalSetting.khata_label;
    this.store_label = this.generalSetting.store_label;
    this.deliveryboy_label = this.generalSetting.deliveryboy_label;
    this.isdisplayChat = this.generalSetting.chat_module;
    this.pos_module = this.generalSetting.pos_module;
    this.stockManage = this.generalSetting.stock_mgmt;
    this.show_customer_details_to_store =
      this.generalSetting.show_customer_details_to_store;
    $("#LoginPageLogoSideMenu").attr("src", this.generalSetting.logo);
    $(".copyright").children("p").text(this.generalSetting.footer_copyright);
    this.main = this.appComponent.main;
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserStoreInfo = JSON.parse(
      session.getSessionLoginUserStore()
    );
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    if (
      this.main.LoggedUserStoreInfo.role_id == this.userRoleEnum.StoreManager
    ) {
      this.getStoreManagerSettings();
    }
    if (
      this.loginStore.role_name == "Store Manager" &&
      this.manageItemImport == 0
    ) {
      this.isAllowItemImport = 0;
    }

    this.cdr.detectChanges();


    this.isAddSellerShow =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace &&
        this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace &&
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
          ? true
          : this.business_model ==
            this.businessModelEnum.Single_Brand_Model_B2C &&
            this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
            ? true
            : false;

    this.pos_allowed = this.main.LoggedUserStoreInfo.pos_allowed;

    this.ModuleHide =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace
        ? true
        : this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace &&
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
          ? true
          : this.business_model ==
            this.businessModelEnum.Single_Brand_Model_B2C &&
            this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
            ? true
            : false;

    this.isdisplayKhata =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace
        ? true
        : this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace &&
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
          ? true
          : false;

    this.isSubscription =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace
        ? true
        : this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace &&
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
          ? true
          : false;

    this.isItemMenagament =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;

    this.isMiscellaneousShow =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;


    this.isAdminMasterItems =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace &&
        this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace &&
          this.userRoleEnum.Admin
          ? true
          : false;

    this.isSellerMenagemant =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3
            ? true
            : false;

    this.isdisplayWholeseller =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace
        ? true
        : this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace &&
          this.userRoleEnum.Admin
          ? true
          : false;

    this.isdisplayWallet =
      this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;

    this.isdisplayAuditLog = this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 1
      ? true
      : false;

    this.isdisplayCommunicationLog =
      this.business_model == 1 && (this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 2)
        ? true
        : this.business_model == 2 && (this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 2)
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 2
            ? true
            : false;

    this.isOrderBalanceShowPlatForm =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace &&
        this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace &&
          this.userRoleEnum.Admin
          ? true
          : false;

    this.isCampaignManagement =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;

    this.isCommunicationShow =
      this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;

    this.isPlatformConfiguration =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace &&
        this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace &&
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
          ? true
          : this.business_model ==
            this.businessModelEnum.Single_Brand_Model_B2C &&
            this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
            ? true
            : false;

    this.isCommonConfiguration =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace &&
        this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace
          ? true
          : this.business_model == this.businessModelEnum.Single_Brand_Model_B2C
            ? true
            : false;

    this.isHomeConfiguration =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace &&
        this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace
          ? true
          : this.business_model == this.businessModelEnum.Single_Brand_Model_B2C
            ? true
            : false;

    this.isWalletConfiguration =
      this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;

    this.isBannerConfiguration =
      this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;

    this.isDemoStoreConfiguration =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace &&
        this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : false;

    this.isEasyScriptConfiguration =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;

    this.isLookups =
      this.business_model ==
        this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace &&
        this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace
          ? true
          : this.business_model == this.businessModelEnum.Single_Brand_Model_B2C
            ? true
            : false;

    this.isReporsShow =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;
    this.view_management =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;


    this.subscription_model = this.platformSetting.subscription_model;

    this.refund_module = this.generalSetting.refund_module;
    this.isOfferShow = this.generalSetting.offers_module;
    this.item_tax_type = this.generalSetting.item_tax_type;
    this.item_approval_shop_type = this.generalSetting.item_approval_shop_type;
    this.giftcard_module = this.generalSetting.giftcard_module;

    this.isShowManageCustomer =
      this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
            ? true
            : false;

    this.isShowDeliveryBoy = false;
    if (
      this.delivery_model ==
      this.deliveryModelEnum.Platform_delivers_for_the_stores ||
      this.delivery_model ==
      this.deliveryModelEnum.Third_party_delivers_for_the_platform
    ) {
      var isShowDeliveryBoyData = false;
      isShowDeliveryBoyData =
        this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Marketplace &&
          this.delivery_model ==
          this.deliveryModelEnum.Platform_delivers_for_the_stores &&
          this.offer_settings ==
          this.offerSettingEnum.Platform_to_define_the_Offers &&
          this.order_settings ==
          this.orderSettingModelEnum.Platform_to_define_the_Order_Settings
          ? true
          : false;

      this.isShowDeliveryBoy =
        this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace &&
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
          ? true
          : this.business_model == isShowDeliveryBoyData &&
            this.userRoleEnum.Admin
            ? true
            : this.business_model ==
              this.businessModelEnum.Single_Brand_Model_B2C &&
              this.userRoleEnum.Admin
              ? true
              : false;
    }

    this.isSubscriptionDetail =
      this.business_model ==
        BusinessModel.Store_Aggregation_Model_Lokaly_Marketplace
        ? true
        : this.business_model ==
          BusinessModel.Store_Aggregation_Model_Marketplace
          ? true
          : false;
    this.isShowManageDB = this.delivery_model == 2 ? true : false;

    this.manageUserShow =
      this.delivery_business == 1 && this.main.LoggedUserInfo.role_id == 2
        ? true
        : false;
    this.offer_settings = this.platformSetting.offer_settings;

    if (this.User.role_id == "6" && (this.business_model == 2 || this.business_model == 3)) {
      this.isDownloadCenter = false
    }

    if (
      this.User.role_id == this.userRoleEnum.Admin ||
      this.User.role_id == this.userRoleEnum.SuperAdmin
    ) {
      if (
        Number(this.offer_settings) ==
        this.offerSettingEnum.Platform_to_define_the_Offers
      ) {
        if (Number(this.isOfferShow) == 1) {
          this.isOfferShow =
            this.business_model ==
              this.businessModelEnum
                .Store_Aggregation_Model_Lokaly_Marketplace &&
              this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
              ? true
              : this.business_model == isShowDeliveryBoyData &&
                this.userRoleEnum.Admin
                ? true
                : this.business_model ==
                  this.businessModelEnum.Single_Brand_Model_B2C &&
                  this.userRoleEnum.Admin
                  ? true
                  : false;
        }
      } else {
        this.isOfferShow = false;
      }
    } else {
      if (this.isOfferShow == 1) {
        this.isOfferShow =
          this.main.LoggedUserStoreInfo.offer_module == 1 ? 1 : 0;
      }
    }

    if (Number(this.refund_module) != 0) {
      this.refund_module =
        (this.subscription_model ==
          this.subscriptionModelEnum
            .Customer_pays_to_Platform_Platform_settles_with_Store_after_subscription_fee ||
          this.subscription_model ==
          this.subscriptionModelEnum
            .Customer_pays_to_Platform_No_settlement_required) &&
          this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace &&
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
          ? true
          : (this.subscription_model ==
            this.subscriptionModelEnum
              .Customer_pays_to_Platform_Platform_settles_with_Store_after_subscription_fee ||
            this.subscription_model ==
            this.subscriptionModelEnum
              .Customer_pays_to_Platform_No_settlement_required) &&
            (this.business_model ==
              this.businessModelEnum.Store_Aggregation_Model_Marketplace ||
              this.business_model ==
              this.businessModelEnum.Single_Brand_Model_B2C) &&
            this.userRoleEnum.Admin
            ? true
            : false;
      this.add_refund_module = this.subscription_model == 1 ? true : false;
      this.view_refund_module = this.subscription_model != 1 ? true : false;
    } else {
      this.add_refund_module = false;
      this.view_refund_module = false;
    }

    if (
      this.main.LoggedUserStoreInfo.role_id == this.main.UserRole.Seller ||
      this.main.LoggedUserStoreInfo.role_id == this.main.UserRole.StoreManager
    ) {
      if (this.isOfferShow == 1) {
        this.isOfferShow =
          this.main.LoggedUserStoreInfo.offer_module == 1 ? 1 : 0;
      }
      if (this.isdisplayChat == 1) {
        this.isdisplayChat = this.main.LoggedUserStoreInfo.chat == 1 ? 1 : 0;
      }

      if (this.add_refund_module == true) {
        this.add_refund_module =
          this.main.LoggedUserStoreInfo.refund == 1 ? 1 : 0;
      }
      if (this.stockManage == 1) {
        this.stockManage = this.main.LoggedUserStoreInfo.inventory == 1 ? 1 : 0;
      }
    }

    this.iseatery = this.main.LoggedUserStoreInfo.iseatery;
    this.allow_dinein = this.generalSetting.dinein_module;
    this.allow_pos = this.generalSetting.pos_module;

    if (this.main.LoggedUserStoreInfo) {
      if (this.main.LoggedUserStoreInfo.pos != 1) {
        this.allow_pos = 0;
      }
      if (this.main.LoggedUserStoreInfo.dine_in != 1) {
        this.allow_dinein = 0;
      }
    }
    this.isSubscriptionModelPlatForm =
      this.subscription_model == 1 ? true : false;
    this.allow_khata = this.generalSetting.allow_khata;
    if (this.delivery_model != 1) {
      this.isDeliveryModelPlatForm = false;
    }
    if (
      this.order_settings ==
      this.orderSettingModelEnum.Storewise_Order_Settings &&
      this.subscription_model ==
      this.subscriptionModelEnum
        .Customer_pays_to_Store_Store_pays_subscription_to_Platform
    ) {
      this.orderSettingShow = false;
    } else {
      this.orderSettingShow =
        this.business_model ==
          this.businessModelEnum.Store_Aggregation_Model_Lokaly_Marketplace &&
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
          ? true
          : this.business_model ==
            this.businessModelEnum.Store_Aggregation_Model_Marketplace &&
            this.userRoleEnum.Admin
            ? true
            : this.business_model ==
              this.businessModelEnum.Single_Brand_Model_B2C &&
              this.userRoleEnum.Admin
              ? false
              : false;
    }

    if (this.pos_allowed == 1) {
      this.pos_allowed = this.main.LoggedUserStoreInfo.pos == 1 ? 1 : 0;
    }

    if (this.generalSetting) {
      if (this.isdisplayWallet == true) {
        this.isdisplayWallet = parseInt(this.generalSetting.allow_wallet);
        this.isWalletConfiguration = parseInt(this.generalSetting.allow_wallet);
      }

      if (this.isdisplayKhata == true) {
        this.isdisplayKhata = parseInt(this.generalSetting.allow_khata);
      }

      if (this.isdisplayWholeseller == true) {
        this.isdisplayWholeseller = parseInt(
          this.generalSetting.allow_wholeseller
        );
      }

      if (this.isCampaignManagement == true) {
        this.isCampaignManagement = parseFloat(
          this.generalSetting.marketing_tool
        );
      }

      if (this.isCommonConfiguration == true) {
        this.isCommonConfiguration =
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
            ? 1
            : parseFloat(this.generalSetting.module_config);
      }

      if (this.isHomeConfiguration == true) {
        this.isHomeConfiguration =
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
            ? 1
            : parseFloat(this.generalSetting.module_config);
      }

      if (this.isPageManagement == true) {
        this.isPageManagement =
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
            ? 1
            : parseFloat(this.generalSetting.module_config);
      }

      if (this.isHelpManagement == true) {
        this.isHelpManagement =
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
            ? 1
            : parseFloat(this.generalSetting.module_config);
      }

      if (this.isLookups == true) {
        this.isDisplayisEatery = this.generalSetting.eatery_module;
        this.isUnitConversion = this.generalSetting.stock_mgmt;
      }

      this.label_khata = this.generalSetting.khata_label;
      this.store_label = this.generalSetting.store_label;
      this.deliveryboy_label = this.generalSetting.deliveryboy_label;
    } else {
      if (this.isdisplayWallet == true) {
        this.isdisplayWallet = parseInt(this.main.allow_wallet);
        this.isWalletConfiguration = parseInt(this.main.allow_wallet);
      }

      if (this.isdisplayKhata == true) {
        this.isdisplayKhata = parseInt(this.main.allow_khata);
      }

      if (this.isdisplayWholeseller == true) {
        this.isdisplayWholeseller = parseInt(this.main.allow_wholeseller);
      }

      if (this.isCampaignManagement == true) {
        this.isCampaignManagement = parseFloat(this.main.marketing_tool);
      }

      if (this.isCommonConfiguration == true) {
        this.isCommonConfiguration =
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
            ? 1
            : parseFloat(this.main.module_config);
      }

      if (this.isHomeConfiguration == true) {
        this.isHomeConfiguration =
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
            ? 1
            : parseFloat(this.main.module_config);
      }



      if (this.isPageManagement == true) {
        this.isPageManagement =
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
            ? 1
            : parseFloat(this.main.module_config);
      }

      if (this.isHelpManagement == true) {
        this.isHelpManagement =
          this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
            ? 1
            : parseFloat(this.main.module_config);
      }

      if (this.isLookups == true) {
        this.isDisplayisEatery = parseFloat(this.main.eatery_module);
        this.isUnitConversion = parseFloat(this.main.stock_mgmt);
      }
      this.label_khata = this.main.khata_label;
      this.store_label = this.main.store_label;
      this.deliveryboy_label = this.main.deliveryboy_label;
    }

    if (this.isMiscellaneousShow) {
      if (!this.isdisplayWholeseller && !this.isdisplayWallet) {
        this.isMiscellaneousShow = false;
      }
    }

    this.viewList('lokaly_admin');
    // this.display_ask_lokaly = 
    // (this.business_model == 1 && this.generalSetting.visualization_module == 1) ? true : 
    // (this.business_model != 1 && this.userRoleEnum.Admin && this.generalSetting.visualization_module == 1) ? false : true;

    if (this.main.LoggedUserStoreInfo.role_id == this.main.UserRole.POS) {
      var subscriptionDetails = JSON.parse(
        localStorage.getItem("subscriptionDetails")
      );
      if (Number(this.generalSetting.visualization_module)) {
        this.viewList();
      }
      if (subscriptionDetails != undefined) {
        if (subscriptionDetails.is_expired == 0) {
          this.menuItems = [
            {
              name: "managedashboard",
              title: "DASHBOARD",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/dashboard.svg",
              icon_white: "assets/icons/menu/dashboard.svg",
              stateRef: "/dashboard",
              subMenu: "",
            },
            {
              name: "pos",
              title: "POS",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/add_order1.svg",
              icon_white: "assets/icons/menu/add_order1.svg",
              stateRef: "/pos",
              subMenu: "",
              display: this.pos_module == 1 && this.pos_allowed == 1 ? 1 : 0,
            },
            {
              name: "view",
              title: "View",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/item_list.svg",
              icon_white: "assets/icons/menu/item_list.svg",
              stateRef: "",
              subMenu: [],
              display: this.generalSetting.visualization_module == 1 && this.view_list_count > 0 ? true : false
            },
            {
              name: "editProfile",
              title: "SETTINGS",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/settings.svg",
              icon_white: "assets/icons/menu/settings.svg",
              stateRef: "",
              subMenu: [
                {
                  name: "My Profile",
                  title: "EDIT_PROFILE",
                  level: 1,
                  order: 1,
                  stateRef: "/edit-profile",
                },
                {
                  name: "change PassWord",
                  title: "CHANGE_PASSWORD",
                  level: 1,
                  order: 1,
                  stateRef: "/change-password",
                },
              ],
            },
          ];
        } else {
          this.menuItems = [
            {
              name: "managedashboard",
              title: "DASHBOARD",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/dashboard.svg",
              icon_white: "assets/icons/menu/dashboard.svg",
              stateRef: "/dashboard",
              subMenu: "",
            },
            {
              name: "editProfile",
              title: "SETTINGS",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/settings.svg",
              icon_white: "assets/icons/menu/settings.svg",
              stateRef: "",
              subMenu: [
                {
                  name: "My Profile",
                  title: "EDIT_PROFILE",
                  level: 1,
                  order: 1,
                  stateRef: "/edit-profile",
                },
                {
                  name: "change PassWord",
                  title: "CHANGE_PASSWORD",
                  level: 1,
                  order: 1,
                  stateRef: "/change-password",
                },
              ],
            },
          ];
        }
      }
    } else if (
      this.main.LoggedUserStoreInfo.role_id == this.main.UserRole.PICKER
    ) {
      if (Number(this.generalSetting.visualization_module)) {
        this.viewList();
      }
      this.cdr.detectChanges();
      var subscriptionDetails = JSON.parse(
        localStorage.getItem("subscriptionDetails")
      );
      if (subscriptionDetails != undefined) {
        if (subscriptionDetails.is_expired == 0) {
          this.menuItems = [
            {
              name: "order",
              title: "Pick Order",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/process_order.svg",
              icon_white: "assets/icons/menu/process_order.svg",
              stateRef: "/pickerorder",
              subMenu: "",
            },
            {
              name: "view",
              title: "View",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/item_list.svg",
              icon_white: "assets/icons/menu/item_list.svg",
              stateRef: "",
              subMenu: [],
              display: this.generalSetting.visualization_module == 1 && this.view_list_count > 0 ? true : false
            },
            {
              name: "editProfile",
              title: "SETTINGS",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/settings.svg",
              icon_white: "assets/icons/menu/settings.svg",
              stateRef: "",
              subMenu: [
                {
                  name: "My Profile",
                  title: "EDIT_PROFILE",
                  level: 1,
                  order: 1,
                  stateRef: "/edit-profile",
                },
                {
                  name: "change PassWord",
                  title: "CHANGE_PASSWORD",
                  level: 1,
                  order: 1,
                  stateRef: "/change-password",
                },
              ],
            },
          ];
        } else {
          this.menuItems = [
            {
              name: "managedashboard",
              title: "DASHBOARD",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/dashboard.svg",
              icon_white: "assets/icons/menu/dashboard.svg",
              stateRef: "notfound",
              subMenu: "",
            },
            {
              name: "editProfile",
              title: "SETTINGS",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/settings.svg",
              icon_white: "assets/icons/menu/settings.svg",
              stateRef: "",
              subMenu: [
                {
                  name: "My Profile",
                  title: "EDIT_PROFILE",
                  level: 1,
                  order: 1,
                  stateRef: "/edit-profile",
                },
                {
                  name: "change PassWord",
                  title: "CHANGE_PASSWORD",
                  level: 1,
                  order: 1,
                  stateRef: "/change-password",
                },
              ],
            },
          ];
        }
      }
    }

    if (
      this.User.role_id != this.userRoleEnum.Admin &&
      this.User.role_id != this.userRoleEnum.SuperAdmin
    ) {
      var subscriptionDetails = JSON.parse(
        localStorage.getItem("subscriptionDetails")
      );
      if (subscriptionDetails?.is_expired == 1) {
        this.menuItems = [
          {
            name: "managedashboard",
            title: "DASHBOARD",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/dashboard.svg",
            icon_white: "assets/icons/menu/dashboard.svg",
            stateRef: "/dashboard",
            subMenu: "",
          },
          {
            name: "manageSubscription",
            title: "MANAGE_SUBSCRIPTION",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/subscription_menu.svg",
            icon_white: "assets/icons/menu/subscription_menu.svg",
            stateRef: "/manage-subscription",
            subMenu: "",
          },
          {
            name: "order",
            title: "PROCESS_ORDERS",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/process_order.svg",
            icon_white: "assets/icons/menu/process_order.svg",
            stateRef: "/order",
            subMenu: "",
          },
          {
            name: "order",
            title: "CHAT_SUPPORT",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/chat_support.svg",
            icon_white: "assets/icons/menu/chat_support.svg",
            stateRef: "/chat-support",
            subMenu: "",
          },
          {
            name: "editProfile",
            title: "SETTINGS",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/settings.svg",
            icon_white: "assets/icons/menu/settings.svg",
            stateRef: "",
            subMenu: [
              {
                name: "My Profile",
                title: "EDIT_PROFILE",
                level: 1,
                order: 1,
                stateRef: "/edit-profile",
              },
              {
                name: "change PassWord",
                title: "CHANGE_PASSWORD",
                level: 1,
                order: 1,
                stateRef: "/change-password",
              },
              {
                name: "delete account",
                title: "DELETE_ACCOUNT",
                level: 1,
                order: 1,
                stateRef: "/delete-account",
              },
            ],
          },
        ];
        this.renewLicenseModel();
        return;
      }
    }

    if (
      this.User.role_id == this.userRoleEnum.Admin ||
      this.User.role_id == this.userRoleEnum.SuperAdmin
    ) {
      if (this.User.role_id == 1) {
        if (Number(this.generalSetting.visualization_module)) {
          this.viewList();
        }
      }
      this.menuItems = [
        {
          name: "dashboard",
          title: "DASHBOARD",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/dashboard.svg",
          icon_white: "assets/icons/menu/dashboard.svg",
          stateRef: "/dashboard",
          subMenu: "",
        },
        {
          name: "activityLogs",
          title: "ACTIVITY_LOGS",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/activity_log.svg",
          icon_white: "assets/icons/menu/activity_log.svg",
          stateRef: "/activity-log",
          subMenu: "",
          display: Number(this.ModuleHide),
        },
        {
          name: "seller",
          title: this.store_label + " Management",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/store_management.svg",
          icon_white: "assets/icons/menu/store_management.svg",
          stateRef: "notfound",
          display: Number(this.isSellerMenagemant),
          subMenu: [
            {
              name: "seller",
              title: "Add New " + this.store_label,
              level: 1,
              order: 1,
              stateRef: "/sellers/add",
              display: Number(this.isAddSellerShow),
            }, //Hide for B2C Solution
            {
              name: "seller",
              title: this.store_label + " Management",
              level: 1,
              order: 1,
              stateRef: "/sellers",
            },
            {
              name: "khatacustomer",
              title: this.label_khata,
              level: 1,
              order: 1,
              stateRef: "/khata-customer",
              display: Number(this.isdisplayKhata),
            }, //Hide for B2C Solution
          ],
        },
        {
          name: "manageCustomers",
          title: "MANAGE_CUSTOMERS",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/manage_customer.svg",
          icon_white: "assets/icons/menu/manage_customer.svg",
          stateRef: "/manage-customer",
          display: Number(this.isShowManageCustomer),
          subMenu: "",
        },
        {
          name: "SUBSCRIPTION",
          title: "SUBSCRIPTION",
          level: 0,
          order: 1,
          display: Number(this.isSubscription),
          icon_green: "assets/icons/menu/subscription.svg",
          icon_white: "assets/icons/menu/subscription.svg",
          stateRef: "notfound",
          subMenu: [
            {
              name: "SUBSCRIPTION_PACKAGES",
              title: "SUBSCRIPTION_PACKAGES",
              level: 1,
              order: 1,
              stateRef: "/subscription-packages",
            },
          ],
        }, //Hide for B2C Solution
        {
          name: "ITEM_MANAGEMENT",
          title: "ITEM_MANAGEMENT",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/item_management.svg",
          icon_white: "assets/icons/menu/item_management.svg",
          stateRef: "items",
          display: Number(this.isItemMenagament),
          subMenu: [
            {
              name: "items",
              title: "MASTER_ITEM_LIST",
              level: 1,
              order: 1,
              stateRef: "items/masteritems",
              display: Number(this.isAdminMasterItems),
            }, //Hide for B2C Solution
            {
              name: "import Items",
              title: "MASTER_ITEM_IMPORT",
              level: 1,
              order: 1,
              stateRef: "/items/import-items",
              display: Number(this.isAdminMasterItems),
            }, //Hide for B2C Solution
            {
              name: "items",
              title: this.store_label + " Item List",
              level: 1,
              order: 1,
              stateRef: "/items",
            },
            {
              name: "items",
              title: this.store_label + " Item Import",
              level: 1,
              order: 1,
              stateRef: "/items/seller-items-import",
            },
            {
              name: "items",
              title: "ITEM_APPROVAL",
              level: 1,
              order: 1,
              stateRef: "/items/pending-items",
              display: Number(this.item_approval_shop_type),
            }, //Hide for B2C Solution
            {
              name: "Item Collection",
              title: "ITEM_COLLECTION",
              level: 1,
              order: 1,
              stateRef: "/items/itemcollection",
            },
          ],
        },
        {
          name: "order",
          title: "PROCESS_ORDERS",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/process_order.svg",
          icon_white: "assets/icons/menu/process_order.svg",
          stateRef: "/order",
          subMenu: "",
          display: Number(this.isShowDeliveryBoy),
        },
        {
          name: "manageUsers",
          title: "Manage " + this.deliveryboy_label,
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/manage_customer.svg",
          icon_white: "assets/icons/menu/manage_customer.svg",
          stateRef: "/manage-user",
          subMenu: "",
          display: Number(this.isShowManageDB),
        },
        {
          name: "manageOffer",
          title: "MANAGE_OFFER",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/manage_offer.svg",
          icon_white: "assets/icons/menu/manage_offer.svg",
          stateRef: "/manage-offer",
          subMenu: "",
          display: Number(this.isOfferShow),
        },
        {
          name: "refund",
          title: "GENERATE_REFUND",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/refund.svg",
          icon_white: "assets/icons/menu/refund.svg",
          stateRef: "/generate-refund",
          subMenu: "",
          display: Number(this.refund_module),
        },
        {
          name: "Miscellaneous",
          title: "Miscellaneous",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/miscellaneous.svg",
          icon_white: "assets/icons/menu/miscellaneous.svg",
          stateRef: "notfound",
          display: Number(this.isMiscellaneousShow),
          subMenu: [
            {
              name: "wholesaleapp",
              title: "WHOLESALE_APP",
              level: 1,
              order: 1,
              stateRef: "/wholesale-app",
              display: Number(this.isdisplayWholeseller),
            },
            {
              name: "creditWallet",
              title: "CREDIT_WALLET",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/subscription payment_menu.svg",
              icon_white: "assets/icons/menu/subscription payment_menu.svg",
              stateRef: "/credit-wallet",
              display: Number(this.isdisplayWallet),
              subMenu: "",
            },
            {
              name: "storeorderbalance",
              title: "STORE_ORDER_BALANCE",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/subscription payment_menu.svg",
              icon_white: "assets/icons/menu/subscription payment_menu.svg",
              stateRef: "/subscription-payment",
              subMenu: "",
              display: Number(this.isOrderBalanceShowPlatForm),
            },
          ],
        },
        {
          name: "CAMPAIGN_MANAGEMENT",
          title: "CAMPAIGN_MANAGEMENT",
          level: 0,
          order: 5,
          icon_green: "assets/icons/menu/campaign_management.svg",
          icon_white: "assets/icons/menu/campaign_management.svg",
          stateRef: "notfound",
          display: Number(this.isCampaignManagement),
          subMenu: [
            {
              name: "CONTACT_LIST",
              title: "CONTACT_LIST",
              level: 1,
              order: 4,
              stateRef: "/contact-list",
              display: Number(this.isCampaignManagement),
            },
            {
              name: "Template",
              title: "TEMPLATE",
              level: 1,
              order: 4,
              stateRef: "/template",
              display: Number(this.isCampaignManagement),
            },
            {
              name: "Campaign",
              title: "CAMPAIGN",
              level: 1,
              order: 4,
              stateRef: "/campaign",
              display: Number(this.isCampaignManagement),
            },
            {
              name: "EMAIL_CAMPAIGN",
              title: "EMAIL_CAMPAIGN",
              level: 1,
              order: 4,
              stateRef: "/email-campaign",
              display: Number(this.hideEmail_Notification),
            },
            {
              name: "NOTIFICATION_TEMPLATE",
              title: "NOTIFICATION_TEMPLATE",
              level: 1,
              order: 4,
              stateRef: "/notification-template",
              display: Number(this.hideEmail_Notification),
            },
          ],
        },
        {
          name: "COMMUNICATION",
          title: "COMMUNICATION",
          level: 0,
          order: 5,
          icon_green: "assets/icons/menu/communication.svg",
          icon_white: "assets/icons/menu/communication.svg",
          stateRef: "notfound",
          display: Number(this.isCommunicationShow),
          subMenu: [
            {
              name: "EMAIL",
              title: "EMAIL",
              level: 1,
              order: 4,
              stateRef: "/email",
            },
            {
              name: "SMS",
              title: "SMS",
              level: 1,
              order: 4,
              stateRef: "/sms",
            },
            {
              name: "NOTIFICATION",
              title: "NOTIFICATION",
              level: 1,
              order: 4,
              stateRef: "/notification",
            },
          ],
        },
        {
          name: "CONFIGURATION",
          title: "CONFIGURATION",
          level: 0,
          order: 5,
          icon_green: "assets/icons/menu/general configuration_blue.svg",
          icon_white: "assets/icons/menu/general configuration_blue.svg",
          stateRef: "notfound",
          subMenu: [
            {
              name: "platformConfiguration",
              title: "PLATFORM",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/subscription payment_menu.svg",
              icon_white: "assets/icons/menu/subscription payment_menu.svg",
              stateRef: "/platform-configuration",
              subMenu: "",
              display: Number(this.isPlatformConfiguration),
            },
            {
              name: "commonConfiguration",
              title: "COMMON",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/subscription payment_menu.svg",
              icon_white: "assets/icons/menu/subscription payment_menu.svg",
              stateRef: "/common-configuration",
              subMenu: "",
              display: Number(this.isCommonConfiguration),
            },
            {
              name: "homeConfiguration",
              title: "HOME_PAGE",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/subscription payment_menu.svg",
              icon_white: "assets/icons/menu/subscription payment_menu.svg",
              stateRef: "/home-page-app",
              subMenu: "",
              display: Number(this.isHomeConfiguration),
            },
            {
              name: "homeConfigurationPortal",
              title: "HOME_PAGE_PORTAL",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/subscription payment_menu.svg",
              icon_white: "assets/icons/menu/subscription payment_menu.svg",
              stateRef: "/home-page-portal",
              subMenu: "",
              display: Number(this.isHomeConfiguration),
            },
            {
              name: "page-management",
              title: "PAGE_MANAGEMENT",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/item_import.svg",
              icon_white: "assets/icons/menu/item_import.svg",
              stateRef: "/page-management",
              subMenu: "",
              display: Number(this.isPageManagement),
            },
            {
              name: "help",
              title: "HELP_MANAGEMENT",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/item_import.svg",
              icon_white: "assets/icons/menu/item_import.svg",
              stateRef: "/help",
              subMenu: "",
              display: Number(this.isHelpManagement),
            },
            {
              name: "block",
              title: "BLOCK_MANAGEMENT",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/item_import.svg",
              icon_white: "assets/icons/menu/item_import.svg",
              stateRef: "/block",
              subMenu: "",
              display: Number(this.isCommonConfiguration),
            },
            {
              name: "item",
              title: "ITEM_CONFIGUARTION",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/item_import.svg",
              icon_white: "assets/icons/menu/item_import.svg",
              stateRef: "/item-config",
              subMenu: "",
              display: Number(this.isCommonConfiguration),
            },
            {
              name: "view-management",
              title: "View Management",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/dashboard.svg",
              icon_white: "assets/icons/menu/dashboard.svg",
              stateRef: "/view-management",
              subMenu: "",
              display: this.User.role_id == 6 && this.generalSetting.visualization_module ? true : false,
            },
            {
              name: "walletconfiguration",
              title: "WALLET",
              level: 1,
              order: 1,
              stateRef: "/wallet",
              display: Number(this.isWalletConfiguration),
            },
            {
              name: "Banner",
              title: "Banner",
              level: 1,
              order: 4,
              stateRef: "/banner",
              display: Number(this.isBannerConfiguration),
            },
            {
              name: "order-settings",
              title: "ORDER_SETTINGS",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/subscription payment_menu.svg",
              icon_white: "assets/icons/menu/subscription payment_menu.svg",
              stateRef: "/order-setting-list",
              subMenu: "",
              display: Number(this.orderSettingShow),
            },
            {
              name: "Demo Store",
              title: "Demo " + this.store_label,
              level: 1,
              order: 4,
              stateRef: "/demo-store",
              display: Number(this.isDemoStoreConfiguration),
            },
            {
              name: "easyScriptConfiguration",
              title: "Easy_Script",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/subscription payment_menu.svg",
              icon_white: "assets/icons/menu/subscription payment_menu.svg",
              stateRef: "/easy-script",
              subMenu: "",
              display: Number(this.isEasyScriptConfiguration),
            },
          ],
        },
        {
          name: "view",
          title: "View",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/item_list.svg",
          icon_white: "assets/icons/menu/item_list.svg",
          stateRef: "",
          subMenu: [],
          display: (this.generalSetting.visualization_module == 1 && this.User.role_id == 1 && this.view_item_list.length > 0 && this.view_list_count > 0) ? true : false,
        },
        {
          name: "LOOKUPS",
          title: "LOOKUPS",
          level: 0,
          order: 5,
          icon_green: "assets/icons/menu/lookups.svg",
          icon_white: "assets/icons/menu/lookups.svg",
          stateRef: "notfound",
          display: Number(this.isLookups),
          subMenu: [
            {
              name: "Store Type",
              title: this.store_label + " Type",
              level: 1,
              order: 4,
              stateRef: "/store-type",
              display: 1,
            },
            {
              name: "Cuisines",
              title: "CUISINES",
              level: 1,
              order: 4,
              stateRef: "/cuisines",
              display: this.isDisplayisEatery,
            },
            {
              name: "Choices",
              title: "CHOICES",
              level: 1,
              order: 4,
              stateRef: "/choices",
              display: this.isDisplayisEatery,
            },
            {
              name: "Addons",
              title: "ADDONS",
              level: 1,
              order: 4,
              stateRef: "/addons",
              display: this.isDisplayisEatery,
            },
            {
              name: "Item Tags",
              title: "ITEM_TAG",
              level: 1,
              order: 4,
              stateRef: "/item-tag",
              display: 1,
            },
            {
              name: "Item Collection",
              title: "ITEM_COLLECTION",
              level: 1,
              order: 4,
              stateRef: "/item-collection",
              display: 1,
            },
            {
              name: "Item Attributes",
              title: "ITEM_ATTRIBUTE",
              level: 1,
              order: 4,
              stateRef: "/item-attribute",
              display: 1,
            },
            {
              name: "Tax Zone",
              title: this.generalSetting.store_tax_label + " Zone",
              level: 1,
              order: 4,
              stateRef: "/tax-zone",
              display: this.item_tax_type == 1 ? 0 : 1,
            },
            {
              name: "Tax Group",
              title: this.generalSetting.store_tax_label + " Group",
              level: 1,
              order: 4,
              stateRef: "/tax-group",
              display: this.item_tax_type == 1 ? 0 : 1,
            },
            {
              name: "Category Type",
              title: "CATEGORY",
              level: 1,
              order: 4,
              stateRef: "/category-type",
              display: 1,
            },
            {
              name: "Sub Category Type",
              title: "SUB_CATEGORY",
              level: 1,
              order: 4,
              stateRef: "/sub-category-type",
              display: 1,
            },
            {
              name: "Packaging Type",
              title: "PACKAGE",
              level: 1,
              order: 4,
              stateRef: "/package-type",
              display: 1,
            },
            {
              name: "Unit Type",
              title: "UNIT",
              level: 1,
              order: 4,
              stateRef: "/unit-type",
            },
            {
              name: "Unit Conversion",
              title: "UNIT_CONVERSION",
              level: 1,
              order: 4,
              stateRef: "/unit-conversion",
              display: Number(this.isUnitConversion),
            },
            {
              name: "Payment Methods",
              title: "PAYMENT_METHODS",
              level: 1,
              order: 4,
              stateRef: "/payment-method",
              display: 1,
            },
            {
              name: "Reason Master",
              title: "REASON_MASTER",
              level: 1,
              order: 4,
              stateRef: "/reason-master",
              display: 1,
            },
            {
              name: "Region Master",
              title: "REGION_MASTER",
              level: 1,
              order: 4,
              stateRef: "/region-master",
              display: 1,
            },
            {
              name: "Ask Lokaly ",
              title: "Ask Lokaly",
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/add_order1.svg",
              icon_white: "assets/icons/menu/add_order1.svg",
              stateRef: "/ask-lokaly",
              subMenu: "",
              display: this.generalSetting.visualization_module == 1 && this.main.LoggedUserInfo.role_id == 6 ? true : false
            },
          ],
        }, 
        {
          name: "REPORTS",
          title: "REPORTS",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/reports.svg",
          icon_white: "assets/icons/menu/reports.svg",
          stateRef: "notfound",
          display: Number(this.isReporsShow),
          subMenu: [
            {
              name: "ORDERS",
              title: "ORDERS",
              level: 1,
              order: 1,
              stateRef: "/orders-report",
            },
            {
              name: "SALES",
              title: "SALES_REPORT",
              level: 0,
              order: 1,
              stateRef: "/sales-report",
            },
            {
              name: "GIFT_VOUCHER_REPORT",
              title: "GIFT_VOUCHER_REPORT",
              level: 0,
              order: 1,
              stateRef: "/voucher-report",
              display: Number(this.giftcard_module),
            },
            {
              name: "CUSTOMER_REPORT",
              title: "CUSTOMER_REPORT",
              level: 0,
              order: 1,
              stateRef: "/customer-report",
            },
            {
              name: "ITEM_WISE_ORDER_REPORT",
              title: "ITEM_WISE_ORDER_REPORT",
              level: 0,
              order: 1,
              stateRef: "/item-wise-order-report",
            },
            {
              name: "WALLET_REPORT",
              title: "WALLET_REPORT",
              level: 0,
              order: 1,
              stateRef: "/wallet-report",
              display: Number(this.isWalletConfiguration),
            },
            {
              name: "COMMUNICATION_LOG_REPORT",
              title: "COMMUNICATION_LOG_REPORT",
              level: 0,
              order: 1,
              stateRef: "/communication-log-report",
              display: Number(this.isdisplayCommunicationLog),
            },
            {
              name: "AUDIT_LOG_REPORT",
              title: "AUDIT_LOG_REPORT",
              level: 0,
              order: 1,
              stateRef: "/audit-log-report",
              display: Number(this.isdisplayAuditLog),
            },
            {
              name: "SUBSCRIPTION_REPORT",
              title: "SUBSCRIPTION_REPORT",
              level: 0,
              order: 1,
              stateRef: "/subscription-report",
              display: Number(this.isOrderBalanceShowPlatForm),
            },
          ],
        },
        {
          name: "downloadCenter",
          title: "DOWNLOAD_CENTER",
          level: 0,
          order: 1,
          icon_green: "assets/icons/menu/item_import.svg",
          icon_white: "assets/icons/menu/item_import.svg",
          stateRef: "/download-center",
          subMenu: "",
          display: this.isDownloadCenter,

        },
        {
          name: "SETTINGS",
          title: "SETTINGS",
          level: 0,
          order: 5,
          icon_green: "assets/icons/menu/settings.svg",
          icon_white: "assets/icons/menu/settings.svg",
          stateRef: "",
          subMenu: [
            {
              name: "change PassWord",
              title: "CHANGE_PASSWORD",
              level: 1,
              order: 1,
              stateRef: "/change-password",
            },
            {
              name: "NOTIFICATIONS",
              title: "NOTIFICATIONS",
              level: 1,
              order: 1,
              stateRef: "/notifications",
            },
          ],
        },
      ];
    } else {
      if (
        this.main.LoggedUserStoreInfo.role_id != this.main.UserRole.POS &&
        this.main.LoggedUserStoreInfo.role_id != this.main.UserRole.PICKER
      ) {
        this.categoryListRecord();
        if (Number(this.generalSetting.visualization_module)) {
          this.viewList();
        }

        this.menuItems = [
          {
            name: "managedashboard",
            title: "DASHBOARD",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/dashboard.svg",
            icon_white: "assets/icons/menu/dashboard.svg",
            stateRef: "/dashboard",
            subMenu: "",
          },
          {
            name: "manageSubscription",
            title: "MANAGE_SUBSCRIPTION",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/subscription_menu.svg",
            icon_white: "assets/icons/menu/subscription_menu.svg",
            stateRef: "/manage-subscription",
            subMenu: "",
            // display: this.isSubscriptionDetail && this.userRoleConfirm == "1",
          },
          {
            name: "manageCustomers",
            title: "MANAGE_CUSTOMERS",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/manage_customer.svg",
            icon_white: "assets/icons/menu/manage_customer.svg",
            stateRef: "/manage-customer",
            subMenu: "",
            display: this.userRoleConfirm == "1" ? 1 : 0,
          },
          {
            name: "addOrder",
            title: "ADD_ORDER",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/add_order1.svg",
            icon_white: "assets/icons/menu/add_order1.svg",
            stateRef: "/add-order",
            subMenu: "",
            display: (this.main.LoggedUserStoreInfo.is_searchable == "1" && this.userRoleConfirm == "1") ? 1 : 0,
          },
          {
            name: "pos",
            title: "POS",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/add_order1.svg",
            icon_white: "assets/icons/menu/add_order1.svg",
            stateRef: "/pos",
            subMenu: "",
            display: (this.pos_module == 1 && this.pos_allowed == 1 && this.userRoleConfirm == "1") ? 1 : 0,
          },
          {
            name: "order",
            title: "PROCESS_ORDERS",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/process_order.svg",
            icon_white: "assets/icons/menu/process_order.svg",
            stateRef: "/order",
            subMenu: "",
            display: this.userRoleConfirm == "1" ? 1 : 0,
          },
          {
            name: "driver-tracking",
            title: this.deliveryboy_label + " Tracking",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/dashboard.svg",
            icon_white: "assets/icons/menu/dashboard.svg",
            stateRef: "/driver-tracking",
            display: this.userRoleConfirm == "1" && (this.generalSetting.livetracking ? 1 : 0) && this.generalSetting.driver_module == '1',
            subMenu: "",
          },
          {
            name: "refund",
            title: "GENERATE_REFUND",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/refund.svg",
            icon_white: "assets/icons/menu/refund.svg",
            stateRef: "/generate-refund",
            subMenu: "",
            display: Number(this.add_refund_module) && this.userRoleConfirm == "1",
          },
          {
            name: "refund",
            title: "REFUND_LIST",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/refund.svg",
            icon_white: "assets/icons/menu/refund.svg",
            stateRef: "/generate-refund",
            subMenu: "",
            display: Number(this.view_refund_module) && this.userRoleConfirm == "1",
          },
          {
            name: "order",
            title: "CHAT_SUPPORT",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/chat_support.svg",
            icon_white: "assets/icons/menu/chat_support.svg",
            stateRef: "/chat-support",
            subMenu: "",
            display: this.isdisplayChat && this.userRoleConfirm == "1",
          },
          {
            name: "items",
            title: "" + this.iseatery == "1" ? "MENU_LIST" : "ITEM_LIST" + "",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/item_list.svg",
            icon_white: "assets/icons/menu/item_list.svg",
            stateRef: "notfound",
            subMenu: [],
            display: this.userRoleConfirm == "1" ? 1 : 0,
          },
          {
            name: "items-import",
            title: "ITEM_IMPORT",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/import_items.svg",
            icon_white: "assets/icons/menu/import_items.svg",
            stateRef: "/items/seller-items-import",
            subMenu: [],
            display: this.isAllowItemImport && this.userRoleConfirm == "1",
          },
          {
            name: "view",
            title: "View",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/item_list.svg",
            icon_white: "assets/icons/menu/item_list.svg",
            stateRef: "",
            subMenu: [],
            display: this.userRoleConfirm == "1" && this.view_list_count > 0 ? true : false,
          },
          {
            name: "UpdateItems",
            title: "UPDATE_PRICE_SIDE",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/update_price.svg",
            icon_white: "assets/icons/menu/update_price.svg",
            stateRef: "update-items",
            subMenu: "",
            display: this.userRoleConfirm == "1",
          },

          {
            name: "Manage Stock",
            title: "MANAGE_STOCK",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/manage_stock.svg",
            icon_white: "assets/icons/menu/manage_stock.svg",
            stateRef: "notfound",
            display: Number(this.stockManage) && this.userRoleConfirm == "1",
            subMenu: [
              {
                name: "Stock Inward",
                title: "STOCK_INWARD",
                level: 0,
                order: 1,
                stateRef: "/stock-inward",
              },
              {
                name: "Stock Outward",
                title: "STOCK_OUTWARD",
                level: 0,
                order: 1,
                stateRef: "/stock-outward",
              },
              {
                name: "damagedStock",
                title: "DAMAGED_STOCK",
                level: 1,
                order: 1,
                stateRef: "/damaged-stock",
              },
              {
                name: "StockMethods",
                title: "UPDATE_STOCK_ITEM",
                level: 1,
                order: 1,
                stateRef: "/stock-method",
              },
              {
                name: "StockSettings",
                title: "STOCK_SETTINGS",
                level: 1,
                order: 1,
                stateRef: "/stock-settings",
              },
            ],
          },
          {
            name: "manageOffer",
            title:
              "" + this.offer_settings == "1"
                ? "MANAGE_OFFER"
                : "View Offer" + "",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/manage_offer.svg",
            icon_white: "assets/icons/menu/manage_offer.svg",
            stateRef: "/manage-offer",
            subMenu: "",
            display: Number(this.isOfferShow) && this.userRoleConfirm == "1",
          },
          {
            name: "manageUsers",
            title: "MANAGE_USERS",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/manage_customer.svg",
            icon_white: "assets/icons/menu/manage_customer.svg",
            stateRef: "/manage-user",
            subMenu: "",
            display: this.userRoleConfirm == "1",
          },
          {
            name: "report",
            title: "REPORTS",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/reports.svg",
            icon_white: "assets/icons/menu/reports.svg",
            stateRef: "notfound",
            display: this.userRoleConfirm == "1",
            subMenu: [
              {
                name: "sales",
                title: "SALES_REPORT",
                level: 0,
                order: 1,
                stateRef: "/sales-report",
              },
              {
                name: "customerReport",
                title: "CUSTOMER_REPORT",
                level: 0,
                order: 1,
                stateRef: "/customer-report",
                display: Number(this.show_customer_details_to_store),
              },
              {
                name: "khata",
                title: this.label_khata + " Report",
                level: 1,
                order: 1,
                stateRef: "/khata-report",
                display: Number(this.isdisplayKhata),
              },
              {
                name: "orderitems",
                title: "ITEM_WISE_ORDER_REPORT",
                level: 0,
                order: 1,
                stateRef: "/item-wise-order-report",
              },
              {
                name: "DELIVERY_REPORT",
                title: "DELIVERY_REPORT",
                level: 0,
                order: 1,
                stateRef: "/delivery-report",
                display:
                  this.main.LoggedUserStoreInfo.is_searchable == "1" ? 1 : 0,
              },
              {
                name: "DB_PAYOUT_REPORT",
                title: this.deliveryboy_label + " Payout",
                level: 0,
                order: 1,
                stateRef: "/deliveryboy-payout-report",
                display:
                  this.main.LoggedUserStoreInfo.is_searchable == "1" ? 1 : 0,
              },
              {
                name: "COMMUNICATION_LOG_REPORT",
                title: "COMMUNICATION_LOG_REPORT",
                level: 0,
                order: 1,
                stateRef: "/communication-log-report",
                display: Number(this.isdisplayCommunicationLog),
              },
              {
                name: "STOCK_REPORT",
                title: "STOCK_REPORT",
                level: 0,
                order: 1,
                stateRef: "/stock-report",
                display: Number(this.stockManage),
              },
            ],
          },
          {
            name: "downloadCenter",
            title: "DOWNLOAD_CENTER",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/item_import.svg",
            icon_white: "assets/icons/menu/item_import.svg",
            stateRef: "/download-center",
            subMenu: "",
            display: this.userRoleConfirm == "1",
          },
          {
            name: "editProfile",
            title: "SETTINGS",
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/settings.svg",
            icon_white: "assets/icons/menu/settings.svg",
            stateRef: "",
            subMenu: [
              {
                name: "My Profile",
                title: "EDIT_PROFILE",
                level: 1,
                order: 1,
                stateRef: "/edit-profile",
              },
              {
                name: "change PassWord",
                title: "CHANGE_PASSWORD",
                level: 1,
                order: 1,
                stateRef: "/change-password",
              },
              {
                name: "NOTIFICATIONS",
                title: "NOTIFICATIONS",
                level: 1,
                order: 1,
                stateRef: "/notifications",
              },
              {
                name: "delete account",
                title: "DELETE_ACCOUNT",
                level: 1,
                order: 1,
                stateRef: "/delete-account",
                display: this.main.LoggedUserStoreInfo.role_id == "5" ? 0 : 1,
              },
            ],
            display: this.userRoleConfirm == "1",
          },
        ];

        if (this.main.LoggedUserStoreInfo.role_id == this.userRoleEnum.Seller) {
          var manage_shop: any = {
            name: "manageStore",
            title: "Manage " + this.store_label,
            level: 0,
            order: 1,
            icon_green: "assets/icons/menu/manage_store.svg",
            icon_white: "assets/icons/menu/manage_store.svg",
            stateRef: "page.managestore",
            subMenu: [
              {
                name: "Store Details",
                title: this.store_label + " Detail",
                level: 0,
                order: 1,
                stateRef: "/store-details",
              },
              {
                name: "Store Banner",
                title: this.store_label + " Banner",
                level: 0,
                order: 1,
                stateRef: "/storebanner",
              },
              {
                name: "Business Hours",
                title: "BUSINESS_HOURS",
                level: 0,
                order: 1,
                stateRef: "/business-hours",
              },
              {
                name: "Payment Setup",
                title: "PAYMENT_SET_UP",
                level: 0,
                order: 1,
                stateRef: "/payment-setting",
                display: Number(this.isSubscriptionModelPlatForm),
              },
              {
                name: "Khata Settings",
                title: this.label_khata + ' Settings',
                level: 0,
                order: 1,
                stateRef: "/khatasettings",
                display: Number(this.allow_khata),
              },
              {
                name: "Order Settings",
                title: "ORDER_SETTINGS",
                level: 0,
                order: 1,
                stateRef: "/order-settings",
                display:
                  this.main.LoggedUserStoreInfo.is_searchable == "1" ? 1 : 0,
              },
              {
                name: "POS Settings",
                title: "POS_SETTINGS",
                level: 0,
                order: 1,
                stateRef: "/possetting",
                display: Number(this.allow_pos),
              },
              {
                name: "DINE_IN Settings",
                title: "DINE_IN_SETTINGS",
                level: 0,
                order: 1,
                stateRef: "/dine-in-setting",
                display: Number(this.allow_dinein) && Number(this.iseatery),
              },
              {
                name: "ManageTable Settings",
                title: "Manage Table",
                level: 0,
                order: 1,
                stateRef: "/manage-table",
                display: Number(this.allow_dinein) && Number(this.iseatery),
              },
              {
                name: "Store Holidays",
                title: this.store_label + " Holidays",
                level: 0,
                order: 1,
                stateRef: "/storeholidays",
                display:
                  this.main.LoggedUserStoreInfo.is_searchable == "1" ? 1 : 0,
              },
              {
                name: "Other Settings",
                title: "OTHER_SETTINGS",
                level: 0,
                order: 1,
                stateRef: "/other-settings",
              },
            ],
          };

          this.menuItems.splice(2, 0, manage_shop);
        }
      }
    }

    this.menuItems.forEach((element) => {
      if (element.subMenu.length > 0) {
        element.subMenu.forEach((item) => {
          if (item.stateRef == this.router.url) {
            element.show_menu = 1;
          }
        });
      }
    });

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      this.isCollapsed = false;
    });
    this.getLanguageList();
  }
  is_order(is_order: any) {
    throw new Error("Method not implemented.");
  }
  create_view(create_view: any) {
    throw new Error("Method not implemented.");
  }
  order_view(order_view: any) {
    throw new Error("Method not implemented.");
  }
  customer_view(customer_view: any) {
    throw new Error("Method not implemented.");
  }

  getStoreManagerSettings() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
    };

    this.commonService
      .getStoreSetting(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.data.manage_item == 1) {
          }
          this.manageItemImport = response.data.manage_item;
          if (response.data.manage_store == 1) {
            this.menuItems[1] = {
              name: "manageStore",
              title: "Manage " + this.store_label,
              level: 0,
              order: 1,
              icon_green: "assets/icons/menu/manage_store.svg",
              icon_white: "assets/icons/menu/manage_store.svg",
              stateRef: "page.managestore",
              subMenu: [
                {
                  name: "Store Details",
                  title: this.store_label + " Detail",
                  level: 0,
                  order: 1,
                  stateRef: "/store-details",
                },
                {
                  name: "Store Banner",
                  title: this.store_label + " Banner",
                  level: 0,
                  order: 1,
                  stateRef: "/storebanner",
                  display:
                    this.main.LoggedUserStoreInfo.is_searchable == "1" ? 1 : 0,
                },
                {
                  name: "Business Hours",
                  title: "BUSINESS_HOURS",
                  level: 0,
                  order: 1,
                  stateRef: "/business-hours",
                  display:
                    this.main.LoggedUserStoreInfo.is_searchable == "1" ? 1 : 0,
                },
                {
                  name: "Payment Setup",
                  title: "PAYMENT_SET_UP",
                  level: 0,
                  order: 1,
                  stateRef: "/payment-setting",
                  display: Number(this.isSubscriptionModelPlatForm),
                },
                {
                  name: "Khata Settings",
                  title: this.label_khata + ' Settings',
                  level: 0,
                  order: 1,
                  stateRef: "/khatasettings",
                  display: Number(this.allow_khata),
                },
                {
                  name: "Order Settings",
                  title: "ORDER_SETTINGS",
                  level: 0,
                  order: 1,
                  stateRef: "/order-settings",
                  display:
                    this.main.LoggedUserStoreInfo.is_searchable == "1" ? 1 : 0,
                },
                {
                  name: "POS Settings",
                  title: "POS_SETTINGS",
                  level: 0,
                  order: 1,
                  stateRef: "/possetting",
                  display: Number(this.allow_pos),
                },
                {
                  name: "DINE_IN Settings",
                  title: "DINE_IN_SETTINGS",
                  level: 0,
                  order: 1,
                  stateRef: "/dine-in-setting",
                  display: Number(this.allow_dinein) && Number(this.iseatery),
                },
                {
                  name: "ManageTable Settings",
                  title: "Manage Table",
                  level: 0,
                  order: 1,
                  stateRef: "/manage-table",
                  display: Number(this.allow_dinein) && Number(this.iseatery),
                },
                {
                  name: "Store Holidays",
                  title: this.store_label + " Holidays",
                  level: 0,
                  order: 1,
                  stateRef: "/storeholidays",
                  display:
                    this.main.LoggedUserStoreInfo.is_searchable == "1" ? 1 : 0,
                },
                {
                  name: "Other Settings",
                  title: "OTHER_SETTINGS",
                  level: 0,
                  order: 1,
                  stateRef: "/other-settings",
                },
              ],
            };
          }
        },
        error: (error) => { },
        complete: () => { },
      });
  }

  async categoryListRecord() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
    };
    await this.categoryservice.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.menuItems.forEach((ItemDynamicMenu) => {
            if (ItemDynamicMenu.name == "items") {
              ItemDynamicMenu?.subMenu?.push({
                name: "all",
                title: "All Items",
                level: 1,
                order: 1,
                stateRef: "items",
                categoryid: "0",
              });
              ItemDynamicMenu.subMenu.push({
                name: "itemsgrouping",
                title: "ITEM_GROUPING",
                level: 1,
                order: 1,
                stateRef: "items/itemgroup",
                categoryid: "a",
              });
              ItemDynamicMenu.subMenu.push({
                name: "ItemCollection",
                title: "Item Collection",
                level: 1,
                order: 1,
                stateRef: "items/itemcollection",
                categoryid: "b",
              });
            }
          });
        } else {
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }

  viewList(label?: any) {
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
      user_id: this.main.LoggedUserInfo.user_id
    };
    this.commonService.viewListing(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.view_item_list = response.data;
          localStorage.setItem("visualisation_details", JSON.stringify(this.view_item_list));
          if (!label) {
            this.view_list_count = response.data.length;
            this.cdr.detectChanges();
            this.menuItems.forEach((ViewDynamicMenu) => {
              if (ViewDynamicMenu.name == "view") {
                ViewDynamicMenu.display = this.view_list_count
                ViewDynamicMenu?.subMenu?.push({
                  name: "all",
                  title: "All View",
                  level: 1,
                  order: 1,
                  stateRef: "/all-view",
                  master_view_id: "0",
                  display: this.User.role_id != 6 && this.generalSetting.visualization_module ? true : false
                });
                var view_list = [];
                view_list = response.data;
                view_list.forEach((Item) => {
                  this.selected_view_details = Item.master_view_id;
                  ViewDynamicMenu.subMenu.push({
                    name: "view",
                    title: Item.view_name,
                    level: 1,
                    order: 1,
                    stateRef: `/customer-view/${Item.url_path}`,
                    master_view_id: Item.master_view_id,
                    display: this.User.role_id != 6 && this.generalSetting.visualization_module ? true : false
                  });
                });
              }
            });
          }
        } else {
          this.view_item_list = [];
          this.view_list_count = 0;
        }
      }
    });

  }

  expand_sub_menu(item) {
    this.current_url = this.router.url;
    if (item.show_menu == 1) {
      item.show_menu = 0;
      return;
    }
    this.menuItems.forEach((element) => {
      if (element == item) {
        element.show_menu = 1;
      } else {
        element.show_menu = 0;
      }
    });
  }

  renewLicenseModel() {
    this.LicenseInfo = this.subscriptionDetails;
    const modalRef = this.modalService.open(renew_licenseComponent);
    modalRef.componentInstance.LicenseInfo = this.LicenseInfo;
  }

  ngAfterContentInit() {
    let filterMenuItem = this.menuItems?.filter(
      (x) => x.stateRef == this.router.url
    );
  }

  catId: any;
  clearCatId() {
    this.catId = "";
  }

  sidebarCollapse(item: any) {
    if (window.outerWidth < 700 && !item?.subMenu) {
      setTimeout(() => {
        $('.navbar-toggler').click();
      }, 500);
    }
  }
  menuChange(menuItem, index, catId) {
    this.catId = catId;
    if (menuItem && menuItem.categoryid) {
      this.itemService.categoryId.next(
        menuItem.categoryid ? menuItem.categoryid : ""
      );
      this.cryptoService.encryptIdValue(
        menuItem.categoryid.toString(),
        "urlcategoryid" + this.main.LoggedUserStoreInfo.store_id.toString(),
        this.main.CryptoKey
      );
    }
  }

  dtectChanges() {
    this.sidebar_open = this.sidebar_open == false ? true : false;
    localStorage.setItem('sidebarOpen', this.sidebar_open);
    var temp: any = this.sidebar_open;
    this.commonService.AClicked(temp);
    this.eventBus.cast('onCollapse');
    if (this.sidebar_open == true) {
      $(".notification-icon-img").css("right", "0");
    } else {
      $(".notification-icon-img").css("right", "100px");
    }
  }

  getLanguageList() {
    if (this.generalSetting.language_codes) {
      if (this.generalSetting.language_codes.length == 2) {
        this.savingItemList = [];
        this.savingItemList.push(this.generalSetting.language_codes);
      } else {
        this.savingItemList = this.generalSetting.language_codes.split(",");
      }
    } else {
      this.savingItemList = ["en"];
    }
    var language_label = localStorage.getItem("select_lan");
    if (language_label) {
      this.selected_show_save_item = language_label;
    } else {
      this.selected_show_save_item = this.savingItemList[0];
      localStorage.setItem("select_lan", this.savingItemList[0]);
      localStorage.setItem("select_lan_id", "1");
    }
  }

  redirect(link: any, event: MouseEvent) {
    if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
      localStorage.removeItem("seller_Order_obj");
    }
    
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      window.open(link, '_blank');
    } else {
      this.router.navigate([link]);
      this.cdr.detectChanges()
    }
  }

  change_lan(item: any) {
    if (this.savingItemList.length > 1) {
      let lng_ids = this.generalSetting.languages.split(",");
      this.savingItemList.forEach((code: any, i: number) => {
        let codeWithId: any = { "language_code": code, 'language_id': lng_ids[i] }
        this.lngCodeWithId.push(codeWithId)
      });
    }
    this.lngCodeWithId.find((value: any) => {
      if (value.language_code == item) {
        localStorage.setItem("select_lan_id", value.language_id);
      }
    })
    localStorage.setItem("select_lan", item);
    this.translate.use(item);
    location.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
