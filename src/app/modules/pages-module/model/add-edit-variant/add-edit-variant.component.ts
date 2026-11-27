import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import {
  NgbActiveModal,
  ModalDismissReasons,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { ItemService } from "src/app/services/item.service";
import { AddUnitConversionModelComponent } from "../add-unit-conversion/add-unit-conversion.component";
import { AddAddonsModelComponent } from "../add-addons/add-addons.component";
import { AddChoiceModelComponent } from "../add-choice/add-choice.component";
import { SortPipe } from "../../util/sort.pipe";
import { cloneDeep } from "lodash";
import { CommonService } from "src/app/services/common.service";
import { Subject } from "rxjs";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-add-edit-variant",
  templateUrl: "./add-edit-variant.component.html",
  styleUrls: ["./add-edit-variant.component.scss"],
})
export class AddEditVariantModelComponent implements OnInit {
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  session_store_id = localStorage.getItem("adminselectedstore");
  session_default_store_name = localStorage.getItem("adminselected_store_name");
  session_default_store_type = localStorage.getItem("adminselected_store_type");
  session_category_id = localStorage.getItem("adminselectedcategory");
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  global_currency = this.generalSetting.currency_symbol;
  global_timezone = this.generalSetting.timezone;
  store_tax_label = this.generalSetting.store_tax_label;
  item_tax_type = this.generalSetting.item_tax_type;
  store_label = this.generalSetting.store_label;
  stock_mgmt = this.generalSetting.stock_mgmt;
  show_price_same_font = this.generalSetting.show_price_same_font;

  @Input() main: any;
  @Input() newItem: any;
  @Input() subCategory: any;
  @Input() fromDetailsModal: any;
  @Output() selectedVarient: EventEmitter<any> = new EventEmitter();
  closeResult = "";
  IsData: boolean = false;
  storeServiceOpen: boolean = true;
  varientForm: UntypedFormGroup;
  choiceArray: UntypedFormArray;
  subChoiceArray: UntypedFormArray;
  addonArray: UntypedFormArray;
  subAddonArray: UntypedFormArray;
  storeServiceInfo: any;
  category_id: any;
  selectedCategoryType: any;
  moment: any = moment;
  serverCurrentDateTime: any;
  serverTempCurrentDateTime: any;
  timediff: any;
  selectedCategory: any;
  sub_attribute_type: any;
  isAddOnChoices: number = 1;
  isItemApprovel: number = 0;
  total_count: number;
  submitInterval: any;
  tagItemList: any = [];
  CollectionItemList: any = [];
  reasonList: any = [];
  categoryList: any = [];
  subCategoryList: any = [];
  masterSubAttributeList: any = [];
  displayChoiceList: any = [];
  displayAddOnList: any = [];
  selectionSubChoiceValue: any;
  selectionSubAddonValue: any;
  selectionAttributeValue: any;
  selectionSubAttributeValue: any;
  @Input() newvarient;
  @Input() packageingList;
  @Input() unitList;
  @Input() taxGroupList;
  @Input() itemId;
  @Input() selectedChoicePriceList;
  @Input() addedChoiceList;
  @Input() selectedAddOnPriceList;
  @Input() addedAddOnList;
  @Input() varientItem;
  @Input() subCategoryid;
  @Input() masterChoiceList;
  @Input() masterAddOnList;
  @Input() masterAttributeList;
  @ViewChild("tagInput") tagInputRef: ElementRef;
  manustockData = 0
  item: any = {};
  selectedSubCategory: any = {};
  validcolorcode: any = false;
  invalid_color_code: any;
  iseatery: any;
  itemApprovalShopTypeString: any;
  selectedSeller: any;
  isSuperAdmin: boolean;
  private destroy$ = new Subject();
  checkboxData = 0;
  style_obj_add_edit_variant: any;
  @Input() manualStock;
  temp: any = [];
  selectedSubChoice: any;
  newUnitConversion: any = {};
  unitConversionList: any = [];
  colorcode: any;
  item_images: any;
  @Input() masterItem;
  @Input() edit_index;
  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private itemService: ItemService,
    private modalService: NgbModal,
    private sortPipe: SortPipe,
    private cdr: ChangeDetectorRef,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    // $(
    //   "<style>.modal-dialog { max-width: 950px }</style>"
    // ).appendTo("body");
    this.item_images = cloneDeep(this.newItem.item_images);
    this.getUnitConversionList(true)
    this.loadForm();
    this.manustockData = this.manualStock;
    if (
      this.main.LoggedUserInfo.role_id != this.main.UserRole.SuperAdmin &&
      this.main.LoggedUserInfo.role_id != this.main.UserRole.Admin
    ) {
      this.isAddOnChoices = this.main.LoggedUserStoreInfo.iseatery;
      this.iseatery = parseInt(this.main.LoggedUserStoreInfo.iseatery);
      this.category_id = parseInt(this.main.LoggedUserStoreInfo.category_id);

      this.itemApprovalShopTypeString =
        this.generalSetting != undefined
          ? this.generalSetting.item_approval_shop_type
          : this.main.item_approval_shop_type;

      var itemApprovalShopType = this.itemApprovalShopTypeString
        .toString()
        .split(",");
      var filterSubcategory = itemApprovalShopType.filter(
        (shopType) => shopType == this.main.LoggedUserStoreInfo.category_id
      );
      if (filterSubcategory.length > 0) {
        this.isItemApprovel = 1;
      }
    } else {
      var storeinfo = localStorage.getItem("selectedStore");
      this.main.LoggedUserStoreInfo = JSON.parse(storeinfo);
      this.category_id = parseInt(
        this.main.LoggedUserStoreInfo.store_category_id
      );
      this.iseatery = parseInt(this.main.LoggedUserStoreInfo.iseatery);
      this.isAddOnChoices = this.main.LoggedUserStoreInfo.iseatery;
      this.itemApprovalShopTypeString =
        this.generalSetting != undefined
          ? this.generalSetting.item_approval_shop_type
          : this.main.item_approval_shop_type;
      if (this.main.LoggedUserStoreInfo.iseatery == 0) {
        var itemApprovalShopType = this.itemApprovalShopTypeString
          .toString()
          .split(",");
        var filterSubcategory = itemApprovalShopType.filter(
          (shopType) =>
            shopType == this.main.LoggedUserStoreInfo.store_category_id
        );
        if (filterSubcategory.length > 0) {
          this.iseatery = 1;
        }
      }
    }
    this.manustockData = this.manualStock;
    this.style_obj_add_edit_variant = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  //LOAD FORM
  loadForm() {
    this.varientForm = this.formBuilder.group({
      package: new UntypedFormControl(null),
      item_number: new UntypedFormControl(null, Validators.required),
      unit: new UntypedFormControl(null),
      selectedUnitConversion: new UntypedFormControl(null),
      opening_stock: new UntypedFormControl(null),
      reorder_quantity: new UntypedFormControl(null),
      mrp: new UntypedFormControl(null, Validators.required),
      discountedPrice: new UntypedFormControl(null),
      min_qty: new UntypedFormControl(null),
      max_qty: new UntypedFormControl(null),
      tax: new UntypedFormControl(null),
      tax_group: new UntypedFormControl(null),
      external_item_id: new UntypedFormControl(null),
      packaging: new UntypedFormControl(""),
      sku: new UntypedFormControl(""),
      location: new UntypedFormControl(null),
      out_of_stock: new UntypedFormControl(""),
      hide_variant: new UntypedFormControl(this.masterItem ? true : false),
      select_all_image: new UntypedFormControl(false),
    });
  }

  /** Set data with form by getting data with input decorator. */
  //bind data
  databind() {
    if (this.newvarient.item_image_ids) {
      var selected_images: any = this.newvarient.item_image_ids.split(',');
      if (selected_images.length == this.item_images.length) {
        this.varientForm.controls["select_all_image"].setValue(true);
      }
      var count = 1;
      selected_images.forEach(selected => {
        this.item_images.forEach(image => {
          if (this.itemId == 0) {
            if (selected == image.file.name) {
              image.is_added = true;
              image.serial_no = count;
              count = count + 1;
            }
          } else {
            if (selected == image.item_image_id) {
              image.is_added = true;
              image.serial_no = count;
              count = count + 1;
            }
          }
        });
      });

      this.item_images = this.item_images.sort((a, b) => a.is_added === b.is_added ? 0 : a.is_added ? -1 : 1);
      this.item_images = this.item_images.sort((a, b) => a.serial_no - b.serial_no);
    }
    this.varientForm.controls["package"].setValue(
      this.newvarient.package?.packaging_id
    );
    this.varientForm.controls["item_number"].setValue(
      this.newvarient.item_number == 0 ? '' : this.newvarient.item_number
    );
    this.varientForm.controls["unit"].setValue(this.newvarient.unit?.unit_id);
    if (
      this.newItem.stock_management_method == "2" &&
      this.stock_mgmt == 1 &&
      this.varientForm.value.unit != this.newItem.unit_id
    ) {

      this.varientForm.controls["selectedUnitConversion"].setValue(
        this.newvarient.selectedUnitConversion == undefined ? this.unitConversionList[0] : this.newvarient.selectedUnitConversion
      );

    }

    if (this.newItem.stock_management_method == "3" && this.stock_mgmt == 1) {
      this.varientForm.controls["opening_stock"].setValue(
        this.newvarient.opening_stock
      );
      this.varientForm.controls["reorder_quantity"].setValue(
        this.newvarient.reorder_quantity
      );
    }
    this.varientForm.controls["mrp"].setValue(this.newvarient.mrp == 0 ? '' : this.newvarient.mrp);
    this.varientForm.controls["discountedPrice"].setValue(
      this.newvarient.discountedPrice == 0 ? '' : this.newvarient.discountedPrice
    );
    this.varientForm.controls["min_qty"].setValue(this.newvarient.min_qty == 0 ? '' : this.newvarient.min_qty);
    this.varientForm.controls["max_qty"].setValue(this.newvarient.max_qty == 0 ? '' : this.newvarient.max_qty);
    //to be test
    if (this.item_tax_type == 1) {
      this.varientForm.controls["tax"].setValue(this.newvarient.tax == 0 ? '' : this.newvarient.tax);
    }
    if (this.item_tax_type == 2) {
      this.varientForm.controls["tax_group"].setValue(
        this.newvarient.tax_group != undefined
          ? this.newvarient.tax_group?.tax_group_id
          : null
      );
    }
    this.varientForm.controls["external_item_id"].setValue(this.newvarient.external_item_id)
    this.varientForm.controls["packaging"].setValue(this.newvarient.packaging == 0 ? '' : this.newvarient.packaging)
    this.varientForm.controls["sku"].setValue(this.newvarient.sku == 0 ? '' : this.newvarient.sku)
    this.varientForm.controls["location"].setValue(this.newvarient.location);
    if (this.masterItem) {
      this.varientForm.controls["hide_variant"].setValue(this.newvarient.hide_variant == 1 ? false : true)
    } else {
      this.varientForm.controls["hide_variant"].setValue(this.newvarient.hide_variant == 1 ? true : false)
    }
    if (this.manustockData == 1) {
      this.varientForm.controls["out_of_stock"].setValue(this.newvarient.out_of_stock == 1 ? true : false)
    }
  }

  //get unit conversion list
  async getUnitConversionList(conversion_id?) {
    var data = new FormData();
    if (this.newItem.stock_management_method == 2) {
      if (this.newvarient.unit) {
        data.append(
          "conversation_ids",
          this.newvarient.unit?.unit_id + "," + this.newItem.unit_id?.unit_id
        );
      } else {
        data.append(
          "conversation_ids",
          this.newItem.unit_id == undefined ? 0 : this.newItem.unit_id?.unit_id
        );
      }
    }
    await this.itemService.getUnitConversionList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach((con) => {
            con.name =
              con.conversation_name.toString() +
              " (" +
              con.from_unit_value.toString() +
              " " +
              con.from_unit_name.toString() +
              " = " +
              con.to_unit_value.toString() +
              " " +
              con.to_unit_name.toString() +
              ")";
          });
          this.unitConversionList = response.data;

          if (conversion_id) {
            this.varientForm.controls["selectedUnitConversion"].setValue(response.data[0]);
            this.varientForm.controls["selectedUnitConversion"].setValue(
              this.unitConversionList.filter(
                (item) => item.conversation_id == conversion_id
              )[0]
            );
          }
          else {
            this.varientForm.controls["selectedUnitConversion"].setValue(
              response.data[0]
            );
          }
          this.newvarient.selectedUnitConversion =
            this.unitConversionList.filter(
              (x) => x.conversation_id == this.newvarient.unit_conversation_id
            )[0];
        } else {
          this.newvarient.selectedUnitConversion = undefined;
        }

        if (this.varientItem.length > 0 && conversion_id) {
          this.databind();
        }
      },
    });
  }

  changeUnitConversion(data) {
    this.newvarient.unit_conversation_id = data.conversation_id;
    this.newvarient.selectedUnitConversion = data;
  }

  getSelectedUnitVarint = function (unt) {
    this.unitConversionList = [];
    this.varientForm.controls["selectedUnitConversion"].reset();
    this.newvarient.unit = this.unitList.filter((x) => x.unit_id == unt)[0];
    this.newvarient.item_number = this.varientForm.value.item_number;
    this.newvarient.package = this.packageingList.filter(
      (x) => x.packaging_id == this.varientForm.value.package
    )[0];
    this.getUnitConversionList(false);
  };

  /** Open AddUnitConversionModelComponent modal */
  //ADD UNIT CONVERSION MODAL
  addUnitConversion() {
    if (this.newvarient.unit.unit_id == 0) {
      this.toastr.error(this.translate.instant("PLEASE_SELECT_UOM"));
      return;
    }

    const modalRef = this.modalService.open(AddUnitConversionModelComponent, {
      size: "lg-950",
      animation: true,
    });
    modalRef.componentInstance.from_unit_id = this.newItem.unit_id;
    modalRef.componentInstance.to_unit_id = this.newvarient.unit;

    modalRef.componentInstance.selectedConversion.subscribe((receivedEntry) => {
      this.getUnitConversionList(receivedEntry);
    });
  }

  // item Attribute array start
  itemAttributeRows(data?) {
    return this.formBuilder.group({
      selectedAttribute: [
        data && data.selectedAttribute ? data.selectedAttribute : "",
      ],
      selectedSubAttribute: [
        data && data.selectedSubAttribute ? data.selectedSubAttribute : [],
      ],
    });
  }

  get itemAttributeFormArr() {
    return this.varientForm.get("item_attribute") as UntypedFormArray;
  }

  newItemAttributeRange() {
    var validation = 0;
    if (this.selectionAttributeValue == undefined) {
      this.toastr.error(this.translate.instant("PLEASE_SELECT_ATTRIBUTE"));
      return;
    }

    this.itemAttributeFormArr.push(this.itemAttributeRows());
  }

  deleteItemAttributeRow(index: number) {
    this.itemAttributeFormArr.removeAt(index);
  }

  // item Attribute array end
  /** item choice array  */
  // item choice array start
  itemChoiceRows(data?) {
    return this.formBuilder.group({
      choice_name: [data && data.choice_name ? data.choice_name : ""],
      choice_prices: [data && data.choice_prices ? data.choice_prices : []],
      item_subChoices: this.formBuilder.array([]),
    });
  }

  get itemChoiceFormArr() {
    return this.varientForm.get("item_choices") as UntypedFormArray;
  }

  deleteItemChoiceRow(index: number) {
    this.itemChoiceFormArr.removeAt(index);
  }

  // item choice array end
  // item sub choice array start
  deleteItemSubChoiceRow(i: number, j: number) {
    this.subChoiceArray = this.varientForm
      .get("item_choices")
      // @ts-ignore
      .controls[i].get("item_subChoices") as UntypedFormArray;
    this.subChoiceArray.removeAt(j);
  }

  itemSubChoiceRows(data?) {
    return this.formBuilder.group({
      choice_id: [data && data.choice_id ? data.choice_id : ""],
      default_choice_id: [data && data.choice_id ? data.choice_id : ""],
      choice_name: [data && data.choice_name ? data.choice_name : ""],
      choice_price_id: [
        data && data.choice_price_id ? data.choice_price_id : "",
      ],
      sub_choice_name: [
        data && data.sub_choice_name ? data.sub_choice_name : "",
      ],
      choice_price: [data && data.choice_price ? data.choice_price : ""],
    });
  }

  addSubChoiceItem(subChoice, i: any) {
    // @ts-ignore: Unreachable code error
    this.subChoiceArray = this.varientForm
      .get("item_choices")
      // @ts-ignore
      .controls[i].get("item_subChoices") as UntypedFormArray;
    this.subChoiceArray.push(this.itemSubChoiceRows(subChoice));
    this.varientForm.updateValueAndValidity();
  }

  // item Addon array start
  addedAddOnRows(data?) {
    return this.formBuilder.group({
      addon_name: [data && data.addon_name ? data.addon_name : ""],
      addons_prices: [data && data.addons_prices ? data.addons_prices : ""],
      item_subAddon: this.formBuilder.array([]),
    });
  }

  get itemAddedAddOnFormArr() {
    return this.varientForm.get("item_addons") as UntypedFormArray;
  }

  addAddonItem(responseDataForAddon) {
    this.addonArray = this.varientForm.get("item_addons") as UntypedFormArray;
    this.addonArray.push(this.addedAddOnRows(responseDataForAddon));
    this.varientForm.updateValueAndValidity();
  }

  deleteAddedAddOnRow(index: number) {
    this.itemAddedAddOnFormArr.removeAt(index);
  }

  // item addon array end
  // item sub addon array start
  itemSubAddonRows(data?) {
    return this.formBuilder.group({
      addon_id: [data && data.addon_id ? data.addon_id : ""],
      default_addon_id: [data && data.addon_id ? data.addon_id : ""],
      addon_name: [data && data.addon_name ? data.addon_name : ""],
      addon_price_id: [data && data.addon_price_id ? data.addon_price_id : ""],
      sub_addon_name: [data && data.sub_addon_name ? data.sub_addon_name : ""],
      addon_price: [data && data.addon_price ? data.addon_price : ""],
    });
  }

  addSubAddonItem(subAddon, i: any) {
    // @ts-ignore: Unreachable code error
    this.subAddonArray = this.varientForm
      .get("item_addons")
      // @ts-ignore
      .controls[i].get("item_subAddon") as UntypedFormArray;
    this.subAddonArray.push(this.itemSubAddonRows(subAddon));
    this.varientForm.updateValueAndValidity();
  }

  selectionSubAddon(event: any, i: any) {
    this.selectionSubAddonValue = event;
  }

  addsubAddon(index: any) {
    var validation = 0;
    if (this.selectionSubAddonValue == undefined) {
      this.toastr.error(this.translate.instant("PLEASE_SELECT_SUB_ADDON"));
      return;
    }

    if (this.varientForm.value.item_addons.length > 0) {
      for (var i = 0; i < this.varientForm.value.item_addons.length; i++) {
        for (
          var j = 0;
          j < this.varientForm.value.item_addons[i].item_subAddon.length;
          j++
        ) {
          if (
            this.selectionSubAddonValue.addon_price_id ==
            this.varientForm.value.item_addons[i].item_subAddon[j]
              .addon_price_id
          ) {
            validation = 1;
          }
        }
      }
    }
    if (validation == 1) {
      this.toastr.error(this.translate.instant("SUB_ADDON_ALREADY_SELECTED"));
      return;
    }
    this.addSubAddonItem(this.selectionSubAddonValue, index);
  }

  deleteItemSubAddonRow(i: number, j: number) {
    // @ts-ignore: Unreachable code error
    this.subAddonArray = this.varientForm
      .get("item_addons")
      // @ts-ignore
      .controls[i].get("item_subAddon") as UntypedFormArray;
    this.subAddonArray.removeAt(j);
  }

  /** Open AddChoiceModelComponent modal and work, getting data from modal */
  addChoice() {
    const modalRef = this.modalService.open(AddChoiceModelComponent, {
      size: "lg-600",
      animation: true,
    });
    modalRef.componentInstance.masterChoiceList = this.masterChoiceList;
    modalRef.componentInstance.selectedChoicePriceList =
      this.selectedChoicePriceList;
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
    modalRef.componentInstance.choicePriceList.subscribe(
      (receivedEntry: any) => {
        this.selectedChoicePriceList.push(receivedEntry[0]);
      }
    );
  }

  selectionSubChoice(item) {
    var field = "selectedSubChoice" + item.choice_id.toString();
    this[field] = item;
    this[field].selected = item;
  }

  removeMasterChoice(formData) {
    this.selectedChoicePriceList.splice(
      this.selectedChoicePriceList.indexOf(formData),
      1
    );
    this.addedChoiceList = this.addedChoiceList.filter((ch) => ch.choice_id != formData.choice_id);
  }

  addsubchoice(subchoice) {
    var field = "selectedSubChoice" + subchoice.choice_id.toString();
    if (this[field].selected == undefined) {
      this.toastr.error(this.translate.instant("PLEASE_SELECT_SUB_CHOICE"));
      return;
    }
    var isaddedchoice = false;
    for (var i = 0; i < this.addedChoiceList.length; i++) {
      if (
        this.addedChoiceList[i].choice_price_id == this[field].choice_price_id
      ) {
        isaddedchoice = true;
        break;
      }
    }

    if (isaddedchoice == true) {
      this.toastr.error(this.translate.instant("SUB_CHOICE_ALREADY_SELECTED"));
      return;
    }
    var itemchoice = {
      choice_id: subchoice.choice_id,
      default_choice_id: subchoice.choice_id,
      choice_name: subchoice.choice_name,
      choice_price_id: this[field].choice_price_id,
      sub_choice_name: this[field].sub_choice_name,
      choice_price: 0,
      variant_choice_id: 0,
      variant_choice_price_id: 0,
    };
    this.addedChoiceList.push(itemchoice);
  }

  removeChoice(ch) {
    for (var i = 0; i < this.addedChoiceList.length; i++) {
      if (this.addedChoiceList[i].choice_price_id == ch.choice_price_id) {
        this.addedChoiceList.splice(i, 1);
        break;
      }
    }
  }

  filerSubChoiceList(MasterId) {
    var list: any = [];
    this.addedChoiceList.forEach((element) => {
      if (MasterId == element.choice_id) {
        list.push(element);
      }
    });

    return list;
  }

  /**Open  AddAddonsModelComponent and get data by event emitter   */
  addAddOn() {
    const modalRef = this.modalService.open(AddAddonsModelComponent, {
      size: "lg-600",
      animation: true,
    });
    modalRef.componentInstance.masterAddOnList = this.masterAddOnList;
    modalRef.componentInstance.selectedAddOnPriceList =
      this.selectedAddOnPriceList;
    modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
    modalRef.componentInstance.addOnPriceList.subscribe(
      (receivedEntry: any) => {
        this.selectedAddOnPriceList.push(receivedEntry[0]);
      }
    );
  }

  removeMasterAddon(formData) {
    this.selectedAddOnPriceList.splice(
      this.selectedAddOnPriceList.indexOf(formData),
      1
    );
    this.addedAddOnList = this.addedAddOnList.filter((ch) => ch.addon_id != formData.addon_id);
  }

  selectionSubAddOn(item) {
    var field1 = "selectedSubAddOn" + item.addon_id.toString();
    this[field1] = item;
    this[field1].selected = item;
  }

  addsubaddon(selectedadd) {
    var field1 = "selectedSubAddOn" + selectedadd.addon_id.toString();
    if (this[field1].selected == undefined) {
      this.toastr.error(this.translate.instant("PLEASE_SELECT_SUB_ADDON"));
      return;
    }
    var isaddedaddon = false;
    for (var i = 0; i < this.addedAddOnList.length; i++) {
      if (
        this.addedAddOnList[i].addon_price_id == this[field1].addon_price_id
      ) {
        isaddedaddon = true;
        break;
      }
    }

    if (isaddedaddon == true) {
      this.toastr.error(this.translate.instant("SUB_ADDON_ALREADY_SELECTED"));
      return;
    }
    var itemaddon = {
      addon_id: selectedadd.addon_id,
      default_addon_id: selectedadd.addon_id,
      addon_name: selectedadd.addon_name,
      addon_price_id: this[field1].addon_price_id,
      sub_addon_name: this[field1].sub_addon_name,
      addon_price: 0,
      variant_addon_id: 0,
      variant_addon_price_id: 0,
    };
    this.addedAddOnList.push(itemaddon);
  }

  filerSubAddonList(MasterId) {
    var list: any = [];
    this.addedAddOnList.forEach((element) => {
      if (MasterId == element.addon_id) {
        list.push(element);
      }
    });

    return list;
  }

  removeAddOn(ch) {
    for (var i = 0; i < this.addedAddOnList.length; i++) {
      if (this.addedAddOnList[i].addon_price_id == ch.addon_price_id) {
        this.addedAddOnList.splice(i, 1);
        break;
      }
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }

  saveVariant() {
    if ((!this.varientForm.value.package && !this.varientForm.value.item_number) && !this.varientForm.value.unit) {
      this.toastr.error(this.translate.instant("ENTER_EITHER_THE_PACKAGING_OR_UNIT_UOM"));
      return;
    }

    if ((this.varientForm.value.package && this.varientForm.value.item_number) && !this.varientForm.value.unit) {
      this.toastr.error(this.translate.instant("SELECT_UNIT_OF_MEASURMENT"));
      return;
    }

    if (this.varientForm.value.item_number && !this.varientForm.value.unit) {
      this.toastr.error(this.translate.instant("SELECT_UNIT_OF_MEASURMENT"));
      return;
    }

    if ((this.varientForm.value.package && this.varientForm.value.unit) && !this.varientForm.value.item_number) {
      this.toastr.error(this.translate.instant("PLEASE_ENTER_UNIT_QUANTITY"));
      return;
    }

    if ((!this.varientForm.value.package && !this.varientForm.value.item_number) && this.varientForm.value.unit) {
      this.toastr.error(this.translate.instant("PLEASE_ENTER_UNIT_QUANTITY"));
      return;
    }

    if (this.varientItem.length > 0) {
      var new_variant_units: any = {
        packaging: this.varientForm.value.package ? Number(this.varientForm.value.package) : '',
        unit_quantity: this.varientForm.value.item_number ? Number(this.varientForm.value.item_number) : '',
        unit: this.varientForm.value.unit ? Number(this.varientForm.value.unit) : '',
      }

      var exist_variant_units: any = [];
      this.varientItem.forEach((variant) => {
        var units: any = {
          packaging: variant.packaging_id ? Number(variant.packaging_id) : '',
          unit_quantity: variant.unit_quantity ? Number(variant.unit_quantity) : '',
          unit: variant.unit_id ? Number(variant.unit_id) : '',
        }

        exist_variant_units.push(units);
      });

      var is_exist_check: boolean = false;

      exist_variant_units.forEach((element, index) => {
        if (JSON.stringify(element) == JSON.stringify(new_variant_units)) {
          if (this.edit_index) {
            if (this.edit_index != index + 2) {
              is_exist_check = true;
            }
          }
          else {
            is_exist_check = true;
          }
        }
      });
      if (is_exist_check) {
        this.toastr.error(this.translate.instant("THE_COMBINATION_OF_THE_VARIANT_PACKAGING_UNIT_UOM_CANNOT_BE_DUPLICATE"));
        return;
      }
    }

    if (this.newItem.stock_management_method == "3") {
      if (
        this.varientForm.value.opening_stock == undefined ||
        this.varientForm.value.opening_stock == null ||
        this.varientForm.value.opening_stock == ""
      ) {
        this.toastr.error(this.translate.instant("PLEASE_ENTER_OPENING_STOCK"));
        return;
      }

      if (
        this.varientForm.value.reorder_quantity == undefined ||
        this.varientForm.value.reorder_quantity == null ||
        this.varientForm.value.reorder_quantity == ""
      ) {
        this.toastr.error(this.translate.instant("PLEASE_ENTER_REORDER_LEVEL"));
        return;
      }
    }

    if (
      this.newItem.stock_management_method == "2" &&
      this.varientForm.value.unit != this.newItem.unit_id.unit_id
    ) {
      if (
        this.varientForm.value.selectedUnitConversion == undefined ||
        this.varientForm.value.selectedUnitConversion == null
      ) {
        this.toastr.error(this.translate.instant("SELECT_THE_UNIT_CONVERSION"));
        return;
      }
    }

    if (
      this.varientForm.value.mrp == undefined ||
      this.varientForm.value.mrp == null ||
      this.varientForm.value.mrp == "" ||
      this.varientForm.value.mrp < 0
    ) {
      this.toastr.error(this.translate.instant("PLEASE_ENTER_PRICE"));
      return;
    }

    if (
      parseFloat(this.varientForm.value.mrp) <
      parseFloat(this.varientForm.value.discountedPrice)
    ) {
      this.toastr.error(this.translate.instant("DISCOUNTED_PRICE_ERROR_TEXT"));
      return;
    }

    if (!this.newvarient.item_attribute) {
      var item_attribute: any = [
        { selectedAttribute: {}, selectedSubAttribute: {} },
      ];

      this.newvarient.item_attribute = item_attribute;
    }
    var attributeflag = false;

    this.newvarient.item_attribute.forEach((item) => {
      if (
        item.selectedAttribute &&
        (!item.selectedSubAttribute || item.selectedSubAttribute?.length === 0)
      ) {
        attributeflag = true;
      }
    });

    if (attributeflag) {
      this.toastr.error(this.translate.instant("PLEASE_SELECT_SUB_ATTRIBUTE"));
      return;
    }

    var pattern = new RegExp("^#[a-fA-F0-9]{6}$");
    this.validcolorcode = true;
    this.newvarient.item_attribute.forEach((item) => {
      if (item.selectedAttribute.sub_attribute_type == 2) {
        item.selectedSubAttribute.forEach((event) => {
          let arr = pattern.test(event.text);
          if (arr == false) {
            this.validcolorcode = false;
            this.invalid_color_code = event.text;
          }
        });
      }
    });

    if (this.validcolorcode == false) {
      this.toastr.error(
        this.translate.instant(
          this.invalid_color_code + " not a valid color code."
        )
      );
      return;
    }

    if (this.item_images.length > 0) {
      var is_image_selected: any = this.item_images.filter((x) => x.is_added == true);
      if (is_image_selected.length == 0) {
        this.toastr.error(this.translate.instant("VARIANT_NEEDS_TO_CONTAIN_MINIMUM_ONE_IMAGE"));
        return;
      }
    }

    //add
    if (
      this.newvarient.sub_category_id == undefined ||
      this.newvarient.sub_category_id == null ||
      this.newvarient.sub_category_id == 0
    ) {
      var objVarient: any = {};
      objVarient.item_price = this.varientForm.value.mrp;
      objVarient.opening_stock =
        this.varientForm.value.opening_stock == null
          ? ""
          : this.varientForm.value.opening_stock;
      objVarient.reorder_quantity =
        this.varientForm.value.reorder_quantity == null
          ? ""
          : this.varientForm.value.reorder_quantity;
      objVarient.item_variants_id =
        this.newvarient.item_variants_id == undefined ||
          this.newvarient.item_variants_id == null
          ? 0
          : this.newvarient.item_variants_id;
      objVarient.sub_category_id = ++this.subCategoryid;
      objVarient.mask_price = 0;
      objVarient.packaging_id =
        this.varientForm.value.package == null
          ? 0
          : this.varientForm.value.package;
      objVarient.tax_group_id =
        this.varientForm.value.tax_group == null
          ? 0
          : this.varientForm.value.tax_group;

      var packaging_name = this.packageingList.filter(
        (x) => x.packaging_id == this.varientForm.value.package
      );

      objVarient.packaging_name =
        this.varientForm.value.package == null
          ? ""
          : packaging_name[0].packaging_name;

      objVarient.packaging_name =
        objVarient.packaging_name == "Packaging"
          ? "-"
          : objVarient.packaging_name;

      objVarient.unit_id =
        this.varientForm.value.unit == null ? 0 : this.varientForm.value.unit;

      var unitName = this.unitList.filter(
        (x) => x.unit_id == this.varientForm.value.unit
      );
      objVarient.unit_name =
        this.varientForm.value.unit == null ? "" : unitName[0].name;

      objVarient.unit_name =
        objVarient.unit_name == "Select UOM" ? "" : objVarient.unit_name;

      objVarient.unit_quantity =
        this.varientForm.value.item_number == undefined ||
          this.varientForm.value.item_number == null
          ? 0
          : this.varientForm.value.item_number;

      objVarient.discounted_price = this.varientForm.value.discountedPrice;
      objVarient.max_qty = this.varientForm.value.max_qty;
      objVarient.min_qty = this.varientForm.value.min_qty;
      objVarient.tax = this.varientForm.value.tax;
      objVarient.external_item_id = this.varientForm.value.external_item_id;
      objVarient.packaging = this.varientForm.value.packaging;
      objVarient.sku = this.varientForm.value.sku;
      objVarient.location = this.varientForm.value.location;
      if (this.masterItem) {
        objVarient.hide_variant = this.varientForm.value.hide_variant == false ? 1 : 0;
      } else {
        objVarient.hide_variant = this.varientForm.value.hide_variant == false ? 0 : 1;
      }
      if (this.manustockData == 1) {
        objVarient.out_of_stock = this.varientForm.value.out_of_stock == false ? 0 : 1;
      }
      objVarient.selectedChoicePriceList = this.selectedChoicePriceList;

      objVarient.item_attribute = this.newvarient.item_attribute; // may require change - add
      objVarient.addedChoiceList = this.addedChoiceList;

      if (this.addedChoiceList.length > 0) {
        var choiceLst: any = [];
        for (var i = 0; i < this.addedChoiceList.length; i++) {
          choiceLst.push({
            variant_choice_id: this.addedChoiceList[i].choice_id,
            default_choice_id: this.addedChoiceList[i].choice_id,
            variant_choice_name: this.addedChoiceList[i].choice_name,
            default_choice_price_id: this.addedChoiceList[i].choice_price_id,
            variant_choice_price_id: this.addedChoiceList[i].choice_price_id,
            variant_sub_choice_name: this.addedChoiceList[i].sub_choice_name,
            price: this.addedChoiceList[i].choice_price,
            item: "",
          });
        }
        objVarient.choices = choiceLst;
      } else {
        objVarient.choices = [];
      }

      objVarient.selectedAddOnPriceList = this.selectedAddOnPriceList;
      objVarient.addedAddOnList = this.addedAddOnList;

      if (this.addedAddOnList.length > 0) {
        var addOnLst = [];
        for (var i = 0; i < this.addedAddOnList.length; i++) {
          addOnLst.push({
            variant_addon_id: this.addedAddOnList[i].variant_addon_id,
            default_addon_id: this.addedAddOnList[i].addon_id,
            variant_addon_name: this.addedAddOnList[i].addon_name,
            variant_addon_price_id:
              this.addedAddOnList[i].variant_addon_price_id,
            default_addon_price_id: this.addedAddOnList[i].addon_price_id,
            variant_sub_addon_name: this.addedAddOnList[i].sub_addon_name,
            price: this.addedAddOnList[i].addon_price,
          });
        }
        objVarient.addons = addOnLst;
      } else {
        objVarient.addons = [];
      }

      objVarient.unit_conversation_id =
        this.varientForm.value.selectedUnitConversion != null
          ? this.varientForm.value.selectedUnitConversion?.conversation_id
          : 0;

      if (this.itemId == 0) {
        objVarient.item_image_ids = this.item_images
          .filter((x) => x.is_added == true)
          .map((x) => x.file.name)
          .toString();
      } else {
        objVarient.item_image_ids = this.item_images
          .filter((x) => x.is_added == true)
          .map((x) => x.item_image_id)
          .toString();
      }

      this.varientItem.push(objVarient);
    }

    //edit
    if (
      this.newvarient.sub_category_id != undefined ||
      this.newvarient.sub_category_id != null ||
      this.newvarient.sub_category_id != 0
    ) {
      var obj = this.varientItem.filter(
        (item) => item.sub_category_id === this.newvarient.sub_category_id
      )[0];

      if (obj != undefined || obj != null) {
        obj.item_price = this.varientForm.value.mrp;
        obj.opening_stock =
          this.varientForm.value.opening_stock == null
            ? ""
            : this.varientForm.value.opening_stock;
        obj.reorder_quantity =
          this.varientForm.value.reorder_quantity == null
            ? ""
            : this.varientForm.value.reorder_quantity;

        obj.packaging_id =
          this.varientForm.value.package == null
            ? 0
            : this.varientForm.value.package;
        obj.tax_group_id =
          this.varientForm.value.tax_group == null
            ? 0
            : this.varientForm.value.tax_group;

        var packaging_name = this.packageingList.filter(
          (x) => x.packaging_id == this.varientForm.value.package
        );
        obj.packaging_name =
          this.varientForm.value.package == null
            ? ""
            : packaging_name[0].packaging_name;

        obj.packaging_name =
          obj.packaging_name == "Packaging" ? "-" : obj.packaging_name;

        obj.unit_id =
          this.varientForm.value.unit == null ? 0 : this.varientForm.value.unit;

        var unitName = this.unitList.filter(
          (x) => x.unit_id == this.varientForm.value.unit
        );
        obj.unit_name =
          this.varientForm.value.unit == null ? "" : unitName[0].name;
        obj.unit_name = obj.unit_name == "Select UOM" ? "" : obj.unit_name;

        obj.unit_quantity =
          this.varientForm.value.item_number == undefined ||
            this.varientForm.value.item_number == null
            ? 0
            : this.varientForm.value.item_number;
        obj.discounted_price = this.varientForm.value.discountedPrice;

        obj.max_qty = this.varientForm.value.max_qty;
        obj.min_qty = this.varientForm.value.min_qty;
        obj.tax = this.varientForm.value.tax;
        obj.external_item_id = this.varientForm.value.external_item_id;
        obj.packaging = this.varientForm.value.packaging;
        obj.sku = this.varientForm.value.sku;
        obj.location = this.varientForm.value.location;
        if (this.masterItem) {
          obj.hide_variant = this.varientForm.value.hide_variant == false ? 1 : 0;
        } else {
          obj.hide_variant = this.varientForm.value.hide_variant == false ? 0 : 1;
        }
        if (this.manustockData == 1) {
          obj.out_of_stock = this.varientForm.value.out_of_stock == false ? 0 : 1;
        }
        obj.item_variants_id = this.newvarient.item_variants_id;
        obj.item_attribute = this.newvarient.item_attribute // to be
        obj.selectedChoicePriceList = this.selectedChoicePriceList;
        obj.addedChoiceList = this.addedChoiceList;

        if (this.addedChoiceList.length > 0) {
          var choiceLst: any = [];
          for (var i = 0; i < this.addedChoiceList.length; i++) {
            choiceLst.push({
              variant_choice_id: this.addedChoiceList[i].variant_choice_id,
              default_choice_id: this.addedChoiceList[i].choice_id,
              variant_choice_name: this.addedChoiceList[i].choice_name,
              default_choice_price_id: this.addedChoiceList[i].choice_price_id,
              variant_choice_price_id:
                this.addedChoiceList[i].variant_choice_price_id,
              variant_sub_choice_name: this.addedChoiceList[i].sub_choice_name,
              out_of_stock: 0,
              hide_variant: this.masterItem ? 1 : 0,
              price: this.addedChoiceList[i].choice_price,
              item: "",
            });
          }
          obj.choices = choiceLst;
        } else {
          obj.choices = [];
        }

        obj.selectedAddOnPriceList = this.selectedAddOnPriceList;
        obj.addedAddOnList = this.addedAddOnList;

        if (this.addedAddOnList.length > 0) {
          var addOnLst = [];
          for (var i = 0; i < this.addedAddOnList.length; i++) {
            addOnLst.push({
              variant_addon_id: this.addedAddOnList[i].variant_addon_id,
              default_addon_id: this.addedAddOnList[i].addon_id,
              variant_addon_name: this.addedAddOnList[i].addon_name,
              variant_addon_price_id:
                this.addedAddOnList[i].variant_addon_price_id,
              default_addon_price_id: this.addedAddOnList[i].addon_price_id,
              variant_sub_addon_name: this.addedAddOnList[i].sub_addon_name,
              price: this.addedAddOnList[i].addon_price,
            });
          }
          obj.addons = addOnLst;
        } else {
          obj.addons = [];
        }

        obj.unit_conversation_id =
          this.newvarient.selectedUnitConversion == undefined
            ? 0
            : this.newvarient.selectedUnitConversion.conversation_id;

        if (this.itemId == 0) {
          obj.item_image_ids = this.item_images
            .filter((x) => x.is_added == true)
            .map((x) => x.file.name)
            .toString();
        } else {
          obj.item_image_ids = this.item_images
            .filter((x) => x.is_added == true)
            .map((x) => x.item_image_id)
            .toString();
        }
      }
    }
    var tempVarientItemList = [];

    tempVarientItemList = cloneDeep(this.varientItem);

    tempVarientItemList.forEach((item) => {
      item.displayChoiceList = this.sortPipe.transform(
        item.displayChoiceList,
        "orderBy",
        "choice_id"
      );
      item.displayAddOnList = this.sortPipe.transform(
        item.displayAddOnList,
        "orderBy",
        "addon_id"
      );
      item.choices = this.sortPipe.transform(
        item.choices,
        "orderBy",
        "default_choice_id"
      );
      item.addons = this.sortPipe.transform(
        item.addons,
        "orderBy",
        "default_addon_id"
      );
    });

    this.varientItem = tempVarientItemList;
    this.selectedVarient.emit(this.varientItem);
    this.modal.close();
  }

  controlHasError(validation: any, controlName: any): boolean {
    const control = this.varientForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }

  removeTag(tag, index) {
    this.newvarient.item_attribute[index].selectedSubAttribute.forEach(
      (el, i) => {
        if (tag == el.id) {
          this.newvarient.item_attribute[index].selectedSubAttribute.splice(
            i,
            1
          );
        }
      }
    );
  }

  onKeyUp(event: KeyboardEvent, index): void {
    if (event.code === "Comma" || event.code === "Enter") {
      var is_exist: any = this.newvarient.item_attribute[index].selectedSubAttribute.filter((x) => x.text.toLowerCase() == this.colorcode.toLowerCase())[0];
      if (is_exist) {
        this.toastr.error(this.translate.instant("DUPLICATE_COLOR_CODE"));
      }
      else {
        var Id = 0;
        this.newvarient.item_attribute[index].selectedSubAttribute.forEach(
          (el, i) => {
            Id++;
          }
        );
        var temp = this.colorcode.split(",");
        var obj = {
          id: Id,
          text: temp[0],
        };
        this.newvarient.item_attribute[index].selectedSubAttribute.push(obj);
      }
      this.colorcode = null;
    }
  }

  colorCodeChange(event, index) {
    this.colorcode = event.target.value;
    var is_exist: any = this.newvarient.item_attribute[index].selectedSubAttribute.filter((x) => x.text.toLowerCase() == this.colorcode.toLowerCase())[0];
    if (is_exist) {
      this.toastr.error(this.translate.instant("DUPLICATE_COLOR_CODE"));
    }
    else {
      var Id = 0;
      this.newvarient.item_attribute[index].selectedSubAttribute.forEach(
        (el, i) => {
          Id++;
        }
      );
      var temp = this.colorcode.split(",");
      var obj = {
        id: Id,
        text: temp[0],
      };
      this.newvarient.item_attribute[index].selectedSubAttribute.push(obj);
    }
    this.colorcode = null;
  }

  //add new attribute
  newAttributeAdd(event, item) {
    if (!item.selectedAttribute.item_attribute_id) {
      return;
    }
    if (
      item.selectedSubAttribute.length == 0 ||
      item.selectedSubAttribute == ""
    ) {
      this.toastr.error(this.translate.instant("PLEASE_SELECT_SUB_ATTRIBUTE"));
      return;
    }
    this.newvarient.item_attribute.push({
      selectedAttribute: {},
      selectedSubAttribute: {},
    });
  }

  //delete attribute
  removeAttribute() {
    this.newvarient.item_attribute[0].selectedAttribute = {};
    this.newvarient.item_attribute[0].selectedSubAttribute = {};
  }

  validateFloatNumber() {
    if (
      this.varientForm.value.tax.split(".").length > 1 &&
      this.varientForm.value.tax.split(".")[0] == ""
    ) {
      this.varientForm.controls["tax"].setValidators(null);
    }
    if (this.varientForm.value.tax.split(".").length > 2) {
      this.varientForm.controls["tax"].setValue(
        Number(
          this.varientForm.value.tax.split(".")[0] +
          "." +
          this.varientForm.value.tax.split(".")[1]
        )
      );
    }

    if (
      this.varientForm.value.tax.split(".").length > 1 &&
      this.varientForm.value.tax.split(".")[1] > 99
    ) {
      this.varientForm.controls["tax"].setValue(
        Number(this.varientForm.value.tax).toFixed(2)
      );
    }
  }

  validatePercentage() {
    this.validateFloatNumber();
    if (this.varientForm.value.tax > 100) {
      this.varientForm.controls["tax"].setValue(
        100
      );
    }
  }

  UpdateItem() {
    if (Number(this.varientForm.value.opening_stock) < Number(this.varientForm.value.reorder_quantity)) {
      this.varientForm.controls["reorder_quantity"].setValue('0');
      this.toastr.error(this.translate.instant('OPENING_STOCK_SHOULD_BE_GREATER_THAN_REORDER_STOCK'));
      return false;
    } else {
    }
  }

  changeAttribute(item, element) {
    element.selectedSubAttribute = [];

    var matchAttributes: any = [];
    this.newvarient.item_attribute.forEach((att) => {
      if (att.selectedAttribute.item_attribute_id == item.item_attribute_id) {
        matchAttributes.push(att);
      }
    });

    if (matchAttributes.length > 1) {
      this.toastr.error(
        this.translate.instant("THIS_ATTRIBUTE_ALREADY_EXISTS")
      );
      element.selectedAttribute = undefined;
      return false;
    }
  }

  changeSubAttribute(event: any, index) {
    this.temp = [];
    this.newvarient.item_attribute[
      index
    ].selectedAttribute.sub_item_attributes.forEach((item) => {
      if (item.value != 0) {
        this.temp.push(item.value);
      }
    });

    event.forEach((el) => {
      if (el == 0) {
        this.newvarient.item_attribute[index].selectedSubAttribute = this.temp;
      }
    });
  }

  selectImage(index) {
    this.item_images[index].is_added = this.item_images[index]?.is_added == 1 ? 0 : 1;
    var selected_images: any = this.item_images.filter((img) => img.is_added);
    if (selected_images.length != 0) {
      if (selected_images[0].type == 2 || selected_images[0].type == 3) {
        this.toastr.error(this.translate.instant("THE_DEFAULT_VIEW_SHOULD_BE_AN_IMAGE"));
        this.item_images.forEach(img => {
          img.is_added = false;
        });
        return;
      }
    }
    if (selected_images.length == this.item_images.length) {
      this.varientForm.controls["select_all_image"].setValue(true);
    } else {
      this.varientForm.controls["select_all_image"].setValue(false);
    }
    this.cdr.detectChanges();
  }

  selectAllImage(val) {
    if (val) {
      this.item_images.forEach(img => {
        img.is_added = true;
      });
    } else {
      this.item_images.forEach(img => {
        img.is_added = false;
      });
    }
    this.cdr.detectChanges();
  }

  drop(event: CdkDragDrop<string[]>) {
    var events: any = event
    var image: any = this.item_images[events.previousContainer.data.index];
    if ((image.type == 2 || image.type == 3) && events.container.data.index == 0) {
      this.toastr.error(this.translate.instant("THE_DEFAULT_VIEW_SHOULD_BE_AN_IMAGE"));
      return;
    }

    if (events.previousContainer.data.index == 0 && this.item_images.length > 1) {
      image = this.item_images[events.previousContainer.data.index + 1];
      if (image.type == 2 || image.type == 3) {
        this.toastr.error(this.translate.instant("THE_DEFAULT_VIEW_SHOULD_BE_AN_IMAGE"));
        return;
      }
    }

    moveItemInArray(
      this.item_images,
      events.previousContainer.data.index,
      events.container.data.index
    );
  }

  onPaste(event: ClipboardEvent) {
    const pastedText = event.clipboardData?.getData('text/plain');
    if (pastedText && pastedText.includes(',')) {
      event.preventDefault();
      this.toastr.error(this.translate.instant("COMMAS_ARE_NOT_ALLOWED"));
      return;
    }
  }
}
