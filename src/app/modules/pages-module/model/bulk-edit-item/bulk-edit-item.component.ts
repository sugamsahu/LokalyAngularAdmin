import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx';
import { environment } from "src/environments/environment";
import { UpdatePriceService } from 'src/app/services/update-price.service';
import * as $ from "jquery";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bulk-edit-item',
  templateUrl: './bulk-edit-item.component.html',
  styleUrls: ['./bulk-edit-item.component.scss']
})
export class BulkEditItemModelComponent implements OnInit, OnDestroy {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  userData = JSON.parse(localStorage.getItem('loginUser'));
  @Input() main: any;
  @Input() store_id: any;
  @Input() script_type: any;
  @Input() category_id: any;
  openAccordion: boolean = false;
  tableSize = environment.tableSize;
  total_count: number = 0;
  SelectedZipFile: any;
  NewExcelRows = [];
  SelectedFile: any;
  file: any;
  no_data = true;
  count: number = 0;
  SelectedFileImport: boolean = true;
  importFileforReset: boolean = false;
  resetFileforImport: boolean = true;
  IsVisible = true
  page: number = 1;
  listForUpdation = [];
  tempExcelData;
  selectedPerPage: any;
  @ViewChild("excelUpload") _ExcelUpload!: ElementRef;
  perPages: any = [
    { id: "5", name: "5" },
    { id: "10", name: "10" },
    { id: "20", name: "20" },
    { id: "50", name: "50" },
    { id: "100", name: "100" },
    { id: "1000000000", name: "ALL" },
  ];
  style_obj_bulk_edit_item:any;

  constructor(
    public modal: NgbActiveModal,
    public translate: TranslateService,
    private toaster: ToastrService,
    private updatePriceService: UpdatePriceService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_bulk_edit_item = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    $(
      "<style>.ng-select.ng-select-single .ng-select-container { width:75px !important;}</style>"
    ).appendTo("body");


    this.selectedPerPage = localStorage.getItem('bulkEditItemModelPagination');
    if (this.selectedPerPage) {
      this.tableSize = this.selectedPerPage;
      this.selectedPerPage = this.selectedPerPage
    } else {
      this.tableSize = this.perPages[1].id;
      this.selectedPerPage = this.perPages[1].id;

    }
  }

  beforeChange(event) {
  }


  SelectFile(event) {
    this.file = event.target?.files[0];
    this.SelectedFileImport = false;
  }

  importFile() {
    if (this.file) {
      if (this.file.name.indexOf(".") > -1) {
        var extension = this.file.name.split(".").pop().toLowerCase();
      } else {
        var extension = this.file.name.split("/").pop().toLowerCase();
      }

      if ($.inArray(extension, ["xls", "xlsx"]) == -1) {
        this.SelectedZipFile = null;
        this._ExcelUpload.nativeElement.value = null;
        this.toaster.error(
          this.translate.instant("PLEASE_UPLOAD_A_VALID_EXCEL_FILE")
        );
        this.importFileforReset = false;
      } else {
        this.NewExcelRows = [];
        this.SelectedFile = this.file;
        this.resetFileforImport = false;
        this.openAccordion = true;
        this.importFileforReset = true;
        const reader = new FileReader();

        reader.onload = (e: any) => {
          let data = "";
          const bytes = new Uint8Array(e.target.result);
          for (let i = 0; i < bytes.byteLength; i++) {
            data += String.fromCharCode(bytes[i]);
          }
          this.ProcessExcel(data);
        };
        reader.readAsArrayBuffer(this.file);
      }
    }
  }

  ProcessExcel(data: string): void {
    // Read the Excel File data.
    const workbook = XLSX.read(data, { type: 'binary' });
    // Fetch the name of First Sheet.
    const firstSheet = workbook.SheetNames[0];
    // Read all rows from First Sheet into an JSON array.
    const excelRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

    let DiscountPriceGrater = false;

    excelRows.forEach((Row: any) => {
      const newRow = {
        Variant_ID: Row.Variant_ID,
        item_image: Row.Image != null ? Row.Image : '',
        category: Row.Category,
        item_name: Row.ITEM_NAME,
        Variant: Row.Variant,
        item_price: Row.MRP != null ? Row.MRP : 0,
        discounted_price: Row.DISCOUNTED_PRICE != null ? Row.DISCOUNTED_PRICE : 0,
      };

      if (newRow.item_price >= newRow.discounted_price) {
        this.NewExcelRows.push(newRow);
      } else {
        if (!DiscountPriceGrater) {
          DiscountPriceGrater = true;
          this.toaster.error(
            this.translate.instant('ITEM_PRICE_MUST_BE_GREATER_THAN_DISCOUNT_PRICE'));
        }
      }
    });

    if (this.NewExcelRows.length <= 0) {
      this.toaster.error(this.translate.instant('NO_RECORD_FOUND'));
      this.no_data = true;
    } else {
      this.no_data = false;
    }

    this.tempExcelData = this.NewExcelRows
    this.total_count = this.NewExcelRows.length

    // Display the data from Excel file in Table.
    this.IsVisible = true;
  }

  changePage(event) {
    this.page = event;
  }

  limitChange() {
    this.page = 1;
    this.tableSize = this.selectedPerPage;
    localStorage.setItem("bulkEditItemModelPagination", JSON.parse(this.selectedPerPage));
  }

  resetFile() {
    this.resetFileforImport = true;
    this.importFileforReset = false;
    this.openAccordion = false;
  }

  submitItemImport() {
    this.listForUpdation = [];
    for (var i = 0; i < this.NewExcelRows.length; i++) {
      var item = {
        item_variants_id: parseInt(this.NewExcelRows[i].Variant_ID),
        item_price: parseInt(this.NewExcelRows[i].item_price),
        discounted_price: parseInt(this.NewExcelRows[i].discounted_price)
      }
      this.listForUpdation.push(item);
    }

    var data = {
      user_id: this.userData.user_id,
      store_id: this.store_id,
      category_id: this.category_id,
      script_type: this.script_type,
      item_prices: JSON.stringify(this.listForUpdation),
      source: 'web'
    };

    this.updatePriceService.updateStoreItemPrices(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toaster.success(response.message);
          this.modal.close()
        } else {
          this.toaster.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });

  }

  ngOnDestroy() {
    $(
      "<style>.ng-select.ng-select-single .ng-select-container { width:100% !important;}</style>"
    ).appendTo("body");
  }
}
