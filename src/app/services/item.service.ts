import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { AjaxService } from "./ajax.service";
import { CommonService } from "./common.service";

@Injectable({
  providedIn: "root",
})
export class ItemService {
  categoryId = new Subject();
  constructor(
    private ajaxService: AjaxService,
    public commonService: CommonService
  ) { }

  role = this.commonService.getUserRoleName();
  userData = JSON.parse(localStorage.getItem("loginUser"));

  get(data: any): Observable<any> {
    if (data?.stock_management_method == 2 || data?.stock_management_method == 3) {
      var userData = JSON.parse(localStorage.getItem("loginUser"));
      var role = userData.role_id == 1 ? "admin" : userData.role_id == 6 ? "admin" : "store";
      return this.ajaxService.post(data, role + '/items_lists_for_stock')
    } else {
      return this.ajaxService.post2(data, "store/item_search");
    }
  }

  itemExport(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "store/item_export");
  }

  downloadExportItemImage(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/download_store_item_images");
  }

  isCategoryIdUpdated() {
    return this.categoryId.asObservable();
  }

  outOfStockItem(data: any): Observable<any> {
    return this.ajaxService.formData(data, this.role + "/manage_out_of_stock");
  }

  manageFeaturedType(data: any): Observable<any> {
    return this.ajaxService.formData2(data, this.role + "/add_best_seller");
  }

  manageMaskPrice(data: any): Observable<any> {
    return this.ajaxService.formData(data, this.role + "/manage_mask_price");
  }

  deleteItem(data: any): Observable<any> {
    return this.ajaxService.formData(data, "store/delete_item");
  }

  changePrice(data: any): Observable<any> {
    return this.ajaxService.formData2(data, this.role + "/change_item_price");
  }

  categoryRearrange(data: any): Observable<any> {
    return this.ajaxService.post(data, "store/reorder_store_categories");
  }

  getRecommendedItems(data: any): Observable<any> {
    return this.ajaxService.post2(data, "store/recommended_items");
  }

  addEditStoreItemGroup(data: any): Observable<any> {
    return this.ajaxService.formData2(data, "store/manage_recommended_items");
  }

  deleteStoreItemGroup(data: any): Observable<any> {
    return this.ajaxService.formData2(data, "store/delete_recommended_items");
  }

  getCollectionList(data: any): Observable<any> {
    return this.ajaxService.post(data, "store/store_collections");
  }

  deleteStoreItemCollection(data: any): Observable<any> {
    return this.ajaxService.formData2(data, "store/delete_store_collection");
  }

  getCollectionMasterData(data: any): Observable<any> {
    return this.ajaxService.post(data, "store/master_collections_for_store");
  }

  getStoreCollectionDetails(data: any): Observable<any> {
    return this.ajaxService.post2(data, "store/store_collection_details");
  }

  getDefaultCategorySubCategoryList(data: any): Observable<any> {
    return this.ajaxService.post(data, "admin/store_sub_categories");
  }

  getPackTypeList(data: any): Observable<any> {
    return this.ajaxService.post2(data, "admin/packaging_list");
  }

  getUOMList(data: any): Observable<any> {
    return this.ajaxService.post(data, "admin/item_unit_list");
  }

  getTagMasterList(data: any): Observable<any> {
    return this.ajaxService.post2(data, "admin/item_tags");
  }

  getAddOnsSubAddOnsList(data: any): Observable<any> {
    return this.ajaxService.post2(data, "admin/master_addons_list");
  }

  getChoicesSubChoicesList(data: any): Observable<any> {
    return this.ajaxService.post2(data, "admin/master_choices_list");
  }

  addMasterItem(data: any): Observable<any> {
    return this.ajaxService.formData(data, this.role + "/manage_item");
  }

  saveExcelItemImport(data: any): Observable<any> {
    return this.ajaxService.formData2(data, "admin/import_store_items");
  }

  addEditCollection(data: any): Observable<any> {
    return this.ajaxService.formData(data, "store/manage_store_collection");
  }

  addEditComboItem(data: any): Observable<any> {
    return this.ajaxService.formData(data, this.role + "/manage_combo_items");
  }

  getComboItemData(data: any): Observable<any> {
    if (this.userData.role_id == 1) {
      // supper admin
      return this.ajaxService.formData(data, "admin/store_item_details");
    } else if (this.userData.role_id == 2) {
      // seller (store)
      return this.ajaxService.formData(data, "store/item_details");
    } else {
      return this.ajaxService.formData(data, "store/item_details");
    }
  }

  // get item list
  getPackageingItemList(): Observable<any> {
    return this.ajaxService.get2(this.role + "/packaging_list");
  }

  getUnitItemList(): Observable<any> {
    return this.ajaxService.get(this.role + "/item_unit_list");
  }

  getUnitConversionList(data: {}): Observable<any> {
    return this.ajaxService.formData(data, "store/item_unit_conversion_list");
  }

  getCollectionMasterList(data: {}): Observable<any> {
    return this.ajaxService.post(data, "store/master_collections_for_store");
  }

  //Get Item Details
  getItemDetails(data: {}): Observable<any> {
    console.log(this.userData)
    if (this.userData.role_id == 1) {
      // supper admin
      return this.ajaxService.formData(data, "admin/store_item_details");
    } else if (this.userData.role_id == 2) {
      // seller (store)
      return this.ajaxService.formData2(data, "store/item_details");
    } else {
      return this.ajaxService.formData2(data, "store/item_details");
    }
  }

  getCategoryList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, this.role + "/categories_list");
  }

  getStoreSubCategoryList(data: {}): Observable<any> {
    return this.ajaxService.post2(data, this.role + "/sub_categories_list");
  }

  getMasterChoiceList(data: any): Observable<any> {
    return this.ajaxService.post2(data, "user/master_choices_list");
  }

  getMasterAttributes(data: any): Observable<any> {
    return this.ajaxService.post(
      data,
      "admin/item_attributes_list_sub_categories"
    );
  }

  getMasterAddOnList(data: any): Observable<any> {
    return this.ajaxService.post2(data, "user/master_addons_list");
  }

  pendingItemsApproval(data: any): Observable<any> {
    return this.ajaxService.post(data, "admin/pending_items_list");
  }

  approveItems(data: any): Observable<any> {
    return this.ajaxService.post2(data, "admin/approve_items");
  }

  rejectItems(data: any): Observable<any> {
    return this.ajaxService.post2(data, "admin/reject_items");
  }

  getDefaultItemList(data: any): Observable<any> {
    return this.ajaxService.post(data, "admin/default_item_list");
  }

  defaultItemActiveInActive(data: any): Observable<any> {
    return this.ajaxService.post(data, "store/manage_default_items");
  }

  deleteDefaultItem(data: any): Observable<any> {
    return this.ajaxService.post2(data, "admin/delete_default_item");
  }

  getMasterItemDetails(data: any): Observable<any> {
    return this.ajaxService.post(data, "store/item_details");
  }

  getUserStoreRoles(data: any): Observable<any> {
    return this.ajaxService.post(data, "admin/user_store_roles");
  }

  getStoreLookupList(data: any): Observable<any> {
    return this.ajaxService.post(data, "store/store_lookups");
  }

  manageItemImages(data: any): Observable<any> {
    if (this.userData.role_id == 1) {
      // supper admin
      return this.ajaxService.formData2(data, "admin/manage_item_images");
    } else if (this.userData.role_id == 2) {
      // seller (store)
      return this.ajaxService.formData2(data, "store/manage_item_images");
    } else {
      return this.ajaxService.formData2(data, "store/manage_item_images");
    }
  }

  deleteItemImages(data: any): Observable<any> {
    if (this.userData.role_id == 1) {
      // supper admin
      return this.ajaxService.formData2(data, "admin/delete_item_image");
    } else if (this.userData.role_id == 2) {
      // seller (store)
      return this.ajaxService.formData2(data, "store/delete_item_image");
    } else {
      return this.ajaxService.formData2(data, "store/delete_item_image");
    }
  }

  changeItemPrice(data: any): Observable<any> {
    return this.ajaxService.formData2(data, "store/change_item_price")
  }

  exportVariants(data: {}): Observable<any> {
    return this.ajaxService.post2(data, "admin/export_variants");
  }

  getDefaultStoreSubCategoryList(data: any): Observable<any> {
    return this.ajaxService.post(data, "store/default_store_sub_category_list");
  }

  getMasterItemList(data: any): Observable<any> {
    return this.ajaxService.post(data, "store/master_item_list");
  }

  manageMasterImportItems(data: any): Observable<any> {
    return this.ajaxService.post(data, "store/master-import-items");
  }
}