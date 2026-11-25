import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DemoStoreService } from 'src/app/services/configuration/demo-store.service';
import { EasyScriptService } from 'src/app/services/configuration/easy-script.service';
import { CategoryService } from 'src/app/services/lookup/category.service';
import { crop_rectangleComponent } from '../crop-rectangle/crop-rectangle.component';
import { RearrangeItemsComponent } from '../rearrange-items/rearrange-items.component';
import * as $ from "jquery";
import Swal from 'sweetalert2';
import { BulkEditItemModelComponent } from '../bulk-edit-item/bulk-edit-item.component';
import * as XLSX from 'xlsx';
import { ItemService } from 'src/app/services/item.service';
import { CommonService } from 'src/app/services/common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-easy-script',
  templateUrl: './easy-script.component.html',
  styleUrls: ['./easy-script.component.scss']
})
export class EasyScriptModalComponent implements OnInit, OnDestroy {
  @Input() main: any;
  @Input() buttonValue: number;
  @Input() store_tax_label: string;
  @Input() store_label: string;
  @Input() global_currency: string;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  public modalEasyScriptForm: FormGroup;
  storeList: any = [];
  categoryList: any = []
  myCroppedImageShow: any;
  myCroppedImage: string;
  cropped_item_image: string;
  isCroppedImage: boolean = false;
  croppedImages: any;
  cropFiles: any;
  style_obj_easy_script:any;
  CategoryGrid: any;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private _demoStoreService: DemoStoreService,
    private _toastr: ToastrService,
    private translate: TranslateService,
    private _categoryService: CategoryService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private _easyScriptService: EasyScriptService,
    private itemService: ItemService,
    public commonService : CommonService

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_easy_script = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    $(
      "<style>.ng-select, .ng-select div, .ng-select input, .ng-select span { white-space: normal !important;}</style>"
    ).appendTo("body");

    $(
      "<style>.ng-select.ng-select-single .ng-select-container { width:100% !important;}</style>"
    ).appendTo("body");

    $(
      "<style>.swal2-styled.swal2-confirm { color: black; font-weight: 600;}</style>"
    ).appendTo("body");

    this.loadForm();
    this.getStoreList();
  }

  loadForm() {
    this.modalEasyScriptForm = this.formBuilder.group({
      SelectedStore: [null],
      SelectedCategory: [null],
      TaxAmount: [''],
      packagingAmount: [null],
      item_image: 'assets/icons/no_image.svg'
    })
  }

  async getStoreList() {
    var data = {
      is_verified: 2,
      khata_user: 0,
      market_type: 2
    };

    await this._demoStoreService.getSellerListRecord(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {

          response.data.forEach(element => {
            element.name = element.store_name + ' (' + element.manager_name + ') ' + element.store_area_name + ', ' + element.store_city_name
          })

          this.storeList = response.data;
          this.modalEasyScriptForm.controls.SelectedStore.setValue(this.storeList[0].store_id);
          this.storeList = this.storeList.sort((a, b) => a.store_name.localeCompare(b.store_name));

          this.getCategoryList(1);
        }
        else {
          this._toastr.error(this.translate.instant(response.message));
        }
      }, error: (error) => {
        this.storeList = [];
        this._toastr.error(error);
      }
    })
  }


  rearragneCatList: any;
  data: any;
  async getCategoryList(event: any) {

    this.data = {
      store_id: this.modalEasyScriptForm.value.SelectedStore
    };

    await this._categoryService.get(this.data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (this.buttonValue != 6) {
            var data = response.data;
            this.categoryList = [{ category_id: 0, name: "All" }];

            response.data.forEach(element => {
              if (element.category_id != 1) {
                element.name = element.category_name + ' (' + element.count + ')';
                this.categoryList.push(element);
              }
            })
            this.modalEasyScriptForm.controls["SelectedCategory"].setValue(this.categoryList[0].category_id)
          } else {
            this.categoryList = [];
            this.rearragneCatList = [];
            for (var i = 0; i < response.data.length; i++) {
              if (response.data[i].count == 0 || response.data[i].category_id == 1 || response.data[i].category_id == 2) {
                response.data.splice(i, 1);
                i--;
              }
            }
            this.rearragneCatList = response.data;
          }

        } else {
          this.categoryList = []
          this._toastr.error(this.translate.instant(response.message));
        }
      }, error: (error) => {
        this._toastr.error(error);
      }
    })

    var tempStoreList = this.storeList.filter((x) => x.store_id == event)
    var tempStoreName;
    if (tempStoreList.length > 0) {
      tempStoreList.forEach(el => {
        tempStoreName = el.store_name + ' (' + el.manager_name + ') '
      })
      this.modalEasyScriptForm.controls["SelectedStore"].setValue(tempStoreName)
    }

  }
  categoryIdData: any
  getCategoryId(event) {
    this.categoryIdData = event
  }
  /** open crop_rectangleComponent modal*/
  openUpdateUserProfPicModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent,{
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.myCroppedImageShow;
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.newseller =
      this.cropped_item_image == undefined
        ? this.modalEasyScriptForm.value.item_image
        : this.cropped_item_image;
    modalRef.componentInstance.isCroppedImage = this.isCroppedImage;
    modalRef.componentInstance.cropFiles = this.cropFiles
    modalRef.componentInstance.cropWidth = '500'
    modalRef.componentInstance.cropHeight = '500'
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.editProfilePic(receivedEntry);
    });
  }

  editProfilePic(item) {
    if (item.crop_image_file != undefined) {
      this.isCroppedImage = true;
      this.cropped_item_image = item.crop_image;
      this.cropFiles = item.cropFiles
      this.croppedImages = item.croppedImages
      this.modalEasyScriptForm.controls["item_image"].setValue(item.crop_image_file);
      this.myCroppedImage = item.full_image;
    }
    this.cdr.detectChanges();
  }

  removeImage() {
    this.modalEasyScriptForm.controls.item_image.setValue('assets/icons/no_image.svg')
    this.isCroppedImage = false;
    this.myCroppedImage = '';
  }
  /** Rearrange item by opening RearrangeItemsComponent modal */
  rearrangeitem() {
    const modalRef = this.modalService.open(RearrangeItemsComponent, {
      size: "lg-600",
      backdrop: 'static'
    });
    modalRef.componentInstance.categoryList = this.rearragneCatList;
    modalRef.componentInstance.storeId = this.data;
    modalRef.result.then(() => {
    });
  }

  
  validatePercentage() {
    this.validateFloatNumber();
    if (this.modalEasyScriptForm.value.TaxAmount > 100) {
      this.modalEasyScriptForm.controls["TaxAmount"].setValue(
        100
      );
    }
  }

  validateFloatNumber() {
    if (
      this.modalEasyScriptForm.value.TaxAmount.split(".").length > 1 &&
      this.modalEasyScriptForm.value.TaxAmount.split(".")[0] == ""
    ) {
      this.modalEasyScriptForm.controls["TaxAmount"].setValidators(null);
    }
    if (this.modalEasyScriptForm.value.TaxAmount.split(".").length > 2) {
      this.modalEasyScriptForm.controls["TaxAmount"].setValue(
        Number(
          this.modalEasyScriptForm.value.TaxAmount.split(".")[0] +
          "." +
          this.modalEasyScriptForm.value.TaxAmount.split(".")[1]
        )
      );
    }

    if (
      this.modalEasyScriptForm.value.TaxAmount.split(".").length > 1 &&
      this.modalEasyScriptForm.value.TaxAmount.split(".")[1] > 99
    ) {
      this.modalEasyScriptForm.controls["TaxAmount"].setValue(
        Number(this.modalEasyScriptForm.value.TaxAmount).toFixed(2)
      );
    }
  }

  exportToExcel() {
    var data = {
      store_id: this.data.store_id,
      category_id: this.categoryIdData == undefined ? 0 : this.categoryIdData,
      user_id: this.main.LoggedUserInfo.user_id
    };
    this.itemService.itemExport(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._toastr.success(this.translate.instant(response.message));
        } else {
          this._toastr.error(this.translate.instant(response.message));
        }
        this.openBulkEditItem();
      },
      error: (error) => {
      },
      complete: () => { },
    });

  }

  downloadExcel() {
    let Heading = [['Variant_ID', 'Category', 'Sub Category', 'ITEM_NAME', 'Variant', 'MRP', 'DISCOUNTED_PRICE']];
    const wb = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);

    XLSX.utils.sheet_add_aoa(ws, Heading);
    XLSX.utils.sheet_add_json(ws, this.CategoryGrid, { origin: 'A2', skipHeader: true });

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    let filename: string = this.modalEasyScriptForm.controls['SelectedStore'].value.split("(")[0] + "Update Items.xlsx";
    XLSX.writeFile(wb, filename);
  }

  openExcelsheetUploadModel() {
    Swal.fire({
      title: this.translate.instant("EXCEL_FILE"),
      text: this.translate.instant("WANT_TO_DOWNLOAD_EXCELFILE"),
      icon: "info",
      confirmButtonColor: '#FFCD3E ',
      cancelButtonColor: "##C1C1C1",
      showCancelButton: true,
      confirmButtonText: this.translate.instant("YES"),
      cancelButtonText: this.translate.instant("NO_BUTTON"),
    }).then((result) => {
      if (result?.isConfirmed) {
        this.exportToExcel();
      }
      else {
        this.openBulkEditItem();
      }

    });
  }

  openBulkEditItem() {
    const modalRef = this.modalService.open(BulkEditItemModelComponent, {
      size: "lg-950",
      centered: true
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.store_id = this.data.store_id
    modalRef.componentInstance.script_type = this.buttonValue.toString();
    modalRef.componentInstance.category_id = this.modalEasyScriptForm.value.SelectedCategory;

  }

  submitEasyScript() {
    if (this.buttonValue == 2 && this.modalEasyScriptForm.value.TaxAmount == null) {
      this._toastr.error(this.translate.instant('PLEASE_ENTER') + this.store_tax_label)
      return;
    }

    if (this.buttonValue == 3 && this.modalEasyScriptForm.value.packagingAmount == null) {
      this._toastr.error(this.translate.instant('PLEASE_ENTER_PACKAGING_COST'))
      return;
    }

    var fd = new FormData();
    fd.append('user_id', this.main.LoggedUserInfo.user_id);
    fd.append('store_id', this.data.store_id);

    if (this.categoryList.length == 1) {
      fd.append('category_id', undefined)
    } else {
      fd.append('category_id', this.modalEasyScriptForm.value.SelectedCategory);
    }
    fd.append('script_type', this.buttonValue.toString());

    if (this.buttonValue == 2) {
      fd.append('tax', this.modalEasyScriptForm.value.TaxAmount);
    }
    if (this.buttonValue == 3) {
      fd.append('packaging', this.modalEasyScriptForm.value.packagingAmount);
    }
    if (this.buttonValue == 5) {
      fd.append('item_image', this.modalEasyScriptForm.value.item_image);
    }

    this._easyScriptService.manageEasyScript(fd).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._toastr.success(response.message);
          this.activeModal.dismiss();
        } else {
          this._toastr.error(response.message);
        }
      }
    })

  }

  ngOnDestroy() {
    $(
      "<style>.ng-select, .ng-select div, .ng-select input, .ng-select span { white-space: normal !important;}</style>"
    ).appendTo("body");


    $(
      "<style>.ng-select.ng-select-single .ng-select-container { width:100% !important;}</style>"
    ).appendTo("body");

    $(
      "<style>.swal2-styled.swal2-confirm { color: black; font-weight: 600;}</style>"
    ).appendTo("body");

  }
}


