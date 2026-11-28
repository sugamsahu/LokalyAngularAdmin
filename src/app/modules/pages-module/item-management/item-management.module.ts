import { TrackByKeyDirective } from '../../../utils/track-by-key.directive';
import { UploadImagesModalModule } from "src/app/modules/pages-module/model/upload-images/upload-images-modal.module";
import { ReviewModalsModule } from "src/app/modules/pages-module/model/reveiw-rating/review-modals.module";
import { ItemPickerModalsModule } from "src/app/modules/pages-module/model/add-select-item/item-picker-modals.module";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonApplicationModule } from "src/app/common-application.module";
import { ItemListComponent } from "./item-list.component";
import { ItemGroupingComponent } from "./item-grouping/item-grouping.component";
import { ItemGroupingAddComponent } from "./item-grouping-add/item-grouping-add.component";
import { ItemCollectionComponent } from "./item-collection/item-collection.component";
import { ItemCollectionAddComponent } from "./item-collection-add/item-collection-add.component";
import { ComboItemAddComponent } from "./combo-item-add/combo-item-add.component";
import { DatePipe } from "@angular/common";
import { ItemSubmissionApprovalComponent } from "./item-submission-approval/item-submission-approval.component";
import { ItemEditComponent } from "./item-edit/item-edit.component";
import { MasterItemListComponent } from "./master-item-list/master-item-list.component";
import { StoreItemImportComponent } from './store-item-import/store-item-import.component';
import { CarouselModule } from "ngx-owl-carousel-o";
import { TabGroupGestureModule } from "src/app/utils/tab-group-gesture.module"; // swipe tabs on the legacy tab group
import { ChangePriceComponent } from './change-price/change-price.component';
import { CKEditorModule } from "ckeditor4-angular";

const routes: Routes = [
  { path: "", component: ItemListComponent },
  { path: "itemgroup", component: ItemGroupingComponent },
  { path: "itemgroupedit", component: ItemGroupingAddComponent },
  { path: "itemgroupadd", component: ItemGroupingAddComponent },
  { path: "itemcollection", component: ItemCollectionComponent },
  { path: "itemcollectionadd", component: ItemCollectionAddComponent },
  { path: "itemcollectionedit", component: ItemCollectionAddComponent },
  { path: "comboitemadd", component: ComboItemAddComponent },
  { path: "comboitemedit", component: ComboItemAddComponent },
  { path: "pending-items", component: ItemSubmissionApprovalComponent },
  { path: "item-add", component: ItemEditComponent },
  { path: "item-masterItemAdd", component: ItemEditComponent },
  { path: "item-edit", component: ItemEditComponent },
  { path: "edit-adminitem", component: ItemEditComponent },
  { path: "edit-master-adminitem", component: ItemEditComponent },
  { path: "masteritems", component: ItemListComponent },
  { path: "seller-items-import", component: StoreItemImportComponent },
  { path: "import-items", component: StoreItemImportComponent },
  { path: "changePrice", component: ChangePriceComponent },
  // { path: "**", component: ItemListComponent },
];

@NgModule({
  declarations: [
    ItemListComponent,
    ItemGroupingComponent,
    ItemGroupingAddComponent,
    ItemCollectionComponent,
    ItemCollectionAddComponent,
    ComboItemAddComponent,
    ItemSubmissionApprovalComponent,
    ItemEditComponent,
    MasterItemListComponent,
    StoreItemImportComponent,
    ChangePriceComponent,
  ],
  imports: [
    TrackByKeyDirective,
    UploadImagesModalModule,
    ReviewModalsModule,
    ItemPickerModalsModule,RouterModule.forChild(routes),
    CommonApplicationModule,
    CarouselModule,
    TabGroupGestureModule,
    CKEditorModule,
  ],
  providers: [DatePipe],
})
export class ItemManagementModule { }
