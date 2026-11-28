import { Subject, takeUntil } from "rxjs";
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
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { ItemService } from "src/app/services/item.service";
import { ItemTagService } from "src/app/services/lookup/item-tag.service";
import { SubCategoryService } from "src/app/services/lookup/sub-category.service";
import { StockUnitManagementInfoComponent } from "../../model/stock-unit-management-info/stock-unit-management-info.component";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { crop_rectangleComponent } from "../../model/crop-rectangle/crop-rectangle.component";
import { AddEditVariantModelComponent } from "../../model/add-edit-variant/add-edit-variant.component";
import { reasonMasterService } from "src/app/services/lookup/reason-master.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { TaxGroupService } from "src/app/services/lookup/tax-group.service";
import { UserRoles } from "src/app/enums/user-roles";
import { CommonService } from "src/app/services/common.service";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { UploadImagesComponent } from "../../model/upload-images/upload-images.component";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ReveiwRatingComponent } from "../../model/reveiw-rating/reveiw-rating.component";
import { AddNoteComponent } from "../../model/add-note/add-note.component";
import { DomSanitizer } from "@angular/platform-browser";
import { UploadVideoComponent } from "../../model/upload-video/upload-video.component";
import { NgxSpinnerService } from "ngx-spinner";
import { cloneDeep } from "lodash";
import { CKEditorComponent } from "ckeditor4-angular";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-item-edit",
  templateUrl: "./item-edit.component.html",
  styleUrls: ["./item-edit.component.scss"],
})
export class ItemEditComponent implements OnInit, OnDestroy, AfterViewInit {
  destroy$ = new Subject();
  itemId: any = 0;
  formGroup: UntypedFormGroup;
  main: any;
  newItem: any = { item_images: [] };
  is_item_approval: any;
  is_addOn_choices: any;
  iseatery: any;
  categoryId: any;
  item_approval_shop_type_string: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @ViewChild('myCKEditor', { static: true }) ckeditorComponent: CKEditorComponent;
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
    // label: "",
    // value: "",
  };

  selectedItemCollection: any = {
    // label: "",
    // value: "",
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
  sidebarCategoryId: any;
  @ViewChild("cursor") cursor: ElementRef;
  userRoleEnum = UserRoles;
  AllowManageItem: boolean = false;
  isStoreManager: boolean = false;
  isSuperAdmin: boolean = false;
  storeIdOfItemSubmission: any = 0;
  disableData: boolean = true;
  session = this.appComponent.sessionConfig();
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
  selected_store_id: any;
  ckEditorConfig: any = {
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
    fontSize_defaultLabel: '16'
  };
  active_tab: string = 'DESCRIPTION';
  tab_active: boolean = false;
  store_type: any;// use for hide and display item type
  amount_seperator: any;
  masterAttributeList: any = [];
  is_invalid_keyword: boolean = false;
  CollectionItemList: any = [];
  TempItemtagList: any = [];
  
  constructor(
    private router: Router,
    private itemService: ItemService,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private appComponent: AppComponent,
    private toastr: ToastrService,
    private subCategoryService: SubCategoryService,
    private itemTagService: ItemTagService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private reasonService: reasonMasterService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private TaxGroupService: TaxGroupService,
    private _snackbarService: ToastrService,
    public commonService: CommonService,
    public dialog: MatDialog,
    private _helpService: BannerService,
    private sanitizer: DomSanitizer,
    public spinner: NgxSpinnerService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    if (location.href.indexOf("/items/item-edit") > -1) {
      this.selected_store_id = this.cryptoService.decryptIdValue("selectedStoreId" + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
      if (this.isSuperAdmin) {
        this.storeIdOfItemSubmission = JSON.parse(
          localStorage.getItem("storeIdOfItemSubmission")
        );
        this.itemId = this.cryptoService.decryptIdValue(
          "selleritemid" + this.main.LoggedUserInfo?.role_id?.toString(),
          this.main.CryptoKey
        );
      }
      else {
        var stockSettingCheck: any = localStorage.getItem("checkStockSettingsId")
        if (stockSettingCheck == 1 && stockSettingCheck != null) {
          this.itemId = this.cryptoService.decryptIdValue(
            "stockSettingId" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
            this.main.CryptoKey
          );
          localStorage.removeItem("stockSettingId")
        }
        else {
          this.itemId = this.cryptoService.decryptIdValue(
            "selleritemid" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
            this.main.CryptoKey
          );
        }
      }
      if (this.itemId == undefined) {
        this.router.navigate(["/items"]);
      }
    } else if (location.href.indexOf("/items/edit-master-adminitem") > -1 || location.href.indexOf("/items/edit-adminitem") > -1) {
      this.selected_store_id = this.cryptoService.decryptIdValue("selectedStoreId" + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
      this.itemId = this.cryptoService.decryptIdValue(
        "adminitemid" + this.main.LoggedUserInfo.role_id.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.itemId == undefined) {
        this.router.navigate(["/items"]);
      }
      else {
        this.loadForm();
      }
    }
  }

  ngOnInit(): void {
    this.activeTab('DESCRIPTION');
    if (location.href.indexOf("/items/edit-master-adminitem") > -1 || location.href.indexOf("/items/item-masterItemAdd") > -1) {
      this.masterItem = true;
    }
    $('.disableOfdropdown ng-dropdown-panel').css({ 'opacity': '0!important' })
    $(
      "<style>.mat-tab-header-pagination-controls-enabled .mat-tab-header-pagination {  background-color: " + this.general_setting.css_button_business_default + " !important; border-color: " + this.general_setting.css_button_business_default + " !important;border-radius: 5px 3px 5px 3px; z-index: 0 !important}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-tab-label-container{  background-color: #F0F3F4 !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-tab-group.mat-primary .mat-ink-bar, .previous-arrow, .next-arrow{  background-color: " + this.general_setting.css_button_business_default + " !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.activeTab{  border-top: 3px solid " + this.general_setting.css_button_business_alternative + " !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-ink-bar{ top: 0px !important; height: 3px !important;} .mat-tab-label:focus,.mat-tab-label:active{ background-color: white !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-tab-label .mat-tab-label-content, .tab-scroll span, .previous-arrow, .next-arrow {  color: " + this.general_setting.css_button_business_font + " !important;}</style>"
    ).appendTo("body");
    this.main = this.appComponent.main;
    this.is_item_approval = 0;
    this.is_addOn_choices = this.main.LoggedUserStoreInfo?.iseatery;
    this.iseatery = parseInt(this.main.LoggedUserStoreInfo?.iseatery);
    this.show_price_same_font = this.general_setting.show_price_same_font;
    this.global_currency = this.general_setting.currency_symbol;
    this.amount_seperator = this.general_setting?.amount_seperator;
    this.store_label = this.general_setting.store_label;
    this.stock_mgmt = this.general_setting.stock_mgmt;
    this.review_rating_module = this.general_setting.review_rating_module;
    this.show_review_rating = this.general_setting.show_review_rating;
    this.item_approval_shop_type_string =
      this.general_setting != undefined
        ? this.general_setting.item_approval_shop_type
        : this.main.item_approval_shop_type;
    if (
      this.main.LoggedUserInfo.role_id != this.main.UserRole.SuperAdmin &&
      this.main.LoggedUserInfo.role_id != this.main.UserRole.Admin
    ) {
      this.categoryId = parseInt(this.main.LoggedUserStoreInfo?.category_id);
      var itemApprovalShopType = this.item_approval_shop_type_string
        .toString()
        .split(",");
      var filterSubcategory = itemApprovalShopType.filter(
        (shopType) => shopType == this.main.LoggedUserStoreInfo?.category_id
      );
      if (filterSubcategory.length > 0) {
        this.is_item_approval = 1;
      }
    }
    else {
      this.storeinfo = JSON.parse(localStorage.getItem("selectedStore"));
      this.main.LoggedUserStoreInfo = this.storeinfo;
      this.categoryId = parseInt(
        this.main.LoggedUserStoreInfo?.store_category_id
      );
      if (this.main.LoggedUserStoreInfo?.iseatery == 0) {
        var itemApprovalShopType = this.item_approval_shop_type_string
          .toString()
          .split(",");
        var filterSubcategory = itemApprovalShopType.filter(
          (shopType) =>
            shopType == this.main.LoggedUserStoreInfo?.store_category_id
        );
        if (filterSubcategory.length > 0) {
          this.iseatery = 1;
        }
      }
    }
    this.isSuperAdmin =
      this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
          ? true
          : false;
    if (location.href.indexOf("/items/item-edit") > -1) {
      if (this.isSuperAdmin) {
        this.storeIdOfItemSubmission = JSON.parse(
          localStorage.getItem("storeIdOfItemSubmission")
        );
        this.itemId = this.cryptoService.decryptIdValue(
          "selleritemid" + this.main.LoggedUserInfo?.role_id?.toString(),
          this.main.CryptoKey
        );
      }
      else {
        var stockSettingCheck: any = localStorage.getItem("checkStockSettingsId")
        if (stockSettingCheck == 1 && stockSettingCheck != null) {
          this.itemId = this.cryptoService.decryptIdValue(
            "stockSettingId" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
            this.main.CryptoKey
          );
          localStorage.removeItem("stockSettingId")
        }
        else {
          this.itemId = this.cryptoService.decryptIdValue(
            "selleritemid" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
            this.main.CryptoKey
          );
        }
      }
      if (this.itemId == undefined) {
        this.router.navigate(["/items"]);
      }
    } else if (location.href.indexOf("/items/edit-adminitem") > -1 || location.href.indexOf("/items/edit-master-adminitem") > -1) {
      this.itemId = this.cryptoService.decryptIdValue(
        "adminitemid" + this.main.LoggedUserInfo.role_id.toString(),
        this.main.CryptoKey
      );
      this.storeinfo = JSON.parse(localStorage.getItem("selectedStore"));
      this.main.LoggedUserStoreInfo = this.storeinfo;
      if (this.itemId == undefined) {
        this.router.navigate(["/items"]);
      }
    } else {
      this.loadForm();
    }
    this.itemService.isCategoryIdUpdated().pipe(takeUntil(this.destroy$)).subscribe((sidebarCategoryId) => {
      this.sidebarCategoryId = sidebarCategoryId;
    });
    let sessionSelectedCategory: any;
    sessionSelectedCategory = this.cryptoService.decryptIdValue(
      "urlcategoryid" + this.main.LoggedUserStoreInfo?.store_id?.toString(),
      this.main.CryptoKey
    );
    if (
      sessionSelectedCategory != null ||
      sessionSelectedCategory != undefined
    ) {
      this.sidebarCategoryId = sessionSelectedCategory;
    }
    this.getCategoryList();
    this.getItemTagList();
    this.getCollectionList();
    this.getPackageingList();
    this.GetTaxGroupList();
    this.getMasterChoiceList();
    this.getMasterAddOnList();
    this.getItemCollectionList();
    if (
      this.main.LoggedUserStoreInfo?.role_id == this.userRoleEnum.StoreManager
    ) {
      this.isStoreManager = true;
      this.getStoreManagerSettings();
    }
    this.getHelpDetails();
    this.ckEditorConfig.contentsCss = [window.location.origin + "/assets/ckEditor-font.css"];
    if (location.href.indexOf("/items/item-add") > -1) {
      if (this.seller_details) {
        this.selected_store_id = this.seller_details.store_id
      } else {
        this.selected_store_id = this.session_store_id
      }
    }
    if (location.href.indexOf("/items/item-masterItemAdd") > -1) {
      this.selected_store_id = this.main.LoggedUserStoreInfo?.store_id
    }
    if (this.selected_store_id) {
      this.ckEditorConfig = {
        extraPlugins: 'uploadimage,pastefromword,filebrowser',
        uploadUrl:
          'https://apilocal.lokaly.in/store/ckeditor?store_id=' + this.selected_store_id,
        filebrowserBrowseUrl:
          'uploads/ckeditor',
        filebrowserImageBrowseUrl:
          'uploads/ckeditor',
        filebrowserUploadUrl:
          'https://apilocal.lokaly.in/store/ckeditor?store_id=' + this.selected_store_id,
        filebrowserImageUploadUrl:
          'https://apilocal.lokaly.in/store/ckeditor?store_id=' + this.selected_store_id,
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
        fontSize_defaultLabel: '16'
      }
    }
  }

  getStoreManagerSettings() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo?.store_id,
    };

    this.commonService
      .getStoreSetting(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.data.manage_item == 1) {
            this.AllowManageItem = true;
          } else {
            this.AllowManageItem = false;
          }
        },
        error: (error) => { },
        complete: () => { },
      });
  }

  loadForm() {
    if (this.seller_details != "") {
      this.sellername = this.seller_details.store_name;
      this.store_type = this.seller_details.item_type;
    } else {
      this.sellername = this.storeinfo?.store_name;
      this.store_type = this.storeinfo?.item_type;
    }
    if (this.masterItem) {
      this.sellername = this.storeinfo?.category_name;
      this.store_type = this.storeinfo?.item_type;
    }
    this.formGroup = this.formBuilder.group({
      store_name: new UntypedFormControl(this.sellername),
      imageArray: new UntypedFormArray([]),
      brandName: new UntypedFormControl(null),
      itemName: new UntypedFormControl(null, Validators.required),
      itemKeywoard: new UntypedFormControl(null),
      category: new UntypedFormControl(null),
      subCategory: new UntypedFormControl(null),
      itemType: new UntypedFormControl(null),
      itemTag: new UntypedFormControl(null),
      itemCollection: new UntypedFormControl(null),
      itemCollectionAutomatic: new UntypedFormControl(""),
      featured_type: new UntypedFormControl(""),
      itemDescription: new UntypedFormControl(""),
      manufacturerDetails: new UntypedFormControl(""),
      howToUse: new UntypedFormControl(""),
      features: new UntypedFormControl(""),
      benefits: new UntypedFormControl(""),
      ingredients: new UntypedFormControl(""),
      nutritionalInformation: new UntypedFormControl(""),
      productInformation: new UntypedFormControl(""),
      otherInformation: new UntypedFormControl(""),
      stockManagementMethod: new UntypedFormControl("1"),
      unitId: new UntypedFormControl(null, [this.conditionallyRequiredValidator]),
      unitId2: new UntypedFormControl(null),
      unit_quantity: new UntypedFormControl(null, [
        this.conditionallyRequiredValidator,
      ]),
      reorder_quantity: new UntypedFormControl(null, [
        this.conditionallyRequiredValidator,
      ]),
      prescription: new UntypedFormControl(""),
      // mask_price: new FormControl(""),
      // out_of_stock: new FormControl(""),
      remarks: new UntypedFormControl(""),
      approval_status: new UntypedFormControl(""),
      selectedReason: new UntypedFormControl(null),
    });
    if (this.seller_details.item_type == 0) {
      this.formGroup.controls["itemType"].setValue(this.item_type[0].value);
    }
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
        } else {
        }
      },
      error: (error: any) => {
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
        this.GetTaxGroupList();
        if (response.status == 1) {
          this.CollectionItemList = response.data;
          response.data.forEach((item: any) => {
            if (item.is_added == 0) {
              this.CollectionItemList.push(item);
            }
          });
        } else {
          this.GetTaxGroupList();
          // this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (response: any) => {
        this.GetTaxGroupList();
      },
    });
  }

  //get data by item id
  async getItemData() {
    var fd = new FormData();
    fd.append("item_id", this.itemId);
    this.loadForm();
    await this.itemService.getItemDetails(fd).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.newItem = response.data;
          this.selected_store_id = response.data.store_id;
          if (response.data.is_approved == 0) {
            this.newItem.approval_status = 1;
            this.formGroup.controls["approval_status"].setValue("1");
            this.GetReasonList(this.newItem.approval_status == 1 ? 8 : 9);
          }

          this.newItem.item_images =
            response.data.item_images == null ? [] : response.data.item_images;

          this.varientItem = [];
          this.newItem.item_variants.forEach((value: any, key: any) => {
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
            if (value.choices !== null && value.choices) {
              value.choices.forEach((value1: any, key: any) => {
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
            this.masterChoiceList.forEach((value1: any, key1: any) => {
              addedChoices.forEach((value2, key2) => {
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
              value.addons.forEach((value1: any, key: any) => {
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
            this.masterAddOnList.forEach((value1: any, key1: any) => {
              addedAdd.forEach((value2, key2) => {
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

          if (this.newItem.item_tag) {
            
            var item_tags: any = [];
            item_tags =
            this.newItem.item_tag.item_tags != ""
            ? this.newItem.item_tag.item_tags.toString().split(",")
            : "";
            if(item_tags){
              item_tags?.forEach((catID: any) => {
                var tagDetails = this.tag_item_list.filter(
                  (x) => x.item_tag_id == catID
                )[0];
                if (tagDetails) {
                  newItemTags_ids.push(tagDetails);
                }
              });
            }
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
          this.setFormData(response.data);
        } else {
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  //get master attribute list
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
      error: (error: any) => {
        // this.toastr.error(this.translate.instant(error.message));
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

  horizontalLeftScroll() {
    $(".nav-tabs").animate(
      {
        scrollLeft: "-=200px",
      },
      "slow"
    );
  }
  
  horizontalRightScroll() {
    $(".nav-tabs").animate(
      {
        scrollLeft: "+=200px",
      },
      "slow"
    );
  }

  setFormData(resopnse) {
    this.formGroup.controls["brandName"].setValue(resopnse.brand_name);
    this.formGroup.controls["itemName"].setValue(resopnse.item_name);
    this.formGroup.controls["itemKeywoard"].setValue(resopnse.item_keyword);
    this.selectedCategory = this.categoryList.filter(
      (x) => x.value == resopnse.category_id
    )[0];

    this.formGroup.controls["category"].setValue(this.selectedCategory);
    this.getSubCategoryList();
    this.selectedItemType = this.item_type.filter(
      (x) => x.value == resopnse.item_type
    )[0];
    this.formGroup.controls["itemType"].setValue(this.selectedItemType.value);
    this.selectedItemTag = this.newItem.item_tag.item_tags.split(",").map((x) => Number(x));
    if (this.selectedItemTag[0] == "") {
      this.formGroup.controls["itemTag"].setValue(null);
    } else {
      this.formGroup.controls["itemTag"].setValue(this.selectedItemTag);
    }

    this.selectedItemCollection =
      this.newItem.item_collection.item_collection_id
        .split(",")
        .map((x) => Number(x));
    if (
      this.selectedItemCollection[0] == 0 ||
      this.selectedItemCollection[0] == ""
    ) {
      this.formGroup.controls["itemCollection"].setValue(null);
    } else {
      this.formGroup.controls["itemCollection"].setValue(
        this.selectedItemCollection
      );
    }

    if (this.newItem.automatic_collection.item_collection_id != "") {
      let selectedItemCollectionAutomatic =
        this.newItem.automatic_collection.map((x) => x.collection_name);
      if (
        selectedItemCollectionAutomatic[0] == 0 ||
        selectedItemCollectionAutomatic[0] == ""
      ) {
        this.formGroup.controls["itemCollectionAutomatic"].setValue(null);
      } else {
        this.formGroup.controls["itemCollectionAutomatic"].setValue(
          selectedItemCollectionAutomatic
        );
      }
    } else {
      this.formGroup.controls["itemCollectionAutomatic"].setValue(null);
    }

    this.formGroup.controls["featured_type"].setValue(
      resopnse.featured_type == 1 ? true : false
    );
    this.formGroup.controls["itemDescription"].setValue(
      resopnse.item_description
    );
    this.formGroup.controls["manufacturerDetails"].setValue(
      resopnse.manufacturer_details
    );
    this.formGroup.controls["howToUse"].setValue(resopnse.how_to_use);
    this.formGroup.controls["features"].setValue(resopnse.features);
    this.formGroup.controls["benefits"].setValue(resopnse.benefits);
    this.formGroup.controls["ingredients"].setValue(resopnse.ingredients);
    this.formGroup.controls["nutritionalInformation"].setValue(
      resopnse.nutritional_information
    );
    this.formGroup.controls["productInformation"].setValue(
      resopnse.product_information
    );
    this.formGroup.controls["otherInformation"].setValue(
      resopnse.other_information
    );
    this.formGroup.controls["stockManagementMethod"].setValue(
      resopnse.stock_management_method.toString()
    );
    if (resopnse.unit_id?.unit_id > 0) {
      this.selectedUnit = this.unitList.filter(
        (x) => x.unit_id == resopnse.unit_id.unit_id
      )[0];
    }
    if (this.selectedUnit.unit_id == "") {
      this.formGroup.controls["unitId"].setValue(null);
      this.formGroup.controls["unitId2"].setValue(null);
    } else {
      this.formGroup.controls["unitId"].setValue(this.selectedUnit.unit_id);
      this.formGroup.controls["unitId2"].setValue(this.selectedUnit.unit_id);
    }
    this.formGroup.controls["unit_quantity"].setValue(resopnse.unit_quantity);
    this.formGroup.controls["reorder_quantity"].setValue(
      resopnse.reorder_quantity
    );
    this.formGroup.controls["prescription"].setValue(
      resopnse.prescription == 1 ? true : false
    );

    this.newItem.item_images.forEach(element => {
      element.crop_image = element.image
      this.editProfilePic(element)
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

  async getCategoryList() {
    let data: any = {
      store_id: this.main.LoggedUserStoreInfo?.store_id,
    };
    this.categoryList = [];
    await this.itemService.getCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          let categoryListLocal: any;
          categoryListLocal = response.data;
          categoryListLocal.forEach((item, i) => {
            if (item.category_id != 1 && item.category_id != 2) {
              var categoryLable = item.category_name;
              var data = { label: categoryLable, value: item.category_id };
              this.categoryList.push(data);
            }
          });
          if (this.itemId > 0) {
            this.getItemData();
          }
          else {
            var sideCategoryId = true;

            if (this.sidebarCategoryId == 0 || this.sidebarCategoryId == 1) {
              sideCategoryId = false
            }

            if (sideCategoryId) {
              if (this.sidebarCategoryId) {
                this.selectedCategory = this.categoryList.filter(
                  (x) => x.value == this.sidebarCategoryId
                )[0];
              } else {
                this.selectedCategory = this.categoryList[0];
              }

              this.formGroup.controls["category"].setValue(
                this.selectedCategory
              );
            }
            else {
              this.selectedCategory = this.categoryList[0];
              this.formGroup.controls["category"].setValue(
                this.selectedCategory
              );
            }
            this.getSubCategoryList();
          }
        } else {
          // this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  openinfo() {
    const modalRef = this.modalService.open(StockUnitManagementInfoComponent, {
      size: "md",
    });
  }

  changeCategory(category: any) {
    this.selectedCategory = category;
    this.formGroup.controls["category"].setValue(this.selectedCategory);
    this.getSubCategoryList();
  }

  changeSubCategory(subcat: any) {
    this.getMasterAttributes();
  }

  async getSubCategoryList() {
    this.subCategoryList = [];

    let data: any = {
      store_id: this.main.LoggedUserStoreInfo?.store_id,
      category_id:
        this.selectedCategory != undefined
          ? this.selectedCategory.value.toString()
          : this.newItem.category_id,
    };

    await this.subCategoryService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          let subCategoryListLocal = response.data;

          subCategoryListLocal.forEach((item) => {
            var data = {
              label: item.sub_category_name,
              value: item.sub_category_id,
              category_id: item.category_id,
            };
            this.subCategoryList.push(data);
          });

          if (this.itemId > 0) {
            this.selectedSubCategory = this.subCategoryList.filter(
              (x) => x.value == this.newItem.sub_category_id
            )[0];
            this.formGroup.controls["subCategory"].setValue(
              this.selectedSubCategory?.value
            );
          } else {
            this.selectedSubCategory = this.subCategoryList[0];
            this.formGroup.controls["subCategory"].setValue(
              this.selectedSubCategory.value
            );
          }
          this.getMasterAttributes();
        } else {
          this.selectedSubCategory = [];
          this.selectedSubCategory = null;
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //Item tag list
  getItemTagList() {
    this.tag_item_list = [];
    var data = {
      category_id: this.categoryId,
    };
    this.itemTagService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.tag_item_list = response.data;

          this.TempItemtagList = response.data;
        } else {
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  openPicModal() {
    if (this.itemId == 0) {
      const dialogRef = this.dialog.open(UploadImagesComponent, {
        width: "50%",
        autoFocus: false,
      });
      dialogRef.afterClosed().subscribe((dialogResult: any) => {
        if (dialogResult) {
          for (let index = dialogResult.length - 1; index >= 0; index--) {
            this.openCropImageModal(dialogResult[index]);
          }
        }
      });
    } else {
      const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
      });
      modalRef.componentInstance.width = "500";
      modalRef.componentInstance.height = "500";
      modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
        this.editProfilePic(receivedEntry);
      });
    }
  }

  openCropImageModal(file: any) {           //Do not remove commented code
    // var tempcrop = [];             //Do not remove commented code
    // var cropType = "jpeg";             //Do not remove commented code
    // tempcrop.push({            //Do not remove commented code
    //   osize: (file.size / 1024).toFixed(0) + "KB",             //Do not remove commented code
    //   name: file.name,             //Do not remove commented code
    //   type: cropType ? "image/" + cropType : file.type,            //Do not remove commented code
    // });

    // let widthHeight = { cropWidth: 1, cropHeight: 1 };             //Do not remove commented code
    // const dialogData = new CropRectangleDialogModel(             //Do not remove commented code
    //   file,
    //   widthHeight,
    //   tempcrop
    // );
    // const dialogRef = this.dialog.open(CropImageComponent, {             //Do not remove commented code
    //   width: "50%",
    //   data: dialogData,
    // });
    // dialogRef.afterClosed().subscribe((dialogResult: any) => {             //Do not remove commented code
    //   if (dialogResult) {
    //     this.editProfilePic(dialogResult);             //Do not remove commented code
    //   }
    // });

    const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.added_file = file;
    modalRef.componentInstance.width = "500";
    modalRef.componentInstance.height = "500";
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.editProfilePic(receivedEntry);
    });
  }

  editProfilePic(item) {
    if (item.crop_image_file != undefined) {
      this.imageArray = this.myFormArray;
      this.cropped_banner_image = item.crop_image;
      this.imageArray.push(this.createImageItems(item));
      this.formGroup.updateValueAndValidity();
      if (this.itemId == 0) {
        var tempItem: any = {
          image: item.crop_image,
          file: item.crop_image_file,
          item_image_id: 0,
          display_id: 0,
          type: 1
        };
        this.newItem.item_images.push(tempItem);
      }
      else {
        if (item.crop_image_file) {
          this.ManageItemImages(item.crop_image_file);
        }
      }
    }
    this.cdr.detectChanges();
  }

  createImageItems(image) {
    return this.formBuilder.group({
      image: [image.crop_image_file],
    });
  }

  get myFormArray(): UntypedFormArray {
    return this.formGroup.get("imageArray") as UntypedFormArray;
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
         }
      },
    });
  }

  //get collection list
  getCollectionList() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo?.store_id,
      collection_type: 1,
    };
    this.itemService.getCollectionMasterData(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.collection_list = response.data;
          this.TempcollectionList = response.data;
        } else {
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

  validate_keyword() {
    if (this.formGroup.value.itemKeywoard.length > 250) {
      this.is_invalid_keyword = true;
    } else {
      this.is_invalid_keyword = false;
    }
  }

  onSubmit() {
    if (this.formGroup.value.itemName == null) {
      this.toastr.error(this.translate.instant("PLEASE_ENTER_ITEM_NAME"));
      return;
    }

    if (this.formGroup.value.itemKeywoard && this.formGroup.value.itemKeywoard.length > 250) {
      this.toastr.error(this.translate.instant("ITEM_KEYWORDS_SHOULD_BE_BETWEEN_250_CHARACTERS"));
      return;
    }

    if (this.newItem.stock_management_method == 2) {
      if (
        this.formGroup.value.unitId == null ||
        this.formGroup.value.unitId == 0
      ) {
        this.toastr.error(this.translate.instant("PLEASE_SELECT_UNIT"));
        return;
      }
      if (this.formGroup.value.unit_quantity == null) {
        this.toastr.error(this.translate.instant("PLEASE_ENTER_OPENING_STOCK"));
        return;
      }
      if (this.formGroup.value.reorder_quantity == null) {
        this.toastr.error(this.translate.instant("PLEASE_ENTER_REORDER_LEVEL"));
        return;
      }
    }

    if (this.varientItem.length <= 0) {
      this.toastr.error(this.translate.instant("ITEM_VARIENT_VALIDATION"));
      return;
    }
    if (!this.formGroup.value.category || !this.formGroup.value.subCategory) {
      this.toastr.error(
        this.translate.instant("PLEASE_SELECT_CATEGORY_AND_SUB_CATEGORY_FIRST")
      );
      return;
    }

    else {
      var fd = new FormData();
      fd.append("user_id", this.main.LoggedUserInfo.user_id);
      fd.append(
        "brand_name",
        this.getFormControlValue("brandName")
          ? this.getFormControlValue("brandName")
          : ""
      );
      fd.append("item_name", this.getFormControlValue("itemName"));
      fd.append(
        "item_keyword",
        this.getFormControlValue("itemKeywoard")
          ? this.getFormControlValue("itemKeywoard")
          : ""
      );
      fd.append("category_id", this.getFormControlValue("category")?.value);
      fd.append("sub_category_id", this.getFormControlValue("subCategory"));
      if (this.formGroup.value.itemType != null) {
        fd.append("item_type", this.formGroup.value.itemType);
      }
      fd.append(
        "item_description",
        this.getFormControlValue("itemDescription")
          ? this.getFormControlValue("itemDescription")
          : ""
      );

      fd.append(
        "prescription",
        this.getFormControlValue("prescription") ? "1" : "0"
      );

      fd.append(
        "how_to_use",
        this.getFormControlValue("howToUse")
          ? this.getFormControlValue("howToUse")
          : ""
      );
      fd.append(
        "benefits",
        this.getFormControlValue("benefits")
          ? this.getFormControlValue("benefits")
          : ""
      );
      fd.append(
        "ingredients",
        this.getFormControlValue("ingredients")
          ? this.getFormControlValue("ingredients")
          : ""
      );
      fd.append(
        "nutritional_information",
        this.getFormControlValue("nutritionalInformation")
          ? this.getFormControlValue("nutritionalInformation")
          : ""
      );

      fd.append(
        "manufacturer_details",
        this.getFormControlValue("manufacturerDetails")
          ? this.getFormControlValue("manufacturerDetails")
          : ""
      );

      fd.append(
        "features",
        this.getFormControlValue("features")
          ? this.getFormControlValue("features")
          : ""
      );

      fd.append(
        "other_information",
        this.getFormControlValue("otherInformation")
          ? this.getFormControlValue("otherInformation")
          : ""
      );
      fd.append(
        "product_information",
        this.getFormControlValue("productInformation")
          ? this.getFormControlValue("productInformation")
          : ""
      );

      fd.append(
        "item_tags",
        this.getFormControlValue("itemTag")
          ? this.getFormControlValue("itemTag")
          : ""
      );
      fd.append(
        "item_collection_id",
        this.getFormControlValue("itemCollection")
          ? this.getFormControlValue("itemCollection")
          : ""
      );

      if (this.itemId == 0) {
        for (var i = 0; i < this.newItem.item_images?.length; i++) {
          if (this.newItem.item_images[i].item_image_id == 0) {
            if (this.newItem.item_images[i].type == 3) {
              fd.append("item_images[]", JSON.stringify(this.newItem.item_images[i].file));
            } else {
              fd.append("item_images[]", this.newItem.item_images[i].file);
            }
          }
        }
      } else {
        var item_images_order = [];
        for (i = 0; i < this.newItem.item_images.length; i++) {
          var dataaa = {
            display_id: i + 1,
            item_image_id: this.newItem.item_images[i].item_image_id,
          };
          item_images_order.push(dataaa);
        }
        fd.append("item_images_order", JSON.stringify(item_images_order));
      }

      if (this.varientItem.length == 0) {
        this.toastr.error(this.translate.instant("PLEASE_ENTER_RADIUS"));
        return;
      }

      const getCircularReplacer = () => {
        const seen = new WeakSet();
        return (key, value) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return;
            }
            seen.add(value);
          }
          return value;
        };
      };

      var all_variant: any = cloneDeep(this.varientItem);
      var is_variant_image: boolean = true;
      all_variant.forEach((element, i) => {
        var tem_item_attribute = [];
        if (element.item_attribute.length > 0) {
          if (element.item_attribute[0].selectedAttribute.item_attribute_id) {
            element.item_attribute?.forEach((attribute) => {
              var data: any = {
                item_attribute_id: attribute?.selectedAttribute?.item_attribute_id ? attribute?.selectedAttribute?.item_attribute_id : attribute?.item_attribute_id,
                sub_attribute_type: attribute?.selectedAttribute?.sub_attribute_type ? attribute?.selectedAttribute?.sub_attribute_type : attribute?.sub_attribute_type,
               }
              if (attribute?.selectedAttribute?.sub_attribute_type == 1) {
                data.sub_item_attributes = attribute?.selectedSubAttribute?.flat().join(",");
              }
              else {
                data.sub_item_attributes = attribute?.selectedSubAttribute?.map((x) => x.text).flat().join(",");
              }
              tem_item_attribute.push(data)
            });
            element.item_attribute = tem_item_attribute
          }
        }

        //Added for multimedia
        if (this.itemId == 0) {
          if (!element.item_image_ids && this.newItem.item_images.length > 0) {
            is_variant_image = false;
          }
          if (element.item_image_ids) {
            element.item_image_names = element.item_image_ids;
            delete element.item_image_ids;
          }
        }

        //To handle adn/chs issue during duplication
        if (element.item_variants_id == 0) {
          if (element.addons != null && element.addons?.length != 0) {
            element.addons.forEach(adn => {
              adn.variant_addon_id = 0;
              adn.variant_addon_price_id = 0;
            });
          }

          if (element.choices != null && element.choices?.length != 0) {
            element.choices.forEach(chs => {
              chs.variant_choice_id = 0;
              chs.variant_choice_price_id = 0;
            });
          }
        }
      });

      if (!is_variant_image) {
        this.toastr.error(this.translate.instant("VARIANT_NEEDS_TO_CONTAIN_MINIMUM_ONE_IMAGE"));
        return;
      }

      var tempVariantItem = JSON.stringify(all_variant, getCircularReplacer());

      fd.append("item_variation", tempVariantItem);

      if (this.itemId) {
        fd.append("item_id", this.itemId.toString());
      }
      fd.append("store_id", this.main.LoggedUserStoreInfo?.store_id);
      if (localStorage.getItem("duplicateItem") == "true") {
        localStorage.setItem("duplicateItem", "false");
      }
      fd.append(
        "featured_type",
        this.getFormControlValue("featured_type") ? "1" : "0"
      );

      fd.append(
        "stock_management_method",
        this.getFormControlValue("stockManagementMethod")
      );

      if (this.getFormControlValue("stockManagementMethod") == 2) {
        fd.append("unit_id", this.getFormControlValue("unitId"));
        fd.append("unit_quantity", this.getFormControlValue("unit_quantity"));
        fd.append(
          "reorder_quantity",
          this.getFormControlValue("reorder_quantity")
        );
      }

      if (this.itemId > 0 && this.newItem.is_approved == 0) {
        fd.append("remarks", this.getFormControlValue("remarks"));
        fd.append(
          "approval_status",
          this.getFormControlValue("approval_status")
        );
        fd.append("reason_id", this.getFormControlValue("selectedReason"));
      }


      var data = fd;
      if (this.newItem != undefined && this.newItem.is_approved == 0) {
        this.finalSubmitItem(data);
      }
      else {
        if (
          Number(this.itemId) > 0 &&
          this.getFormControlValue("stockManagementMethod") == 1 &&
          this.newItem.used_in_combo == 1
        ) {
          this.finalSubmitItem(data)
        } else {
          this.finalSubmitItem(data);
        }
      }
    }
  }

  finalSubmitItem(data) {
    this.spinner.show('home');
    this.itemService.addMasterItem(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide('home');
          if (this.is_item_approval == 1) {
            if (this.itemId > 0) {
              this.toastr.success(this.translate.instant(response.message));
            } else {
              this.toastr.success(
                this.translate.instant(
                  "ITEMS_IMPORTED_WILL_SHOW_ON_YOUR_STORE_ONCE_WE_REVIEW_APPROVE_THE_SAME_THANK_YOU_FOR_THE_PATIENCE"
                )
              );
            }
          } else {
            if (this.rejectedStatus == 9) {
              this.toastr.success(
                this.translate.instant("ITEM_REJECTED_SUCCESSFULLY")
              );
            } else {
              this.toastr.success(this.translate.instant(response.message));
            }
          }

          if (this.user_data.role_id == 1) {
            window.history.back();
          } else if (this.user_data.role_id == 2 || this.user_data.role_id == 5) {
            window.history.back();
          } else {
            window.history.back();
          }
        } else {
          this.spinner.hide('home');
          var message =
            "<ul> <li>Stock details of one or more of your variant is not correct. </li> <li> Please note the following for Stock managed at Item Level: </li> <li> a. All variant should have a UOM defined </li> <li> b. All variant should have a unit conversion if it's UOM is different from Item Stock UOM </li> </ul>";

          if (
            response.message ==
            "Stock details of one or more of your variant is not correct"
          ) {
            this.toastr.error(this.translate.instant(message));
          } else {
            this.toastr.error(this.translate.instant(response.message));
          }
          this.afterSubmitError();
        }
      },
      error: (error) => {
        this.spinner.hide('home');
        this.afterSubmitError();
      },
      complete: () => {
        this.spinner.hide('home');
      },
    });
  }

  afterSubmitError() {
    this.spinner.hide('home');
    this.varientItem.forEach((vrient) => {
      vrient.item_attribute.forEach((el) => {
        if (el.selectedAttribute.sub_attribute_type == 1) {
          let data = {
            item_attribute_id: el.selectedAttribute.item_attribute_id,
            sub_attribute_type: el.selectedAttribute.sub_attribute_type,
            sub_item_attributes: el.selectedSubAttribute.toString(),
          };
          el = data;
        } else {
          var colorCode = [];
          el.selectedSubAttribute.forEach((se) => {
            colorCode.push(se.text);
          });
          let data = {
            item_attribute_id: el.selectedAttribute.item_attribute_id,
            sub_attribute_type: el.selectedAttribute.sub_attribute_type,
            sub_item_attributes: colorCode.toString(),
          };
          el = data;
        }
      });
    });
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement =
      this.el.nativeElement.querySelector("form .ng-invalid");

    window.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: "smooth",
    });
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

  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  rejectedStatus;
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
          reasonListLocal.forEach((item, i) => {
            var reasonLable = item.reason;
            var data = {
              label: reasonLable,
              value: item.reason_id,
            };
            this.reason_list.push(data);
          });
          this.formGroup.controls["selectedReason"].setValue(
            this.reason_list[0].value
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
        }
      },
    });
  }

  //get ytax group list
  async GetTaxGroupList() {
    var search = "";
    var data = {
      page: 0,
      search_query: search,
      sort_type: 1,
    };

    await this.TaxGroupService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.taxGroupList = [];
          response.data.forEach((item) => {
            if (item.is_active == 1) {
              this.taxGroupList.push(item);
            }
          });
        }
      },
    });
  }

  //edit variant
  editVariants(item, index) {
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

    var manualStock = this.formGroup.get("stockManagementMethod").value;

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
    modalRef.componentInstance.manualStock = manualStock;
    modalRef.componentInstance.masterItem = this.masterItem;
    modalRef.componentInstance.edit_index = index + 2;

    modalRef.componentInstance.selectedVarient.subscribe((receivedEntry) => {
    });
  }

  //duplicate variant
  duplicateVariants(item, index) {
    this.newvarient.is_stock_added = 0;
    this.newvarient.sub_category_id = 0;
    this.newvarient.mrp = item.item_price;
    this.newvarient.package = this.packageingList.filter(
      (x) => x.packaging_id == item.packaging_id
    )[0];
    this.newvarient.unit = this.unitList.filter(
      (x) => x.name == item.unit_name
    )[0];
     this.newvarient.unit =
      this.newvarient.unit == undefined
        ? this.unitList[0]
        : this.newvarient.unit;
    this.newvarient.reorder_quantity = '';
    this.newvarient.opening_stock = '';
    this.newvarient.item_number = item.unit_quantity;
    this.newvarient.discountedPrice = item.discounted_price;
    this.newvarient.max_qty = item.max_qty;
    this.newvarient.min_qty = item.min_qty;
    this.newvarient.tax = item.tax;
    this.newvarient.external_item_id = item.external_item_id;
    this.newvarient.item_variants_id = 0;
    this.newvarient.packaging = item.packaging;
    this.newvarient.sku = item.sku;
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
    modalRef.componentInstance.selectedChoicePriceList = this.selectedChoicePriceList;
    modalRef.componentInstance.selectedAddOnPriceList = this.selectedAddOnPriceList;
    modalRef.componentInstance.addedChoiceList = this.addedChoiceList
    modalRef.componentInstance.addedAddOnList = this.addedAddOnList
    modalRef.componentInstance.varientItem = this.varientItem
    modalRef.componentInstance.subCategoryid = ++this.subCategoryid
    modalRef.componentInstance.masterAttributeList = this.masterAttributeList
    modalRef.componentInstance.masterItem = this.masterItem;

    modalRef.componentInstance.selectedVarient.subscribe((receivedEntry) => {
    });
  }

  //add variant
  addvariant() {
    // return;
    if (this.formGroup.get("stockManagementMethod").value == "2") {
      if (
        this.formGroup.value.unitId == undefined ||
        this.formGroup.value.unitId == null ||
        this.formGroup.value.unitId == 0
      ) {
        this.toastr.error(this.translate.instant("PLEASE_SELECT_UNIT"));
        return;
      }

      if (this.formGroup.value.unit_quantity == null) {
        this.toastr.error(this.translate.instant("PLEASE_ENTER_OPENING_STOCK"));
        return;
      }

      if (this.formGroup.value.reorder_quantity == null) {
        this.toastr.error(this.translate.instant("PLEASE_ENTER_REORDER_LEVEL"));
        return;
      }
    }

    this.newvarient.item_number = "";
    this.newvarient.mrp = "";
    this.newvarient.opening_stock = "";
    this.newvarient.reorder_quantity = "";
    this.newvarient.discountedPrice = "";
    this.newvarient.package = this.packageingList[0];
    this.newvarient.tax_group = "";
    this.newvarient.unit = this.unitList[0];
    this.newvarient.selectedUnitConversion = undefined;
    this.newvarient.max_qty = "";
    this.newvarient.min_qty = "";
    this.newvarient.tax = "";
    this.newvarient.external_item_id = "";
    this.newvarient.sub_category_id = 0;
    this.newvarient.packaging = "";
    this.newvarient.sku = "";
    this.newvarient.location = "";
    this.newvarient.is_stock_added = 0
    this.newvarient.item_attribute = [];
    this.newvarient.item_image_ids = "";
    this.newvarient.item_attribute.push({
      selectedAttribute: {},
      selectedSubAttribute: {},
    });

    this.selectedChoicePriceList = [];
    this.addedChoiceList = [];
    this.selectedAddOnPriceList = [];
    this.addedAddOnList = [];
    if (!this.formGroup.value.category || !this.formGroup.value.subCategory) {
      this.toastr.error(
        this.translate.instant("PLEASE_SELECT_CATEGORY_AND_SUB_CATEGORY_FIRST")
      );
      return;
    }
    var manualStock = this.formGroup.get("stockManagementMethod").value;
    const modalRef = this.modalService.open(AddEditVariantModelComponent, {
      size: "lg-950",
      backdrop: 'static',
    });

    modalRef.componentInstance.subCategory = this.selectedSubCategory;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.itemId = this.itemId;
    modalRef.componentInstance.newItem = this.newItem;
    modalRef.componentInstance.packageingList = this.packageingList;
    modalRef.componentInstance.unitList = this.unitList;
    modalRef.componentInstance.taxGroupList = this.taxGroupList;
     modalRef.componentInstance.masterChoiceList = this.masterChoiceList;
    modalRef.componentInstance.masterAddOnList = this.masterAddOnList;
    modalRef.componentInstance.selectedChoicePriceList =
      this.selectedChoicePriceList;
    modalRef.componentInstance.selectedAddOnPriceList =
      this.selectedAddOnPriceList;
    modalRef.componentInstance.addedChoiceList = this.addedChoiceList;
    modalRef.componentInstance.addedAddOnList = this.addedAddOnList;
    modalRef.componentInstance.newvarient = this.newvarient;
    modalRef.componentInstance.varientItem = this.varientItem;
    modalRef.componentInstance.subCategoryid = ++this.subCategoryid;
    modalRef.componentInstance.masterAttributeList = this.masterAttributeList;
    modalRef.componentInstance.manualStock = manualStock;
    modalRef.componentInstance.masterItem = this.masterItem;

    modalRef.componentInstance.selectedVarient.subscribe((receivedEntry) => {
    });
  }

  resetVarient = function () {
    this.newvarient.item_number = "";
    this.newvarient.mrp = "";
    this.newvarient.opening_stock = "";
    this.newvarient.reorder_quantity = "";
    this.newvarient.discountedPrice = "";
    this.newvarient.package = this.packageingList[0];
    this.newvarient.tax_group = "";
    this.newvarient.unit = this.unitList[0];
    this.newvarient.selectedUnitConversion = undefined;
    this.newvarient.max_qty = "";
    this.newvarient.min_qty = "";
    this.newvarient.tax = "";
    this.newvarient.external_item_id = "";
    this.newvarient.sub_category_id = 0;
    this.newvarient.packaging = "";
    this.newvarient.sku = "";
    this.newvarient.location = "";
    this.newvarient.is_stock_added = 0
    this.newvarient.item_attribute = [];
    this.newvarient.item_image_ids = "";
    this.newvarient.item_attribute.push({
      selectedAttribute: {},
      selectedSubAttribute: {},
    });
  };

  RemoveSelectedTag(id) {
    this.tag_item_list = this.TempItemtagList;
    id.forEach((element) => {
      this.tag_item_list = this.tag_item_list.filter(
        (item) => item.item_tag_id !== element
      );
    });
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
    this.tab_active = true;
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
    $(
      "<style>.mat-tab-label-container{  background-color: #F0F3F4 !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-ink-bar{ top: 0px !important; height: 3px !important;} .mat-tab-label:focus,.mat-tab-label:active{ background-color: white !important;}</style>"
    ).appendTo("body");
  }
  isDivDisabled: boolean = true;

  cancelClick() {
    history.back();
  }


  ValidTwoDecimalDigits(event: any) {
    const input = event.target;
    const value = input.value;
    const parts = value.split('.');

    if (parts.length > 1 && parts[1].length > 5) {
      input.value = `${parts[0]}.${parts[1].slice(0, 5)}`;
    }
  }
  validateDropDown(event: any) {
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      // backdrop: "static",
      // keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }



  UpdateItem = function () {
    if (Number(this.formGroup.value.unit_quantity) < Number(this.formGroup.value.reorder_quantity)) {
      this.formGroup.controls["reorder_quantity"].setValue(0);
      this.toastr.error(this.translate.instant('OPENING_STOCK_SHOULD_BE_GREATER_THAN_REORDER_STOCK'));
      return false;
    } else {
    }
  }
  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent: any;
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

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '139'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_details = response.data;
        }
        // this.toastr.success(response.message);
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  /** Open AddURLComponent modal */
  addURL() {
    const modalRef = this.modalService.open(AddNoteComponent, {
      size: "md",
      centered: true,
      animation: true,
    });

    modalRef.componentInstance.for_url = true;
    modalRef.componentInstance.Note.subscribe((link) => {
      if (this.itemId == 0) {
        var new_file: any = {
          name: new Date().getTime() + '_' + link,
          originalName: link,
        }

        var url = {
          image: this.sanitizer.bypassSecurityTrustResourceUrl(link),
          file: new_file,
          item_image_id: 0,
          display_id: 0,
          type: 3
        };
        this.newItem.item_images.push(url);
      } else {
        this.ManageItemImages(link, '3')
      }
    });
  }

  addVideo() {
    const modalRef = this.modalService.open(UploadVideoComponent, {
      size: "lg-600",
      centered: true,
      animation: true,
    });

    modalRef.componentInstance.video.subscribe((video) => {
      if (this.itemId == 0) {
        var url = {
          image: video.url,
          file: video.file,
          item_image_id: 0,
          display_id: 0,
          type: 2
        };
        this.newItem.item_images.push(url);
      }
      else {
        this.spinner.show('home');
        this.ManageItemImages(video.file, '2')
      }
    });
  }


  activeTab(value: any) {
    this.active_tab = value;
  }
}
