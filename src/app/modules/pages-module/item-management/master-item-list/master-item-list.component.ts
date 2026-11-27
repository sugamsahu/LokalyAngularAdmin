import {
  Component,
  ElementRef,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CommonService } from "src/app/services/common.service";
import { ItemService } from "src/app/services/item.service";
import { environment } from "src/environments/environment";
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from "@angular/forms";
import { ItemAttributeService } from "src/app/services/lookup/item-attribute.service";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { ItemDetailsComponent } from "../../model/item-details/item-details.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-master-item-list",
  templateUrl: "./master-item-list.component.html",
  styleUrls: ["./master-item-list.component.scss"],
})
export class MasterItemListComponent implements OnInit {
  public formGroup: UntypedFormGroup;
  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  search = "";
  no_data = true;
  main: any;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  global_currency: any;
  global_timezone: any;
  session_store_id: string;
  session_category_id: string;
  iseatery: any;
  platform_setting: any;
  business_model: any;
  store_label: any;
  show_price_same_font: any;
  is_master_item_show: boolean;
  general_setting: any;
  StoreList: any = [];
  CategoryList: any = [];
  FilterByStatusList = [
    { name: "All", value: 0 },
    { name: "Active", value: 1 },
    { name: "InActive", value: 2 },
  ];
  search_as_per_table_field: any = [];
  main_default_item_list: any = [];
  default_item_list: any = [];
  CatIDs: any = [];
  admin_base_image: any
  AdminImp = {
    SelectAllItems: false,
  };
  base_url: any;

  constructor(
    private itemService: ItemService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private formBuilder: UntypedFormBuilder,
    private itemAttributeService: ItemAttributeService,
    private modalService: NgbModal,
    private router: Router,
  ) {
    this.base_url = environment.apiUrl;
    this.admin_base_image = this.base_url + "/uploads/store/";
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    this.getCondition();
    this.loadForm();
    this.StoreTypeListRecord();
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;
    if (
      localStorage.getItem("seller_Order_obj") != null &&
      localStorage.getItem("seller_Order_obj") != undefined
    ) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }

    if (filterObject) {
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.defaultItemListRecord(1);
        })
      )
      .subscribe();
  }

  getCondition() {
    this.main = this.appComponent.main;
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserStoreInfo = JSON.parse(
      session.getSessionLoginUserStore()
    );
    localStorage.setItem("masterItemDuplicate", "false");
    this.general_setting = JSON.parse(
      localStorage.getItem("LoggedUserSettings")
    );
    this.global_currency = this.general_setting.currency_symbol;
    this.global_timezone = this.general_setting.timezone;
    this.session_store_id = localStorage.getItem("adminselectedstore");
    this.session_category_id = localStorage.getItem("adminselectedcategory");
    this.iseatery = this.main.LoggedUserStoreInfo.iseatery;
    this.platform_setting = JSON.parse(
      localStorage.getItem("_platform_setting")
    );
    this.platform_setting =
      this.platform_setting == null
        ? this.main.platform_setting
        : this.platform_setting;
    this.business_model = this.platform_setting.business_model;
    if (this.general_setting) {
      this.store_label = this.general_setting.store_label;
      this.show_price_same_font = this.general_setting.show_price_same_font;
    } else {
      this.store_label = this.main.store_label;
      this.show_price_same_font = this.main.show_price_same_font;
    }
    this.is_master_item_show =
      this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : false;
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      SelectedStoreType: new UntypedFormControl(null),
      Selectedcategory: new UntypedFormControl(null),
      showCombineVarient: new UntypedFormControl(false),
      filter: new UntypedFormControl(0),
      FilterSearchAsperTableField: new UntypedFormControl(0),
      item_varients: new UntypedFormControl(null),
    });
    this.defaultSearchField();
  }

  //get store type list
  async StoreTypeListRecord() {
    var data = {
      token_type: 1,
    };
    await this.commonService.getMasterCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var storetypelist = response.data;
          storetypelist.forEach((element) => {
            if (element.iseatery == 0) {
              this.StoreList.push(element);
            }
          });
          this.formGroup.controls["SelectedStoreType"].setValue(
            this.StoreList[0].category_id
          );
          this.getCategoryList();
          this.cdr.detectChanges();
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //get store type id
  getStoreTypeId() {
    this.getCategoryList();
  }
  //get category list
  getCategoryList() {
    this.defaultItemListRecord(this.page);
    this.AdminImp.SelectAllItems = false;
    const data: any = {
      category_id: this.formGroup.value.SelectedStoreType,
    };
    this.itemAttributeService.getCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.CategoryList = response.data;
          this.formGroup.controls["Selectedcategory"].setValue(
            this.CategoryList[0].parent_category_id
          );
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  // active and inactive
  ItemActiveInActive(activeInactiveFlag) {
    var Items = [];
    if (this.formGroup.value.showCombineVarient == false) {
      this.default_item_list.forEach((Item) => {
        if (Item.SelectedItem == true) {
          var item = {
            item_variants_id: Item.item_variants_id,
            is_active: activeInactiveFlag,
          };
          Items.push(item);
        }
      });
    } else {
      for (var i = 0; i < this.default_item_list.length; i++) {
        if (this.default_item_list[i].SelectedItem == true) {
          var item = {
            item_id: this.default_item_list[i].item_id,
            is_active: activeInactiveFlag,
          };
          Items.push(item);
        }
      }
    }
    this.defaultItemListActiveInActive(Items);
  }

  defaultItemListActiveInActive(Items) {
    var fd = {
      items: Items,
      user_id: this.main.LoggedUserInfo.user_id,
    };

    if (this.formGroup.value.showCombineVarient == false) {
      this.itemService.defaultItemActiveInActive(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.checkall = false;
            this.toastr.success(response.message);
            this.defaultItemListRecord(this.page);
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => { },
        complete: () => { },
      });
    } else {
      this.itemService.deleteDefaultItem(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.checkall = false;
            this.toastr.success(response.message);
            this.defaultItemListRecord(this.page);
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => { },
        complete: () => { },
      });
    }
  }

  //select combine view
  ShowCombineVarientList() {
    this.defaultItemListRecord(this.page);
  }

  // search filter
  defaultSearchField() {
    if (this.formGroup.value.showCombineVarient == false) {
      this.search_as_per_table_field = [
        { name: "All", field: "$", value: 0 },
        { name: "Brand Name", field: "brand_name", value: 1 },
        { name: "Item Name", field: "item_name", value: 2 },
        { name: "Pack Type", field: "packaging_name", value: 3 },
        { name: "UOM", field: "unit_name", value: 4 },
        { name: "UOM Qty", field: "unit_quantity", value: 5 },
        { name: "Price MRP", field: "item_price", value: 6 },
        { name: "Discounted Price", field: "discounted_price", value: 7 },
      ];
    } else {
      this.search_as_per_table_field = [
        { name: "All", field: "$", value: 0 },
        { name: "Brand Name", field: "brand_name", value: 1 },
        { name: "Item Name", field: "item_name", value: 2 },
      ];
    }
  }
  
  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.defaultItemListRecord(1);
    }
  }

  GetItemListRecord() {
    this.default_item_list = [];
    this.main_default_item_list = [];
    this.CatIDs = [];
    if (this.formGroup.value.SelectedStoreType) {
      if (!this.formGroup.value.Selectedcategory) {
        var CatIDs = this.CategoryList.map(function (cat) {
          return cat.parent_category_id;
        });
        this.CatIDs = CatIDs;
      } else {
        this.CatIDs.push(this.formGroup.value.Selectedcategory);
      }
      this.defaultItemListRecord(this.page);
    } else {
      this.toastr.error(this.translate.instant("PLEASE_SELECT_ANY_STORE_TYPE"));
      return;
    }
  }

  //Get item list record
  varients: any = [];
  defaultItemListRecord(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    this.page = page;
    var data = {};

    if (this.formGroup.value.showCombineVarient == false) {
      var data1 = {
        user_id: this.main.LoggedUserInfo.user_id,
        sub_category_id: this.CatIDs.length > 0 ? this.CatIDs.toString() : "",
        category_id: this.formGroup.value.SelectedStoreType,
        page: this.page,
        search_type:
          this.formGroup.value.FilterSearchAsperTableField > 0
            ? this.formGroup.value.FilterSearchAsperTableField
            : null,
        search_query: search,
        filter:
          this.formGroup.value.filter > 0 ? this.formGroup.value.filter : "",
      };
      data = data1;
    } else {
      var data2 = {
        user_id: this.main.LoggedUserInfo.user_id,
        sub_category_id: this.CatIDs.length > 0 ? this.CatIDs.toString() : "",
        category_id: this.formGroup.value.SelectedStoreType,
        variants: 1,
        page: this.page,
        search_type:
          this.formGroup.value.FilterSearchAsperTableField > 0
            ? this.formGroup.value.FilterSearchAsperTableField
            : null,
        search_query: search,
      };
      data = data2;
    }

    this.itemService.getDefaultItemList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.defaultSearchField();
          this.main_default_item_list = response.data;
          this.varients = [];
          this.main_default_item_list.forEach((element) => {
            if (element.item_image) {
              element.item_image = this.admin_base_image + element.item_image;
            }
            element.SelectedItem = false;
          });
          this.default_item_list = this.main_default_item_list;
          this.no_data = false;
          this.count = response.count;
          this.AdminImp.SelectAllItems = false;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.default_item_list = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  // check all
  checkall = false;
  selectall() {
    if (this.checkall == true) {
      this.default_item_list.forEach((category) => {
        category.SelectedItem = true;
      });
    }
    if (this.checkall == false) {
      this.default_item_list.forEach((category) => {
        category.SelectedItem = false;
      });
    }
  }

  // details modal
  newItem: any = [];
  varientItem: any = [];
  counter = 0;
  async viewMasterItemDetail(item) {
    var fd = {
      item_id: item.item_id,
    };
    await this.itemService.getMasterItemDetails(fd).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.newItem = [];
          this.varientItem = [];
          this.newItem = response.data[0];
          if (localStorage.getItem("masterItemDuplicate") == "false") {
            var obj = {
              packaging_name: null,
              unit_quantity: null,
              unit_name: null,
              item_price: null,
              discounted_price: null,
              unit_id: null,
              packaging_id: null,
              item_variants_id: null,
              sub_category_id: null,
            };
            this.newItem.item_variants.forEach((value) => {
              obj.packaging_name = value.packaging_name;
              obj.unit_quantity = value.unit_quantity;
              obj.unit_name = value.unit_name;
              obj.item_price = value.item_price;
              obj.discounted_price = value.discounted_price;
              obj.unit_id = value.unit_id;
              obj.packaging_id = value.packaging_id;
              obj.item_variants_id = value.item_variants_id;
              obj.sub_category_id = ++this.counter;
              this.varientItem.push(obj);
            });

            this.itemdetailsModal(item);

            this.cdr.detectChanges();
          } else {
            this.newItem.item_image = "";
          }
        } else {
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  itemdetailsModal(item) {
    const modalRef = this.modalService.open(ItemDetailsComponent, {
      size: "lg",
      centered: true,
    });
    modalRef.componentInstance.viewItem = item;
    modalRef.componentInstance.newItem = this.newItem;
    modalRef.componentInstance.varientItem = this.varientItem;
    modalRef.componentInstance.show_price_same_font = this.show_price_same_font;
  }
}
