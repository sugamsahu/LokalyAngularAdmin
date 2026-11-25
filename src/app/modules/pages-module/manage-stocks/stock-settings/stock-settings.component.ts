import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { StockSettingsService } from 'src/app/services/manage-stock/stock-settings.service';
import { environment } from "src/environments/environment";
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap, } from "rxjs";
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { Router } from '@angular/router';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stock-settings',
  templateUrl: './stock-settings.component.html',
  styleUrls: ['./stock-settings.component.scss'],
})
export class StockSettingsComponent implements OnInit {

  main;
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  is_eatery: any;
  search = "";
  no_data: boolean = true;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.general_setting.store_label;
  category_grid: any = [];
  unit_list: any = [];
  unit_conversion_list: any = [];
  updated_item_list: any = [];
  opening_stock_smaller: boolean = false;
  stockMethodList = [
    { label: 'Manual Stock Management', value: 1 },
    { label: 'At Item Level', value: 2 },
    { label: 'At Variant Level', value: 3 }
  ]
  selectedStockMethod = this.stockMethodList[0];
  CurrentStockList: any = [];
  checkStockSettingsId = 0;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  showCombineVarient = false;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private stockSettingService: StockSettingsService,
    private _snackbarService: ToastrService,
    private cryptoService: CryptoService,
    private router: Router,
    private _helpService: BannerService,
    private modalService: NgbModal,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    this.is_eatery = this.main.LoggedUserStoreInfo.iseatery;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.CurrentStockList = [
      { label: this.is_eatery == '0' ? 'Out Of Stock' : 'Sold Out', value: 1 },
      { label: this.is_eatery == '0' ? 'In Stock' : 'Available', value: 0 }
    ]
    this.page = 1;
    this.search = "";
    this.count = 0;
    var filterObject: any;
    var preUrl = localStorage.getItem("Previous_URL");
    if (preUrl == "/items/item-edit") {
      filterObject = JSON.parse(localStorage.getItem("stockSetting"));
      localStorage.removeItem("stockSetting");
      localStorage.removeItem("checkStockSettingsId");
    }
    if (filterObject) {
      this.search = filterObject.search_query;
      this.page = filterObject.page;
      this.selectedStockMethod = filterObject.stock_management_method;
    }
    this.getItemsList(this.page);
    if (this.searchbox != undefined) {
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.getItemsList(1);
          })
        )
        .subscribe();
    }
    this.getHelpDetails();
  }

  getItemsList(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data: any = {
      page: this.page,
      search_query: search,
      stock_management_method: this.selectedStockMethod.value,
      store_id: this.main.LoggedUserStoreInfo.store_id
    };
    data.is_item_variant_level = this.showCombineVarient == true ? 1 : 0
    if (data.stock_management_method == 1) {
      data.is_item_variant_level = 1
    }
    this.stockSettingService.getItemListForStock(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.category_grid = response.data;
          this.category_grid.forEach(element => {
            var found: any;
            if (element.item_variants[0].item_image_ids) {
              var img = element.item_variants[0].item_image_ids.split(',');
              found = element.item_images.filter((image: any) => image.item_image_id == img[0])[0];
            }
            element.item_image = found?.image;
            this.CurrentStockList.forEach(item => {
              if (Number(element.item_variants[0].out_of_stock) == item.value) {
                element.selectedCurrentStock = item
              }
            });
            element.opening_stock = Number(element.stock_management_method == "3" ? element.item_variants[0].opening_stock : element.opening_stock);
            element.reorder_stock = Number(element.stock_management_method == "3" ? element.item_variants[0].reorder_stock : element.reorder_stock);
            element.selectedStockUnit = this.unit_list.filter(event => event.unit_id == Number(element?.unit_id), true)[0];
            element.filterUnitConversionList = this.filterUnitConversionList(element?.unit_id, element?.item_variants[0]?.unit_id);
            element.selectedUnitConversion = element.filterUnitConversionList.filter(event => event.conversation_id == element?.item_variants[0].unit_conversation_id, true)[0];
            element.is_update = false;
          });
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.category_grid = [];
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => {
        ;
      }
    });
  }

  changeStockMethod(event) {
    this.selectedStockMethod = event;
    this.page = 1;
    if (this.selectedStockMethod.value == 2) {
      this.category_grid = [];
      this.getItemsList(this.page)
      this.getUnitList();
    }
    else {
      this.getItemsList(this.page);
    }
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getItemsList(1);
    }
  }

  getSelectedCurrentStock(item) {
    item.is_update = true;
  }

  UpdateItem = function (item) {
    item.is_update = true;
    if (Number(item.opening_stock) < Number(item.reorder_stock)) {
      item.reorder_stock = 0;
      this.toastr.error(this.translate.instant('OPENING_STOCK_SHOULD_BE_GREATER_THAN_REORDER_STOCK'));
      this.opening_stock_smaller = true;
      return false;
    } else {
      this.opening_stock_smaller = false;
    }
  }

  getUnitList() {
    this.stockSettingService.getItemUnitList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.unit_list = response.data;
          var item = {
            unit_id: 0,
            name: 'Select UOM'
          };
          this.unit_list.splice(0, 0, item);

          this.getUnitConversionList();
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => {
      }
    })
  }

  getUnitConversionList() {
    this.unit_conversion_list = [];
    this.stockSettingService.getUnitConversionList({}).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.unit_conversion_list = response.data;
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => {
      }
    })
  }

  filterUnitConversionList(itemUnitId, varientUnitId) {
    var conversionList = [];
    this.unit_conversion_list.forEach(element => {
      if (element.from_unit_id == itemUnitId && element.to_unit_id == varientUnitId) {
        conversionList.push(element);
      }
      else if (element.to_unit_id == itemUnitId && element.from_unit_id == varientUnitId) {
        conversionList.push(element);
      }
    });
    return conversionList;
  }

  getSelectedItemStockUnit(selUnit, item) {
    item.selectedUnitConversion = undefined;
    item.filterUnitConversionList = this.filterUnitConversionList(selUnit.unit_id, item.item_variants[0].unit_id);
    item.selectedStockUnit = selUnit;
    item.is_update = true;
  }

  getSelectedUnitConversion(selected, item) {
    item.selectedUnitConversion = selected;
    item.is_update = true;
  }


  UpdateAndNext() {
    this.updated_item_list = this.category_grid.filter(item => item.is_update == true, true);

    if (this.updated_item_list.length > 0) {
      var updateItems = [];
      var doNotCallApi: boolean = false;
      this.updated_item_list.forEach(el => {
        var data: any = {};
        if (this.selectedStockMethod.value == 1) {
          data = {
            item_id: el.item_id,
            item_variants_id: el.item_variants[0].item_variants_id,
            out_of_stock: el.selectedCurrentStock.value,
            stock_management_method: el.stock_management_method,
          };
        }
        else if (this.selectedStockMethod.value == 2) {
          data = {
            item_id: el.item_id,
            item_variants_id: el.item_variants[0].item_variants_id,
            opening_stock: el.opening_stock == null ? 0 : el.opening_stock,
            reorder_stock: el.reorder_stock == null ? 0 : el.reorder_stock,
            stock_management_method: el.stock_management_method,
            item_unit_id: el.selectedStockUnit.unit_id,
            unit_conversation_id: el.selectedUnitConversion == undefined ? 0 : el.selectedUnitConversion.conversation_id
          };

          if (data.unit_conversation_id == 0 && this.showCombineVarient) {
            if (el.item_variants[0].unit_id != data.item_unit_id) {
              this.toastr.error(this.translate.instant('SELECT_THE_UNIT_CONVERSION'));
              doNotCallApi = true;
              return;
            }
          }
        }
        else if (this.selectedStockMethod.value == 3) {
          data = {
            item_id: el.item_id,
            item_variants_id: el.item_variants[0].item_variants_id,
            opening_stock: el.opening_stock == null ? 0 : el.opening_stock,
            reorder_stock: el.reorder_stock == null ? 0 : el.reorder_stock,
            stock_management_method: el.stock_management_method,
          };
        }
        updateItems.push(data);
      })
      var data = {
        store_id: this.main.LoggedUserStoreInfo.store_id,
        user_id: this.main.LoggedUserInfo.user_id,
        items: JSON.stringify(updateItems),
      };

      if (doNotCallApi == false) {
        this.stockSettingService.updateStockSettingsData(data).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this._snackbarService.success(response.message);
            } else {
              this._snackbarService.error(response.message);
            }
          },
          error: (error) => {
            this._snackbarService.error(error);
          },
          complete: () => {
          }
        });
      }
    }
  }

  editItem(item: any) {
    this.checkStockSettingsId = 1
    var obj = {
      page: this.page,
      search_query: this.search,
      stock_management_method: this.selectedStockMethod,
    };
    localStorage.setItem("stockSetting", JSON.stringify(obj));
    localStorage.setItem("checkStockSettingsId", JSON.stringify(this.checkStockSettingsId))
    this.cryptoService.encryptIdValue(
      item.item_id.toString(),
      "stockSettingId" + this.main.LoggedUserStoreInfo?.store_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate([]).then(result => { window.open("/items/item-edit", '_blank'); });
  }

  getUnites(allunit, unit_quantity, subItem, index) {
    var lastIndex = allunit?.length - 1;
    if (lastIndex != index) {
      var unites: any = unit_quantity + subItem + ','
    } else {
      var unites: any = unit_quantity + subItem
    }
    return unites
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  disableddivCheck(item: any, label: any) {
    if (this.selectedStockMethod.value == 2) {
      if (!this.showCombineVarient) {
        if (item.is_stock_added != 1) {
          return false
        } else {
          if (label == 'REORDER_LEVEL') {
            return false
          }
          else {
            return true
          }
        }
      } else {
        if (item.is_stock_added != 1) {
          if (label == 'UNIT_CONVERSION') {
            return false
          }
          else {
            return true
          }
        } else {
          return true
        }
      }
    }
    else if (this.selectedStockMethod.value == 3) {
      if (item.item_variants[0].is_stock_added != 1) {
        return false
      }
      else {
        if (label == 'OPENING_STOCK') {
          return true
        }
        else {
          return false
        }
      }
    }
    else {
      return false;
    }
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '121'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '121'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '121'
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
}
