import { SpinnerService } from "src/app/services/custom/spinner.service";
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap, } from "rxjs";
import { Router } from "@angular/router";
import { OfferService } from "src/app/services/offer.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { customerDetailComponent } from "../model/customer-details/customer-details.component";
import Swal from "sweetalert2";
import { environment } from "src/environments/environment";
import * as $ from "jquery";
import { offerAddComponent } from "../model/offer-add/offer-add.component";
import { CommonService } from "src/app/services/common.service";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { OfferDetailComponent } from "../model/offer-detail/offer-detail.component";

@Component({
  selector: 'app-manage-offer',
  templateUrl: './manage-offer.component.html',
  styleUrls: ['./manage-offer.component.scss']
})
export class ManageOfferComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search: any;
  offer_grid_data: [];
  no_data = true;
  main: any;
  storeOfferType = 1;
  seller_details = JSON.parse(localStorage.getItem('loginUserStore'));
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  platform_setting = JSON.parse(localStorage.getItem('_platform_setting'));
  delivery_model = this.platform_setting.delivery_model;
  offer_settings = this.platform_setting.offer_settings;
  business_model = this.platform_setting.business_model;
  is_delivery_model_platform = true;
  is_offer_setting_platform = true;
  is_offer_show = this.general_setting.offers_module;
  css_button_business_font = this.general_setting.css_button_business_default;
  css_button_business_alternative = this.general_setting.css_button_business_alternative;
  show_price_same_font = this.general_setting.show_price_same_font
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  is_super_admin: boolean;
  offer_setting_show: boolean;
  default_offer_type: any = [];
  sub_offer_types: any = [];
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private offerService: OfferService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private spinner: SpinnerService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private modalService: NgbModal,
    public commonService: CommonService,
    private _helpService: BannerService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    $('<style>.panel-body.revenue-block.ng-star-inserted.backcolorwhite { border: 1px solid ' + this.css_button_business_font + ' !important;}</style>').appendTo('body');
    $('<style>.panel-body.revenue-block.ng-star-inserted.backcolor { border: 1px solid ' + this.css_button_business_alternative + ' !important;background-color: ' + this.css_button_business_alternative + '!important;}</style > ').appendTo('body');
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin && this.offer_settings == 1) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.cryptoService.clearCookie('add_offerId' + this.main.LoggedUserInfo.role_id.toString());
    this.cryptoService.clearCookie('add_subofferId' + this.main.LoggedUserInfo.role_id.toString());
    this.platform_setting = this.platform_setting == null ? this.main.platform_setting : this.platform_setting;
    if (Number(this.is_offer_show) == 1) {
      if (this.delivery_model != 1) {
        this.is_delivery_model_platform = false;
      }
      if (this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 1) {
        if (Number(this.offer_settings) == 2) {
          this.offer_setting_show = (this.business_model == 1 && (this.main.LoggedUserInfo.role_id == 6)) ? true : (this.business_model == 2 && (this.main.LoggedUserInfo.role_id == 1)) ? true : (this.business_model == 3 && (this.main.LoggedUserInfo.role_id == 1)) ? true : false;
        }
        else {
          this.offer_setting_show = false;
        }
      }
      else {
        if (this.offer_settings != 1) {
          this.is_offer_setting_platform = false;
        }
      }
    }

    this.is_super_admin = false;
    if (this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 1) {
      this.is_super_admin = true;
    }
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;

    if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }
    if (filterObject) {
      this.storeOfferType = filterObject.storeoffertype
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    this.getOfferList(this.page);
    this.getDefaultOfferTypes()
    // server-side search
    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.getOfferList(1);
          })
        )
        .subscribe();
    this.getHelpDetails();
  }

  async getOfferList(page) {
    this.spinner.show();
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data = {}
    data = {
      page: this.page,
      search_query: search,
      limit: this.table_size,
      store_id: this.seller_details.store_id,
      offer_type: this.storeOfferType
    };
    await this.offerService.getStoreOffers(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.offer_grid_data = response.data;
          this.no_data = false;
          this.count = response.count;

        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.offer_grid_data = [];
        }
      },
      error: (error) => {
        // handle error
        this.spinner.hide();
      },
      complete: () => {
        ;
        this.spinner.hide();
      },
    });
  }

  async getDefaultOfferTypes() {
    this.spinner.show();
    let data = {
    };
    await this.offerService.getDefaultOfferType(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.default_offer_type = response.data
          this.getSubOfferTypes()
        } else {
          this.default_offer_type = []
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        this.spinner.hide();
        this.toastr.error(error);
      },
      complete: () => {
        this.spinner.hide();
        ;
      },
    });
  }

  async getSubOfferTypes() {
    this.spinner.show();
    if (this.default_offer_type.length > 0) {
      this.default_offer_type.forEach(async element => {
        let data = {
          default_offer_id: element['default_offer_id']
        };
        await this.offerService.getDefaultOfferType(data).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              response.data.forEach(element1 => {
                var suboffertype = {
                  parentId: element['default_offer_id'],
                  parentOfferName: element['offer_name'],
                  default_offer_id: element1['default_offer_id'],
                  offer_name: element1['offer_name'],
                  offer_info: element1['offer_info']
                };
                this.sub_offer_types.push(suboffertype);
              });

            } else {
              this.toastr.error(response.message);
            }
          },
          error: (error) => {
            this.spinner.hide();
            this.toastr.error(error);
          },
          complete: () => {
            this.spinner.hide();
            ;
          },
        });
      });
    }
  }

  onSearchChange(value) {
    this.search = value;
    this.page = 1;
    this.getOfferList(1);
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getOfferList(1);
    }
  }

  /** Open offerAddComponent modal */
  addOffer() {
    const modalRef = this.modalService.open(offerAddComponent, {
      size: "xl",
    });
    modalRef.componentInstance.isSuperAdmin = this.is_super_admin;
    modalRef.componentInstance.DefaultOfferType = this.default_offer_type
    modalRef.componentInstance.SubOfferTypes = this.sub_offer_types
    modalRef.componentInstance.isDeliveryModelPlatForm = this.is_delivery_model_platform
    modalRef.componentInstance.main = this.main;
  }

  changeType() {
    this.search = this.search;
    this.page = 1;
    this.getOfferList(this.page);
  }

  editOffer(cid) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      storeoffertype: this.storeOfferType
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.clearCookie("seller_offerId" + this.main.LoggedUserInfo.role_id.toString());
    this.cryptoService.encryptIdValue(
      cid.toString(),
      "seller_offerId" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/manage-offer/edit/"]);
  }

  openOfferDetailsModel(offerList: any) {
    const modalRef = this.modalService.open(OfferDetailComponent, {
      size: "lg",
      centered: true,
    });
    modalRef.componentInstance.OfferDetail = offerList;

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
      data.module_key = '122'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '122'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '122'
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

  deleteOffer(offerId) {
    Swal.fire({
      title: this.translate.instant('ARE_YOU_SURE'),
      text: this.translate.instant("DELETE"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteOfferConfirm(offerId);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  deleteOfferConfirm(id) {
    this.spinner.show();
    let data = {
      user_id: this.main.LoggedUserInfo.user_id,
      offer_id: id
    };
    this.offerService.deleteStoreOffer(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(response.message);
          this.getOfferList(this.page);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        this.spinner.hide();
        this.toastr.error(error);
      },
      complete: () => {
        this.spinner.hide();
        ;
      },
    });
  }

  ngOnDestroy(): void {
    $('<style>.panel-body.revenue-block.ng-star-inserted.backcolorwhite { border: 1px solid ' + this.css_button_business_font + ' !important;}</style>').appendTo('body');
    $('<style>.panel-body.revenue-block.ng-star-inserted.backcolor { border: 1px solid ' + this.css_button_business_alternative + ' !important;background-color: ' + this.css_button_business_alternative + '!important;}</style > ').appendTo('body');
  }
}