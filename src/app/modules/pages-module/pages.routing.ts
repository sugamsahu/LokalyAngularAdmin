import { Routes } from "@angular/router";
import { MapsComponent } from "./maps/maps.component";
import { PagesComponent } from "./pages.component";
import { CkEditorImagesComponent } from "./model/ck-editor-images/ck-editor-images.component";
export const PagesRoutes: Routes = [
  {
    path: "",
    component: PagesComponent,
    children: [
      {
        path: "dashboard",
        loadChildren: () =>
          import("src/app/modules/pages-module/dash/dashboard.module").then(
            (m) => m.DashboardModule
          ),
      },
      { path: "maps", component: MapsComponent },
      {
        path: "unit-type",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/unit-type/unit-type.module"
          ).then((m) => m.UnitTypeModule),
      },
      {
        path: "sellers",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/store-management/store-management.module"
          ).then((m) => m.StoreManagementModule),
      },
      {
        path: "items",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/item-management/item-management.module"
          ).then((m) => m.ItemManagementModule),
      },
      {
        path: "payment-method",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/payment-method/payment-method.module"
          ).then((m) => m.PaymentMethodModule),
      },
      {
        path: "package-type",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/package-type/package-type.module"
          ).then((m) => m.PackageTypeModule),
      },
      {
        path: "reason-master",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/reason-master/reason-master.module"
          ).then((m) => m.ReasonMasterModule),
      },
      {
        path: "category-type",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/category-type/category-type.module"
          ).then((m) => m.CategoryTypeModule),
      },
      {
        path: "sub-category-type",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/sub-category-type/sub-category-type.module"
          ).then((m) => m.SubCategoryTypeModule),
      },
      {
        path: "unit-conversion",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/unit-conversion/unit-conversion.module"
          ).then((m) => m.UnitConversionModule),
      },
      {
        path: "manage-customer",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-customer/manage-customer.module"
          ).then((m) => m.ManageCustomerModule),
      },
      {
        path: "manage-user",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-user/manage-user.module"
          ).then((m) => m.ManageUserModule),
      },
      {
        path: "view-management",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/view-management/view-management.module"
          ).then((m) => m.ViewManagementModule),
      },
      {
        path: "all-view",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/view/all-customer/all-customer.module"
          ).then((m) => m.AllCustomerModule),
      },
      {
        path: "customer-view/:slug",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/view/customer/customer.module"
          ).then((m) => m.CustomerModule),
      },
      {
        path: "cuisines",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/cuisines/cuisines.module"
          ).then((m) => m.CuisinesModule),
      },
      {
        path: "item-tag",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/item-tag/item-tag.module"
          ).then((m) => m.ItemTagModule),
      },
      {
        path: "generate-refund",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/refund/generate-refund/generate-refund.module"
          ).then((m) => m.generateRefundModule),
      },
      {
        path: "wholesale-app",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/miscellaneous/wholesale-app/wholesale-app.module"
          ).then((m) => m.WholesaleAppModule),
      },
      {
        path: "credit-wallet",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/miscellaneous/credit-wallet/credit-wallet.module"
          ).then((m) => m.CreditWalletModule),
      },
      {
        path: "store-type",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/store-type/store-type.module"
          ).then((m) => m.StoreTypeModule),
      },
      {
        path: "item-collection",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/item-collection/item-collection.module"
          ).then((m) => m.ItemCollectionModule),
      }, //
      {
        path: "item-attribute",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/item-attribute/item-attribute.module"
          ).then((m) => m.ItemAttributeModule),
      },
      {
        path: "choices",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/choices/choices.module"
          ).then((m) => m.ChoicesModule),
      },
      {
        path: "addons",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/addons/addons.module"
          ).then((m) => m.AddonsModule),
      },
      {
        path: "tax-group",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/tax-group/tax-group.module"
          ).then((m) => m.TaxGroupModule),
      },
      {
        path: "subscription-payment",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/miscellaneous/store-order-balance/store-order-balance.module"
          ).then((m) => m.StoreOrderBalanceModule),
      },
      {
        path: "platform-configuration",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/platform-configuration/platform-configuration.module"
          ).then((m) => m.PlatformConfigurationModule),
      },
      {
        path: "demo-store",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/demo-store/demo-store.module"
          ).then((m) => m.DemoStoreModule),
      },
      {
        path: "tax-zone",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/tax-zone/tax-zone.module"
          ).then((m) => m.TaxZoneModule),
      },
      {
        path: "subscription-packages",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/subscription-packages/subscription-packages.module"
          ).then((m) => m.SubscriptionPackagesModule),
      },
      {
        path: "wallet",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/wallet/wallet.module"
          ).then((m) => m.WalletModule),
      },
      {
        path: "home-page-app",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/home-page-app/home-page-app.module"
          ).then((m) => m.HomePageAppModule),
      },
      {
        path: "stock-settings",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-stocks/stock-settings/stock-settings.module"
          ).then((m) => m.StockSettingsModule),
      },
      {
        path: "stock-method",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-stocks/stock-method/stock-method.module"
          ).then((m) => m.StockMethodModule),
      },
      {
        path: "home-page-portal",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/home-page-portal/home-page-portal.module"
          ).then((m) => m.HomePagePortalModule),
      },
      {
        path: "khata-customer",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/store-management/khata/khata.module"
          ).then((m) => m.KhataModule),
      },
      {
        path: "manage-subscription",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-subscription/manage-subscription.module"
          ).then((m) => m.ManageSubscriptionModule),
      },
      {
        path: "edit-profile",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/settings/edit-profile/edit-profile.module"
          ).then((m) => m.EditProfileModule),
      },
      {
        path: "change-password",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/settings/change-password/change-password.module"
          ).then((m) => m.ChangePasswordModule),
      },
      {
        path: "delete-account",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/settings/delete-account/delete-account.module"
          ).then((m) => m.DeleteAccountModule),
      },
      {
        path: "activity-log",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/activity-log/activity-log.module"
          ).then((m) => m.ActivityLogModule),
      },
      {
        path: "sms",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/communication/sms/sms.module"
          ).then((m) => m.SmsModule),
      },
      {
        path: "notification",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/communication/notification/notification.module"
          ).then((m) => m.NotificationModule),
      },
      {
        path: "email",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/communication/email/email.module"
          ).then((m) => m.EmailModule),
      },
      {
        path: "possetting",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-store/pos-setting/pos-setting.module"
          ).then((m) => m.POSSettingModule),
      },
      {
        path: "order-settings",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-store/order-settings/order-settings.module"
          ).then((m) => m.OrderSettingsModule),
      },
      {
        path: "other-settings",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-store/other-settings/other-settings.module"
          ).then((m) => m.OtherSettingsModule),
      },
      {
        path: "platform-configuration",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/platform-configuration/platform-configuration.module"
          ).then((m) => m.PlatformConfigurationModule),
      },
      {
        path: "common-configuration",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/common-configuration/commonConfiguration.module"
          ).then((m) => m.CommonConfigurationModule),
      },
      {
        path: "region-master",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/region-master/region-master.module"
          ).then((m) => m.RegionMasterModule),
      },
      {
        path: "/region-master",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/region-master/region-master.module"
          ).then((m) => m.RegionMasterModule),
      },
      {
        path: "manage-offer",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-offer/manage-offer.module"
          ).then((m) => m.ManageOfferModule),
      },
      {
        path: "contact-list",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/campaign-management/contact-list/contact-list.module"
          ).then((m) => m.ContactListModule),
      },
      {
        path: "/region-master",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/lookup/region-master/region-master.module"
          ).then((m) => m.RegionMasterModule),
      },
      {
        path: "banner",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/banner/banner.module"
          ).then((m) => m.BannerModule),
      },
      {
        path: "storebanner",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-store/banner-setting/banner-setting.module"
          ).then((m) => m.BannerSettingModule),
      },
      {
        path: "store-details",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-store/store-details/store-details.module"
          ).then((m) => m.StoreDetailsModule),
      },
      {
        path: "template",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/campaign-management/template/template.module"
          ).then((m) => m.TemplateModule),
      },
      {
        path: "campaign",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/campaign-management/campaign/campaign.module"
          ).then((m) => m.CampaignModule),
      },
      {
        path: "easy-script",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/easy-script/easy-script.module"
          ).then((m) => m.EasyScriptModule),
      },
      {
        path: "stock-inward",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-stocks/stock-inward/stock-inward.module"
          ).then((m) => m.StockInwardModule),
      },
      {
        path: "email-campaign",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/campaign-management/email-campaign/email-campaign.module"
          ).then((m) => m.EmailCampaignModule),
      },
      {
        path: "notification-template",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/campaign-management/notification-template/notification-template.module"
          ).then((m) => m.NotificationTemplateModule),
      },
      {
        path: "dine-in-setting",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-store/dine-in-setting/dine-in-setting.module"
          ).then((m) => m.DineInSettingModule),
      },
      {
        path: "business-hours",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-store/business-hours/business-hours.module"
          ).then((m) => m.BusinessHoursModule),
      },
      {
        path: "payment-setting",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-store/payment-setting/payment-setting.module"
          ).then((m) => m.PaymentSettingModule),
      },
      {
        path: "khatasettings",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-store/khata-settings/khata-settings.module"
          ).then((m) => m.KhatasettingsModule),
      },
      {
        path: "manage-table",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-store/manage-table/manage-table.module"
          ).then((m) => m.ManagetableModule),
      },
      {
        path: "storeholidays",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-store/store-holidays/store-holidays.module"
          ).then((m) => m.StoreholidaysModule),
      },
      {
        path: "stock-outward",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-stocks/stock-outward/stock-outward.module"
          ).then((m) => m.StockOutwardModule),
      },
      {
        path: "damaged-stock",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/manage-stocks/damaged-stock/damaged-stock.module"
          ).then((m) => m.DamagedStockModule),
      },
      {
        path: "customer-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/customer-report/customer-report.module"
          ).then((m) => m.CustomerReportModule),
      },
      {
        path: "khata-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/khata-report/khata-report.module"
          ).then((m) => m.KhataReportModule),
      },
      {
        path: "voucher-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/gift-voucher/gift-voucher.module"
          ).then((m) => m.GiftVoucherModule),
      },
      {
        path: "order-setting-list",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/order-settings-list/order-settings-list.module"
          ).then((m) => m.OrderSettingsListModule),
      },
      {
        path: "wallet-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/wallet-report/wallet-report.module"
          ).then((m) => m.WalletReportModule),
      },
      {
        path: "delivery-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/delivery-report/delivery-report.module"
          ).then((m) => m.DeliveryReportModule),
      },
      {
        path: "item-wise-order-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/item-wise-order/item-wise-order.module"
          ).then((m) => m.ItemWiseOrderModule),
      },
      {
        path: "deliveryboy-payout-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/delivery-boy-payout/delivery-boy-payout.module"
          ).then((m) => m.DeliveryBoyPayoutModule),
      },
      {
        path: "audit-log-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/audit-log-report/audit-log-report.module"
          ).then((m) => m.AuditLogReportModule),
      },
      {
        path: "communication-log-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/communication-log-report/communication-log-report.module"
          ).then((m) => m.CommunicationLogReportModule),
      },
      {
        path: "subscription-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/subscription-report/subscription-report.module"
          ).then((m) => m.SubscriptionReportModule),
      },
      {
        path: "sales-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/sales-report/sales-report.module"
          ).then((m) => m.SalesReportModule),
      },
      {
        path: "stock-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/stock-report/stock-report.module"
          ).then((m) => m.StockReportModule),
      },
      {
        path: "orders-report",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/report/orders/orders.module"
          ).then((m) => m.OrdersModule),
      },
      {
        path: "chat-support",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/chat-support/chat-support.module"
          ).then((m) => m.ChatSupportModule),
      },
      {
        path: "order",
        loadChildren: () =>
          import("src/app/modules/pages-module/order/order.module").then(
            (m) => m.OrderModule
          ),
      },
      {
        path: "driver-tracking",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/driver-tracking/driver-trakcing.module"
          ).then((m) => m.DriverTrakcingModule),
      },
      {
        path: "update-items",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/update-price/update-price.module"
          ).then((m) => m.UpdatePriceModule),
      },
      {
        path: "notfound",
        loadChildren: () =>
          import("src/app/modules/errors/errors.module").then(
            (m) => m.ErrorsModule
          ),
      },
      {
        path: "pickerorder",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/pick-order/pick-order.module"
          ).then((m) => m.PickOrderModule),
      },
      {
        path: "picker-selller-process-order",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/pick-order-process/pick-order-process.module"
          ).then((m) => m.PickOrderProcessModule),
      },
      {
        path: "add-order",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/add-order/add-order.module"
          ).then((m) => m.AddOrderModule),
      },
      {
        path: "download-center",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/download-center/download-center.module"
          ).then((m) => m.DownloadCenterModule),
      },
      {
        path: "notifications",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/settings/notification-list/notification-list.module"
          ).then((m) => m.NotificationModule),
      },
      {
        path: "pos",
        loadChildren: () =>
          import("src/app/modules/pages-module/pos/pos.module").then(
            (m) => m.POSModule
          ),
      },
      {
        path: "ask-question",
        loadChildren: () =>
          import("src/app/modules/pages-module/show-history/history.module").then(
            
            (m) => m.HistoryModule
          ),
      },
      {
        path: "ask-lokaly",
        loadChildren: () =>
          import("src/app/modules/pages-module/ask-lokaly/ask-lokaly.module").then(
            
            (m) => m.AskLokalyModule
          ),
      },
      {
        path: "page-management",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/page-management/page-management.module"
          ).then((m) => m.PageManagementModule),
      },
      {
        path: "help",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/help/help.module"
          ).then((m) => m.HelpModule),
      },
      {
        path: "block",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/block-management/block-management.module"
          ).then((m) => m.BlockManagementModule),
      },
      {
        path: "item-config",
        loadChildren: () =>
          import(
            "src/app/modules/pages-module/configurations/item-configuration/item-configuration.module"
          ).then((m) => m.ItemConfigurationModule),
      },
    ],
  },
  { path: "uploads/ckeditor", component: CkEditorImagesComponent },
];
