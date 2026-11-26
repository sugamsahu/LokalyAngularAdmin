import { Component, OnInit, ElementRef, ChangeDetectorRef } from "@angular/core";
import { ROUTES } from "../sidebar/sidebar.component";
import {
  Location,
} from "@angular/common";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { UsersService } from "src/app/services/users.service";
import * as $ from "jquery";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { StoreLinkComponent } from "src/app/modules/pages-module/model/store-link/store-link.component";
import * as moment from "moment";
import { TranslateService } from "@ngx-translate/core";
import { NgEventBus } from "ng-event-bus";
import { CookieService } from "ngx-cookie-service";
import { UserRoles } from "src/app/enums/user-roles";
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  public focus;
  public isCollapsed = false;
  public listTitles: any[];
  public location: Location;
  main: any;
  storeUserRoles: any;
  PlatformSetting: any;
  business_model: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting?.store_label;
  loginUserDetails = JSON.parse(localStorage.getItem("LoginUserDetails"));
  loginStore = JSON.parse(localStorage.getItem("loginUserStore"));
  closeResult: string;
  moment: any = moment;
  storeServiceOpen: boolean = true;
  isSuperAdmin: boolean;
  userRoleEnum = UserRoles;
  roleChange = 6;
  sidebar_open: any = false;
  view_validate: any;
  lngCodeWithId: any = [];
  temp: boolean = false
  savingItemList: any = [];
  selected_show_save_item: any;

  constructor(
    location: Location,
    private appComponent: AppComponent,
    private toastr: ToastrService,
    private usersService: UsersService,
    private element: ElementRef,
    private router: Router,
    public translate: TranslateService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private eventBus: NgEventBus,
    private cookieService: CookieService,
    public commonService: CommonService
  ) {
    this.location = location;
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    if (!this.loginUserDetails) {
      localStorage.clear();
      this.router.navigate([`/auth/login`]);
      return
    }
  }

  ngOnInit() {
    $(".notification-icon-img").css("right", "100px");
    $(".navbar-toggler").click(function () {
      $("#sidenav-main").toggleClass("show");
      $("body").toggleClass("menu-open");
    });
    this.listTitles = ROUTES.filter((listTitle) => listTitle);
    this.main = this.appComponent.main;
    this.PlatformSetting = JSON.parse(
      localStorage.getItem("_platform_setting")
    );
    this.PlatformSetting =
      this.PlatformSetting == null
        ? this.main.platform_setting
        : this.PlatformSetting;
    this.business_model = this.PlatformSetting.business_model;
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.main.LoggedUserStoreInfo = JSON.parse(
      session.getSessionLoginUserStore()
    );
    if (this.loginUserDetails.role_id == 1 || this.loginUserDetails.role_id == 6) {
    } else {
      this.getLoggedUserList();
    }
    this.router.events.subscribe((event) => {
      this.isCollapsed = false;
    });
    this.storeServiceModule();
    this.getLanguageList();

    this.isSuperAdmin =
      this.main.LoggedUserInfo.role_id == this.userRoleEnum.SuperAdmin
        ? true
        : this.main.LoggedUserInfo.role_id == this.userRoleEnum.Admin
          ? true
          : false;

    if (this.business_model == 2) {
      this.roleChange = 1
    }

    if (this.isSuperAdmin == true) {
      this.view_validate = this.main.LoggedUserInfo;
    } else {
      this.view_validate = this.loginStore;
    }
  }

  dtectChanges() {
    this.sidebar_open = this.sidebar_open == false ? true : false;
    localStorage.setItem('sidebarOpen', this.sidebar_open);
    var temp: any = this.sidebar_open;
    this.commonService.AClicked(temp);
    this.eventBus.cast('onCollapse');
    if (this.sidebar_open == true) {
      $(".notification-icon-img").css("right", "0");
    } else {
      $(".notification-icon-img").css("right", "100px");
    }
  }

  logout() {
    // The request takes the token when it is created, so storage can be
    // cleared straight after. Failures don't block logging out locally.
    if (localStorage.getItem("accessToken")) {
      const phone = this.main?.LoggedUserInfo?.phone;
      this.usersService.logout(phone ? { phone, role_id: this.main.LoggedUserInfo.role_id } : {})
        .subscribe({ error: () => {} });
    }
    localStorage.clear();
    this.router.navigate([`/auth/login`]);
    $("body").removeClass("menu-open");
    $("footer").hide();
    $(".main-content").css("padding-bottom", "0");
    if (this.isSuperAdmin == true) {
      this.cookieService.delete("recentsearch2");
    } else {
      this.cookieService.delete("recentsearch");
    }
  }

  getLoggedUserList() {
    var data = {
      user_id: this.main.LoggedUserInfo.user_id,
      is_pos: this.main.LoggedUserInfo.role_id == 7 ? "1" : "",
      is_store_login: 1
    };
    this.usersService.getUserStoreRoles(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.storeUserRoles = [];

          response.data.forEach((item) => {
            if (
              item.role_id == 2 ||
              item.role_id == 5 ||
              item.role_id == 7 ||
              item.role_id == 8
            ) {
              this.storeUserRoles.push(item);
            }
          });
          this.storeUserRoles.forEach((item, index) => {
            if (item.store_id == this.loginStore.store_id) {
              this.storeUserRoles.splice(index, 1)
              this.storeUserRoles.splice(0, 0, item)
            }
          });
          if (this.storeUserRoles.length > 0) {
            if (this.storeUserRoles.length == 1) {
            } else {
            }
          }
        } else {
        }
      },
      error: (error) => {

      },
      complete: () => {
      },
    });
  }

  NotificationCountReturn(count) {
    var notification = "";
    if (Number(count) > 99) {
      notification = "99+";
    } else {
      notification = count;
    }
    return notification;
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
    context.font = "16px Arial";
    context.fillStyle = "#FFFFFF";
    var nameArray = name?.split(" ");
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

  GetStoreSubscriptionDetailsForSwitchUser(user) {
    var data = {
      store_id: user.store_id,
    };
    this.usersService.getStoreSubscriptionDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.main.LoggedUserInfo.license_detail = response.data;
          localStorage.setItem(
            "subscriptionDetails",
            JSON.stringify(response.data)
          );
          localStorage.setItem("user_role_confirm", user.user_role_confirm);
          localStorage.removeItem("UID");
          if (user.role_id == 8) {
            this.router.navigate([`/pickerorder`])
              .then(() => {
                window.location.reload();
              });
          } else {
            if (user.user_role_confirm == '0') {
              this.router.navigate([`/store-details`]);
              this.router.navigate([`/store-details`])
                .then(() => {
                  window.location.reload();
                });
            } else {
              this.router.navigate([`/dashboard`]);
              this.router.navigate([`/dashboard`])
                .then(() => {
                  window.location.reload();
                });
            }
          }
        } else {
          this.toastr.error(response.message);
          setTimeout(function () {
            location.reload();
          }, 1000);
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  editSellerDetail() {
    var session = this.appComponent.sessionConfig();
    session.encryptIdValue(
      this.main.LoggedUserInfo.user_id.toString(),
      "storeManage_sellerid" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );

    localStorage.setItem("DisabledLokalyBusiness", JSON.stringify("1"))
    session.encryptIdValue(
      this.main.LoggedUserStoreInfo.store_id.toString(),
      "storeManage_storeID" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/sellers/edit"]);
  }

  submitChangeUser(user) {

    var session = this.appComponent.sessionConfig();
    session.setSessionLoginUserStore(user == undefined ? "" : user);
    this.GetStoreSubscriptionDetailsForSwitchUser(user);
    localStorage.removeItem("setup_steps");
    if (this.isSuperAdmin == true) {
      this.cookieService.delete("recentsearch2");
    } else {
      this.cookieService.delete("recentsearch");
    }
    if (user.user_role_confirm == '0') {
      this.router.navigate([`/store-details`]);
    } else {
      this.router.navigate([`/dashboard`]);
    }
    this.cdr.detectChanges();
  }
  /**get store code by it's role id and seller details */
  //link gen
  getStoreUniqCode() {
    const modalRef = this.modalService.open(StoreLinkComponent, {
      size: "lg",
    });
    modalRef.componentInstance.roleId = this.main.LoggedUserInfo.role_id;
  }

  /**get store data using user service */
  storeServiceModule() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
    };
    this.usersService.getStoreServiceDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 0) {
          this.storeServiceOpen = true;
        }
        else {
          this.storeServiceOpen = false;
        }

      },

      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      },
    });
  }

  // The pop-up (and moment-timezone, which it needs) is loaded on first use
  // instead of with every page.
  async serviceModule() {
    const { StoreServiceModelComponent } = await import(
      "src/app/modules/pages-module/model/store-service/store-service-modal.module"
    );
    const modalRef = this.modalService.open(StoreServiceModelComponent, {
      size: "md",
    });

    modalRef.componentInstance.main = this.main;

    modalRef.result.then(
      (result) => {
        this.storeServiceModule();
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );

    modalRef.componentInstance.storeServiceOpenData.subscribe((receivedEntry) => {
      if (receivedEntry == "1") {
        this.temp = true;
        this.storeServiceModule();
      }
    });

  }
  /**modal dismiss */
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }

  getLanguageList() {
    if (this.generalSetting.language_codes) {
      if (this.generalSetting.language_codes.length == 2) {
        this.savingItemList = [];
        this.savingItemList.push(this.generalSetting.language_codes);
      } else {
        this.savingItemList = this.generalSetting.language_codes.split(",");
      }
    } else {
      this.savingItemList = ["en"];
    }
    var language_label = localStorage.getItem("select_lan");
    if (language_label) {
      this.selected_show_save_item = language_label;
    } else {
      this.selected_show_save_item = this.savingItemList[0];
      localStorage.setItem("select_lan", this.savingItemList[0]);
      localStorage.setItem("select_lan_id", "1");
    }
  }

  changeLanguage(item: any) {
    if (this.savingItemList.length > 1) {
      let lng_ids = this.generalSetting.languages.split(",");
      this.savingItemList.forEach((code: any, i: number) => {
        let codeWithId: any = { "language_code": code, 'language_id': lng_ids[i] }
        this.lngCodeWithId.push(codeWithId)
      });
    }
    this.lngCodeWithId.find((value: any) => {
      if (value.language_code == item) {
        localStorage.setItem("select_lan_id", value.language_id);
      }
    })
    localStorage.setItem("select_lan", item);
    this.translate.use(item);
    location.reload();
  }

  redirectToNewComponent() {
    // this.router.navigate(['/show-history']);
    this.router.navigate(['/ask-question']);
    
  }
  
}
