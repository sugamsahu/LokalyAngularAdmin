import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { AppComponent } from "src/app/app.component";
import { SettingsService } from "src/app/services/settings.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-delete-account",
  templateUrl: "./delete-account.component.html",
  styleUrls: ["./delete-account.component.scss"],
})
export class DeleteAccountComponent implements OnInit {
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  main: any = { LoggedUserInfo: {} };
  Delete_form: any;
  delete = {
    is_agree: "",
  };
  helpDetails: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  constructor(
    private router: Router,
    private appComponent: AppComponent,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private SettingsService: SettingsService,
    private modalService: NgbModal,
    private _snackbarService: ToastrService,
    private toastr: ToastrService,
    private _helpService: BannerService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.getHelpDetails();
  }
  
  /** Deletec account */
  deleteAccount() {
    if (!this.delete.is_agree) {
      this.toastr.error(
        this.translate.instant("AGREE_TO_THE_TERMS_OF_ACCOUNT_DELETION")
      );
      return;
    } else {
      var data = {
        user_id: this.main.LoggedUserInfo.user_id,
      };
      this.SettingsService.deleteaccount(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            localStorage.clear();
            this.router.navigate([`/auth/login`]);
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          this._snackbarService.error(error);
        },
        complete: () => { },
      });
    }
  }

  cancelClick() {
    history.back();
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
      data.module_key = '134'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '134'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '134'
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
