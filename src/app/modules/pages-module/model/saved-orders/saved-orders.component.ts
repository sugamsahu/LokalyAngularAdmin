import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";

import { OrderService } from 'src/app/services/order.service';
import { Subject, debounceTime, distinctUntilChanged, filter, fromEvent, takeUntil, tap } from "rxjs";
import { environment } from 'src/environments/environment';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-saved-orders',
  templateUrl: './saved-orders.component.html',
  styleUrls: ['./saved-orders.component.scss']
})
export class SavedOrdersComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  saved_order: any = [];
  private destroy$ = new Subject();
  search: any;
  page: number = 1;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  tableSize: number = environment.tableSize;
  count: number = 0;
  no_data = true;
  style_obj_saved_orders: any
  show_price_same_font: any;
  amount_seperator: any;

  constructor(public modal: NgbActiveModal,
    public translate: TranslateService,
    private order_service: OrderService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public commonService: CommonService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.style_obj_saved_orders = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.view_saved_orders(1);
    this.show_price_same_font = this.generalSetting.show_price_same_font;
    this.amount_seperator = this.generalSetting?.amount_seperator;
    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.view_saved_orders(1);
          })
        )
        .subscribe();
    this.cdr.detectChanges();
  }

  // View saved orders
  async view_saved_orders(page) {
    this.page = page;
    var data = {
      store_id: this.sellerDetails.store_id,
      search_query: this.search,
      page: this.page,
      limit: this.tableSize,
    };
    await this.order_service.getPOSSavedOrder(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.saved_order = response.data;
          this.count = this.saved_order.length;
          this.no_data = false;
        } else {
          this.no_data = true;
          this.saved_order = [];
          this.count = 0;
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  clearSearch() {
    if (this.search) {
      this.search = undefined;
      this.view_saved_orders(1);
    }
  }

  //image
  getInitials(name) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 35;
    canvas.height = 35;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    context.fillStyle = "#476ce8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "18px Arial";
    context.fillStyle = "#FFFFFF";
    context.textAlign = "center";
    var nameArray = name.split(" ");
    var initials = "";
    initials = initials + nameArray[0][0];
    initials = initials == "undefined" ? "U" : initials;
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 13, 22);
    } else {
      context.fillText(initials.toUpperCase(), 13, 22);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }

  // Delete saved orders
  deleteTagMaster(cart_group_id, user_id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_RECORD"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteTagMasterConfirm(cart_group_id, user_id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  deleteTagMasterConfirm(cart_group_id, user_id) {
    var data = {
      user_id: user_id,
      cart_group_id: cart_group_id,
      cart_type: 3,
      store_id: this.sellerDetails.store_id,
    }
    this.order_service.deletePOSSavedOrder(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(response.message);
          this.view_saved_orders(1);
        } else {
          this.toastr.error(response.message);
          this.view_saved_orders(1);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  vieworderdetails(item) {
    var is_cart = true;
    localStorage.setItem('is_cart', JSON.stringify(is_cart));
    localStorage.setItem('customerdetails', JSON.stringify(item.customer))
    localStorage.setItem('cart_group_id', item.cart_group_id)
    this.modal.dismiss();
    this.router.navigate(["/pos/add-pos/"]);
  }
}
