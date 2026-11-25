import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { StockMethodService } from 'src/app/services/manage-stock/stock-method.service';
import { environment } from "src/environments/environment";
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap, } from "rxjs";
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { Router } from '@angular/router';
import Swal from "sweetalert2";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stock-method',
  templateUrl: './stock-method.component.html',
  styleUrls: ['./stock-method.component.scss'],
})
export class StockMethodComponent implements OnInit {

  main;
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search = "";
  no_data = true;
  category_grid = [];
  updated_item_list = [];
  StockManagementMethod = [
    { label: 'Manual Stock Management', value: 1 },
    { label: 'At Item Level', value: 2 },
    { label: 'At Variant Level', value: 3 }
  ];
  selectedStockMethod = this.StockManagementMethod[0];
  selectedStockMethodMain = this.StockManagementMethod[0];
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  checkStockSettingsId: number;

  constructor(
    public translate: TranslateService,
    private appComponent: AppComponent,
    private stockMethodService: StockMethodService,
    private toastr: ToastrService,
    private _snackbarService: ToastrService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private cryptoService: CryptoService,
    private router: Router,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.page = 1;
    this.search = "";
    this.count = 0;
    this.getItemsList(this.page)
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
    var data = {
      page: this.page,
      search_query: search,
      stock_management_method: this.selectedStockMethod.value,
      store_id: this.main.LoggedUserStoreInfo.store_id,
      for_stock_method_list: 1
    };
    this.stockMethodService.getItemList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.category_grid = response.data;
          this.category_grid.forEach(element => {
            element.selectedStockMethodItem = this.StockManagementMethod.filter(item => item.value == element.stock_management_method, true)[0];
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

  getSelectedStockMethod(event) {
    this.selectedStockMethod = event;
    this.page = 1;
    this.getItemsList(this.page);
  }

  getSelectedStockMethodItem(event, item) {
    item.selectedStockMethodItem = event;
    this.updated_item_list.push(item);
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getItemsList(1);
    }
  }

  UpdateAndNext() {
    var updateItems = [];
    this.updated_item_list.forEach(element => {
      var data = {
        item_id: element.item_id,
        item_variants_id: element.item_variants_id,
        stock_management_method: element.selectedStockMethodItem.value
      }
      updateItems.push(data);
    })

    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      items: JSON.stringify(updateItems),
    }

    this.stockMethodService.post(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.getItemsList(this.page);
        } else {
          this._snackbarService.error(response.message);
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => {
      }
    })
  }

  getSelectedStockMethodMain(event) {
    this.selectedStockMethodMain = event;
  }

  setForAllItemStockAlert() {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("SET_FOR_ALL_ITEM"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.setForAllItemStock();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  setForAllItemStock() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      stock_management_method: this.selectedStockMethodMain.value
    };

    this.stockMethodService.post(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.getItemsList(this.page);
        } else {
          this._snackbarService.error(response.message);
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => {
      }
    })

  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  editItem(item: any) {
    this.cryptoService.encryptIdValue(
      item.item_id.toString(),
      "selleritemid" + this.main.LoggedUserStoreInfo?.store_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate([]).then(result => { window.open("/items/item-edit", '_blank'); });
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '120'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '120'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '120'
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