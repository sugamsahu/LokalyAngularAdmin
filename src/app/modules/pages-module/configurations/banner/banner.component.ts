import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { environment } from "src/environments/environment"
import Swal from 'sweetalert2';
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap, } from "rxjs";
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {

  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  no_data = true;
  main: any;
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  search: any;
  isActive: string;
  banner_list: [];
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  status: any;

  constructor(
    private appComponent: AppComponent,
    private router: Router,
    public translate: TranslateService,
    private toastr: ToastrService,
    private _bannerService: BannerService,
    private cryptoService: CryptoService,
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
    this.cryptoService.clearCookie("configurations_banner_Id" + this.main.LoggedUserInfo.role_id?.toString());
    var filterObject:any;
    this.page = 1;
    this.search = "";
    this.count = 0;  
    if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }
    if (filterObject) {
      this.search = filterObject.search;      
      this.page = filterObject.page;
      this.tableSizes = filterObject.limit;
      this.searchbox.nativeElement.value = this.search; 
      this.status = JSON.parse(localStorage.getItem("isActive_status"))
      localStorage.removeItem("isActive_status");
      if (this.status) {
        this.isActive = this.status;
      }
    }
    else {
      this.isActive = '1'
    }
    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean),
        debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.getBannerList(1);
        })
      )
      .subscribe();
    this.getBannerList(this.page);
    this.getHelpDetails()
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.getBannerList(1);
    }
  }

  getBannerList(page): void {
    this.page = page;
    const data = {
      is_active: this.isActive,
      page: this.page,
      search_query: this.search,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy == true ? 1 : 2
    }
    this._bannerService.getBannerList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(item => {
            item.banner_type_name = item.banner_type == 1 ? this.translate.instant('FIRST_BANNER') :
              item.banner_type == 2 ? this.translate.instant('SECOND_BANNER') :
                item.banner_type == 3 ? this.translate.instant('THIRD_BANNER') :
                  item.banner_type == 4 ? this.translate.instant('FOURTH_BANNER') :
                    this.translate.instant('FIFTH_BANNER')
          });
          this.banner_list = response.data;
          this.count = response.count;
          this.no_data = false;
        } else {
          this.banner_list = []
          this.no_data = true
          this.count = 0
        }
      },
      error: (error) => {
        this.toastr.error(error);
      }
    })
  }

  deleteBanner(id) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteBannerConfirm(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  deleteBannerConfirm(id) {
    const data = {
      global_banner_id: id
    }
    this._bannerService.deleteGlobalBanner(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(response.message);
          this.getBannerList(this.page);
        }
      },
      error: (error) => {
        this.toastr.error(error);
      }
    })
  }

  editBanner(id) {
    const obj = {
      page: this.page,
      search: this.search,
      limit: this.table_size,
    }
    localStorage.setItem("isActive_status", JSON.stringify(this.isActive));

    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(
      id.toString(),
      "configurations_banner_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/banner/edit"]);
  }

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
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '37'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '37'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '37'
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