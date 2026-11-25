import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { RegionMasterService } from 'src/app/services/lookup/region-master.service';
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap } from "rxjs";
import { environment } from "src/environments/environment"
import { AppComponent } from 'src/app/app.component';
import Swal from 'sweetalert2';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-region-master',
  templateUrl: './region-master.component.html',
  styleUrls: ['./region-master.component.scss']
})
export class RegionMasterComponent implements OnInit {
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  no_data = true;
  search = "";
  main: any;
  region_list: any = [];
  sortKey: any = "";
  isOrderBy: boolean = true;
  @ViewChild("search", { static: true }) searchbox: ElementRef;

  selectedRegionType = '1'
  region_change: boolean = false;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  hide_add: boolean = false;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private toastr: ToastrService,
    private cryptoService: CryptoService,
    private regionMasterService: RegionMasterService,
    private appComponent: AppComponent,
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

    if (localStorage.getItem("seller_Order_obj") != null && localStorage.getItem("seller_Order_obj") != undefined) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
      localStorage.removeItem("seller_Order_obj");
    }
    if (this.platform_setting.business_model == 3 && this.main.LoggedUserInfo.role_id == 1) {
      this.hide_add = true;
    }
    if (filterObject) {
      this.search = filterObject.search;
      this.page = filterObject.page;
      this.table_size = filterObject.limit;
      this.searchbox.nativeElement.value = this.search;
      this.selectedRegionType = filterObject.regionType
    }

    this.GetRegionList(this.page);

    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.GetRegionList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetRegionList(1);
    }
  }

  GetRegionList(page): void {

    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }

    this.page = page;
    var data: any = {};

    data = {
      type_list: this.selectedRegionType,
      page: this.page,
      search_query: search,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.is_config = 1;
    } else {
      data.is_config = 0;
    }

    this.regionMasterService.getRegionList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.region_change = true;
          this.region_list = response.data;
          this.count = response.count;
          this.no_data = false;
        } else {
          this.toastr.error(response.message);
          this.no_data = true;
          this.count = 0;
          this.region_list = [];
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {

      }
    })
  }

  chnageRegionType(event) {
    this.search = this.search;
    this.searchbox.nativeElement.value = this.search;
    this.selectedRegionType = event.target.defaultValue;
    this.GetRegionList(1);
  }

  editRegionDetail(item) {
    var obj = {
      page: this.page,
      search: this.search,
      regionType: this.selectedRegionType,
      sortKey: this.sortKey,
      isOrderBy: this.isOrderBy,
      limit: this.table_size,
    }

    item.regionType = this.selectedRegionType;

    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    localStorage.setItem("regionDetail", JSON.stringify(item));
    this.cryptoService.encryptIdValue(
      item.id.toString(),
      "lookup_regionMaster_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );

    this.router.navigate(["/region-master/edit"]);
  }

  deleteRegion(item) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_REGION"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteRegionMethodConfirm(item);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  deleteRegionMethodConfirm(item) {
    var data = {
      type_list: this.selectedRegionType,
      region_id: item.id,
      name: item.name,
      is_active: item.is_active,
      is_deleted: 1
    };
    this.regionMasterService.manageRegion(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant('REGION_DELETE_SUCCESSFULLY'));
          this.GetRegionList(this.page);
        } else {
          this.toastr.error(response.message)
        }
      },
      error: (error) => {
        this.toastr.error(error)
      },
      complete: () => {
      }
    })
  }

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetRegionList(this.page);
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
      data.module_key = '56'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '56'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '56'
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

