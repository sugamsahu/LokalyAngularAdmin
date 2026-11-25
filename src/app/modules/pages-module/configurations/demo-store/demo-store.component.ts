import { Component, ElementRef, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { CommonService } from "src/app/services/common.service";
import { DemoStoreService } from "src/app/services/configuration/demo-store.service";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-demo-store",
  templateUrl: "./demo-store.component.html",
  styleUrls: ["./demo-store.component.scss"],
})
export class DemoStoreComponent implements OnInit {
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.general_setting.store_label;
  main: any = { LoggedUserInfo: {} };
  formGroup: FormGroup;
  demo_user_list: any = [];
  demo_store_list = [];
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";

  constructor(
    private appComponent: AppComponent,
    public translate: TranslateService,
    private router: Router,
    private spinner: SpinnerService,
    private DemoStoreService: DemoStoreService,
    public commonService: CommonService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private _helpService: BannerService,
    private modalService: NgbModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();
    this.GetUserDetails();
    this.getHelpDetails()
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      demo_store: new FormControl(""),
    });
  }
  /** Get selected user by it's user id */
  id;
  getSelecteduser(item) {
    var userid = item.user_id;
    this.id = userid;
    this.GetStoreDetails(userid);
    this.formGroup.controls["demo_store"].setValue(item);
  }

  // get seller
  async GetUserDetails() {
    var data = {
      market_type: 2
    }
    await this.DemoStoreService.getSellerListRecord(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach(element => {
            var obj = this.demo_user_list.filter((item) => item.phone == element.phone)[0]
            if (!obj) {
              this.demo_user_list.push(element)
            }
          });
          this.GetStoreDetails(this.demo_user_list[0].user_id);
          this.formGroup.controls["demo_store"].setValue(this.demo_user_list[0]);
        }
      },
      error: (error) => {
        this.spinner.hide();
      },
      complete: () => {
      },
    });
  }

  // get stores
  async GetStoreDetails(daata) {
    daata = daata || null;
    var data = {
      demoapp_user_id: daata,
    };

    await this.DemoStoreService.getDemoStoreSellerListRecord(data).subscribe({
      next: (response: any) => {
        this.demo_store_list = [];
        if (response.status == 1) {
          this.demo_store_list = response.data;
        }
        if (this.demo_store_list.length == 0) {
          this.toastr.error(this.translate.instant("NO_RECORD_FOUNDS"));
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }
  /** Submit edited data by it's service */
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      var data = {
        store_owner_user_id: this.id,
        app_user_id: 1,
      };
      this.DemoStoreService.editSubCategoryType(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/demo-store`]);
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
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement =
      this.el.nativeElement.querySelector("form .ng-invalid");

    window.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: "smooth",
    });
  }
  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  cancelClick() {
    history.back();
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      // backdrop: "static",
      // keyboard: false,
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
      data.module_key = '38'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '38'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '38'
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