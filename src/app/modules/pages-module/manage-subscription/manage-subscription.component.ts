import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { AppComponent } from "src/app/app.component";
import { UsersService } from "src/app/services/users.service";
import { TranslateService } from "@ngx-translate/core";
import { HelpInfoModelComponent } from "../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
@Component({
  selector: "app-manage-subscription",
  templateUrl: "./manage-subscription.component.html",
  styleUrls: ["./manage-subscription.component.scss"],
})
export class ManageSubscriptionComponent implements OnInit {
  public users: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.general_setting.store_label;
  license_info: any;
  main: any;
  p_name: any;
  end_date: any;
  sub_id: any;
  ord_balance: any;
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private UsersService: UsersService,
    private _helpService: BannerService,
    private modalService: NgbModal,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
  }

  ngOnInit() {
    this.subscriptiontRecord();
    this.cdr.detectChanges();
    this.getHelpDetails();
  }
  // get subslist
  async subscriptiontRecord() {
    var data = {
      store_id: this.seller_details.store_id,
    };
    await this.UsersService.getStoreSubscriptionDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.license_info = response.data;
          this.p_name = this.license_info.package_name;
          this.end_date = this.license_info.subscription_enddate;
          this.sub_id = this.license_info.subscription_id;
          this.ord_balance = this.license_info.order_balance;
          this.cdr.detectChanges();
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
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '106'
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
