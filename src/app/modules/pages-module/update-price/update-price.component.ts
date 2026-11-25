import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { UpdatePriceService } from "src/app/services/update-price.service";
import { environment } from "src/environments/environment";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import * as $ from "jquery";
import { ItemService } from "src/app/services/item.service";
import Swal from "sweetalert2";
import { CommonService } from "src/app/services/common.service";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { SpinnerService } from "src/app/services/custom/spinner.service";

@Component({
  selector: "app-update-price",
  templateUrl: "./update-price.component.html",
  styleUrls: ["./update-price.component.scss"],
})
export class UpdatePriceComponent implements OnInit {
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef
  main: any = {};
  category_grid: any = [];
  category_id = 0;
  table_size = environment.tableSize;
  page: number = 1;
  count: number = 0;
  search: any;
  errrval: any = [];
  updatedItemList: any = [];
  btnval = false;
  searchText: any;
  category_customer_icon: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  storeLabel: any;
  no_data = true;
  totalCount: any;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  loginStore = JSON.parse(localStorage.getItem("loginUserStore"));
  display_note: boolean = false;
  constructor(
    public translate: TranslateService,
    private appComponent: AppComponent,
    private updatePriceService: UpdatePriceService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private itemService: ItemService,
    public commonService: CommonService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private router: Router,
    private spinner: SpinnerService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.category_customer_icon =
      this.main.LoggedUserStoreInfo.category_customer_icon;
    this.storeLabel = this.general_setting.store_label;
    var filterObject;
    this.page = 1;
    this.search = "";
    this.count = 0;

    if (filterObject) {
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    this.getItemsList(this.page);
    var itemApproval: any = this.general_setting.item_approval_shop_type.split(',');
    var is_available_cat = itemApproval.filter((x) => x == this.loginStore.category_id);
    if (is_available_cat != '') {
      this.display_note = true
    }

    fromEvent(this.searchbox.nativeElement, 'keyup')
      .pipe(
        filter(() => !window.getSelection().toString()), // Check if there is no selected text
        filter(Boolean),
        debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getItemsList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }


  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getItemsList(1);
    }
  }

  getItemsList(page: any): void {
    this.spinner.show();
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;

    var data: any = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
      category_id: this.category_id,
      page: this.page,
      search_type: 1,
      user_id: this.main.LoggedUserInfo.user_id,
      limit: this.table_size,
      is_item_variant_level: 1
    };
    if (search) {
      data.search_query = search
    }
    this.updatePriceService.getItemsList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.category_grid = [];
          var tempData = response.data;
          this.totalCount = response.count
          for (var i = 0; i < tempData.length; i++) {
            if (tempData[i].item_variants.length == 1) {
              var found: any;
              if (tempData[i].item_variants[0].item_image_ids) {
                var img = tempData[i].item_variants[0].item_image_ids.split(',');
                found = tempData[i].item_images.filter((image: any) => image.item_image_id == img[0])[0];
              }
              var item:any = {
                item_id: tempData[i].item_id,
                category_id: tempData[i].sub_category_id,
                sub_category_id: tempData[i].category_name,
                category_name: tempData[i].sub_category_name,
                item_name: tempData[i].item_name,
                brand_name: tempData[i].brand_name,
                item_image: found?.image,
                item_price: Number(
                  tempData[i].item_variants[0].item_price
                ),
                Unit_text:
                  parseFloat(
                    tempData[i].item_variants[0].unit_quantity
                  ) +
                  " " +
                  (tempData[i].item_variants[0].unit_name == null
                    ? ""
                    : tempData[i].item_variants[0].unit_name),
                discounted_price: Number(
                  tempData[i].item_variants[0].discounted_price
                ),
                item_variants_id:
                  tempData[i].item_variants[0].item_variants_id,
                unit_name:
                  tempData[i].item_variants[0].unit_name == null
                    ? ""
                    : tempData[i].item_variants[0].unit_name,
                unit_quantity: parseFloat(
                  tempData[i].item_variants[0].unit_quantity
                ),
                packaging_name: tempData[i].item_variants[0].packaging_name == null ? "" : tempData[i].item_variants[0].packaging_name

              };
              var imageObject: any = [];
              if (found) {
                let obj: any = {
                  image: found.image,
                  thumbImage: found.image,
                  type: found.type
                }
                imageObject.push(obj)
              }
              item.ImageObject = imageObject;
              console.log(item)
              this.category_grid.push(item);
            } else {
              for (
                var v = 0;
                v < tempData[i].item_variants.length;
                v++
              ) {
                var found: any;
                if (tempData[i].item_variants[v].item_image_ids) {
                  var img = tempData[i].item_variants[v].item_image_ids.split(',');
                  found = tempData[i].item_images.filter((image: any) => image.item_image_id == img[0])[0];
                }
                var item:any = {
                  item_id: tempData[i].item_id,
                  category_id: tempData[i].sub_category_id,
                  sub_category_id: tempData[i].category_name,
                  category_name: tempData[i].sub_category_name,
                  item_name: tempData[i].item_name,
                  brand_name: tempData[i].brand_name,
                  item_image: found.image,
                  item_price: Number(
                    tempData[i].item_variants[v].item_price
                  ),
                  Unit_text:
                    parseFloat(
                      tempData[i].item_variants[0].unit_quantity
                    ) +
                    " " +
                    (tempData[i].item_variants[0].unit_name == null
                      ? ""
                      : tempData[i].item_variants[0].unit_name),
                  discounted_price: Number(
                    tempData[i].item_variants[v].discounted_price
                  ),
                  item_variants_id:
                    tempData[i].item_variants[v].item_variants_id,
                  unit_name:
                    tempData[i].item_variants[v].unit_name == null
                      ? ""
                      : tempData[i].item_variants[v].unit_name,
                  unit_quantity: parseFloat(
                    tempData[i].item_variants[v].unit_quantity
                  ),
                  packaging_name: tempData[i].item_variants[v].packaging_name == null ? "" : tempData[i].item_variants[v].packaging_name

                };
                var imageObject: any = [];
                if (found) {
                  let obj: any = {
                    image: found.image,
                    thumbImage: found.image,
                    type: found.type
                  }
                  imageObject.push(obj)
                }
                item.ImageObject = imageObject;
                console.log(item)
                this.category_grid.push(item);
              }
            }
          }
          this.no_data = false;

        } else {
          this.toastr.error(response.message);
          this.no_data = true;

        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  sideMenuClose() {
    var sidebarOpne: any = true;
    sidebarOpne = localStorage.getItem('sidebarOpen');
    return sidebarOpne;
  }

  /** update item data  */
  updateItem(itemVarientId: any, item_id: any) {
    this.errrval = [];
    var updatedPrice: any =
      $("#price-" + itemVarientId).val() != "NaN"
        ? $("#price-" + itemVarientId).val()
        : "0.00";
    var updatedDiscountedPrice: any = $(
      "#discountedPrice-" + itemVarientId
    ).val();
    var oldPrice: any = $("#price-" + itemVarientId).val();
    var oldDiscountedPrice: any = $("#discountedPrice-" + itemVarientId).val();

    updatedPrice = Number(updatedPrice).toFixed(2);
    updatedDiscountedPrice = Number(updatedDiscountedPrice).toFixed(2);
    oldPrice = Number(oldPrice).toFixed(2);
    oldDiscountedPrice = Number(oldDiscountedPrice).toFixed(2);

    var ItemDetail: any = this.category_grid.filter(
      (elem) => elem.item_variants_id == itemVarientId
    )[0];
    if (updatedDiscountedPrice > updatedPrice) {
      $("#price-" + itemVarientId).val(oldPrice);
      $("#discountedPrice-" + itemVarientId).val(oldDiscountedPrice);
      ItemDetail.item_price = oldPrice;
      ItemDetail.discounted_price = oldDiscountedPrice;
      this.errrval.push(itemVarientId);
      this.toastr.error(
        this.translate.instant("DISCOUNTED_PRICE_CAN_NOT_GREATER_THEN_PRICE")
      );
      this.cdr.detectChanges();
      return false;
    }

    if (updatedPrice < updatedDiscountedPrice) {
      $("#price-" + itemVarientId).val(oldPrice);
      $("#discountedPrice-" + itemVarientId).val(oldDiscountedPrice);
      ItemDetail.item_price = oldPrice;
      this.errrval.push(itemVarientId);
      this.toastr.error(
        this.translate.instant("DISCOUNTED_PRICE_CAN_NOT_GREATER_THEN_PRICE")
      );
      return false;
    }

    if (updatedPrice == "NaN") {
      $("#price-" + itemVarientId).val(oldPrice);
      ItemDetail.item_price = oldPrice;
      this.toastr.error(this.translate.instant("PRICE_CAN_NOT_BLANK"));
      return false;
    }

    if (updatedPrice == 0) {
      $("#price-" + itemVarientId).val(oldPrice);
      ItemDetail.item_price = oldPrice;
      this.toastr.error(this.translate.instant("PRICE_CAN_NOT_ZERO"));
      return false;
    }

    if (updatedDiscountedPrice == 0) {
      $("#discountedPrice-" + itemVarientId).val(oldDiscountedPrice);
      ItemDetail.discounted_price = oldDiscountedPrice;
      this.toastr.error(this.translate.instant("DIS_PRICE_CAN_NOT_ZERO"));
      return false;
    }

    if (
      updatedPrice != oldPrice ||
      updatedDiscountedPrice != oldDiscountedPrice
    ) {
      var obj = this.updatedItemList.filter((obj) => {
        return obj.item_variants_id == itemVarientId;
      });

      var inArray = jQuery.inArray(obj[0], this.updatedItemList);

      if (
        inArray == -1 ||
        obj[0].item_price != updatedPrice ||
        obj[0].discounted_price != updatedDiscountedPrice
      ) {
        if (inArray != -1) {
          this.updatedItemList.pop(inArray);
        }
        var item = {
          item_id: item_id,
          item_variants_id: itemVarientId,
          item_price: updatedPrice,
          discounted_price: updatedDiscountedPrice,
        };
        this.updatedItemList.push(item);
      }
    } else if (
      updatedPrice == oldPrice &&
      updatedDiscountedPrice == oldDiscountedPrice
    ) {
      this.btnval = true;
      var obj = this.updatedItemList.filter((obj) => {
        return obj.item_variants_id == itemVarientId;
      });
      var inArray = jQuery.inArray(obj[0], this.updatedItemList);
      if (inArray != -1) {
        this.updatedItemList.pop(inArray);
      }
      var item = {
        item_id: item_id,
        item_variants_id: itemVarientId,
        item_price: updatedPrice,
        discounted_price: updatedDiscountedPrice,
      };
      this.updatedItemList.push(item);
    }
  }

  updated = false;
  /** Update current changes */
  UpdateAndNext() {
    if (this.errrval.length > 0) {
      this.toastr.error(
        this.translate.instant("PLEASE_CHECK_YOUR_MRP_AND_DISCOUNTED_PRICE")
      );
      return false;
    }

    if (this.updatedItemList?.length > 0) {
      var data = {
        store_id: this.main.LoggedUserStoreInfo.store_id,
        user_id: this.main.LoggedUserInfo.user_id,
        item_prices: JSON.stringify(this.updatedItemList),
        source: "web",
      };

      this.updatePriceService.updateStoreItemPrices(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.getItemsList(this.page);
            this.updated = true;
            this.toastr.success(response.message);
          } else {
            this.toastr.error(response.message);
            this.updated = false;
          }
        },
        error: (error) => { },
        complete: () => { },
      });
    }

  }

  sort(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
  }
  openExcelsheetUploadModel(item) {

  }

  download() {
    const data = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
      user_id: this.main.LoggedUserInfo.user_id
    }

    Swal.fire({
      title: this.translate.instant("EXCEL_FILE"),
      text: this.translate.instant("WANT_TO_DOWNLOAD_EXCELFILE"),
      icon: "info",
      showCancelButton: true,
      confirmButtonText: this.translate.instant("YES"),
      cancelButtonText: this.translate.instant("NO_BUTTON"),
    }).then((result) => {
      if (result?.isConfirmed) {
        this.itemService.exportVariants(data).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.toastr.success(this.translate.instant(response.message));
            } else {
              this.toastr.error(this.translate.instant(response.message));
            }
          },
          error: (error) => {
          },
          complete: () => { },
        });
      }
      else {
        //cancel click
      }
    });
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
      data.module_key = '116'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '116'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '116'
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
