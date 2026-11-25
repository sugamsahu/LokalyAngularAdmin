import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { KhataService } from 'src/app/services/store-management/khata.service';
import { environment } from "src/environments/environment";
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap, pairwise } from "rxjs";
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-khata',
  templateUrl: './khata.component.html',
  styleUrls: ['./khata.component.scss']
})
export class KhataComponent implements OnInit {
  @ViewChild("search", { static: true }) searchbox: ElementRef;
  main:any;
  page: number = 1;
  count: number = 0;
  tableSize = environment.tableSize;
  search = "";
  no_data = true;
  khataList: any = [];
  sortKey: any = "";
  isOrderBy: boolean = true
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting.store_label;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  show_price_same_font: any;
  amount_seperator: any;
  global_currency: any;

  constructor(
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private khataService: KhataService,
    private _snackbarService: ToastrService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private router: Router,
    public commonService: CommonService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    this.show_price_same_font = this.generalSetting.show_price_same_font;
    this.amount_seperator = this.generalSetting?.amount_seperator;
    this.global_currency = this.generalSetting.currency_symbol;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.page = 1;
    this.search = "";
    this.count = 0;
    this.getKhataList(this.page);
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getKhataList(1);
        })
      ).subscribe();
    this.getHelpDetails()
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getKhataList(1);
    }
  }

  getKhataList(page): void {
    var search = "";
    search = this.search;
    this.page = page;
    var data = {};
    data = {
      page: this.page,
      search_query: search,
      user_id: this.main.LoggedUserInfo.user_id,
    };
    this.khataService.getKhataUsers(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.khataList = response.data;
          this.khataList.forEach(element => {
            if (element.store_name == '') {
              element.store_name = '-';
            }
            if (element.amount == 0) {
              element.amount = '0.00';
            }
          })
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.khataList = [];
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

  /** Sorting data  */
  sort(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '78'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '12'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '12'
    }
    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;

        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }
}