import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { environment } from "src/environments/environment";
import { ManageUserService } from "src/app/services/manage-user.service";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-manage-user",
  templateUrl: "./manage-user.component.html",
  styleUrls: ["./manage-user.component.scss"],
})
export class ManageUserComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search: any;
  user_list: [];
  no_data = true;
  main: any;
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  business_model = this.platform_setting.business_model;

  show_price_same_font = this.general_setting.show_price_same_font;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  is_super_admin: boolean;
  delivery_model: any;
  deliveryboy_label = this.general_setting.deliveryboy_label;
  driver_module = this.general_setting.driver_module;
  store_label = this.general_setting.store_label;
  pos = this.general_setting.pos_module;
  dinein_module = this.general_setting.dinein_module;
  picker = this.general_setting.picker_module;

  is_delivery_model_platform: any;
  userlist: any = [];
  selectedstoremanager: any;
  isstoremanager: any;
  roleid: any;
  isShowDeliveryBoy: boolean;
  pos_allowed: any;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  ChangeManager(item) {
    this.selectedstoremanager = item;
    this.isstoremanager = item.value;

    if (this.isstoremanager == 1) {
      this.roleid = 5;
    } else if (this.isstoremanager == 2) {
      this.roleid = 3;
    } else {
      if (this.isstoremanager == 3) {
        this.roleid = 7;
      }
      if (this.isstoremanager == 4) {
        this.roleid = 8;
      }
      if (this.isstoremanager == 5) {
        this.roleid = 9;
      }
      if (this.isstoremanager == 6) {
        this.roleid = 10;
      }
    }

    this.page = 1;
    this.UserList(this.page);
  }

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private ManageUserService: ManageUserService,
    private appComponent: AppComponent,
    private router: Router,
    private modalService: NgbModal,
    private _helpService: BannerService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin && this.platform_setting.delivery_model == 2) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.platform_setting =
      this.platform_setting == null
        ? this.main.platform_setting
        : this.platform_setting;
    this.delivery_model = this.platform_setting.delivery_model;
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());

    this.is_super_admin = false;
    this.isShowDeliveryBoy = false;

    if (this.delivery_model == 2 || this.delivery_model == 4) {
      if (
        this.main.LoggedUserInfo.role_id == 6 ||
        this.main.LoggedUserInfo.role_id == 1
      ) {
        this.is_super_admin = true;
      }

      if (this.is_super_admin == true) {
        this.isShowDeliveryBoy =
          this.business_model == 1 && this.main.LoggedUserInfo.role_id == 6
            ? true
            : this.business_model == 2 && this.main.LoggedUserInfo.role_id == 1
              ? true
              : this.business_model == 3 && this.main.LoggedUserInfo.role_id == 1
                ? true
                : false;

        if (this.isShowDeliveryBoy == false) {
          this.router.navigate([`/dashboard`]);
        }
      }
    }
    this.main.LoggedUserStoreInfo = JSON.parse(
      session.getSessionLoginUserStore()
    );
    this.is_delivery_model_platform = this.delivery_model != 1 ? false : true;
    this.condition();
    var filterObject;
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
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }
    this.UserList(this.page);

    // server-side search
    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean), debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.UserList(1);
          })
        )
        .subscribe();
    this.getHelpDetails()
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.UserList(1);
    }
  }
  /** Condition for manage user. */
  condition() {
    if (this.main.LoggedUserInfo.role_id == this.main.UserRole.Seller) {
      this.userlist = [
        { label: this.store_label + " Manager", value: 1 },
        { label: this.deliveryboy_label, value: 2 },
        { label: "POS", value: 3 },
        { label: "Picker", value: 4 },
        { label: "Captain", value: 5 },
        { label: "Kitchen", value: 6 },
      ];
      if (this.is_delivery_model_platform == false) {
        this.userlist = [
          { label: this.store_label + " Manager", value: 1 },
          { label: "POS", value: 3 },
          { label: "Picker", value: 4 },
          { label: "Captain", value: 5 },
          { label: "Kitchen", value: 6 },
        ];
      }
    } else if (
      this.main.LoggedUserInfo.role_id == this.main.UserRole.Admin ||
      this.main.LoggedUserInfo.role_id == this.main.UserRole.SuperAdmin
    ) {
      this.userlist = [{ label: this.deliveryboy_label, value: 2 }];
    } else {
      this.userlist = [
        { label: this.deliveryboy_label, value: 2 },
        { label: "POS", value: 3 },
        { label: "Picker", value: 4 },
        { label: "Captain", value: 5 },
        { label: "Kitchen", value: 6 },
      ];
      if (this.is_delivery_model_platform == false) {
        this.userlist = [
          { label: "POS", value: 3 },
          { label: "Picker", value: 4 },
          { label: "Captain", value: 5 },
          { label: "Kitchen", value: 6 },
        ];
      }
    }
    if (this.pos == 0 || this.seller_details?.pos_allowed == 0) {
      this.userlist = this.userlist.filter((x) => x.value !== 3);
    }
    if (this.picker == 0) {
      this.userlist = this.userlist.filter((x) => x.value !== 4);
    }
    if (this.dinein_module == 0 || this.seller_details?.dine_in_allowed == 0) {
      this.userlist = this.userlist.filter((x) => x.value !== 5);
      this.userlist = this.userlist.filter((x) => x.value !== 6);
    }

    if (this.driver_module == 0) {
      this.userlist = this.userlist.filter(x => x.value !== 2);
    }

    if (this.main.LoggedUserStoreInfo) {
      if (this.main.LoggedUserStoreInfo.pos != 1) {
        this.userlist = this.userlist.filter((x) => x.value !== 3);
      }
      if (this.main.LoggedUserStoreInfo.picker != 1) {
        this.userlist = this.userlist.filter((x) => x.value !== 4);
      }
      if (this.main.LoggedUserStoreInfo.dine_in != 1) {
        this.userlist = this.userlist.filter((x) => x.value !== 5);
        this.userlist = this.userlist.filter((x) => x.value !== 6);
      }
      if (this.main.LoggedUserStoreInfo.iseatery != 1) {
        this.userlist = this.userlist.filter((x) => x.value !== 5);
        this.userlist = this.userlist.filter((x) => x.value !== 6);
      }
    }
    this.selectedstoremanager = this.userlist[0];
    this.isstoremanager = this.userlist[0].value;
    if (this.isstoremanager == 1) {
      this.roleid = 5;
    } else if (this.isstoremanager == 2) {
      this.roleid = 3;
    } else {
      if (this.isstoremanager == 3) {
        this.roleid = 7;
      }
      if (this.isstoremanager == 4) {
        this.roleid = 8;
      }
      if (this.isstoremanager == 5) {
        this.roleid = 9;
      }
      if (this.isstoremanager == 6) {
        this.roleid = 10;
      }
    }

    if (this.main.LoggedUserStoreInfo.is_searchable == '0') {
      this.userlist = this.userlist.filter((x) => x.value !== 2);
    }
  }

  UserList(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    this.page = page;
    var data = {};
    if (this.is_super_admin == false) {
      data = {
        page: this.page,
        search_query: this.search,
        limit: this.table_size,
        store_id: this.seller_details.store_id,
        role_id: this.roleid,
      };
    } else {
      data = {
        page: this.page,
        search_query: this.search,
        limit: this.table_size,
        sort_field: this.sortKey,
        sort_type: this.isOrderBy ? 1 : 2,
        role_id: this.roleid
      };
    }

    this.ManageUserService.getStorePOS(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.user_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          if (this.is_super_admin == false && this.main.LoggedUserInfo?.role_id != 1) {
            this.toastr.error(response.message);
          }
          this.no_data = true;
          this.count = 0;
          this.user_list = [];
        }
      },
      error: (error) => { },
      complete: () => {

      },
    });
  }

  onSearchChange(value) {
    this.search = value;
    this.page = 1;
    this.UserList(1);
  }

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

  deleteUser(item) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE"),
      icon: "warning",
      showConfirmButton: true,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("DELETE_CURRENT_STORE"),
      cancelButtonText: this.translate.instant("CANCEL"),
      denyButtonText: this.translate.instant("DELETE_ALL_STORE")
    }).then((result) => {
      if (result.value) {
        item.delete_all = 0;
        this.deleteuserConfirm(item);
      } else if (result.isDenied) {
        item.delete_all = 1;
        this.deleteuserConfirm(item);
      }
      else if (result.value == false) {
      }
    });
  }

  deleteuserConfirm(item) {
    var data = {};
    if (this.isstoremanager == 1) {
      data = {
        store_manager_id: item.store_manager_id,
        user_id: item.user_id,
        store_id: this.main.LoggedUserStoreInfo.store_id,
        delete_all: item.delete_all,
        role_id: 5,
      };
    } else if (this.isstoremanager == 2) {
      data = {
        deliveryboy_id: item.deliveryboy_id,
        user_id: item.user_id,
        store_id: this.main.LoggedUserStoreInfo.store_id,
        delete_all: item.delete_all,
        role_id: 3,
      };
    } else {
      data = {
        user_id: item.user_id,
        store_id: this.main.LoggedUserStoreInfo.store_id,
        role_id: this.roleid,
      };
    }

    this.ManageUserService.deleteStoreUser(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(response.message);
          this.UserList(this.page);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {

      },
    });
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.UserList(this.page);
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
      data.module_key = '20'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '20'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '123'
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
