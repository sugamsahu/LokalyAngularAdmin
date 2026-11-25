
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { StoreService } from "src/app/services/store.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Router } from "@angular/router";
import { shareURLComponent } from "../model/share-url/share-url.component";
import Swal from "sweetalert2";
import { SellerService } from "src/app/services/seller.service";
import { environment } from "src/environments/environment";
import { filter, debounceTime, distinctUntilChanged, tap } from "rxjs/operators";
import { fromEvent } from "rxjs";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ReveiwRatingComponent } from "../model/reveiw-rating/reveiw-rating.component";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-store-management",
  templateUrl: "./store-management.component.html",
  styleUrls: ["./store-management.component.scss"],
})
export class StoreManagementComponent implements OnInit {
  POSTS: any;
  page: number = 1;
  count: number = 0;
  tableSize = environment.tableSize;
  unitTypeList: [];
  search: any = '';
  no_data = true;
  sellerTypeList = [
    { label: "Application", value: 1 },
    { label: "In Process", value: 2 },
    { label: "Approved", value: 3 },
    { label: "Rejected", value: 4 },
    { label: "Deleted", value: 5 },
  ];
  selectedSellerItem = this.sellerTypeList[2];
  selectedUserType = 1;
  adminDetails = JSON.parse(localStorage.getItem("loginUser"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting.store_label;
  khata_label = this.generalSetting.khata_label;
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  main: any;
  business_model: any;
  isAddSellerShow: boolean;
  isSellerStatusShow: boolean;
  isSellerFilterType: boolean;
  isDemoSellerShow: boolean;
  isEditDeleteCreatePencil: boolean;
  hidePDF: boolean;
  sellerURL: string;
  sellerFlag: string;
  sellerFlagIndex: number;
  sellerList: any;
  UrL: string;
  whatsappURL: string;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  storeid: string;
  storeDetail: any;
  review_rating_module: any;
  searchSubscription: any;

  constructor(
    private storeService: StoreService,
    private sellerService: SellerService,
    private router: Router,
    private modalService: NgbModal,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private _helpService: BannerService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit() {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    var sessionConfig = this.appComponent.sessionConfig();
    sessionConfig.clearCookie("storeManage_Behalf" + this.main.LoggedUserInfo.role_id.toString());
    sessionConfig.clearCookie("storeManage_storeID" + this.main.LoggedUserInfo.role_id.toString());
    sessionConfig.clearCookie("storeManage_sellerid" + this.main.LoggedUserInfo.role_id.toString());
    this.main.LoggedUserInfo = JSON.parse(sessionConfig.getSessionLoginUser());
    this.PlatformSetting =
      this.PlatformSetting == null
        ? this.main.platform_setting
        : this.PlatformSetting;
    this.business_model = this.PlatformSetting.business_model;

    this.isAddSellerShow =
      this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 6
            ? true
            : false;
    this.isSellerStatusShow =
      this.business_model == 1
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : false;
    this.isSellerFilterType = this.business_model == 1 ? true : false;
    this.isDemoSellerShow =
      this.business_model == 1 ? true : this.business_model == 2 ? true : false;
    this.isEditDeleteCreatePencil =
      this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
        ? true
        : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
          ? true
          : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 6
            ? true
            : false;
    this.hidePDF = this.business_model == 3 ? false : true;
    this.review_rating_module = this.generalSetting.review_rating_module;
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;
    var preUrl = localStorage.getItem("Previous_URL");
    let previousURL = preUrl.slice(0, preUrl.lastIndexOf("/"));
    if (previousURL == "/sellers") {
      if (localStorage.getItem("storeSearchQuery") != null && localStorage.getItem("storeSearchQuery") != undefined) {
        filterObject = JSON.parse(localStorage.getItem("storeSearchQuery"));
        localStorage.removeItem("storeSearchQuery");
      }
    }

    if (filterObject) {
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.searchbox.nativeElement.value = this.search;
    }

    this.getSellerList(this.page);
    fromEvent(this.searchbox.nativeElement, 'keyup')
      .pipe(
        filter(() => !window.getSelection().toString()), // Check if there is no selected text
        filter(Boolean),
        debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getSellerList(1);
        })
      )
      .subscribe();
    this.getHelpDetails()

  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getSellerList(1);
    }
  }

  UserTypeChange(value) {
    this.selectedUserType = value;
    this.page = 1;
    this.getSellerList(this.page);
  }

  getSellerList(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    this.page = page;
    var data: any;
    if (this.selectedSellerItem.value != 5) {
      data = {
        is_verified:
          this.selectedSellerItem.value == 1
            ? "0"
            : this.selectedSellerItem.value == 2
              ? 1
              : this.selectedSellerItem.value == 3
                ? 2
                : 3,
        khata_user: 0,
        page: this.page,
        search_query: search,
        sort_field: this.sortKey,
        sort_type: this.isOrderBy ? 1 : 2,
      };
      if (this.selectedUserType != 1) {
        data.demo_user = this.selectedUserType == 2 ? 1 : (this.selectedUserType == 3 ? 0 : 1)
      }
    } else {
      data = {
        is_deleted: 1,
        page: this.page,
        search_query: search,
      };
    }

    this.sellerService.getSellerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (this.selectedSellerItem.value == 1) {
            this.sellerURL = "sellerApplied";
            this.sellerFlag = "SELLER_APPLIED";
            this.sellerFlagIndex = 1;
          } else if (this.selectedSellerItem.value == 2) {
            this.sellerURL = "sellerInprogress";
            this.sellerFlag = "SELLER_INPROGRESS";
            this.sellerFlagIndex = 2;
          } else if (this.selectedSellerItem.value == 3) {
            this.sellerURL = "sellerApproved";
            this.sellerFlag = "SELLER_APPROVED";
            this.sellerFlagIndex = 3;
          } else if (this.selectedSellerItem.value == 4) {
            this.sellerURL = "sellerRejected";
            this.sellerFlag = "SELLER_REJECTED";
            this.sellerFlagIndex = 4;
          } else if (this.selectedSellerItem.value == 5) {
            this.sellerURL = "sellerDelete";
            this.sellerFlag = "SELLER_DELETED";
            this.sellerFlagIndex = 5;
          }
          this.sellerList = response.data;
          this.sellerList = this.selectedUserType == 2 ? this.sellerList.filter(x => x.demo_user == 1) :
            this.selectedUserType == 3 ? this.sellerList.filter(x => x.demo_user == 0) : this.sellerList;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          if (this.selectedSellerItem.value == 1) {
            this.sellerURL = "sellerApplied";
            this.sellerFlag = "SELLER_APPLIED";
            this.sellerFlagIndex = 1;
          } else if (this.selectedSellerItem.value == 2) {
            this.sellerURL = "sellerInprogress";
            this.sellerFlag = "SELLER_INPROGRESS";
            this.sellerFlagIndex = 2;
          } else if (this.selectedSellerItem.value == 3) {
            this.sellerURL = "sellerApproved";
            this.sellerFlag = "SELLER_APPROVED";
            this.sellerFlagIndex = 3;
          } else if (this.selectedSellerItem.value == 4) {
            this.sellerURL = "sellerRejected";
            this.sellerFlag = "SELLER_REJECTED";
            this.sellerFlagIndex = 4;
          } else if (this.selectedSellerItem.value == 5) {
            this.sellerURL = "sellerDelete";
            this.sellerFlag = "SELLER_DELETED";
            this.sellerFlagIndex = 5;
          }
          this.no_data = true;
          this.count = 0;
          this.sellerList = [];
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


  changeSellerType(item) {
    this.selectedSellerItem = item;
    this.page = 1;
    this.getSellerList(this.page);
  }

  restoreSeller(id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("RESTORE_SELLER_RECORD"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.restoreSellerConfirm(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  deleteSeller(id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_SELLER_RECORD"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.restoreSellerConfirm(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  restoreSellerConfirm(sellerid) {
    var data = {
      user_id: this.adminDetails.user_id,
      seller_id: sellerid,
    };
    this.storeService.deleteSeller(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.getSellerList(this.page);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
      },
      complete: () => {
        ;
      },
    });
  }

  downloadPDFForBannerAndPoster(storeId, value) {
    var data = {};
    switch (value) {
      case "Banner":
        {
          data = {
            store_id: storeId,
          };
        }
        break;
      case "Poster":
        {
          data = {
            store_id: storeId,
            poster: 1,
          };
        }
        break;
    }
    this.getDownloadPDFForBannerAndPoster(data);
  }

  getDownloadPDFForBannerAndPoster(data) {
    this.storeService.getPosterOrBannerPdfUrl(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var fileName = response.data.substr(
            response.data.lastIndexOf("/") + 1
          );
          var xhr = new XMLHttpRequest();
          xhr.open("GET", response.data, true);
          xhr.responseType = "blob";

          xhr.onprogress = function (event) {
            if (event.lengthComputable) {
              var percentComplete = (event.loaded / event.total) * 100;
            }
          };

          xhr.onload = function (event) {
            if (this.status == 200) {
              var aelement = document.createElement("a");
              document.body.appendChild(aelement);
              var url = window.URL.createObjectURL(this.response);
              aelement.href = url;
              aelement.download = fileName;
              aelement.click();
              document.body.removeChild(aelement);
            }
          };
          xhr.send();
        } else {
          this.toastr.error(response.message);
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
  /** Share store management store link url */
  shareUrl(sellerDetail) {
    var Url = this.generalSetting.website_url;
    this.UrL =
      Url + "/store/" + sellerDetail.store_slug + "/" + sellerDetail.store_id;
    this.whatsappURL =
      "https://api.whatsapp.com/send/?phone&text=" + this.UrL + "&app_absent=0";
    const modalRef = this.modalService.open(shareURLComponent);
    modalRef.componentInstance.UrL = this.UrL;
    modalRef.componentInstance.whatsappURL = this.whatsappURL;
  }

  editSellerDetail(sellerid, storeID, beHalfStore) {
    var obj = {
      page: this.page,
      search: this.search,
      selectedUserType: this.selectedUserType,
      selectedSellerItem: this.selectedSellerItem,
      sortKey: this.sortKey,
      isOrderBy: this.isOrderBy,
    }
    localStorage.setItem('storeSearchQuery', JSON.stringify(obj));
    var sessionConfig = this.appComponent.sessionConfig();
    sessionConfig.clearCookie("storeManage_Behalf" + this.main.LoggedUserInfo.role_id.toString());
    sessionConfig.clearCookie("storeManage_storeID" + this.main.LoggedUserInfo.role_id.toString());
    sessionConfig.clearCookie("storeManage_sellerid" + this.main.LoggedUserInfo.role_id.toString());
    sessionConfig.encryptIdValue(
      sellerid.toString(),
      "storeManage_sellerid" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    sessionConfig.encryptIdValue(
      storeID.toString(),
      "storeManage_storeID" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    sessionConfig.encryptIdValue(
      beHalfStore.toString(),
      "storeManage_Behalf" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/sellers/edit"]);
  }

  readReview(stoerId: any) {
    var data = {
      store_id: stoerId,
      user_id: "0",
      business_hours: "0",
      is_order_settings: "0",
      is_reviews: "1",
      is_cuisine: "0",
      store_business_hours: "0"

    };
    this.storeService.getStorePageDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.storeDetail = response.data
          const modalRef = this.modalService.open(ReveiwRatingComponent, {
            size: 'lg',
            centered: true,
          });
          modalRef.componentInstance.review = this.storeDetail.reviews;
          modalRef.componentInstance.store = this.storeDetail.store;
          modalRef.componentInstance.forStore = true;
        }

      },
    });
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.getSellerList(this.page);
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '77'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '11'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '11'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }
}