import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { EmailCampaignService } from "src/app/services/campaign-management/email-campaign.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-email-campaig",
  templateUrl: "./email-campaig.component.html",
  styleUrls: ["./email-campaig.component.scss"],
})
export class EmailCampaigComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  search: any;
  no_data = true;
  main: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  show_price_same_font = this.general_setting.show_price_same_font;
  sortKey: any = "";
  isOrderBy: boolean = true;
  searchText: string;
  email_campaign_list: any = [];

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private emailCampaignService: EmailCampaignService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    let filterObject;
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
    this.getPagedList(this.page);
  }

  /** Get campaign detail using service*/
  getPagedList(page): void {
    this.page = page;
    var data = {};
    data = {
      page: this.page,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      limit: this.table_size,
    };
    this.emailCampaignService.getCampaignDetail(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.email_campaign_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.email_campaign_list = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  clearSearch() {
    if (this.search != '') {
      this.search = '';
      this.getPagedList(1);
    }
  }

  //edit
  editEmailDetails(templateid) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      templateid.toString(),
      "campaign_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/email-campaign/edit"]);
  }
}
