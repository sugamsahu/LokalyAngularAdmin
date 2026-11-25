import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { CampaignService } from "src/app/services/campaign-management/campaign.service";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { campaignLogComponent } from "../../model/campaign-log/campaign-log.component";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-campaign",
  templateUrl: "./campaign.component.html",
  styleUrls: ["./campaign.component.scss"],
})
export class CampaignComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  search: any;
  no_data = true;
  main: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  show_price_same_font = this.general_setting.show_price_same_font;
  //template
  campaign_list: any = [];
  filter_on = '1';
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private _snackbarService: ToastrService,
    private campaignService: CampaignService,
    private modalService: NgbModal,
    private _helpService: BannerService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.cryptoService.encryptIdValue(
      '',
      "campaign_id_duplicate" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
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
      this.page = filterObject.page;
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search
      this.table_size = filterObject.limit;
      this.filter_on = filterObject.isActive.toString()
    }
    this.getCampaignList(this.page);
    this.cryptoService.clearCookie(
      "campaign_id" + this.main.LoggedUserInfo.role_id.toString()
    );
    this.cryptoService.clearCookie(
      "campaign_id_duplicate" + this.main.LoggedUserInfo.role_id.toString()
    );
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean),
        debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getCampaignList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getCampaignList(1);
    }
  }

  //get list
  getCampaignList(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data = {};
    data = {
      page: this.page,
      limit: this.table_size,
      search_query: search,
      isActive: Number(this.filter_on)
    };
    this.campaignService.getCampaignList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.campaign_list = response.data;
          if (this.campaign_list.length == 0) {
            this.no_data = true;
          } else {
            this.no_data = false;
          }
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.campaign_list = [];
        }
      },
      error: (error) => {
      },
      complete: () => {

      },
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
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '26'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '26'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '26'
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

  //delete contact
  deleteCampaign(campaign_id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_CAMPAIGN_RECORD"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.confirmDeleteCampaign(campaign_id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  confirmDeleteCampaign(campaign_id) {
    let data = {
      is_deleted: 1,
      campaign_id: campaign_id,
    };

    this.campaignService.manageCampaigns(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.getCampaignList(this.page);
        } else {
          this._snackbarService.error(response.message);
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => {
        ;
      },
    });
  }


  viewLog(templateid) {
    const modalRef = this.modalService.open(campaignLogComponent, {
      size: "lg",
      centered: true
    });
    modalRef.componentInstance.campaigId = templateid;
    modalRef.componentInstance.user_id = this.main.LoggedUserInfo.user_id;
  }

  //edit
  editCampaignDetails(templateid) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      isActive: Number(this.filter_on)
    };

    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      templateid.toString(),
      "campaign_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/campaign/edit"]);
  }

  duplicateEditCampaignDetails(templateid) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      isActive: Number(this.filter_on ? this.filter_on : 1)
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      templateid.toString(),
      "campaign_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      'duplicate',
      "campaign_id_duplicate" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/campaign/edit"]);
  }
}
