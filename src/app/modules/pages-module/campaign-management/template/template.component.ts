import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { TemplateService } from "src/app/services/campaign-management/template.service";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-template",
  templateUrl: "./template.component.html",
  styleUrls: ["./template.component.scss"],
})
export class TemplateComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search: any;
  no_data = true;
  main: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  show_price_same_font = this.general_setting.show_price_same_font;
  //template
  template_list: any = [];
  filter_on = '1'
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  check_duplicate: any = false;

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private _snackbarService: ToastrService,
    private TemplateService: TemplateService,
    private _helpService: BannerService,
    private modalService: NgbModal,
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
      this.search = filterObject.search
      this.searchbox.nativeElement.value = this.search
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
      this.filter_on = filterObject.isActive.toString()
    }
    this.getTamplateList(this.page);
    this.cryptoService.clearCookie(
      "campaign_templates_id" + this.main.LoggedUserInfo.role_id?.toString()
    );
    this.cryptoService.clearCookie(
      "campaign_templates_id_duplicate" + this.main.LoggedUserInfo.role_id?.toString()
    );
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean),
        debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getTamplateList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  //get list
  getTamplateList(page): void {
    this.page = page;
    var data = {};
    data = {
      page: this.page,
      limit: this.table_size,
      search_query: this.search,
      isActive: Number(this.filter_on)
    };
    this.TemplateService.getCampaignTemplate(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.template_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.template_list = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  //delete contact
  deleteTemplate(campaign_templates_id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_SELLER_RECORD"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteTemplateConfirm(campaign_templates_id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  deleteTemplateConfirm(campaign_templates_id) {
    let data = {
      is_deleted: 1,
      campaign_templates_id: campaign_templates_id,
    };
    this.TemplateService.manageCampaignTemplate(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.getTamplateList(this.page);
        } else {
          this._snackbarService.error(response.message);
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => { },
    });
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getTamplateList(1);
    }
  }

  editTemplateDetails(templateid) {
    localStorage.setItem("check_duplicate", this.check_duplicate);

    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      isActive: Number(this.filter_on)
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      templateid.toString(),
      "campaign_templates_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/template/edit"]);
  }

  duplicateEditTemplateDetails(templateid) {
    this.check_duplicate = true
    localStorage.setItem("check_duplicate", this.check_duplicate)
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      isActive: Number(this.filter_on)
    };

    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.clearCookie(
      "campaign_templates_id" + this.main.LoggedUserInfo.role_id?.toString()
    );
    this.cryptoService.clearCookie(
      "campaign_templates_id_duplicate" + this.main.LoggedUserInfo.role_id?.toString()
    );

    this.cryptoService.encryptIdValue(
      templateid.toString(),
      "campaign_templates_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );

    this.cryptoService.encryptIdValue(
      'duplicate',
      "campaign_templates_id_duplicate" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );

    this.router.navigate(["/template/edit"]);
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
      data.module_key = '25'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '25'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '25'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_details = response.data;
        }
        // this.toastr.success(response.message);
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }
}

