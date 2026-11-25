import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { AppComponent } from "src/app/app.component";
import { StockInwardService } from "src/app/services/manage-stock/stock-inward.service";
import { AddSelectItemComponent } from "../../model/add-select-item/add-select-item.component";
import { CommonService } from "src/app/services/common.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-stock-outward",
  templateUrl: "./stock-outward.component.html",
  styleUrls: ["./stock-outward.component.scss"],
})
export class StockOutwardComponent implements OnInit, AfterViewInit {
  main: any;
  general_setting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  stock_manage: any;
  store_label: string;
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  stockMethodList = [
    { label: 'At Item Level', value: 2 },
    { label: 'At Variant Level', value: 3 }
  ]
  store_list: any = [];
  SelectedStore: any;
  file: any = null;
  stockOutwardForm: FormGroup;
  selectedItems: any = [];
  @ViewChild("takeInput", { static: false }) InputVar: ElementRef;
  @ViewChild("cursor", { static: false }) cursor: ElementRef
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private translate: TranslateService,
    private appComponent: AppComponent,
    private _stockInwardService: StockInwardService,
    private fb: FormBuilder,
    private _toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    public commonService: CommonService,
    private _helpService: BannerService,
    private router: Router,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    if (this.general_setting) {
      this.stock_manage = this.general_setting.stock_mgmt;
      this.store_label = this.general_setting.store_label;
    } else {
      this.stock_manage = this.main.stock_mgmt;
      this.store_label = this.main.store_label;
    }
    this.getStoreList();
    this.loadForm();
    this.getHelpDetails();
  }

  loadForm() {
    this.stockOutwardForm = this.fb.group({
      transaction_number: ["", Validators.required],
      transaction_date: new FormControl(moment(new Date()).format(this.main.DateFormate.split(" ")[0])),
      description: [""],
    });
  }

  getStoreList() {
    const data = {
      user_id: this.main.LoggedUserInfo.user_id,
    };

    this._stockInwardService.getStoreList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach((el) => {
            el.details =
              el.store_name + " (" + el.manager + ") " + el.store_address;
          });

          this.store_list = response.data;
          this.store_list = this.store_list.sort((a, b) => a.store_name.localeCompare(b.store_name));

          this.SelectedStore = this.store_list.filter(
            (item) => item.store_id == this.seller_details.store_id
          )[0];
        }
      },
    });
  }
  /** Open ManageStocksSelectItemComponent modal */
  openSelectItemModal() {
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
    });
    modalRef.componentInstance.is_damage_stock = true;
    modalRef.componentInstance.is_outward = true;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.initialSelectedItems = this.selectedItems;

    modalRef.componentInstance.selectedPopupItems.subscribe((items) => {
      this.selectedItems = items;
    });
  }

  validateThreeDigit(item) {
    if (
      item.SelectedQty.split(".").length > 1 &&
      item.SelectedQty.split(".")[1] > 99
    ) {
      item.SelectedQty = Number(item.SelectedQty).toFixed(3);
    }
    if (Number(item.SelectedQty) > Number(item.current_stock)) {
      this._toastr.error(this.translate.instant('OUTWARD_QUANTITY_CANNOT_BE_GREATER_THAN_THE_CURRENT_STOCK'));
      item.SelectedQty = 0
      item.quantity = 0
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      this.file = event.target.files[0];
      if (this.file.name.indexOf(".") > -1) {
        var extension = this.file.name.split(".").pop().toLowerCase();
      } else {
        var extension = this.file.name.split("/").pop().toLowerCase();
      }
      if (
        $.inArray(extension, [
          "png",
          "PNG",
          "jpg",
          "jpeg",
          "pdf",
          "doc",
          "docx",
          "DOC",
          "DOCX",
          "xls",
          "xlsx",
          "csv",
          "txt",
          "rtf",
          "svg",
          "tiff",
        ]) == -1
      ) {
        this._toastr.error(
          this.translate.instant(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_ADDRESS"
          )
        );
        this.InputVar.nativeElement.value = "";
        this.file = null;
        return;
      } else if (this.file.size / 1024 >= 2048) {
        this.file = null;
        this._toastr.error(
          this.translate.instant("IMAGE_SIZE_SHOULD_BE_LESS_THAN_2_MB")
        );
      }
    }
  }

  clearForm() {
    this.stockOutwardForm.controls.transaction_number.reset("");
    this.stockOutwardForm.controls.description.reset();
    this.InputVar.nativeElement.value = "";
    this.selectedItems = [];
    this.file = null;
  }

  QuantityChnage(item) {
    this.validateThreeDigit(item);
    this.selectedItems.forEach((selItem) => {
      if (selItem.item_variants_id == item.item_variants_id) {
        selItem.quantity = item.SelectedQty;
      }
    });
  }

  removeItemOnOrder(item) {
    var filterData = this.selectedItems.filter((el) => el != item);
    if (filterData.length > 0) {
      this.selectedItems = filterData;
    } else {
      this._toastr.error(
        this.translate.instant(
          "STOCK_OUTWARD_NEEDS_TO_CONTAIN_MINIMUM_ONE_ITEM"
        )
      );
    }
  }

  controlHasError(validation, controlName): boolean {
    const control = this.stockOutwardForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '118'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '118'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '118'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_details = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  /** Submit stock outward data */
  onSubmit() {
    if (!this.stockOutwardForm.valid) {
      this._toastr.error(
        this.translate.instant("PLEASE_ENTER_REQUIRED_FIELD")
      );
      return;
    }
    if (this.selectedItems.length == 0) {
      this._toastr.error(
        this.translate.instant("STOCK_INWARD_NEEDS_TO_CONTAIN_MINIMUM_ONE_ITEM")
      );
      return;
    }
    if (!this.file) {
      this._toastr.error(
        this.translate.instant("ATTCH_DOCUMENT_IS_REQUIRED")
      );
      return;
    }
    var stockItems = [];
    var errorShow = false
    this.selectedItems.forEach((item) => {
      if (item.quantity == '') {
        errorShow = true
      }
      var itemDetails = {
        item_id: item.item_id,
        item_variants_id: item.item_variants_id,
        stock_quantity: item.quantity,
        stock_management_method: item.stock_management_method,
      };
      stockItems.push(itemDetails);
    });
    if (errorShow) {
      this._toastr.error(
        this.translate.instant("QTY_CANNOT_BE_BLANK")
      );
      return;
    }
    var formData = new FormData();
    formData.append("user_id", this.main.LoggedUserInfo.user_id);
    formData.append("store_id", this.SelectedStore.store_id);
    formData.append("date", moment(new Date()).format(this.main.DateFormate.split(" ")[0]));
    formData.append("items", JSON.stringify(stockItems));
    formData.append(
      "transaction_number",
      this.stockOutwardForm.value.transaction_number
    );
    formData.append("description", this.stockOutwardForm.value.description);
    formData.append("stock_type", "3");
    formData.append("attachment", this.file);
    this._stockInwardService.manageStock(formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._toastr.success(this.translate.instant(response.message));
          this.clearForm();
        } else {
          this._toastr.error(this.translate.instant(response.message));
        }
      },
    });
  }
}