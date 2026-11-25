import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { ManageStoreService } from 'src/app/services/manage-store.service';
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-banner-setting',
  templateUrl: './banner-setting.component.html',
  styleUrls: ['./banner-setting.component.scss']
})
export class BannerSettingComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  sellerDetails = JSON.parse(localStorage.getItem('loginUserStore'));
  POSTS: any;
  page: number = 1;
  search: any;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  sortKey: any = "";
  isOrderBy: boolean = true;
  no_data = true;
  count: number = 0;
  banner_list: any = [];
  main: any;
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  store_banner_id: any;
  id: any;
  formGroup: any;
  display_id: any;
  store_label: string = this.generalSetting.store_label;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  skipShow: boolean = true;

  constructor(
    private manageStoreService: ManageStoreService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private router: Router,
    private appComponent: AppComponent,
    private cryptoService: CryptoService,
    private _snackbarService: ToastrService,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    var preUrl = localStorage.getItem("Previous_URL");
    let previousURL = preUrl.slice(0, preUrl.lastIndexOf("/"));
    var filterObject;
    this.search = "";
    this.count = 0;
    if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }
    if (filterObject) {
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    this.getStoreBanners(this.page);
    this.getHelpDetails();
  }

  getStoreBanners(page): void {
    this.page = page;
    var data = {
      store_id: this.sellerDetails.store_id,
    };
    this.manageStoreService.getStoreBanners(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.banner_list = response.data;

          if (this.banner_list.length > 0) {
            this.no_data = false;
          } else {
            this.no_data = true;
          }
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.banner_list = [];
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

  onPreviousButton() {
    this.router.navigate([`/store-details`])
  }

  onNextButton() {
    this.router.navigate([`/business-hours`])
  }

  editBanner(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id.toString(),
      "banner-setting" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/storebanner/edit"]);
  }

  deleteBanner(id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_BANNER"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteConfirm(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  deleteConfirm(id) {
    let data = {
      store_banner_id: id,
      store_id: this.sellerDetails.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
    };

    this.manageStoreService.deleteStoreBanner(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.getStoreBanners(this.page);
        } else {
          this._snackbarService.error(response.message);
        }
      },
      error: (error) => {

        this._snackbarService.error(error);
      },
      complete: () => {

        ;
      },
    });
  }

  reorderBanner() {
    var bannerDup = this.banner_list;
    var bannersSubmit = new Array();
    bannersSubmit = [];
    var ismatch = false;

    this.banner_list.forEach(banner => {
      bannerDup.forEach(tempBanner => {
        if (banner.display_id == tempBanner.display_id
          && banner.store_banner_id != tempBanner.store_banner_id) {
          ismatch = true;
        }
      });
      bannersSubmit.push({ store_banner_id: banner.store_banner_id, display_id: banner.display_id });
    });
    if (ismatch) {
      this.toastr.error(this.translate.instant('DISPLAY_SEQUENCE_SHOULD_BE_UNIQ'));
      return;
    }
    var fd = new FormData();
    fd.append('store_id', this.sellerDetails.store_id);
    fd.append('user_id', this.main.LoggedUserInfo.user_id);
    fd.append('banners', JSON.stringify(bannersSubmit));
    this.manageStoreService.reOrderStoreBanner(fd).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  onSearchChange(value) {
    this.search = value;
    this.getStoreBanners(0);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName; //set the sortKey to the param passed
    this.isOrderBy = !this.isOrderBy;
    this.getStoreBanners(this.page);
  }

  sort(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
  }

  restrictNumeric(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;

    if (inputValue.length >= 2) {
      event.preventDefault();
    }
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
      data.module_key = '92'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '92'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '92'
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