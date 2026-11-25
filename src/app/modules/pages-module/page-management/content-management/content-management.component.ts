import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";

@Component({
  selector: "app-content-management",
  templateUrl: "./content-management.component.html",
  styleUrls: ["./content-management.component.scss"],
})
export class ContentManagementComponent implements OnInit {
  ContentId: any;
  languages = [];
  active = 0;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  pageTitle: string = "";
  main: any = {};
  customer_User_Id: any = 0;
  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService
  ) {
    this.main = this.appComponent.main;
    if (location.href.indexOf("/page-management/edit-content") > -1) {
      this.ContentId = this.cryptoService.decryptIdValue(
        "content_mgmt_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.ContentId == undefined) {
        this.router.navigate(["/page-management"]);
      }
    }

  }
  ngOnInit() {

    $(
      "<style>.nav-link active { color: " + this.general_setting.css_button_business_font + "!important;}</style>"
    ).appendTo("body");

    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    var pagemgmtobj = JSON.parse(localStorage.getItem("seller_Order_obj"));

    if (pagemgmtobj) {
      this.languages = pagemgmtobj.languages;
      this.pageTitle = "(" + pagemgmtobj.pageTitle + ")";
    }
    this.active = this.languages[0].sequence_no;
  }

  navChanged(event) {
  }

  getContentDetail(event) {
    if (event) {
      this.ContentId = event.id;
    }
    else {
      this.ContentId = 0;
    }
  }

  cancelClick() {
    history.back();
  }
}
