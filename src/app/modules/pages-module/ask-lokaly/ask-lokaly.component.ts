import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "src/app/services/common.service";
import { BannerService } from "src/app/services/configuration/banner.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { ToastrService } from "ngx-toastr";
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from "rxjs";

@Component({
  selector: "app-ask-lokaly",
  templateUrl: "./ask-lokaly.component.html",
  styleUrls: ["./ask-lokaly.component.scss"],
})
export class AskLokalyComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  search: any;
  helpDetails: any;
  page: any;
  no_data = true;
  view_list: any = [];
  view_count: any;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  count: number = 0;
  language_id = localStorage.getItem("select_lan_id") || "1";
  is_duplicate_view: any = false;
  main: any;
  // tableSize = environment.tableSize;
  tableSize = 10;
  tableSizes: any = [3, 6, 9, 12];
  id: any;
  selectedOrderItem: any;

  orderStatusList = [
    { label: 'All', value: 1 },
    { label: 'Available', value: 2 },
    { label: 'Not Available', value: 3 },
  ];
  ChangeOrderStatus(item: any) {
    console.log("45", item);
    // this.selectedOrderItem = item;
    console.log("this.selectedOrderItem", this.selectedOrderItem);
    this.getLokalyList(this.page);
  }

  constructor(
    public commonService: CommonService,
    public translate: TranslateService,
    private cryptoService: CryptoService,
    private _helpService: BannerService,
    private appComponent: AppComponent,
    private modalService: NgbModal,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    this.cryptoService.clearCookie("askLokalyId" + this.main.LoggedUserInfo.role_id.toString());
    if (!this.generalSetting.visualization_module) {
      this.router.navigate(['/dashboard']);
    }
    var superAdmin = this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin || !this.generalSetting.visualization_module) {
      this.router.navigate(['/dashboard']);
    }

    this.getHelpDetails();
    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getLokalyList(this.page);
        })
      ).subscribe();
    var filterObject: any;
    this.page = 1;
    this.search = "";
    this.count = 0;
    if (
      localStorage.getItem("seller_Order_obj") != null &&
      localStorage.getItem("seller_Order_obj") != undefined
    ) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }
    if (filterObject) {
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.tableSize = filterObject.limit;
      this.searchbox.nativeElement.value = this.search;
      this.selectedOrderItem = filterObject.query;
    } else {
      this.selectedOrderItem = this.orderStatusList[0].label;
    }
    console.log("filterObject", filterObject)
    this.getLokalyList(this.page);
  }

  getLokalyList(page) {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;

    const data = {
      search_string: search,
      page: this.page,
      sort_by: 'updated_on',
      sort_direction: 'desc',
      size: this.tableSize,
      query_status: this.selectedOrderItem
    };
    this.commonService.askLokalyList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.no_data = false;
          this.view_list = response.data.items;
          this.view_count = response.data.total;
        } else {
          this.no_data = true;
          this.count = 0;
          this.view_list = [];
        }

      }
    })
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id,
    };
    if (
      this.main.LoggedUserInfo.role_id == 1 ||
      this.main.LoggedUserInfo.role_id == 6 ||
      this.main.LoggedUserInfo.role_id == 2
    ) {
      data.module_key = "148";
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => { },
      complete: () => { },
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

  addLokaly() {
    // localStorage.removeItem("isDuplicateView")
    this.router.navigate(["/ask-lokaly/add"]);
  }

  //edit by id
  editView(id) {
    console.log("id", id);
    localStorage.removeItem("isDuplicateView")
    //localStorage.setItem("selected_orderItem_status", JSON.stringify(this.selectedOrderItem));
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.tableSize,
      query: this.selectedOrderItem
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(id.toString(),
      "askLokalyId" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/ask-lokaly/edit"]);
  }

  // for delete 
  deleteViewList(id) {
    Swal.fire({
      title: this.translate.instant("Are you sure?"),
      text: this.translate.instant("Delete Lokaly Details"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("Cancel"),
    }).then((result) => {
      if (result.value) {
        this.ConfirmDelete(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  ConfirmDelete(id) {
    const data = {
      question_id: id,
    };
    this.commonService.DeleteAskLokalyList(data, id).subscribe({
      next: (response: any) => {
        if (response.status == true) {
          this.toastr.success(this.translate.instant(response.response));
          this.getLokalyList(this.page);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  clearSearch() {
    if (this.search !== "") {
      this.search = "";
      this.getLokalyList(this.page);
    }
  }

  // GetReasonTypeList(page): void {
  //   var search = "";
  //   if (this.search != "" && this.search != undefined && this.search != null) {
  //     search = this.search;
  //   }

  //   this.page = page;
  //   var data = {};

  //   if (this.selectedOrderItem?.value == 0) {
  //     data = {
  //       page: this.page,
  //       search_query: this.search,
  //       sort_field: this.sortKey,
  //       sort_type: this.isOrderBy ? 1 : 2,
  //     }
  //   }

  //   if (this.selectedOrderItem?.value <= 9 && this.selectedOrderItem?.value > 0) {
  //     data = {
  //       reason_type: this.selectedOrderItem?.value,
  //       page: this.page,
  //       search_query: this.search,
  //       limit: this.table_size,
  //     };
  //   }

  //get list
}
