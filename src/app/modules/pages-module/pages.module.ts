import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { ClipboardModule } from "ngx-clipboard";
import { PagesRoutes } from "./pages.routing";
import { MapsComponent } from "./maps/maps.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxPaginationModule } from "ngx-pagination";
import { NgxSpinnerModule } from "ngx-spinner";
import { NgSelectModule } from "@ng-select/ng-select";
import { LoggeduserComponent } from "src/app/modules/pages-module/model/logged-user/logged-user.component";
import { renew_licenseComponent } from "src/app/modules/pages-module/model/renew-license/renew-license.component";
import { shareURLComponent } from "src/app/modules/pages-module/model/share-url/share-url.component";
import { crop_rectangleComponent } from "src/app/modules/pages-module/model/crop-rectangle/crop-rectangle.component";
import { ImageCropperModule } from "ngx-image-cropper";
import { AgmCoreModule } from "@agm/core";
import { subscriptionAddComponent } from "src/app/modules/pages-module/model/subscription-add/subscription-add.component";
import { MaterialModule } from "src/app/material/material/material.module";
import { PagesComponent } from "./pages.component";
import { ComponentsModule } from "src/app/components/components.module";
import { ChangeItemPriceComponent } from "./model/change-item-price/change-item-price.component";
import { RearrangeItemsComponent } from "./model/rearrange-items/rearrange-items.component";
import { SelectSubCategoryComponent } from "./model/select-sub-category/select-sub-category.component";
import { offerAddComponent } from "./model/offer-add/offer-add.component";
import { SelectCountryComponent } from "./model/select-country/select-country.component";
import { StoreLinkComponent } from "./model/store-link/store-link.component";
import { ActivitylogDetailsComponent } from "./model/activity-log-details/activity-log-details.component";
import { CropBannerImageComponent } from "./model/crop-banner-image/crop-banner-image.component";
import { AddContactComponent } from "./model/add-contact/add-contact.component";
import { EasyScriptModalComponent } from "./model/easy-script/easy-script.component";
import { SelectCategoryComponent } from "./model/select-category/select-category.component";
import { SelectCityAreaComponent } from "./model/select-city-area/select-city-area.component";
import { ManageStocksSelectItemComponent } from "./model/manage-stocks-select-item/manage-stocks-select-item.component";
import { BusinessHoursInfoComponent } from "./model/business-hours-info/business-hours-info.component";
import { WalletReportListComponent } from "./model/wallet-report-list/wallet-report-list.component";
import { DeliveryInfoModelComponent } from "./model/delivery-info/delivery-info.component";
import { SlotCutoffMethodinfoModelComponent } from "./model/slot-cutoff-method-info/slot-cutoff-method-info.component";
import { CityAreaModelComponent } from "./model/city-area/city-area.component";
import { SubscriptionSettlementComponent } from "./model/subscription-settlement/subscription-settlement.component";
import { ProofOfDeliveryComponent } from "./model/proof-of-delivery/proof-of-delivery.component";
import { OrderItemDetailsComponent } from "./model/order-item-details/order-item-details.component";
import { ChatSupportSelectItemsComponent } from "./model/chat-support-select-items/chat-support-select-items.component";
import { SortPipe } from "./util/sort.pipe";
import { SelectItemDeleteAddonChoiceComponent } from "./model/select-item-delete-addon-choice/select-item-delete-addon-choice.component";
import { SelectAddonChoicesComponent } from "./model/select-addon-choices/select-addon-choices.component";
import { RepeatAddonChoiceComponent } from "./model/repeat-addon-choice/repeat-addon-choice.component";
import { StockUnitManagementInfoComponent } from "./model/stock-unit-management-info/stock-unit-management-info.component";
import { DashboardHelpInfoComponent } from "./model/dashboard-help-info/dashboard-help-info.component";
import { AddEditVariantModelComponent } from "./model/add-edit-variant/add-edit-variant.component";
import { AddUnitConversionModelComponent } from "./model/add-unit-conversion/add-unit-conversion.component";
import { AddAddonsModelComponent } from "./model/add-addons/add-addons.component";
import { AddAttributeModelComponent } from "./model/add-attribute/add-attribute.component";
import { AddChoiceModelComponent } from "./model/add-choice/add-choice.component";
import { ItemDetailsComponent } from "./model/item-details/item-details.component";
import { OrderRefundDetailsComponent } from "./model/order-refund-details/order-refund-details.component";
import { NotificationBellComponent } from "./model/notification-bell/notification-bell.component";
import { proofOfDeliveryListComponent } from "./model/proof-of-delivery-list/proof-of-delivery-list.component";
import { PickerOrderDetailsComponent } from "./model/picker-order-details/picker-order-details.component";
import { AddOrderAddItemComponent } from "./model/add-order-add-item/add-order-add-item.component";
import { OrderSelectItemsComponent } from "./model/order-select-items/order-select-items.component";
import { SelectComboItemsComponent } from "./model/select-combo-items/select-combo-items.component";
import { RepeatComboItemsComponent } from "./model/repeat-combo-items/repeat-combo-items.component";
import { AvailableOffersComponent } from "./model/available-offers/available-offers.component";
import { OfferDetailComponent } from "./model/offer-detail/offer-detail.component";
import { itemImportSuccessModelComponent } from "./model/item-import-success/item-import-success.component";
import { OrderHistoryComponent } from "./model/order-history/order-history.component";
import { NgxImageCompressService } from "ngx-image-compress";
import { RearrangeCollectionComponent } from "./model/rearrange-collection/rearrange-collection.component";
import { AddNoteComponent } from "./model/add-note/add-note.component";
import { ExportItemDlModelComponent } from "./model/export-item-dl/export-item-dl.component";
import { BulkEditItemModelComponent } from "./model/bulk-edit-item/bulk-edit-item.component";
import { CropImageComponent } from "./model/crop-image/crop-image.component";
import { DownloadCommonComponent } from "./model/download-common/download-common.component";
import { SavedOrdersComponent } from "./model/saved-orders/saved-orders.component";
import { ChangeCustomerComponent } from "./model/change-customer/change-customer.component";
import { PosOrderConfirmComponent } from "./model/pos-order-confirm/pos-order-confirm.component";
import { AddPosCustomerComponent } from "./model/add-pos-customer/add-pos-customer.component";
import { RearrangePageManagementComponent } from "./model/rearrange-page-management/rearrange-page-management.component";
import { HelpInfoModelComponent } from "./model/help-info/help-info.component";
import { campaignLogComponent } from "./model/campaign-log/campaign-log.component";
import { ConfirmPasswordComponent } from "./model/confirm-password/confirm-password.component";
import { AddressBookComponent } from './model/address-book/address-book.component';
import { PaymentDetailComponent } from './model/payment-detail/payment-detail.component';
import { ShareLocationModelComponent } from "./model/share-location/share-location.component";
import { AddAddressComponent } from './model/add-address/add-address.component';
import { AuditLogDetailComponent } from "./model/audit-log-details/audit-log-details.component";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommunicationLogDetailComponent } from "./model/communication-log-details/communication-log-details.component";
import { StoreSetupModelComponent } from "./model/store-setup-model/store-setup-model.component";
import { VoiceSearchComponent } from "./model/voice-search/voice-search.component";
import { AddViewComponent } from './model/add-view/add-view.component';
import { DriverTrackingComponent } from './driver-tracking/driver-tracking.component';
import { UploadVideoComponent } from './model/upload-video/upload-video.component';
import { ChangeSequenceComponent } from './model/change-sequence/change-sequence.component';
import { CkEditorImagesComponent } from './model/ck-editor-images/ck-editor-images.component';
import { ColumnsToViewSequenceComponent } from './model/columns-to-view-sequence/columns-to-view-sequence.component';

@NgModule({
  imports: [
    MaterialModule,
    CommonModule,
    RouterModule.forChild(PagesRoutes),
    FormsModule,
    NgbModule,
    NgSelectModule,
    ReactiveFormsModule,
    ClipboardModule,
    NgxPaginationModule,
    ImageCropperModule,
    NgxSpinnerModule,
    ComponentsModule,
    AgmCoreModule, // configured once with forRoot in AppModule
    TranslateModule, // configured once with forRoot in AppModule
    FontAwesomeModule
  ],
  declarations: [
    PagesComponent,
    MapsComponent,
    LoggeduserComponent,
    renew_licenseComponent,
    shareURLComponent,
    offerAddComponent,
    campaignLogComponent,
    crop_rectangleComponent,
    subscriptionAddComponent,
    ChangeItemPriceComponent,
    RearrangeItemsComponent,
    RearrangeCollectionComponent,
    SelectSubCategoryComponent,
    SelectCountryComponent,
    StoreLinkComponent,
    CropBannerImageComponent,
    ActivitylogDetailsComponent,
    AddContactComponent,
    EasyScriptModalComponent,
    SelectCategoryComponent,
    SelectCityAreaComponent,
    ManageStocksSelectItemComponent,
    BusinessHoursInfoComponent,
    DeliveryInfoModelComponent,
    SlotCutoffMethodinfoModelComponent,
    CityAreaModelComponent,
    WalletReportListComponent,
    SubscriptionSettlementComponent,
    ProofOfDeliveryComponent,
    OrderItemDetailsComponent,
    ChatSupportSelectItemsComponent,
    SelectAddonChoicesComponent,
    RepeatAddonChoiceComponent,
    SelectItemDeleteAddonChoiceComponent,
    DashboardHelpInfoComponent,
    HelpInfoModelComponent,
    AddEditVariantModelComponent,
    AddUnitConversionModelComponent,
    AddAddonsModelComponent,
    AddAttributeModelComponent,
    AddChoiceModelComponent,
    StockUnitManagementInfoComponent,
    OrderRefundDetailsComponent,
    ItemDetailsComponent,
    NotificationBellComponent,
    proofOfDeliveryListComponent,
    PickerOrderDetailsComponent,
    AddOrderAddItemComponent,
    OrderSelectItemsComponent,
    SelectComboItemsComponent,
    RepeatComboItemsComponent,
    AvailableOffersComponent,
    OfferDetailComponent,
    itemImportSuccessModelComponent,
    OrderHistoryComponent,
    AddNoteComponent,
    ExportItemDlModelComponent,
    BulkEditItemModelComponent,
    CropImageComponent,
    DownloadCommonComponent,
    SavedOrdersComponent,
    ChangeCustomerComponent,
    PosOrderConfirmComponent,
    AddPosCustomerComponent,
    ConfirmPasswordComponent,
    AddressBookComponent,
    PaymentDetailComponent,
    ShareLocationModelComponent,
    AddAddressComponent,
    AuditLogDetailComponent,
    CommunicationLogDetailComponent,
    StoreSetupModelComponent,
    VoiceSearchComponent,
    AddViewComponent,
    UploadVideoComponent,
    ChangeSequenceComponent,
    CkEditorImagesComponent,
    ColumnsToViewSequenceComponent,
  ],
  providers: [SortPipe, NgxImageCompressService],
})
export class PagesModule { }
