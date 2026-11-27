import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from 'src/app/app.component';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { HelpInfoModelComponent } from '../model/help-info/help-info.component';
import { BannerService } from 'src/app/services/configuration/banner.service';


@Component({
  selector: 'app-view-management',
  templateUrl: './view-management.html',
  styleUrls: ['./view-management.scss']
})
export class ViewManagementComponent implements OnInit {
  generalSetting: any = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  view_list: any = [];
  view_count: any;
  @ViewChild("searchevt", { static: true }) searchbox: ElementRef;
  page: any;
  tableSize = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  search: any;
  count: number = 0; 
  main: any;
  no_data = true;
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  is_duplicate_view : any = false;

  constructor(
    public formbuilder: UntypedFormBuilder,
    private modalService: NgbModal,
    private router: Router,
    public commonService: CommonService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cryptoService: CryptoService,
    private _helpService: BannerService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }


  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin || !this.generalSetting.visualization_module) {
      this.router.navigate(['/dashboard']);
    }
    this.cryptoService.clearCookie(
      "View_management_id" + this.main.LoggedUserInfo.role_id.toString()
    );
    this.cryptoService.clearCookie(
      "duplicate_view_management_id" + this.main.LoggedUserInfo.role_id.toString()
    );
    var filterObject;
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
      this.tableSize = filterObject.limit;
      this.searchbox.nativeElement.value = this.search; 
    }
    this.GetViewList(this.page);    

    fromEvent(this.searchbox.nativeElement, "keyup")
      .pipe(
        filter(() => !window.getSelection().toString()),
        filter(Boolean), debounceTime(environment.search_time),
        distinctUntilChanged(),
        tap(() => {
          this.search = this.searchbox.nativeElement.value;
          this.GetViewList(1);
        })
      )
      .subscribe();
    this.getHelpDetails();

  } 

  GetViewList(page) {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;
    var data = {
      search_query: search,
      page: this.page
    };

    this.commonService.getViewManageList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.no_data = false;
          this.view_list = response.data;
          this.view_count = response.count
        } else {
          this.no_data = true;
          this.count = 0;
          this.view_list = [];
        }

      }
    })
  }

  addView(){
    localStorage.removeItem("isDuplicateView")
    this.router.navigate(["/view-management/add"]);
  }

  duplicateView(duplicate_id:any){
    console.log(duplicate_id);
    this.is_duplicate_view = true
    localStorage.setItem("isDuplicateView", this.is_duplicate_view);
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.tableSize,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(duplicate_id.toString(),
      "View_management_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/view-management/edit"]);
  }

  viewCustomerDetail(details: any) {
    localStorage.removeItem("isDuplicateView")
    localStorage.setItem(`${details.url_path}displayViewId`, (details.master_view_id));
    // this.router.navigate([`/customer-view/${details.url_path}`]);
    localStorage.setItem(`${details.url_path}displayViewName`, details.view_name);
    localStorage.setItem(`${details.url_path}specifictoShowStore`, details.specific_to);
    localStorage.setItem(`${details.url_path}showFilterType`, details.filter_type);
    localStorage.setItem(`${details.url_path}filterName`, details.filter_name);
    window.open(`/customer-view/${details.url_path}`, '_blank').focus();
  }

  editView(id) {
    localStorage.removeItem("isDuplicateView")
    var obj = {
      page: this.page,
      search: this.search,
      limit: this.tableSize,
    };
    localStorage.setItem("seller_Order_obj", JSON.stringify(obj));
    this.cryptoService.encryptIdValue(id.toString(),
      "View_management_id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.router.navigate(["/view-management/edit"]);
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetViewList(1);
    }
  }

  deleteViewList(id) {
    Swal.fire({
      title: this.translate.instant("Are you sure?"),
      text: this.translate.instant("Delete View Details"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("Cancel"),
    }).then((result) => {
      if (result.value) {
        this.ConfirmDelete(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  ConfirmDelete(id) {
    const data = {
      master_view_id: id,
    }
    this.commonService.DeleteViewList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
          this.GetViewList(this.page);
        }
      },
      error: (error) => { },
      complete: () => { }
    })
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
    if (this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '145'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });
  }

}
