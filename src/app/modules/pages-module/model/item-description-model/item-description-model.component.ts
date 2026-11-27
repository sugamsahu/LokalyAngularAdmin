import { Input } from "@angular/core";
import { Subject } from "rxjs";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ItemService } from "src/app/services/item.service";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { reasonMasterService } from "src/app/services/lookup/reason-master.service";
import { UserRoles } from "src/app/enums/user-roles";
import { CommonService } from "src/app/services/common.service";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { ReveiwRatingComponent } from "../../model/reveiw-rating/reveiw-rating.component";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { AddEditVariantModelComponent } from "../add-edit-variant/add-edit-variant.component";
import { trustCleanHtml } from "src/app/utils/safe-html";
@Component({
  selector: "app-item-description-model",
  templateUrl: "./item-description-model.component.html",
  styleUrls: ["./item-description-model.component.scss"],
})
export class ItemDescriptionComponent implements OnInit, OnDestroy, AfterViewInit {
  destroy$ = new Subject();
  @Input() itemId: any;
  formGroup: UntypedFormGroup;
  @Input() main: any;
  newItem: any = { item_images: [] };
  is_item_approval: any;
  is_addOn_choices: any;
  iseatery: any;
  categoryId: any;
  item_approval_shop_type_string: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: any;
  categoryList: any = [];
  selectedCategory: any = {
    label: "",
    value: "",
  };
  subCategoryList: any = [];
  selectedSubCategory: any = {
    label: "",
    value: "",
  };
  selectedReason: any = {
    label: "",
    value: "",
  };
  active = 1;
  rejectedStatus: any;
  item_type = [
    { label: "None", value: 0 },
    { label: "Veg", value: 1 },
    { label: "Non-Veg", value: 2 },
    { label: "Egg", value: 3 },
  ];

  selectedItemType: any = {
    label: "",
    value: "",
  };

  selectedUnit: any = {
    name: "",
    unit_id: "",
  };

  selectedItemTag: any = {
    
  };

  selectedItemCollection: any = {
  };

  tag_item_list: any = [];
  cropped_banner_image: string;
  imageArray: UntypedFormArray;
  varient: any = [];
  show_price_same_font: any;
  global_currency: any;
  unitList: any = [];
  collection_list: any = [];
  reason_list: any = [];
  user_data = JSON.parse(localStorage.getItem("loginUser"));
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  ession_default_store_name = localStorage.getItem("adminselected_store_name");
  session_default_store_type = localStorage.getItem("adminselected_store_type");
  session_category_id = localStorage.getItem("adminselectedcategory");
  session_default_store_name = localStorage.getItem("adminselected_store_name");
  session_store_id = localStorage.getItem("adminselectedstore");
  store_label: any;
  newvarient: any = {
    package: {},
    unit: {},
    tax_group: {},
  };
  packageingList: any = [];
  selectedChoicePriceList: any = [];
  addedChoiceList: any = [];
  selectedAddOnPriceList: any = [];
  addedAddOnList: any = [];
  displayChoiceList: any = [];
  displayAddOnList: any = [];
  taxGroupList: any = [];
  counter = 0;
  varientItem: any = [];
  masterChoiceList: any = [];
  masterAddOnList: any = [];
  selectedCategoryType: any;
  categoryByType = [
    { name: "None", value: 0 },
    { name: "Veg", value: 1 },
    { name: "Non-Veg", value: 2 },
    { name: "Egg", value: 3 },
  ];
  sellername: any;
  storeinfo: any = 0;
  @ViewChild("cursor") cursor: ElementRef;
  userRoleEnum = UserRoles;
  isSuperAdmin: boolean = false;
  storeIdOfItemSubmission: any = 0;
  disableData: boolean = true;
  stock_mgmt: any
  @ViewChild('mySelectElement', { static: false }) mySelectElement: ElementRef;
  @ViewChild('blurFocus') blurFocus: ElementRef;
  masterItem: boolean = false;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  review_rating_module: any;
  show_review_rating: any;
  customer_User_Id: any = 0;
  outOfStockData: any;
  subCategoryid = 0;
  TempcollectionList: any = [];
  selectUomData: any;
  is_pos: any = false;
  store_type: any;// use for hide and display item type
  CollectionItemList: any = [];
  description_visible: boolean = false;
  style_obj_add_edit_variant: any;
  amount_seperator: any;

  constructor(
    private itemService: ItemService,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private reasonService: reasonMasterService,
    private _snackbarService: ToastrService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    public activeModal: NgbActiveModal,
    public spinner: NgxSpinnerService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    $('.disableOfdropdown ng-dropdown-panel').css({ 'opacity': '0!important' })
    $(
      "<style>.mat-tab-header-pagination-controls-enabled .mat-tab-header-pagination {  background-color: " + this.general_setting.css_button_business_default + " !important; border-color: " + this.general_setting.css_button_business_default + " !important;border-radius: 5px 3px 5px 3px; z-index: 0 !important}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-tab-label-container{  background-color: #F0F3F4 !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-tab-group.mat-primary .mat-ink-bar{  background-color: " + this.general_setting.css_button_business_default + " !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-ink-bar{ top: 0px !important; height: 3px !important;} .mat-tab-label:focus,.mat-tab-label:active{ background-color: white !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-tab-label .mat-tab-label-content{  color: " + this.general_setting.css_button_business_font + " !important;}</style>"
    ).appendTo("body");
    this.is_item_approval = 0;
    this.is_addOn_choices = this.main.LoggedUserStoreInfo?.iseatery;
    this.iseatery = parseInt(this.main.LoggedUserStoreInfo?.iseatery);
    this.show_price_same_font = this.general_setting.show_price_same_font;
    this.global_currency = this.general_setting.currency_symbol;
    this.amount_seperator = this.general_setting.amount_seperator;
    this.store_label = this.general_setting.store_label;
    this.stock_mgmt = this.general_setting.stock_mgmt;
    this.review_rating_module = this.general_setting.review_rating_module;
    this.show_review_rating = this.general_setting.show_review_rating;
    this.item_approval_shop_type_string = this.general_setting != undefined ? this.general_setting.item_approval_shop_type : this.main.item_approval_shop_type;
    if (
      this.main.LoggedUserInfo.role_id != this.main.UserRole.SuperAdmin &&
      this.main.LoggedUserInfo.role_id != this.main.UserRole.Admin
    ) {
      this.categoryId = parseInt(this.main.LoggedUserStoreInfo?.category_id);
      var itemApprovalShopType = this.item_approval_shop_type_string.toString().split(",");
      var filterSubcategory = itemApprovalShopType.filter((shopType) => shopType == this.main.LoggedUserStoreInfo?.category_id);
      if (filterSubcategory.length > 0) {
        this.is_item_approval = 1;
      }
    }
    else {
      this.storeinfo = JSON.parse(localStorage.getItem("selectedStore"));
      this.main.LoggedUserStoreInfo = this.storeinfo;
      this.categoryId = parseInt(this.main.LoggedUserStoreInfo?.store_category_id);
      if (this.main.LoggedUserStoreInfo?.iseatery == 0) {
        var itemApprovalShopType = this.item_approval_shop_type_string.toString().split(",");
        var filterSubcategory = itemApprovalShopType.filter((shopType) => shopType == this.main.LoggedUserStoreInfo?.store_category_id);
        if (filterSubcategory.length > 0) {
          this.iseatery = 1;
        }
      }
    }
    this.isSuperAdmin = this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin ? true : this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin ? true : false;
    if (this.seller_details != "") {
      this.sellername = this.seller_details.store_name;
      this.store_type = this.seller_details.item_type;
    } else {
      this.sellername = this.storeinfo?.store_name;
      this.store_type = this.storeinfo?.item_type;
    }
    if (this.isSuperAdmin) {
      this.sellername = this.storeinfo?.category_name;
      this.store_type = this.storeinfo?.item_type;
    }
    this.style_obj_add_edit_variant = {
      "--css_button_business_default": this.general_setting.css_button_business_default,
      "--css_button_business_font": this.general_setting.css_button_business_font
    }
    this.getMasterChoiceList();
    this.getPackageingList();
    this.getItemCollectionList();
  }

  //get data by item id
  async getItemData() {
    var fd = new FormData();
    fd.append("item_id", this.itemId);
    await this.itemService.getItemDetails(fd).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.newItem = response.data;
          if (response.data.is_approved == 0) {
            this.newItem.approval_status = 1;
            this.GetReasonList(this.newItem.approval_status == 1 ? 8 : 9);
          }
          this.newItem.item_images =
            response.data.item_images == null ? [] : response.data.item_images;
          this.varientItem = [];
          this.newItem.item_variants.forEach((value: any) => {
            var obj: any = {};
            obj.packaging_name = value.packaging_name != null ? value.packaging_name : "-";
            obj.packaging_name = obj.packaging_name == "Packaging" ? "-" : obj.packaging_name;
            obj.unit_quantity = parseFloat(value.unit_quantity);
            obj.opening_stock = parseFloat(value.opening_stock).toFixed(1);
            obj.reorder_quantity = parseFloat(value.reorder_quantity).toFixed(1);
            obj.unit_name = value.unit_name;
            obj.item_price = value.item_price;
            obj.discounted_price = value.discounted_price;
            obj.unit_id = value.unit_id;
            obj.packaging_id = value.packaging_id == 0 ? 0 : value.packaging_id;
            obj.tax_group_id = value.tax_group_id == 0 ? 0 : value.tax_group_id;
            obj.packaging = value.packaging == 0 ? 0 : value.packaging;
            obj.sku = value.sku == 0 ? 0 : value.sku;
            obj.location = value.location == "" ? "" : value.location;
            obj.max_qty = value.max_qty;
            obj.min_qty = value.min_qty;
            obj.choices = value.choices;
            obj.addons = value.addons;
            obj.tax = value.tax;
            obj.external_item_id = value.external_item_id;
            obj.item_variants_id = value.item_variants_id;
            obj.sub_category_id = ++this.counter;
            obj.unit_conversation_id = value.unit_conversation_id;
            obj.out_of_stock = value.out_of_stock
            obj.hide_variant = value.hide_variant

            var addedChoices = [];
            if (value.choices !== null) {
              value.choices.forEach((value1: any) => {
                var adchoice = {
                  choice_id: value1.default_choice_id,
                  choice_name: value1.variant_choice_name,
                  choice_price_id: value1.default_choice_price_id,
                  sub_choice_name: value1.variant_sub_choice_name,
                  choice_price: value1.price,
                  variant_choice_id: value1.variant_choice_id,
                  variant_choice_price_id: value1.variant_choice_price_id,
                };
                addedChoices.push(adchoice);
              });
            }

            var addMasterChoice = [];
            this.masterChoiceList.forEach((value1: any) => {
              addedChoices.forEach((value2) => {
                if (value1.choice_id == value2.choice_id) {
                  var found = addMasterChoice.filter(
                    (x) => x.choice_id == value2.choice_id
                  )[0];
                  if (found == null || found == undefined) {
                    var ch = {
                      choice_id: value1.choice_id,
                      choice_name: value1.choice_name,
                      description: value1.description,
                      choice_prices: value1.choice_prices,
                      is_allready_added: true,
                    };
                    addMasterChoice.push(ch);
                  }
                }
              });
            });
            obj.addedChoiceList = addedChoices;
            obj.selectedChoicePriceList = addMasterChoice;
            obj.displayChoiceList = addedChoices;

            var addedAdd = [];
            if (value.addons != null) {
              value.addons.forEach((value1: any) => {
                var ad = {
                  addon_id: value1.default_addon_id,
                  addon_name: value1.variant_addon_name,
                  addon_price_id: value1.default_addon_price_id,
                  sub_addon_name: value1.variant_sub_addon_name,
                  addon_price: value1.price,
                  variant_addon_id: value1.variant_addon_id,
                  variant_addon_price_id: value1.variant_addon_price_id,
                };
                addedAdd.push(ad);
              });
            }

            var addMasterAddOn = [];
            this.masterAddOnList.forEach((value1: any) => {
              addedAdd.forEach((value2) => {
                if (value1.addon_id == value2.addon_id) {
                  var found = addMasterAddOn.filter(
                    (x) => x.addon_id == value2.addon_id
                  )[0];
                  if (found == null || found == undefined) {
                    var ad = {
                      addon_id: value1.addon_id,
                      addon_name: value1.addon_name,
                      description: value1.description,
                      addons_prices: value1.addons_prices,
                      is_allready_added: true,
                    };
                    addMasterAddOn.push(ad);
                  }
                }
              });
            });
            obj.addedAddOnList = addedAdd;
            obj.selectedAddOnPriceList = addMasterAddOn;
            obj.displayAddOnList = addedAdd;
            obj.item_attribute = value.item_attribute;
            obj.is_stock_added = value.is_stock_added;
            obj.item_image_ids = value.item_image_ids;
            this.varientItem.push(obj);
          });

          this.newItem.prescription =
            response.data.prescription == 1 ? true : false;
          this.newItem.store_name =
            this.newItem.store_name == undefined
              ? this.session_default_store_name
              : this.newItem.store_name;
          this.newItem.store_type =
            this.newItem.store_type == undefined
              ? this.session_default_store_type
              : this.newItem.store_type;
          this.newItem.featured_type =
            response.data.featured_type == 1 ? true : false;
          this.newItem.unit_quantity = Number(response.data.unit_quantity);
          this.newItem.reorder_quantity = Number(
            response.data.reorder_quantity
          );
          this.newItem.image = response.data.item_image;
          this.newItem.item_images.forEach((img) => {
            img.file = null;
            if (img.type == 3) {
              img.image = this.sanitizer.bypassSecurityTrustResourceUrl(img.image);
            }
          });
          this.newItem.unit_id = this.unitList.filter(
            (x) => x.unit_id == response.data.unit_id
          )[0];
          this.selectedCategoryType = this.categoryByType.filter(
            (x) => x.value == response.data.item_type
          );
          var newItemTags_ids = [];
          if (this.newItem.item_tags) {
            var item_tags: any = [];
            item_tags =
              this.newItem.item_tag.item_tags != ""
                ? this.newItem.item_tag.item_tags.toString().split(",")
                : "";
            item_tags.forEach((catID: any) => {
              var tagDetails = this.tag_item_list.filter(
                (x) => x.item_tag_id == catID
              )[0];
              if (tagDetails) {
                newItemTags_ids.push(tagDetails);
              }
            });
          }
          this.newItem.tag_ids = newItemTags_ids;
          var newItemCollection_ids = [];
          if (this.newItem.item_collection.item_collection_id != "") {
            var item_collection: any = [];
            item_collection =
              this.newItem.item_collection.item_collection_id != ""
                ? this.newItem.item_collection.item_collection_id
                  .toString()
                  .split(",")
                : "";
            item_collection.forEach((catID: any) => {
              var collectionDetails = this.CollectionItemList.filter(
                (x) => x.item_collection_id == Number(catID)
              )[0];
              if (collectionDetails) {
                newItemCollection_ids.push(collectionDetails);
              }
            });
          }

          this.newItem.collection_ids = newItemCollection_ids;
          this.newItem.autocollection_ids = this.newItem.automatic_collection;
        } else {
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // handle error
      },
      complete: () => {
      },
    });
  }

  //get master choices list
  getMasterChoiceList() {
    var data = {};
    this.itemService.getMasterChoiceList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.masterChoiceList = response.data;
          for (var i = 0; i < this.masterChoiceList.length; i++) {
            var field =
              "selectedSubChoice" +
              this.masterChoiceList[i].choice_id.toString();
            this[field] = { selected: undefined };

            for (
              var j = 0;
              j < this.masterChoiceList[i].choice_prices.length;
              j++
            ) {
              this.masterChoiceList[i].choice_prices[j].choice_id =
                this.masterChoiceList[i].choice_id;
              this.masterChoiceList[i].choice_prices[j].choice_name =
                this.masterChoiceList[i].choice_name;
            }
          }
          this.getMasterAddOnList();
        } else {
          // this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        // this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  //get master addon list
  getMasterAddOnList() {
    var data = {};
    this.itemService.getMasterAddOnList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.masterAddOnList = response.data;

          for (let i = 0; i < this.masterAddOnList.length; i++) {
            const field1 = `selectedSubAddOn${this.masterAddOnList[
              i
            ].addon_id.toString()}`;
            this[field1] = { selected: undefined };

            for (
              let j = 0;
              j < this.masterAddOnList[i].addons_prices.length;
              j++
            ) {
              this.masterAddOnList[i].addons_prices[j].addon_id =
                this.masterAddOnList[i].addon_id;
              this.masterAddOnList[i].addons_prices[j].addon_name =
                this.masterAddOnList[i].addon_name;
            }
          }
          this.getItemData();
        } else {
          // this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error: any) => {
        // this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  //get collection item list
  getItemCollectionList() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo?.store_id
        ? this.main.LoggedUserStoreInfo?.store_id
        : this.session_store_id,
      collection_type: 1,
    };
    this.itemService.getCollectionMasterList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.CollectionItemList = response.data;
          response.data.forEach((item: any) => {
            if (item.is_added == 0) {
              this.CollectionItemList.push(item);
            }
          });
        } else {
          // this.GetTaxGroupList();
          // this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (response: any) => {
        // this.GetTaxGroupList();
      },
    });
  }



  reviewModal() {
    const modalRef = this.modalService.open(ReveiwRatingComponent, {
      size: "lg",
      centered: true,
    });
    modalRef.componentInstance.review = this.newItem.reviews;
    modalRef.componentInstance.store = this.newItem.rating_count;
    modalRef.componentInstance.itemRating = this.newItem.avg_rating;
    modalRef.componentInstance.timeZone = this.newItem.timezone;

  }

  //get master attribute list
  masterAttributeList: any = [];
  async getMasterAttributes() {
    this.masterAttributeList = [];
    var data = {
      store_id: this.main.LoggedUserStoreInfo?.store_id
        ? this.main.LoggedUserStoreInfo?.store_id
        : this.session_store_id,
      sub_category_id: this.formGroup.value.subCategory,
    };
    await this.itemService.getMasterAttributes(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach((attribute: any) => {
            var data: any = {
              attribute_name: attribute.attribute_name,
              item_attribute_id: Number(attribute.item_attribute_id),
              sub_attribute_type: attribute.sub_attribute_type,
              sub_item_attributes: [{ label: "All", value: 0 }],
            };
            if (attribute.sub_item_attributes != null) {
              attribute.sub_item_attributes.forEach((subAttribute: any) => {
                data.sub_item_attributes.push({
                  label: subAttribute.sub_item_attribute_name,
                  value: Number(subAttribute.sub_item_attribute_id),
                });
              });
            }
            this.masterAttributeList.push(data);
          });

          if (this.itemId != 0) {
            this.varientItem.forEach((varient) => {
              if (varient.item_attribute.length == 0) {
                varient.item_attribute.push({
                  selectedAttribute: {},
                  selectedSubAttribute: {},
                });
              } else {
                varient.item_attribute.forEach((attribute: any, i) => {
                  var objAttributeDetails = this.masterAttributeList.filter(
                    (x) => x.item_attribute_id == attribute.item_attribute_id
                  )[0];

                  var data = {
                    selectedAttribute: objAttributeDetails,
                    selectedSubAttribute: [],
                  };
                  if (attribute.sub_attribute_type == 1) {
                    data.selectedSubAttribute = attribute.sub_item_attributes
                      .split(",")
                      .map(Number);
                  } else {
                    var index = 0;
                    var colorArray = attribute.sub_item_attributes?.split(",");
                    colorArray?.forEach((colorCode: any) => {
                      var objData = { text: colorCode, id: index };
                      data.selectedSubAttribute.push(objData);
                      index++;
                    });
                  }

                  varient.item_attribute[i] = data;
                });
              }
            });
          }
          this.cdr.detectChanges();
        } else {
        }
      },
      error: () => {
        // this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  CheckChoices(item) {
    if (item.choices && item.choices != null && item.choices.length != 0) {
      return item.choices;
    } else {
      return [];
    }
  }

  CheckAddons(item) {
    if (item.addons && item.addons != null && item.addons.length != 0) {
      return item.addons;
    } else {
      return [];
    }
  }

  openinfo() {
  }

  createImageItems(image) {
    return this.formBuilder.group({
      image: [image.crop_image_file],
    });
  }

  //get packaging list
  async getPackageingList() {
    await this.itemService.getPackageingItemList().subscribe({
      next: (response: any) => {
        this.getUnitList();
        if (response.status == 1) {
          this.packageingList = response.data;
          var c = this.packageingList.length + 1;
          var item: any = {};
          item.packaging_name = "Packaging";
          item.packaging_id = 0;
          this.packageingList.splice(0, 0, item);
          this.newvarient.package = this.packageingList[0];
        } else {
          // this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }

  //edit variant
  editVariants(item) {
    this.spinner.show();
    this.newvarient.sub_category_id = item.sub_category_id
      ? item.sub_category_id
      : 0;
    this.newvarient.mrp = item.item_price;
    this.newvarient.package = this.packageingList.filter(
      (x) => x.packaging_id == item.packaging_id
    )[0];
    if (item.tax_group_id != undefined) {
      this.newvarient.tax_group = this.taxGroupList.filter(
        (x) => x.tax_group_id == item.tax_group_id.toString()
      )[0];
    }
    this.newvarient.unit = this.unitList.filter(
      (x) => x.name == item.unit_name
    )[0];
    this.newvarient.tax_group = this.taxGroupList.filter(
      (x) => x.tax_group_id == item.tax_group_id
    )[0];
    this.newvarient.unit =
      this.newvarient.unit == undefined
        ? this.unitList[0]
        : this.newvarient.unit;
    this.newvarient.reorder_quantity = parseInt(item.reorder_quantity ? item.reorder_quantity : 0);
    this.newvarient.opening_stock = parseInt(item.opening_stock ? item.opening_stock : 0);
    this.newvarient.item_number = item.unit_quantity;
    this.newvarient.discountedPrice = item.discounted_price;
    this.newvarient.sub_category_id = item.sub_category_id;
    this.newvarient.max_qty = item.max_qty;
    this.newvarient.min_qty = item.min_qty;
    this.newvarient.tax = item.tax;
    this.newvarient.external_item_id = item.external_item_id;
    this.newvarient.item_variants_id = item.item_variants_id;
    this.newvarient.packaging = item.packaging == null ? 0 : item.packaging;
    this.newvarient.sku = item.sku == null ? 0 : item.sku;
    this.newvarient.location = item.location == null ? "" : item.location;
    this.selectedChoicePriceList =
      item.selectedChoicePriceList != undefined
        ? item.selectedChoicePriceList
        : [];
    this.addedChoiceList =
      item.addedChoiceList != undefined ? item.addedChoiceList : [];
    this.selectedAddOnPriceList =
      item.selectedAddOnPriceList != undefined
        ? item.selectedAddOnPriceList
        : [];
    this.addedAddOnList =
      item.addedAddOnList != undefined ? item.addedAddOnList : [];
    this.displayChoiceList = item.displayChoiceList;
    this.displayAddOnList = item.displayAddOnList;
    this.newvarient.item_attribute = item.item_attribute;
    this.newvarient.unit_conversation_id = item.unit_conversation_id;
    this.newvarient.out_of_stock = item.out_of_stock;
    this.newvarient.hide_variant = item.hide_variant;
    this.newvarient.is_stock_added = item.is_stock_added;
    this.newvarient.item_image_ids = item.item_image_ids;
    const modalRef = this.modalService.open(AddEditVariantModelComponent, {
      size: "lg-950",
      backdrop: 'static',
    });

    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.newvarient = this.newvarient;
    modalRef.componentInstance.packageingList = this.packageingList;
    modalRef.componentInstance.unitList = this.unitList;
    modalRef.componentInstance.newItem = this.newItem;
    modalRef.componentInstance.taxGroupList = this.taxGroupList;
    modalRef.componentInstance.subCategory = this.selectedSubCategory;
    modalRef.componentInstance.itemId = this.itemId;
    modalRef.componentInstance.selectedChoicePriceList =
      this.selectedChoicePriceList;
    modalRef.componentInstance.selectedAddOnPriceList =
      this.selectedAddOnPriceList;
    modalRef.componentInstance.addedChoiceList = this.addedChoiceList;
    modalRef.componentInstance.addedAddOnList = this.addedAddOnList;
    modalRef.componentInstance.varientItem = this.varientItem;
    modalRef.componentInstance.masterAttributeList = this.masterAttributeList;
    modalRef.componentInstance.masterChoiceList = this.masterChoiceList;
    modalRef.componentInstance.masterAddOnList = this.masterAddOnList;
    modalRef.componentInstance.manualStock = this.newItem.stock_management_method;
    modalRef.componentInstance.masterItem = this.isSuperAdmin;
    modalRef.componentInstance.fromDetailsModal = true;
    modalRef.componentInstance.selectedVarient.subscribe(() => {
    });
  }

  get myFormArray(): UntypedFormArray {
    return this.formGroup.get("imageArray") as UntypedFormArray;
  }

  /**
 * To read the description
 */
  activateReadMore() {
    this.description_visible = !this.description_visible
    if (!this.description_visible) {
      var a: any = $("#description-details")?.offset()?.top
      $('html, body').animate({
        scrollTop: a - 100
      }, 0);
    }
  }

  removeImage(imageData, index) {
    if (this.newItem.item_images.length == 1) {
      this.toastr.error(
        this.translate.instant("ITEM_NEEDS_TO_CONTAIN_MINIMUM_ONE_IMAGE")
      );
      return;
    }

    this.DeleteItemImages(imageData, index);
  }

  drop(event: CdkDragDrop<any[]>) {
    var events: any = event
    var image: any = this.newItem.item_images[events.previousContainer.data.index];
    if ((image.type == 2 || image.type == 3) && events.container.data.index == 0) {
      this.toastr.error(this.translate.instant("THE_DEFAULT_VIEW_SHOULD_BE_AN_IMAGE"));
      return;
    }

    if (events.previousContainer.data.index == 0 && this.newItem.item_images.length > 1) {
      image = this.newItem.item_images[events.previousContainer.data.index + 1];
      if (image.type == 2 || image.type == 3) {
        this.toastr.error(this.translate.instant("THE_DEFAULT_VIEW_SHOULD_BE_AN_IMAGE"));
        return;
      }
    }

    moveItemInArray(
      this.newItem.item_images,
      events.previousContainer.data.index,
      events.container.data.index
    );
  }

  //add image to api
  ManageItemImages(tempItem, type?) {
    var fd = new FormData();
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("item_id", this.itemId);
    fd.append("display_id", this.newItem.item_images.length + 1);
    fd.append("image", tempItem);
    if (type) {
      fd.append("type", type);
    }

    this.itemService.manageItemImages(fd).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide('home');
          this._snackbarService.success(response.message);
          if (type == 3) {
            response.data.image = this.sanitizer.bypassSecurityTrustResourceUrl(tempItem);
            this.newItem.item_images.push(response.data);
          } else {
            this.newItem.item_images.push(response.data);
          }
        } else {
          this.spinner.hide('home');
        }
      },
    });
  }

  //delete image from api
  DeleteItemImages(tempItem, index) {
    if (tempItem.item_image_id == 0) {
      //Vlidation for variant first image
      var allow_image_delete: boolean = true;
      if (this.varientItem.length > 0) {
        this.varientItem.forEach(variant => {
          var variant_images: any = [];
          variant_images = variant.item_image_ids.split(',');
          if (variant_images.length > 0) {
            if (variant_images[0] == tempItem.file.name) {
              allow_image_delete = false;
            }
          }
        });
      }
      if (allow_image_delete) {
        this.newItem.item_images.splice(index, 1);
        this.myFormArray.removeAt(index);
        return;
      } else {
        this.toastr.error(this.translate.instant("Variant's first image can not be deleted."));
        return;
      }

    }
    var fd = new FormData();
    fd.append("user_id", this.main.LoggedUserInfo.user_id);
    fd.append("item_image_id", tempItem.item_image_id);

    this.itemService.deleteItemImages(fd).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.newItem.item_images.splice(index, 1);
          this.myFormArray.removeAt(index);
        } else {
          this._snackbarService.error(response.message);
        }
      },
    });
  }

  OpenImageInNewTab(element) {
    if (this.itemId > 0) {
      var item = this.newItem.item_images.filter((item) => item.item_image_id == element.item_image_id)[0];
      var link: any;
      link = item.type == 1 || item.type == 2 ? item.image : item.image.changingThisBreaksApplicationSecurity;
      window.open(link, "_blank");
      return;
    }

    var image = new Image();
    image.src = element.image;

    var w = window.open("");
    w.document.write(image.outerHTML);
  }

  removeVarient(formData) {
    this.varientItem.splice(this.varientItem.indexOf(formData), 1);
  }

  getUnitList() {
    this.itemService.getUnitItemList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.unitList = response.data;
          var item: any = {};
          item.unit_id = 0;
          item.name = "Select UOM";
          this.unitList.splice(0, 0, item);
          this.newvarient.unit = this.unitList[0];
        } else {
          // this.toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }

  stockMethod() {
    this.newItem.stock_management_method =
      this.formGroup.value.stockManagementMethod;
    this.cdr.detectChanges();
  }

  getFormControlValue(formControlName) {
    return this.formGroup.controls[formControlName].value;
  }

  changeStockUnit(item) {
    var unit_id = {
      unit_id: this.formGroup.value.unitId,
      name: "",
    };

    this.selectUomData = item;
    this.newItem.unit_id = unit_id;
    this.formGroup.controls["unitId2"].setValue(this.formGroup.value.unitId);
    this.cdr.detectChanges();
  }


  approvalStatusChange(status) {
    this.GetReasonList(status == 1 ? 8 : 9);
  }

  //get reason list
  GetReasonList(reasonType) {
    var data = {
      reason_type: reasonType,
    };
    this.rejectedStatus = data.reason_type;
    this.reasonService.get(data).subscribe({
      next: (response: any) => {
        this.reason_list = [];
        if (response.status == 1) {
          let reasonListLocal: any;
          reasonListLocal = response.data;
          reasonListLocal.forEach((item) => {
            var reasonLable = item.reason;
            var data = {
              label: reasonLable,
              value: item.reason_id,
            };
            this.reason_list.push(data);
          });
          this.formGroup.controls["selectedReason"].setValue(
            this.reason_list[2].value
          );
        } else {
        }
      },
    });
  }

  conditionallyRequiredValidator(formControl: AbstractControl) {
    if (!formControl.parent) {
      return null;
    }

    if (formControl.parent.get("stockManagementMethod").value == 2) {
      return Validators.required(formControl);
    }
    return null;
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  RemoveSelectedcollection(id) {
    this.collection_list = this.TempcollectionList;
    id.forEach((element) => {
      this.collection_list = this.collection_list.filter(
        (item) => item.item_collection_id !== element
      );
    });
  }

  ngAfterViewInit(): void {
    this.cursor?.nativeElement.focus();
    this.cursor?.nativeElement.blur();
  }

  ngOnDestroy(): void {
    $(
      "<style>.mat-tab-label-container{  background-color: #F0F3F4 !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-ink-bar{ top: 0px !important; height: 3px !important;} .mat-tab-label:focus,.mat-tab-label:active{ background-color: white !important;}</style>"
    ).appendTo("body");
  }


  ValidTwoDecimalDigits(event: any) {
    const input = event.target;
    const value = input.value;
    const parts = value.split('.');
    if (parts.length > 1 && parts[1].length > 5) {
      input.value = `${parts[0]}.${parts[1].slice(0, 5)}`;
    }
  }

  getSanitizedHtml(value: any) {
    return this.sanitizeHtml(value);
  }

  sanitizeHtml(value: string): SafeHtml {
    return trustCleanHtml(this.sanitizer, value); // scripts and event handlers removed
  }

  /**
 * Used to scroll right
 */
  public scrollRight(): void {
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 200), behavior: 'smooth' });
  }

  /**
   * Used to scroll left
   */
  public scrollLeft(): void {
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - 200), behavior: 'smooth' });
  }
}
