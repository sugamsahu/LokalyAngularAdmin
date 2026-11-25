import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { CommunicationService } from "src/app/services/communication.service";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-email",
  templateUrl: "./email.component.html",
  styleUrls: ["./email.component.scss"],
})
export class EmailComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search: any;
  no_data = true;
  main: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  show_price_same_font = this.general_setting.show_price_same_font;
  sortKey: any = "";
  isOrderBy: boolean = true;
  //email
  email_template_list: any = [];

  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  category_list: any = [];
  selected_category_id: any;
  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private CommunicationService: CommunicationService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private _snackbarService: ToastrService,

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
      this.cryptoService.clearCookie(
        "email_template_id" + this.main.LoggedUserInfo.role_id?.toString()
      );
    }

    if (filterObject) {
      this.search = filterObject.search;
      this.searchbox.nativeElement.value = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
    }

    // server-side search
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean),
        debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getMailTemplateList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
    this.getCategoryList();
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getMailTemplateList(1);
    }
  }

  getMailTemplateList(page): void {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data = {};
    data = {
      page: this.page,
      search_query: search,
      limit: this.table_size,
      category_id: this.selected_category_id
    };

    this.CommunicationService.getEmailTemplateList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.email_template_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.email_template_list = [];
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
  
  onSearchChange(value) {
    this.search = value;
    this.page = 1;
    this.getMailTemplateList(1);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.getMailTemplateList(this.page);
  }
  editSmsTemplateDetail(emailtemplateid) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      emailtemplateid.toString(),
      "email_template_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      '',
      "email_template_id_duplicate" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/email/edit"]);
  }

  duplicateEditSmsTemplateDetail(emailtemplateid) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      emailtemplateid.toString(),
      "email_template_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      'duplicate',
      "email_template_id_duplicate" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/email/edit"]);
  }

  getCategoryList() {
    const data = {};
    this.CommunicationService.getModuleCategoryTypeList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.category_list = response.data;
          this.category_list = [{ id: 0, name: "All" }];
          response.data.forEach(item => {
            this.category_list.push(item)
          });
          this.selected_category_id = this.category_list[0].id;
          this.getMailTemplateList(this.page);
        } else {
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      }
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
      data.module_key = '27'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '27'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '27'
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
