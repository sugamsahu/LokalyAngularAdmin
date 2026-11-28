import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { ItemService } from "src/app/services/item.service";
import * as XLSX from "xlsx-js-style";
import Swal from "sweetalert2";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { itemImportSuccessModelComponent } from "../../model/item-import-success/item-import-success.component";
import { CommonService } from "src/app/services/common.service";
import { environment } from "src/environments/environment";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { isEqual } from "lodash";
import { UsersService } from "src/app/services/users.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-store-item-import",
  templateUrl: "./store-item-import.component.html",
  styleUrls: ["./store-item-import.component.scss"],
})
export class StoreItemImportComponent implements OnInit {
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  login_user_store = JSON.parse(localStorage.getItem("loginUserStore"));
  store_label = this.general_setting.store_label;
  is_common_eatery = this.general_setting.eatery_module;
  eatery_import_file = this.general_setting.eatery_import_file;
  non_eatery_import_file = this.general_setting.non_eatery_import_file;
  show_eatery_file_for_store = false;
  show_non_eatery_file_for_store = false;
  SelectedCategory: 0;
  category_list: any = [];
  main: any;
  NewExcelRows: any = [];
  NotMatchSubCateguryExcelRows: any = [];
  NotAddItemsInDatabase: any = [];
  store_category_name: any;
  store_Full_Address: any;
  iseatery: any;
  isItemApprovel: any;
  SelectedFile = null;
  SelectedZipFile = null;
  DuplicatItems = [];
  AddItemsInDatabase = [];
  storeid: any = 0;
  CurrentDateTime: any;
  details = [];
  selected_store_category_id: any;
  @ViewChild("excelUpload") _ExcelUpload!: ElementRef;
  @ViewChild("zipUpload") _zipUpload!: ElementRef;
  DefaultCategorySubCategoryList: any;
  PackTypeList: any[];
  UOMList: any[];
  ItemTagList: any[];
  AddOnsList: any[];
  ChoicesList: any[];
  status: any;
  selectedCategory: any;
  userId: any;
  IsVisible: boolean;
  TotalUploadItems: any;
  SuccessUploadItems: any;
  FailedUploadItems: any;
  isSellerItemImport = false;
  storetypelist: any = [];
  no_data_NotMatchSubCateguryExcelRows = false;
  no_data_NotAddItemsInDatabase = false;
  no_data_DuplicatItems = false;
  no_data_AddItemsInDatabase = false;
  no_data_NewExcelRows = false;
  selectedPerPage: any;
  page: number = 1;
  tableSize = environment.tableSize;
  total_count: number = 0;
  perPages: any = [
    { id: "5", name: "5" },
    { id: "10", name: "10" },
    { id: "20", name: "20" },
    { id: "50", name: "50" },
    { id: "100", name: "100" },
    { id: "1000000000", name: "ALL" },
  ];
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  import_from: any = "1";
  start_importing_category: boolean = false;
  start_importing_item: boolean = false;
  sub_category_ids: any = [];
  master_store_category: any = [];
  master_store_items: any = [];
  selected_import_items: any = [];
  select_sub_cat: boolean = false;
  select_all_cat: boolean = false;
  select_all_items: boolean = false;
  selected_store: any;
  selected_store_value: any;
  fileName: any = '';
  superAdmin: any;
  sub_category_status: any = 0;

  constructor(
    public translate: TranslateService,
    private appComponent: AppComponent,
    public itemService: ItemService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    public commonService: CommonService,
    private spinner: SpinnerService,
    private _helpService: BannerService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    this.superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!this.superAdmin && window.location.pathname == "/items/import-items") {
      this.router.navigate(['/dashboard']);
      return;
    }
    if (this.login_user_store.user_role_confirm == '0') {
      this.selected_store_value = this.login_user_store;
      this.store_category_name = this.login_user_store.category_name;
      if (this.login_user_store.store_name != "") {
        this.selected_store = this.login_user_store.store_name;
        this.SelectedCategory = this.login_user_store.store_name;
      }
      if (this.login_user_store.store_name == "") {
        this.selected_store = this.login_user_store.manager_name;
        this.SelectedCategory = this.login_user_store.manager_name;
      }
      this.store_Full_Address = [
        this.login_user_store.store_address1,
        this.login_user_store.store_address2,
        this.login_user_store.area_name,
        this.login_user_store.city_name,
        this.login_user_store.country_name,
        this.login_user_store.zipcode,
      ]
        .filter(Boolean)
        .join(", ");
    }
    this.selectedPerPage = localStorage.getItem('itemImportPagination');
    if (this.selectedPerPage) {
      this.tableSize = this.selectedPerPage;
    } else {
      this.tableSize = this.perPages[1].id;
      this.selectedPerPage = this.perPages[1].id;
    }
    if (location.href.indexOf("/items/seller-items-import") > -1) {
      this.isSellerItemImport = true
    }
    this.GetMasterCategoryList();
    this.getHelpDetails()
  }

  GetMasterCategoryList() {
    var data = {}
    if (this.isSellerItemImport) {
      data = {
        user_id: this.main.LoggedUserInfo.user_id,
      };
      this.itemService.getUserStoreRoles(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            response.data.forEach((data) => {
              if (data.role_id == 2) {
                data.manager_name = data.manager;
                data.store_area_name = data.area_name;
                data.store_city_name = data.city_name;
                if (data.iseatery == 1) {
                  this.show_eatery_file_for_store = true;
                } else {
                  this.show_non_eatery_file_for_store = true;
                }
                this.category_list.push(data);
              }
            });
            this.category_list = this.category_list.sort((a, b) => a.store_name.localeCompare(b.store_name));
          }
        },
        error: (error) => { },
        complete: () => {
          if (this.login_user_store.user_role_confirm == '0') {
            this.getMasterSubCategoryList();
          }
        },
      });
    } else {
      data = {
      };
      this.commonService.getMasterCategoryList(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            response.data.forEach((data) => {
              if (data.iseatery == 1) {
                this.show_eatery_file_for_store = true;
              } else {
                this.show_non_eatery_file_for_store = true;
              }
              this.category_list.push(data)
            })
          }
        },
        error: (error) => { },
        complete: () => { },
      });
    }
  }

  getMasterSubCategoryList() {
    this.spinner.show();
    let data: any = {
      category_id: this.selected_store_value.category_id,
      market_type: 1,
      store_id: this.selected_store_value.store_id,
    };
    this.itemService.getDefaultStoreSubCategoryList(data).subscribe({
      next: (response: any) => {
        this.sub_category_status = response.status;
        if (response.status == 1) {
          this.select_all_cat = false;
          this.sub_category_ids = [];
          this.master_store_category = response.data;
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  getMasterItemList() {
    this.spinner.show();
    let data: any = {
      sub_category_id: this.sub_category_ids.toString(),
      store_id: this.selected_store_value.store_id,
    };
    this.itemService.getMasterItemList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.select_all_items = false;
          this.selected_import_items = [];
          this.master_store_items = response.data;
          this.master_store_items.forEach((element: any) => {
            element.is_added = 0
          });
          this.start_importing_item = true;
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  selectedStore(item: any) {
    if (item.store_name != "") {
      this.selected_store = item.store_name;
    }
    if (item.store_name == "") {
      this.selected_store = item.manager_name;
    }
    this.selected_store_value = item;
  }

  selectCategory(item) {
    if (item.store_name != "") {
      this.SelectedCategory = item.store_name;
    }
    if (item.store_name == "") {
      this.SelectedCategory = item.manager_name;
    }
    this.storeid = item.store_id;
    if (item.store_id != null) {
      this.store_category_name = item.category_name;
      this.store_Full_Address = [
        item.store_address1,
        item.store_address2,
        item.area_name,
        item.city_name,
        item.country_name,
        item.zipcode,
      ]
        .filter(Boolean)
        .join(", ");
      this.selected_store_category_id = item.category_id;
      this.userId = item.user_id;
      this.selectedCategory = item;
      this.iseatery = item.iseatery;
      this.isItemApprovel = 0;

      var itemApprovalShopTypeString =
        this.general_setting != undefined
          ? this.general_setting.item_approval_shop_type
          : this.main.item_approval_shop_type;
      var itemApprovalShopType = itemApprovalShopTypeString
        .toString()
        .split(",");
      var filterSubcategory = itemApprovalShopType.filter(
        (shopType) => shopType == item.category_id
      );
      if (filterSubcategory.length > 0) {
        this.isItemApprovel = 1;
      }
    }
  }

  DateFormateFromServerSide() {
    return this.main.DateFormate;
  }

  downloadCategorySubCategory() {
    var store_id: any;
    if (this.login_user_store.user_role_confirm == '0') {
      store_id = this.login_user_store.store_id;
    } else {
      store_id = this.storeid;
    }
    var data = {
      store_id: (store_id).toString(),
    };
    this.itemService.getStoreLookupList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          window.open(response.data)
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  async getDefaultCategorySubCategoryList() {
    this.spinner.show();
    var data = {};
    await this.itemService.getDefaultCategorySubCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.DefaultCategorySubCategoryList = response.data;
          this.GetPackTypeList();
        } else {
          this.DefaultCategorySubCategoryList = [];
          this.GetPackTypeList();
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  GetPackTypeList() {
    this.spinner.show();
    var data = {};
    this.itemService.getPackTypeList(data).subscribe({
      next: (response: any) => {
        this.GetUOMList();
        if (response.status == 1) {
          this.PackTypeList = [];
          this.PackTypeList = response.data;
        } else {
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  GetUOMList() {
    this.spinner.show()
    var data = {};
    this.itemService.getUOMList(data).subscribe({
      next: (response: any) => {
        this.GetItemTagList();
        if (response.status == 1) {
          this.UOMList = [];
          this.UOMList = response.data;
        } else {
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  GetItemTagList() {
    this.spinner.show()
    var data = {
      category_id: this.selected_store_category_id,
    };
    this.itemService.getTagMasterList(data).subscribe({
      next: (response: any) => {
        this.GetAddOnsSubAddOnsList();
        if (response.status == 1) {
          this.ItemTagList = [];
          this.ItemTagList = response.data;
        } else {
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  GetAddOnsSubAddOnsList() {
    this.spinner.show();
    var data = {};
    this.itemService.getAddOnsSubAddOnsList(data).subscribe({
      next: (response: any) => {
        this.getChoicesSubChoicesList();
        if (response.status == 1) {
          this.AddOnsList = [];
          this.AddOnsList = response.data;
        } else {
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  getChoicesSubChoicesList() {
    this.spinner.show();
    var data = {};
    this.itemService.getChoicesSubChoicesList(data).subscribe({
      next: (response: any) => {
        if (this.login_user_store.user_role_confirm == '0') {
          this.UpdateFirstTimeLoginConfirm(this.main.LoggedUserStoreInfo);
        }
        if (response.status == 1) {
          this.ChoicesList = [];
          this.ChoicesList = response.data;

        } else {
        }
        this.Upload();
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  Upload() {
    this.spinner.show();
    this.status = {
      isCustomHeaderOpen1: true,
      isCustomHeaderOpen2: false,
      isCustomHeaderOpen3: false,
      isCustomHeaderOpen4: false,
      isFirstOpen: true,
      isFirstDisabled: false,
    };

    this.NewExcelRows = [];
    this.DuplicatItems = [];
    this.NotMatchSubCateguryExcelRows = [];
    this.NotAddItemsInDatabase = [];
    this.AddItemsInDatabase = [];

    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    if (
      this.selectedCategory.store_id != null &&
      this.selectedCategory.store_id != ""
    ) {
      if (this.SelectedFile == null) {
        this.toastr.error(
          this.translate.instant("Please select any file to be upload.")
        );
      } else {
        var finame = this.SelectedFile.name;
        var newfile = finame.replace(/[/\\?%*:|"<> ()]/g, "_");
        if (regex.test(newfile.toLowerCase())) {
          if (typeof FileReader != "undefined") {
            var reader = new FileReader();
            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
              let self = this;
              reader.onloadend = function (e) {
                self.ProcessExcel(reader.result);
              };
              reader.readAsBinaryString(this.SelectedFile);
            } else {
              let self = this;
              reader.readAsArrayBuffer(this.SelectedFile);
            }
          } else {
            this.toastr.error(
              this.translate.instant("This browser does not support HTML5.")
            );
          }
        } else {
          this.toastr.error(
            this.translate.instant(
              "File name should not contain any special characters."
            )
          );
        }
      }
    } else {
      this.toastr.error(this.translate.instant("Please select any category."));
    }
    this.spinner.hide();
  }

  ProcessExcel(data) {
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
      type: "binary",
    });

    //Fetch the name of First Sheet.
    var firstSheet = workbook.SheetNames[0];

    //Read all rows from First Sheet into an JSON array.
    var excelRows: any = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

    var count = 0;
    var variant_units: any = [];
    excelRows.forEach((Row) => {
      count++;
      var PrescRequired = false;
      var newRow = {
        import_item_variants_id: Row.import_item_variants_id,
        parent_category_name:
          Row.Category_Cuisine != null ? Row.Category_Cuisine : "",
        sub_category_name:
          Row.Sub_Category_Menu_Category != null
            ? Row.Sub_Category_Menu_Category
            : Row.Category_Cuisine,
        item_name: Row.Item_Name != null ? Row.Item_Name : "",

        item_tags: Row.Item_Tags != null ? Row.Item_Tags : "",
        item_description: Row.Description != null ? Row.Description : "",
        how_to_use: Row.How_to_use != null ? Row.How_to_use : "",
        benefits: Row.Benefits != null ? Row.Benefits : "",
        nutritional_information:
          Row.Nutritional_information != null
            ? Row.Nutritional_information
            : "",
        other_information:
          Row.Other_information != null ? Row.Other_information : "",
        product_information:
          Row.Product_information != null ? Row.Product_information : "",
        ingredients: Row.Ingredients != null ? Row.Ingredients : "",

        item_type:
          Row.Veg_Egg_NonVeg != null
            ? Row.Veg_Egg_NonVeg.toLowerCase() == "veg"
              ? "V"
              : Row.Veg_Egg_NonVeg.toLowerCase() == "nonveg"
                ? "NV"
                : Row.Veg_Egg_NonVeg.toLowerCase() == "egg"
                  ? "E"
                  : Row.Veg_Egg_NonVeg.toLowerCase() == undefined
                    ? "NA"
                    : Row.Veg_Egg_NonVeg
            : "NA",
        item_image:
          Row.Image_Name != null
            ? Row.Image_Name
            : this.store_category_name.toLowerCase() + "04" + ".png",
        brand_name: Row.Brand_Name != null ? Row.Brand_Name : "",
        manufacturing_details:
          Row.Manufacturer_Details != null ? Row.Manufacturer_Details : "",
        item_price: Row.Price != null ? Row.Price : "",
        packaging_name: Row.Pack_Type != null ? Row.Pack_Type : "",
        unit_name: Row.UOM != null ? Row.UOM : "",
        unit_quantity: Row.UOM_Qnty != null ? Row.UOM_Qnty : "",
        ean_code: Row.EAN_Code != null ? Row.EAN_Code : "",
        best_before: Row.Best_Before != null ? Row.Best_Before : "",
        shelf_life: Row.Shelf_Life != null ? Row.Shelf_Life : "",
        discounted_price:
          Row.Discounted_Price != null ? Row.Discounted_Price : Row.Price,
        discount_type: Row.Dicount_Type != null ? Row.Dicount_Type : "F",
        discount: Row.Discount != null ? Row.Discount : 0,
        mask_price: Row.Hide_Price != null ? Row.Hide_Price : "N",
        out_of_stock: Row.Out_of_Stock != null ? Row.Out_of_Stock : "N",
        variant_prescription:
          Row.Prescription_Req != null ? Row.Prescription_Req : "NA",
        features: Row.Features != null ? Row.Features : "",
        is_active: Row.is_active != null ? Row.is_active : 1,
        variant_choice_name: Row.Choice_Name != null ? Row.Choice_Name : "",
        variant_sub_choice_name:
          Row.Sub_Choice_Name != null ? Row.Sub_Choice_Name : "",
        variant_choice_price: Row.Choice_Price != null ? Row.Choice_Price : "",
        variant_addon_name: Row.Addon_Name != null ? Row.Addon_Name : "",
        variant_sub_addon_name:
          Row.Sub_Addon_Name != null ? Row.Sub_Addon_Name : "",
        variant_addon_price: Row.Addon_Price != null ? Row.Addon_Price : "",
        tax: Row.Tax != null ? Row.Tax : "",
        external_item_id:
          Row.External_item_id != null ? Row.External_item_id : "",
        packaging: Row.Packaging_Cost != null ? Row.Packaging_Cost : "",
      };

      if (newRow.item_price && newRow.discounted_price) {
        newRow.discount =
          parseInt(newRow.item_price) - parseInt(newRow.discounted_price);
      }

      if (!PrescRequired) {
        var ExcelRow: any = this.ReturnNewObject(newRow);
        var NotMatchError = [];
        var catNotMatch = this.DefaultCategorySubCategoryList.filter(
          (item) => item.parent_category_name == newRow.parent_category_name
        )[0]
          ? false
          : NotMatchError.push(" Category/ Cuisine  Not Found");
        var subcatNotMatch = this.DefaultCategorySubCategoryList.filter(
          (item) => item.sub_category_name == newRow.sub_category_name,
          (item) => item.parent_category_name == newRow.parent_category_name
        )[0]
          ? false
          : NotMatchError.push(" Sub_Category/Menu Category  Not Found");

        if (newRow.item_name != null && newRow.item_name != "") {
          var ItemNameNotMatch =
            newRow.item_name.length <= 255
              ? false
              : NotMatchError.push(" Item Name must be 250 characters or less");
        } else {
          NotMatchError.push(" Item Name must be enter");
        }
        var BrandNameNotMatch =
          newRow.brand_name.length <= 150
            ? false
            : NotMatchError.push(" Brand Name must be 150 characters or less");

        var ItemPriceNumber = Number(newRow.item_price);

        if (ItemPriceNumber == 0) {
          NotMatchError.push(" Price must be enter");
        } else {
          var ItemPriceNoteMatch = Number(newRow.item_price)
            ? false
            : NotMatchError.push(" Price must be Number or important");
        }

        var DiscountNoteMatch =
          parseInt(newRow.item_price) >= parseInt(newRow.discounted_price)
            ? false
            : NotMatchError.push(
              " Discounted_Price must be less than or Equal to Price"
            );
        var DicountTypeNotMatch =
          newRow.discount_type == "F" || newRow.discount_type == "P"
            ? false
            : NotMatchError.push(" discount_type Not Match");
        var ItemTypeNotMatch =
          newRow.item_type == "NA" ||
            newRow.item_type == "V" ||
            newRow.item_type == "NV" ||
            newRow.item_type == "E"
            ? false
            : NotMatchError.push(" Veg/Egg/NonVeg Not Match");
        var HidePriceNotMatch =
          newRow.mask_price == "Y" || newRow.mask_price == "N"
            ? false
            : NotMatchError.push(" mask_price Not Match");
        var OutOfStockNotMatch =
          newRow.out_of_stock == "Y" || newRow.out_of_stock == "N"
            ? false
            : NotMatchError.push(" Out_of_Stock Not Match");
        var item_tags =
          newRow.item_tags != "" ? newRow.item_tags.toString().split(",") : "";
        var TagNotFountList = [];

        if (item_tags) {
          item_tags?.forEach((tag) => {
            var tags = this.ItemTagList.filter(
              (item) => item.item_tag_name == tag,
              true
            )[0];
            if (tags == undefined) {
              TagNotFountList.push(tag);
            }
          });
        }

        if (TagNotFountList.length > 0) {
          var ItemTagsNotMatch = NotMatchError.push(
            "[ " +
            TagNotFountList.filter(Boolean).join(", ") +
            " ] item_tags Not Found"
          );
        }

        if (this.iseatery != 1) {
          var UnitNameNotMatch =
            newRow.unit_name != null && newRow.unit_name != ""
              ? false
              : NotMatchError.push(" UOM  Not Found");
          var UOMQuentity =
            newRow.unit_quantity != null && newRow.unit_quantity != ""
              ? false
              : NotMatchError.push(" UOM Qnty Not Found");

          if (newRow.packaging_name != "") {
            var packTypeNotMatch = this.PackTypeList.filter(
              (item) => item.packaging_name == newRow.packaging_name,
              true
            )[0]
              ? false
              : NotMatchError.push(" Pack Type  Not Found");
          }

          if (newRow.unit_name != "") {
            UnitNameNotMatch = this.UOMList.filter(
              (item) => item.name == newRow.unit_name,
              true
            )[0]
              ? false
              : NotMatchError.push(" UOM Not Found");
          }

          if (Number(newRow.unit_quantity) < 0) {
            UOMQuentity = NotMatchError.push(" UOM Qnty Not Less than 0");
          }
        } else {
          if (newRow.unit_name != "") {
            UnitNameNotMatch = this.UOMList.filter(
              (item) => item.name == newRow.unit_name,
              true
            )[0]
              ? false
              : NotMatchError.push(" UOM Not Found");
          }
        }

        if (newRow.variant_addon_name != "") {
          var addon = this.AddOnsList.filter(
            (item) => item.addon_name == newRow.variant_addon_name
          )[0];
          if (addon != undefined) {
            var AddOnsNotMatch = this.AddOnsList.filter(
              (item) => item.addon_name == newRow.variant_addon_name,
              true
            )[0]
              ? false
              : NotMatchError.push(" Addon Not Found");
            var SubAddOnsNotMatch = addon.addons_prices.filter(
              (item) => item.sub_addon_name == newRow.variant_sub_addon_name,
              true
            )[0]
              ? false
              : NotMatchError.push(" Sub Addon Not Found");
          } else {
            NotMatchError.push(" Addon and Sub Addon Not Found");
          }
        } else {
          if (newRow.variant_sub_addon_name != "") {
            NotMatchError.push(" Addon Not Found");
          }
        }

        if (newRow.variant_choice_name != "") {
          var choice = this.ChoicesList.filter(
            (item) => item.choice_name == newRow.variant_choice_name
          )[0];
          if (choice != undefined) {
            var ChoicesNotMatch = this.ChoicesList.filter(
              (item) => item.choice_name == newRow.variant_choice_name,
              true
            )[0]
              ? false
              : NotMatchError.push(" Choice Not Found");
            var SubChoicesNotMatch = choice.choice_prices.filter(
              (item) => item.sub_choice_name == newRow.variant_sub_choice_name,
              true
            )[0]
              ? false
              : NotMatchError.push(" Sub Choice Not Found");
          } else {
            NotMatchError.push(" Choice and Sub Choice Not Found");
          }
        } else {
          if (newRow.variant_sub_choice_name != "") {
            NotMatchError.push(" Choice Not Found");
          }
        }

        if ((!newRow.packaging_name && !newRow.unit_quantity) && !newRow.unit_name) {
          NotMatchError.push(" Packaging or Unit & UOM Not Found");
        }

        if ((newRow.packaging_name && newRow.unit_quantity) && !newRow.unit_name) {
          NotMatchError.push(" Unit of Measurment Not Found");
        }

        if ((!newRow.packaging_name && newRow.unit_quantity) && !newRow.unit_name) {
          NotMatchError.push(" Unit of Measurment Not Found");
        }

        if ((newRow.packaging_name && newRow.unit_name) && !newRow.unit_quantity) {
          NotMatchError.push(" Unit quantity Not Found");
        }

        if ((!newRow.packaging_name && !newRow.unit_quantity) && newRow.unit_name) {
          NotMatchError.push(" Unit quantity Not Found");
        }

        var new_variant_units: any = {
          item_name: newRow.item_name,
          packaging: newRow.packaging_name ? newRow.packaging_name : '',
          unit_quantity: newRow.unit_quantity ? newRow.unit_quantity : '',
          unit: newRow.unit_name ? newRow.unit_name : '',
        }

        variant_units.push(new_variant_units);
        var duplicate_unit: any = [];
        if (variant_units.length > 1) {
          variant_units.forEach(unit => {
            if (JSON.stringify(unit) == JSON.stringify(new_variant_units)) {
              duplicate_unit.push(unit);
            }
          });

          if (duplicate_unit.length > 1) {
            NotMatchError.push(" The combination of the Variant's Packaging, Unit & UOM cannot be duplicate");
          }
        }

        ExcelRow.sub_category_name = newRow.sub_category_name;
        if (NotMatchError.length == 0) {
          this.NewExcelRows.push(ExcelRow);
        } else {
          ExcelRow.error_message = NotMatchError.join();
          this.NotMatchSubCateguryExcelRows.push(ExcelRow);
        }
      }
      this.no_data_NewExcelRows = this.NewExcelRows.length <= 0 ? false : true;
      this.no_data_NotMatchSubCateguryExcelRows = this.NotMatchSubCateguryExcelRows.length <= 0 ? false : true;
      this.spinner.hide();
      if (count == excelRows.length) {
      }
    });
    if (
      this.NewExcelRows.length <= 0 &&
      this.DuplicatItems.length <= 0 &&
      this.NotMatchSubCateguryExcelRows <= 0
    ) {
      this.toastr.error(
        this.translate.instant("No record found for this store")
      );
    }

    //Display the data from Excel file in Table.
    this.IsVisible = true;
    if (this.iseatery != 1) {
      this.RemoveDuplication();
    }
  }

  RemoveDuplication() {
    var removeDeuplication = [];
    var DuplicatItems = [];
    this.NewExcelRows.forEach((item) => {
      var exists = false;
      removeDeuplication.forEach((noDuplication) => {
        if (isEqual(item, noDuplication)) {
          exists = true;
          item.error_message = "Duplicate Item In Excel";
        }
      });
      if (exists == false && item != "") {
        removeDeuplication.push(item);
      } else {
        DuplicatItems.push(item);
      }
    });
    this.NewExcelRows = removeDeuplication;
    this.DuplicatItems = DuplicatItems;

    this.no_data_NewExcelRows = this.NewExcelRows.length <= 0 ? false : true;
    this.no_data_DuplicatItems = this.DuplicatItems.length <= 0 ? false : true;

    if (this.DuplicatItems.length > 0) {
      this.toastr.error(
        this.translate.instant(this.DuplicatItems.length + " duplicate records")
      );
    }
  }

  ReturnNewObject(newRow) {
    var ExcelRow = {
      import_item_variants_id: newRow.import_item_variants_id,
      category_name: newRow.category_name,
      parent_category_name: newRow.parent_category_name,
      sub_category_name: newRow.sub_category_name,
      item_name: newRow.item_name,
      item_type: newRow.item_type,
      item_image: newRow.item_image,
      brand_name: newRow.brand_name,

      item_tags: newRow.item_tags,
      item_description: newRow.item_description,
      how_to_use: newRow.how_to_use,
      benefits: newRow.benefits,
      nutritional_information: newRow.nutritional_information,
      other_information: newRow.other_information,
      product_information: newRow.product_information,
      ingredients: newRow.ingredients,

      manufacturing_details: newRow.manufacturing_details,
      item_price: newRow.item_price,
      packaging_name: newRow.packaging_name,
      unit_name: newRow.unit_name,
      unit_quantity: newRow.unit_quantity,
      ean_code: newRow.ean_code,
      best_before: newRow.best_before,
      shelf_life: newRow.shelf_life,
      discounted_price: newRow.discounted_price,
      discount_type: newRow.discount_type,
      discount: newRow.discount,
      mask_price: newRow.mask_price,
      out_of_stock: newRow.out_of_stock,
      variant_prescription: newRow.variant_prescription,
      features: newRow.features,
      variant_choice_name: newRow.variant_choice_name,
      variant_sub_choice_name: newRow.variant_sub_choice_name,
      variant_choice_price: newRow.variant_choice_price,
      variant_addon_name: newRow.variant_addon_name,
      variant_sub_addon_name: newRow.variant_sub_addon_name,
      variant_addon_price: newRow.variant_addon_price,
      tax: newRow.tax,
      external_item_id: newRow.external_item_id,
      packaging: newRow.packaging,
    };
    return ExcelRow;
  }

  sellerImportFile() {
    if (this.SelectedFile == null) {
      this.toastr.error(
        this.translate.instant("PLEASE_SELECT_ANY_FILE_TO_BE_UPLOAD")
      );
      return;
    }

    this.spinner.show();
    this.getDefaultCategorySubCategoryList();
  }

  SelectFile(event) {
    this.NewExcelRows = [];
    this.DuplicatItems = [];
    this.NotMatchSubCateguryExcelRows = [];
    this.NotAddItemsInDatabase = [];
    this.AddItemsInDatabase = [];
    this.SelectedFile = ''
    var file = event.target?.files[0];
    this.fileName = file.name
    if (file) {
      if (file.name.indexOf(".") > -1) {
        var extension = file.name.split(".").pop().toLowerCase();
      } else {
        var extension = file.name.split("/").pop().toLowerCase();
      }

      if ($.inArray(extension, ["xls", "xlsx"]) == -1) {
        this.SelectedZipFile = null;
        this._ExcelUpload.nativeElement.value = null;
        this.toastr.error(
          this.translate.instant("PLEASE_UPLOAD_A_VALID_EXCEL_FILE")
        );
      } else {
        this.NewExcelRows = [];
        this.SelectedFile = file;
      }
    }
  }

  SelectZipFile(file) {
    var file = file.target?.files[0];
    if (
      file.name.substring(file.name.lastIndexOf(".")).toLowerCase() == ".zip"
    ) {
      this.SelectedZipFile = file;
    } else {
      this.SelectedZipFile = null;
      this._zipUpload.nativeElement.value = null;
      this.toastr.error(
        this.translate.instant("Please upload a valid Zip file.")
      );
    }
  }

  ResetAfterItemUpload() {
    this.NewExcelRows = [];
    this.SelectedFile = null;
    this._zipUpload.nativeElement.value = null;
    this._ExcelUpload.nativeElement.value = null;
    this.SelectedZipFile = null;
  }

  subbmitItemImport() {
    if (
      this.SelectedZipFile == null ||
      this.SelectedZipFile == "" ||
      this.SelectedZipFile == undefined
    ) {

      Swal.fire({
        title: this.translate.instant("ARE_YOU_SURE"),
        text: this.translate.instant("ARE_YOU_SURE_UPLOAD"),
        icon: "warning",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: this.translate.instant("OK"),
        cancelButtonText: this.translate.instant("CANCEL"),
      }).then((result) => {
        if (result.value) {
          this.finalsubbmitItemImport();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
    }
    else {
      this.finalsubbmitItemImport();
    }

  }

  importSuccessModel() {
    const modalRef = this.modalService.open(itemImportSuccessModelComponent, {
      size: "lg",
      centered: true,
    });

    modalRef.componentInstance.TotalUploadItems = this.TotalUploadItems;
    modalRef.componentInstance.SuccessUploadItems = this.SuccessUploadItems;
    modalRef.componentInstance.FailedUploadItems = this.FailedUploadItems;
  }

  finalsubbmitItemImport() {
    this.spinner.show();
    var fd = new FormData();
    if (this.superAdmin) {
      fd.append("is_super_admin", '1');
    }
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    const blob = new Blob([JSON.stringify(this.NewExcelRows)], { type: 'text/plain' });
    const importFile = new File([blob], 'item_import.json');
    fd.append("items", importFile);
    if (
      this.SelectedZipFile != null ||
      this.SelectedZipFile != "" ||
      this.SelectedZipFile != undefined
    ) {
      fd.append("item_images", this.SelectedZipFile);
    }
    fd.append("store_id", this.storeid);
    this.itemService.saveExcelItemImport(fd).subscribe({
      next: (response: any) => {
        this.TotalUploadItems = response.total_count;
        this.SuccessUploadItems = response.success_count;
        this.FailedUploadItems = response.failed_count;
        if (response.status == 1) {
          this.spinner.hide();
          if (
            this.main.LoggedUserInfo.role_id != 1 &&
            this.main.LoggedUserInfo.role_id != 6
          ) {
            this.toastr.success(this.translate.instant(response.message));
          } else {
            this.toastr.success(this.translate.instant(response.message));
          }
          this.ResetAfterItemUpload();

          if (this.storeid == this.main.LoggedUserStoreInfo.store_id) {
            if (this.SuccessUploadItems > 0) {
              this.importSuccessModel();
            }
          }

          var response = response.data.failed.concat(this.DuplicatItems);
          this.NotAddItemsInDatabase = response.concat(
            this.NotMatchSubCateguryExcelRows
          );

          this.no_data_NotAddItemsInDatabase = this.NotAddItemsInDatabase.length <= 0 ? false : true;

          this.AddItemsInDatabase = response.data.success;
          this.no_data_AddItemsInDatabase = this.AddItemsInDatabase.length <= 0 ? false : true
        } else if (response.status == 2) {
          this.spinner.hide();
          if (
            this.main.LoggedUserInfo.role_id != 1 &&
            this.main.LoggedUserInfo.role_id != 6
          ) {

            if (this.storeid == this.main.LoggedUserStoreInfo.store_id) {
              if (this.SuccessUploadItems > 0) {
                this.importSuccessModel();
              }
            }
            this.toastr.success(this.translate.instant(response.message));
          } else {
            this.toastr.success(this.translate.instant(response.message));
          }
          this.ResetAfterItemUpload();
          var response = response.data.failed.concat(this.DuplicatItems);
          this.NotAddItemsInDatabase = response.concat(
            this.NotMatchSubCateguryExcelRows
          );

          this.AddItemsInDatabase = response.data.success;
          this.no_data_AddItemsInDatabase = this.AddItemsInDatabase.length <= 0 ? false : true

        } else if (response.status == 0) {
          this.spinner.hide();
          this.toastr.error(this.translate.instant(response.message));
        }
        else {
          this.spinner.hide();
          this.toastr.success(this.translate.instant(response.message));
        }
      },
      error: (error) => {
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  downloadExcelReport(tableId) {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    var wscols = [
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];
    ws["!cols"] = wscols;
    var heading: any = [
      "Error",
      "Category_Cuisine",
      "Sub_Category_Menu_Category",
      "Image_Name",
      "Brand_Name",
      "Item_Name",
      "Item_Tags",
      "Description",
      "How_to_use",
      "Benefits",
      "Nutritional_information",
      "Other_information",
      "Product_information",
      "Ingredients",
      "Features",
      "Manufacturer_Details",
      "Pack_Type",
      "UOM_Qnty",
      "UOM",
      "EAN_Code",
      "Best_Before",
      "Shelf_Life",
      "Price",
      "Discounted_Price",
      "Dicount_Type",
      "Discount",
      "Veg_Egg_NonVeg",
      "Hide_Price",
      "Out_of_Stock",
      "Prescription_Req",
    ];
    if (this.iseatery == 1) {
      heading.push("Choice_Name");
      heading.push("Sub_Choice_Name");
      heading.push("Choice_Price");
      heading.push("Addon_Name");
      heading.push("Sub_Addon_Name");
      heading.push("Addon_Price");
    }
    XLSX.utils.sheet_add_aoa(ws, [heading], { origin: "A1" });
    if (tableId == "tblNotMatchSubCateguryExcelRows") {
      var excelData = this.NotMatchSubCateguryExcelRows;
    } else {
      var excelData = this.NotAddItemsInDatabase;
    }
    for (let i = 0; i < excelData.length; i++) {
      if (this.iseatery != 1) {
        XLSX.utils.sheet_add_aoa(
          ws,
          [
            [
              excelData[i].error_message,
              excelData[i].parent_category_name,
              excelData[i].sub_category_name,
              excelData[i].item_image,
              excelData[i].brand_name,
              excelData[i].item_name,
              excelData[i].item_tags,
              excelData[i].item_description,
              excelData[i].how_to_use,
              excelData[i].benefits,
              excelData[i].nutritional_information,
              excelData[i].other_information,
              excelData[i].product_information,
              excelData[i].ingredients,
              excelData[i].features,
              excelData[i].manufacturing_details,
              excelData[i].packaging_name,
              excelData[i].unit_quantity,
              excelData[i].unit_name,
              excelData[i].ean_code,
              excelData[i].best_before,
              excelData[i].shelf_life,
              excelData[i].item_price,
              excelData[i].discounted_price,
              excelData[i].discount_type,
              excelData[i].discount,
              excelData[i].item_type,
              excelData[i].mask_price,
              excelData[i].out_of_stock,
              excelData[i].variant_prescription,
            ],
          ],
          { origin: "A" + (i + 2) }
        );
      } else {
        XLSX.utils.sheet_add_aoa(
          ws,
          [
            [
              excelData[i].error_message,
              excelData[i].parent_category_name,
              excelData[i].sub_category_name,
              excelData[i].item_image,
              excelData[i].brand_name,
              excelData[i].item_name,
              excelData[i].item_tags,
              excelData[i].item_description,
              excelData[i].how_to_use,
              excelData[i].benefits,
              excelData[i].nutritional_information,
              excelData[i].other_information,
              excelData[i].product_information,
              excelData[i].ingredients,
              excelData[i].features,
              excelData[i].manufacturing_details,
              excelData[i].packaging_name,
              excelData[i].unit_quantity,
              excelData[i].unit_name,
              excelData[i].ean_code,
              excelData[i].best_before,
              excelData[i].shelf_life,
              excelData[i].item_price,
              excelData[i].discounted_price,
              excelData[i].discount_type,
              excelData[i].discount,
              excelData[i].item_type,
              excelData[i].mask_price,
              excelData[i].out_of_stock,
              excelData[i].variant_prescription,
              excelData[i].variant_choice_name,
              excelData[i].variant_sub_choice_name,
              excelData[i].variant_choice_price,
              excelData[i].variant_addon_name,
              excelData[i].variant_sub_addon_name,
              excelData[i].variant_addon_price,
            ],
          ],
          { origin: "A" + (i + 2) }
        );
      }
    }
    for (let i in ws) {
      if (typeof ws[i] != "object") continue;
      let cell = XLSX.utils.decode_cell(i);
      ws[i].s = {
        border: {
          right: {
            style: "thin",
            color: "000000",
          },
          left: {
            style: "thin",
            color: "000000",
          },
          top: {
            style: "thin",
            color: "000000",
          },
          bottom: {
            style: "thin",
            color: "000000",
          },
        },
      };
      if (cell.r == 0) {
        ws[i].s = {
          font: {
            bold: true,
          },
          fill: {
            patternType: "solid",
            fgColor: { rgb: "bfbfbf" },
          },
          border: {
            right: {
              style: "thin",
              color: "000000",
            },
          },
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws);
    if (tableId == "tblNotMatchSubCateguryExcelRows") {
      XLSX.writeFile(wb, "NotMatchSubCateguryExcelRows.xlsx");
    } else if (tableId == "tblNotAddItemsInDatabase") {
      XLSX.writeFile(wb, "NotAddItemsInDatabase.xlsx");
    }
  }

  Reset() {
    this.NewExcelRows = [];
    this.DuplicatItems = [];
    this.NotMatchSubCateguryExcelRows = [];
    this.NotAddItemsInDatabase = [];
    this.AddItemsInDatabase = [];
    this.SelectedFile = null;
    this._ExcelUpload.nativeElement.value = null;
    this.SelectedZipFile = null;
  }

  changePage(event) {
    this.page = event;
  }

  limitChange() {
    this.page = 1;
    this.tableSize = this.selectedPerPage;
    localStorage.setItem("itemImportPagination", JSON.parse(this.selectedPerPage));
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
    if (this.isSellerItemImport) {
      if (this.main.LoggedUserInfo.role_id == 1) {
        data.module_key = '18'
      }
      if (this.main.LoggedUserInfo.role_id == 6) {
        data.module_key = '18'
      }
      if (this.main.LoggedUserInfo.role_id == 2) {
        data.module_key = '115'
      }
    } else {
      if (this.main.LoggedUserInfo.role_id == 1) {
        data.module_key = '16'
      }
      if (this.main.LoggedUserInfo.role_id == 6) {
        data.module_key = '16'
      }
      if (this.main.LoggedUserInfo.role_id == 2) {
        data.module_key = '16'
      }
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

  // Select all items
  selectAllCat() {
    this.sub_category_ids = [];
    this.master_store_category.forEach((element: any) => {
      if (!this.select_all_cat) {
        element.is_added = 1;
        this.sub_category_ids.push(element.sub_category_id);
      } else {
        element.is_added = 0;
        this.sub_category_ids = [];
      }
    });
    this.select_all_cat = !this.select_all_cat;
    this.cdr.detectChanges();
  }

  CheckAllSubCatSelected() {
    this.select_all_cat = true;
    this.master_store_category.forEach((element: any) => {
      if (element.is_added != 1) {
        this.select_all_cat = false;
      }
    });
    this.cdr.detectChanges();
  }

  /**
 * Change the sub category
 */
  onSubCategoryChange(e: any, category: any) {
    this.master_store_category.forEach((item: any) => {
      if (category.sub_category_id == item.sub_category_id) {
        if (e.target.checked) {
          item.is_added = 1
        } else {
          item.is_added = 0
        }
      }
    });
    if (e.target.checked) {
      this.sub_category_ids.push(e.target.value);
    } else {
      this.sub_category_ids.forEach((item: any, i: any) => {
        if (item == e.target.value) {
          this.sub_category_ids.splice(i, 1);
          return;
        }
      });
    };
    this.CheckAllSubCatSelected();
    this.cdr.detectChanges();
  }

  // Selet all categories item
  selectAllCatItem() {
    this.selected_import_items = [];
    this.master_store_items.forEach((catElement: any) => {
      catElement.items.forEach((element: any) => {
        if (!this.select_all_items) {
          element.is_added = 1;
          element.store_id = element.seller_id
          catElement.is_added = 1;
          this.selected_import_items.push(element);
        } else {
          element.is_added = 0;
          catElement.is_added = 0;
          this.selected_import_items = [];
        }
      });
    });
    this.select_all_items = !this.select_all_items;
    this.cdr.detectChanges();
  }

  // Selet all categories item
  selectAllSubCat(i: number, all_added: number) {
    this.master_store_items[i].items.forEach((element: any) => {
      if (all_added == 0) {
        element.is_added = 1;
        element.store_id = element.seller_id
        this.selected_import_items.push(element);
      } else {
        element.is_added = 0;
        let indexToRemove = this.selected_import_items.indexOf(element);
        if (indexToRemove !== -1) {
          this.selected_import_items.splice(indexToRemove, 1);
        }
      }
    });
    this.master_store_items[i].is_added = all_added == 1 ? 0 : 1;
    this.checkAllSubCatItemSelected();
    this.cdr.detectChanges();
  }

  /**
* Change the sub category
*/
  onItemSelectionChange(e: any, catItem: any) {
    catItem.store_id = catItem.seller_id
    this.master_store_items.forEach((catElement: any, i: number) => {
      catElement.items.forEach((item: any) => {
        if (catItem.item_id == item.item_id && item.item_variants_id && catItem.item_variants_id == item.item_variants_id) {
          if (e.target.checked) {
            item.is_added = 1
            item.store_id = item.seller_id
          } else {
            item.is_added = 0
          }
        } else if (catItem.item_id == item.item_id && !item.item_variants_id) {
          if (e.target.checked) {
            item.is_added = 1
            item.store_id = item.seller_id
          } else {
            item.is_added = 0
          }
        }
      });
      this.selectAllSubCatSeleted(i);
    });
    if (e.target.checked) {
      this.selected_import_items.push(catItem);
    } else {
      this.selected_import_items.forEach((item: any, i: any) => {
        if (item.item_id == e.target.value && item.item_variants_id && catItem.item_variants_id == item.item_variants_id) {
          this.selected_import_items.splice(i, 1);
          return;
        } else if (item.item_id == e.target.value && !item.item_variants_id) {
          this.selected_import_items.splice(i, 1);
          return;
        }
      });
    };
    this.cdr.detectChanges();
  }

  checkAllSubCatItemSelected() {
    this.select_all_items = true;
    this.master_store_items.forEach((catElement: any) => {
      catElement.items.forEach((item: any) => {
        if (item.is_added != 1) {
          this.select_all_items = false;
        }
      });
    });
    this.cdr.detectChanges();
  }


  // Selet all categories item
  selectAllSubCatSeleted(i: number) {
    let all_added: any = 1;
    this.master_store_items[i].items.forEach((element: any) => {
      if (element.is_added != 1) {
        all_added = 0
      }
    });
    this.master_store_items[i].is_added = all_added;
    this.checkAllSubCatItemSelected();
    this.cdr.detectChanges();
  }

  manageMasterImportItems() {
    this.spinner.show();
    let data: any = {
      item_ids: JSON.stringify(this.selected_import_items),
      seller_id: this.selected_store_value.store_id,
      store_id: this.selected_import_items[0].seller_id,
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this.itemService.manageMasterImportItems(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.start_importing_item = false;
          this.start_importing_category = false;
          if (this.login_user_store.user_role_confirm == '0') {
            this.UpdateFirstTimeLoginConfirm(this.main.LoggedUserStoreInfo);
          }
          this.toastr.success(response.message);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  onPreviousButton() {
    this.router.navigate([`/other-settings`]);
  }

  skipButtonClick() {
    this.UpdateFirstTimeLoginConfirm(this.main.LoggedUserStoreInfo);
  }

  UpdateFirstTimeLoginConfirm(user: any) {
    this.spinner.show();
    var fd = new FormData();
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("store_id", user.store_id);
    fd.append("contact_number", user.phone);
    fd.append("manager", user.manager);
    fd.append("store_name", user.store_name);
    fd.append("store_description", user.store_description);
    fd.append("store_address", user.store_address1);
    fd.append("store_address2", user.store_address2);
    fd.append("category_id", user.category_id);
    fd.append("is_confirm", "1");
    fd.append("country_id", user.country_id);
    fd.append("state_id", user.state_id);
    fd.append("city_id", user.city_id);
    fd.append("area_id", user.area_id);
    fd.append("zipcode", user.zipcode);
    var data = fd;

    this.usersService.updateFirstTimeLoginConfirm(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          localStorage.setItem(
            "subscriptionDetails",
            JSON.stringify(response.data)
          );
          localStorage.setItem("user_role_confirm", '1');
          localStorage.removeItem('setup_steps');
          this.login_user_store.user_role_confirm = '1';
          localStorage.setItem('loginUserStore', this.login_user_store);
          var session = this.appComponent.sessionConfig();
          user.user_role_confirm = 1
          session.setSessionLoginUserStore(user == undefined ? "" : user);
          this.router.navigate([`/dashboard`])
            .then(() => {
              window.location.reload();
            });
        } else {
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
        ;
      },
    });
  }
}