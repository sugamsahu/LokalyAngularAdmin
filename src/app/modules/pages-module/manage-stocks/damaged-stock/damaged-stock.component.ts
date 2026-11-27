import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { AppComponent } from "src/app/app.component";
import { reasonMasterService } from "src/app/services/lookup/reason-master.service";
import { StockInwardService } from "src/app/services/manage-stock/stock-inward.service";
import { AddSelectItemComponent } from "../../model/add-select-item/add-select-item.component";
import { CommonService } from "src/app/services/common.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-damaged-stock",
  templateUrl: "./damaged-stock.component.html",
  styleUrls: ["./damaged-stock.component.scss"],
})
export class DamagedStockComponent implements OnInit, AfterViewInit {
  main: any;
  general_setting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  stock_manage: any;
  store_label: string;
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  store_list: any = [];
  SelectedStore: any;
  file: any = null;
  reasonList: any = [];
  stockMethodList = [
    { label: 'At Item Level', value: 2 },
    { label: 'At Variant Level', value: 3 }
  ]
  damagedStockForm: UntypedFormGroup;
  @ViewChild("takeInput", { static: false }) InputVar: ElementRef;
  @ViewChild("cursor", { static: false }) cursor: ElementRef;
  selectedItems: any = [];
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private translate: TranslateService,
    private appComponent: AppComponent,
    private _stockInwardService: StockInwardService,
    private fb: UntypedFormBuilder,
    private _toastr: ToastrService,
    private modalService: NgbModal,
    private _reasonService: reasonMasterService,
    public commonService: CommonService,
    private _helpService: BannerService,
    private el: ElementRef,
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
    this.getReasonList();
    this.getHelpDetails();
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

  loadForm() {
    this.damagedStockForm = this.fb.group({
      transaction_number: ["", Validators.required],
      transaction_date: new UntypedFormControl(moment(new Date()).format(this.main.DateFormate.split(" ")[0])),
      reason: [null, Validators.required],
      description: [""],
    });
  }

  getReasonList() {
    const data = {
      reason_type: 6,
      is_active: 1
    };
    this._reasonService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.reasonList = response.data;
        } else {
        }
      },
      error: (error) => {
      },
    });
  }

  /** Open ManageStocksSelectItemComponent modal */
  openSelectItemModal() {
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
    });
    modalRef.componentInstance.is_damage_stock = true;
    modalRef.componentInstance.is_damage = true;
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
      this._toastr.error(this.translate.instant('DAMAGED_QUANTITY_CANNOT_BE_GREATER_THAN_THE_CURRENT_STOCK'));
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
        this._toastr.error(
          this.translate.instant("IMAGE_SIZE_SHOULD_BE_LESS_THAN_2_MB")
        );
        this.file = null;
      }
    }
  }

  clearForm() {
    this.damagedStockForm.controls.transaction_number.reset();
    this.damagedStockForm.controls.description.reset();
    this.damagedStockForm.controls.reason.reset();
    this.InputVar.nativeElement.value = "";
    this.selectedItems = [];
    this.file = null;
  }

  quantityChange(item) {
    if (Number(item.SelectedQty) > Number(item.opening_stock)) {
      this._toastr.error(
        this.translate.instant(
          "DAMAGED_QUANTITY_CANNOT_BE_GREATER_THAN_THE_CURRENT_STOCK"
        )
      );
      item.SelectedQty = 0;
      item.quantity = 0;
    }

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
          "DAMAGED_STOCK_NEEDS_TO_CONTAIN_MINIMUM_ONE_ITEM"
        )
      );
    }
  }

  controlHasError(validation, controlName): boolean {
    const control = this.damagedStockForm.controls[controlName];
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

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement =
      this.el.nativeElement.querySelector("form .ng-invalid");

    window.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: "smooth",
    });
  }

  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '119'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '119'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '119'
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

  /** Submit damage stock data */
  onSubmit() {
    if (!this.damagedStockForm.valid) {
      const controls = this.damagedStockForm.controls;
      Object.keys(controls).forEach((controlName, i) => {
        if (i == 0) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          invalidControl.focus();
        }
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
      return;
    }
    if (this.selectedItems.length == 0) {
      this._toastr.error(
        this.translate.instant(
          "DAMAGED_STOCK_NEEDS_TO_CONTAIN_MINIMUM_ONE_ITEM"
        )
      );
      return;
    }
    if (!this.damagedStockForm.value.reason == null) {
      this._toastr.error(this.translate.instant("REASON_IS_REQUIRED"));
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
      this.damagedStockForm.value.transaction_number
    );
    formData.append("description", this.damagedStockForm.value.description);
    formData.append("attachment", this.file);
    formData.append("stock_type", "2");
    formData.append("reason_id", this.damagedStockForm.value.reason);
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
