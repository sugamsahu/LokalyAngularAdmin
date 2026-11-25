import { UnitTypeService } from "../../../../services/lookup/unit-type.service";
import { TranslateService } from "@ngx-translate/core";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  fromEvent,
  filter,
  debounceTime,
  distinctUntilChanged,
  tap,
} from "rxjs";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { environment } from "src/environments/environment";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-unit-type",
  templateUrl: "./unit-type.component.html",
  styleUrls: ["./unit-type.component.scss"],
})
export class unitTypeComponent implements OnInit {
  POSTS: any;
  page: number = 1;
  count: number = 0;
  table_size = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  unit_type_list: [];
  search: any;
  no_data = true;
  main: any;
  sortKey: any = "";
  isOrderBy: boolean = true;

  @ViewChild("search", { static: true }) searchbox: ElementRef;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private unitTypeservice: UnitTypeService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private _helpService: BannerService,
    private modalService: NgbModal,
    private cryptoService: CryptoService,
    private router: Router,
    private appComponent: AppComponent,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit() {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    var preUrl = localStorage.getItem("Previous_URL");
    let previousURL = preUrl.slice(0, preUrl.lastIndexOf("/"));
    var filterObject;
    this.search = "";
    this.count = 0;
    if (previousURL == "/unit-type") {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    } else {
      localStorage.removeItem("seller_Order_obj");
    }

    if (filterObject) {
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
      this.searchbox.nativeElement.value = this.search;
    }
    this.GetUnitTypeList(this.page);

    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.GetUnitTypeList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetUnitTypeList(1);
    }
  }

  GetUnitTypeList(page): void {


    this.page = page;
    var data = {
      page: this.page,
      search_query: this.search,
      limit: this.table_size,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };

    this.unitTypeservice.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.unit_type_list = response.data;
          this.no_data = false;
          this.count = response.count;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.unit_type_list = [];
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

  editunitDetail(id) {
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id.toString(),
      "lookup_unit_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );

    this.router.navigate(["/unit-type/edit"]);
  }

  onSearchChange(value) {
    this.search = value;
    this.GetUnitTypeList(0);
  }

  sortAPISide(columnName) {
    this.sortKey = columnName; //set the sortKey to the param passed
    this.isOrderBy = !this.isOrderBy;
    this.GetUnitTypeList(this.page);
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
      data.module_key = '52'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '52'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '52'
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
