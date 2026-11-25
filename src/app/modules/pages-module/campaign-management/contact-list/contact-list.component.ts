import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { ContactListService } from "src/app/services/campaign-management/contact-list.service";
import Swal from "sweetalert2";
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from "rxjs";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CookieService } from "ngx-cookie-service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-contact-list",
  templateUrl: "./contact-list.component.html",
  styleUrls: ["./contact-list.component.scss"],
})
export class ContactListComponent implements OnInit {
  search_text: string;
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  search: any;
  no_data = true;
  main: any;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  show_price_same_font = this.general_setting.show_price_same_font;
  filter_on = '1'
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  contact_list: any = [];
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
    private ContactListService: ContactListService,
    private _snackbarService: ToastrService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private cookieService: CookieService,
    public spinner: SpinnerService
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
    this.cookieService.deleteAll()
    this.cryptoService.clearCookie("campaign_contact_id_duplicate" + this.main.LoggedUserInfo.role_id.toString());
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
      this.search_text = this.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
      this.filter_on = filterObject.isActive.toString()
    }
    this.cryptoService.clearCookie(
      "campaign_contact_id" + this.main.LoggedUserInfo.role_id.toString(),
    );
    this.getContactList(this.page);
    if (this.searchbox != undefined)
      fromEvent(this.searchbox.nativeElement, "keyup")
        .pipe(
          filter(() => !window.getSelection().toString()),
          filter(Boolean),
          debounceTime(environment.search_time),
          distinctUntilChanged(),
          tap(() => {
            this.search = this.searchbox.nativeElement.value;
            this.getContactList(1);
          })
        )
        .subscribe(() => {
        });
    this.getHelpDetails();
  }

  //get contact list
  getContactList(page): void {
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
      isActive: Number(this.filter_on)
    };

    this.ContactListService.getContactList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.contact_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.contact_list = [];
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
    if (this.search !== '') {
      this.search = '';
      this.getContactList(1);
    }
  }

  //delete contact
  deleteContact(campaign_contacts_id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_CONTACT_RECORD"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.confirmDeleteContact(campaign_contacts_id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  confirmDeleteContact(campaign_contacts_id) {
    let data = {
      is_deleted: 1,
      campaign_contacts_id: campaign_contacts_id,
    };
    this.ContactListService.manageCampaignContacts(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
          this.getContactList(this.page);
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

  editContactDetail(campaign_contact_id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
      isActive: Number(this.filter_on)
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      campaign_contact_id.toString(),
      "campaign_contact_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.clearCookie("campaign_contact_id_duplicate" + this.main.LoggedUserInfo.role_id.toString());
    this.router.navigate(["/contact-list/edit"]);
  }

  duplicateEditContactDetail(campaign_contact_id) {
    this.spinner.show()
    var data = {
      campaign_contacts_id: campaign_contact_id,
    }
    this.ContactListService.duplicateCampaignContacts(data).subscribe({
      next: (response: any) => {
        this.spinner.hide()
        if (response.status == 1) {
          var obj = {
            page: this.page,
            search: this.search,
            limit: this.table_size,
            isActive: Number(this.filter_on)
          };
          localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
          this.cryptoService.encryptIdValue(
            response.data?.campaign_contacts_id.toString(),
            "campaign_contact_id" + this.main.LoggedUserInfo.role_id.toString(),
            this.main.CryptoKey
          );
          this.cryptoService.encryptIdValue(
            '"duplicate"',
            "campaign_contact_id_duplicate" + this.main.LoggedUserInfo.role_id.toString(),
            this.main.CryptoKey
          );
          this.router.navigate(["/contact-list/edit"]);
        } else {
        }
      },
      error: (error) => {
        this.spinner.hide()
        this._snackbarService.error(error);
      },
      complete: () => {
        this.spinner.hide()
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
      data.module_key = '24'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '24'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '24'
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
