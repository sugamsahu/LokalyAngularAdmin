import { Component, OnInit, Input } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { Router } from "@angular/router";
import { Subscription, Observable, fromEvent, Subject } from "rxjs";
import { UsersService } from "src/app/services/users.service";
import * as $ from "jquery";
import { AppComponent } from "src/app/app.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { LoggeduserComponent } from "../../pages-module/model/logged-user/logged-user.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { MessagingService } from "src/app/push-notification-service/messaging-service";
import { takeUntil } from 'rxjs/operators';
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  @Input() storeUserRoles;
  isLogin: any = localStorage.getItem('isLogin');
  login = {
    email: "",
    password: "",
    is_agree: "",
  };
  hasError: boolean;
  login_form: any;
  isLoading$: Observable<boolean>;
  main: any;
  business_model: any;
  loginUserId: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label: any;

  constructor(
    private authService: AuthService,
    private appComponent: AppComponent,
    private usersService: UsersService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal,
    public translate: TranslateService,
    private messagingService: MessagingService,
    private spinner: SpinnerService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');;
    this.isLoading$ = this.authService.isLoading$;
    if (this.isLogin) {
      this.router.navigate([`/dashboard`]);
    }
  }

  private unsubscriber: Subject<void> = new Subject<void>();

  ngOnInit() {
    history.pushState(null, '');
    fromEvent(window, 'popstate').pipe(
      takeUntil(this.unsubscriber)
    ).subscribe((_) => {
      history.pushState(null, '');
    });

    $("body").removeClass("menu-open");
    $("footer").hide();
    $(".main-content").css("padding-bottom", "0");
    $(".main-content").css("margin-top", "0");
    this.appComponent.getCommonConfigurationDetails();
    var url = this.router.url;
    if (url == "/login") {
      $("body").addClass("login");
    }
    this.main = this.appComponent.main;
    if (this.generalSetting) {
      this.store_label = this.generalSetting.store_label;
    }
    this.messagingService.requestPermission();
  }

  signIn(): void {
    this.spinner.show();
    if (!this.login.is_agree || !this.login.email || !this.login.password) {
      return;
    }
    this.hasError = false;
    var userDeta = {
      phone: this.login.email,
      password: this.login.password,
      fcm_token: localStorage.getItem("fcmToken"),
      device_os: "web",
    };
    this.authService.login(userDeta).subscribe({
      next: (res: any) => {
        if (res.status == 1) {
          this.getgeneralSettings(res);
        } else {
          if (res.status_code == 401) {

            this.toastr.error(res.message);
          } else if (res.status_code == 404) {

            this.toastr.error(res.message);
          } else {

            this.toastr.error(res.message);
          }
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

  forgotPassword() {
    this.resetPassword();
  }
  resetPassword() {
    const modalRef = this.modalService.open(ResetPasswordComponent, {
      size: "ml",
    });
  }

  getgeneralSettings = function (response) {
    this.usersService.getCommonConfigurationDetails().subscribe({
      next: (settingResponse: any) => {
        if (settingResponse.status == 1) {
          localStorage.setItem("user_role_confirm", response.data.profile.is_confirm);
          localStorage.setItem(
            "LoggedUserSettings",
            JSON.stringify(settingResponse.data)
          );

          if (
            window.location.host == "business.lokaly.in" ||
            window.location.host == "store.lokaly.in"
          ) {
            //for seller login
            if (
              response.data.profile.role_id == 2 ||
              response.data.profile.role_id == 5 ||
              (response.data.profile.role_id == 7 &&
                settingResponse.data.pos_module == 1) ||
              (response.data.profile.role_id == 8 &&
                settingResponse.data.picker_module == 1)
            ) {
              this.setLoginData(response);
            } else {
              this.toastr.error(
                "Only Seller and Store Manager, Picker can LOGIN from this portal"
              );
              return;
            }
          }
          if (window.location.host == "wa.lokaly.in") {
            //for admin login
            if (
              response.data.profile.role_id == 1 ||
              response.data.profile.role_id == 6
            ) {
              this.setLoginData(response);
            } else {
              this.toastr.error("Only Admin can LOGIN from this portal");
              return;
            }
          } else if (
            window.location.host != "business.lokaly.in" &&
            window.location.host != "wa.lokaly.in" &&
            window.location.host != "store.lokaly.in"
          ) {
            if (
              response.data.profile.role_id == 2 ||
              response.data.profile.role_id == 1 ||
              response.data.profile.role_id == 5 ||
              response.data.profile.role_id == 6 ||
              (response.data.profile.role_id == 7 &&
                settingResponse.data.pos_module == 1) ||
              (response.data.profile.role_id == 8 &&
                settingResponse.data.picker_module == 1)
            ) {
              this.setLoginData(response);
            } else {
              this.toastr.error(
                "Only Seller, Store Manager, Picker and Admin can LOGIN from this portal"
              );
              return;
            }
          }
        } else {
          if (settingResponse.status_code == 404) {
            this.toastr.error(settingResponse.message);
          } else if (settingResponse.status_code == 400) {
            this.toastr.error(settingResponse.message);
          }
        }
      },
      error: (error) => {
        // handle error

      },
      complete: () => {
        ;
        this.spinner.hide();
      },
    });
  };

  validateNumber(event: any) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  setLoginData(response) {
    localStorage.setItem("select_lan", response.data.profile.language_code);
    localStorage.setItem("select_lan_id", response.data.profile.language_id);
    var session = this.appComponent.sessionConfig();
    session.clearSessionLoginUser();
    session.setSessionLoginUser(response.data.profile);
    session.clearSessionLoginUserStore();
    session.setSessionLoginUserStore(
      response.data.store == undefined ? "" : response.data.store
    );
    session.clearSessionToken();
    session.setSessionToken(response.token);
    if (
      response.data.profile.role_id == 1 ||
      response.data.profile.role_id == 6
    ) {
      this.router.navigate([`/dashboard`]);
    }
    localStorage.setItem("isLogin", "true");
    this.main = this.appComponent.main;
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.loginUserId = this.main.LoggedUserInfo.user_id;
    if (
      response.data.profile.role_id != 1 &&
      response.data.profile.role_id != 6
    ) {
      this.getLoggedUserList();
      $(".login .main-content").css("padding-bottom", "60px !important");
    } else {
      $(".login .main-content").css("padding-bottom", "60px !important");
    }
  }

  getLoggedUserList() {
    var data = {
      user_id: this.loginUserId,
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

          if (this.storeUserRoles.length > 0) {
            if (this.storeUserRoles.length == 1) {
              this.GetStoreSubscriptionDetails(this.storeUserRoles[0]);
            } else {
              const modalRef = this.modalService.open(LoggeduserComponent,{
                size: "md"
              });
              modalRef.componentInstance.storeUserRoles = this.storeUserRoles;
              modalRef.componentInstance.passEntry.subscribe(
                (receivedEntry) => {
                  this.GetStoreSubscriptionDetails(receivedEntry);
                }
              );
            }
          }
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

  GetStoreSubscriptionDetails(user) {
    var data = {
      store_id: user.store_id,
    };
    this.usersService.getStoreSubscriptionDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          localStorage.setItem("user_role_confirm", user.user_role_confirm);
          localStorage.setItem(
            "subscriptionDetails",
            JSON.stringify(response.data)
          );
          var session = this.appComponent.sessionConfig();
          session.setSessionLoginUserStore(user == undefined ? "" : user);
          if (user.role_id == 8) {
            this.router.navigate([`/dashboard`]);
          } else {
            if (user.user_role_confirm == 0) {
              this.router.navigate([`/store-details`]);
            } else {
              this.router.navigate([`/dashboard`]);
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
      complete: () => {
        ;
      },
    });
  }

  type = 'password';
  viewPassword() {
    if (this.type == 'password') {
      this.type = 'text';
    }
    else {
      this.type = 'password';
    }
  }

  ngOnDestroy(): void {
    this.unsubscriber.next();
    this.unsubscriber.complete();
  }
}
