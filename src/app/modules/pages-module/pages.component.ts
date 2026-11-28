import { Component, HostListener, OnInit } from "@angular/core";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { AppComponent } from "src/app/app.component";
import { Router } from '@angular/router';
import { CommonService } from "src/app/services/common.service";
import { UserRoles } from "src/app/enums/user-roles";
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
export const MY_FORMATS = {
  parse: {
    dateInput: "YYYY/MM/DD",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@Component({
  selector: "app-pages-layout",
  templateUrl: "./pages.component.html",
  styleUrls: ["./pages.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PagesComponent implements OnInit {
  main: any;
  generalSetting: any = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  loginUserStoreData: any = JSON.parse(localStorage.getItem('loginUserStore'));
  isLogin: any = localStorage.getItem('isLogin');

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    public commonService: CommonService,
    library: FaIconLibrary
  ) {
    this.main = this.appComponent.main;
  }

  userRolesEnum = UserRoles;
  loadSidebar: boolean = false;

  ngOnInit() {
    $('.page-footer').css({ 'display': 'none' })
    if (this.generalSetting.date_format_web == "DD-MM-YYYY HH:mm:ss") {
      MY_FORMATS.display.dateInput = "DD-MM-YYYY";
    } else {
      MY_FORMATS.display.dateInput = "MM-DD-YYYY";
    }
    if (this.isLogin) {
      if (window.location.pathname == '/') {
        this.router.navigate([`/dashboard`]);
      }
    } else {
      localStorage.clear();
      this.router.navigate([`/auth/login`]);
      $("body").removeClass("menu-open");
      $("footer").hide();
      $(".main-content").css("padding-bottom", "0");
    }
    if (Number(this.loginUserStoreData?.role_id) == this.userRolesEnum.StoreManager) {
      this.getStoreManagerSettings();
    }
    else {
      this.loadSidebar = true;
    }
  }

  getStoreManagerSettings() {
    var data = {
      store_id: this.loginUserStoreData?.store_id
    }
    this.commonService.getStoreSetting(data).subscribe({
      next: (response: any) => {
        var manageItemImportData = response.data.manage_item;
        localStorage.setItem("allowItemImportData", JSON.stringify(manageItemImportData));
        this.loadSidebar = true;
      },
      error: (error) => {
      },
      complete: () => {
      },
    })
  }
  
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
    let max = document.documentElement.scrollHeight;
    if ((pos + 10) >= max) {
      $('.page-footer').css({ 'display': 'block' })
    } else {
      $('.page-footer').css({ 'display': 'none' })
    }
  }
}