import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { SettingsService } from "src/app/services/settings.service";
@Component({
  selector: "app-help-add-edit",
  templateUrl: "./help-add-edit.component.html",
  styleUrls: ["./help-add-edit.component.scss"],
})
export class HelpAddEditComponent implements OnInit {
  content_id: any = 0;
  languages = [];
  active: any = 1;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  main: any = {};
  customer_User_Id: any = 0;
  constructor(
    private settingsService: SettingsService,
    private cdr: ChangeDetectorRef,
    private appComponent: AppComponent,
    private router: Router,
    private cryptoService: CryptoService,
  ) {
    var pagemgmtobj = JSON.parse(localStorage.getItem("seller_Order_obj"));
    var languageList = JSON.parse(localStorage.getItem("languageList"));
    if (pagemgmtobj) {
      this.languages = pagemgmtobj.languages;
      this.active = 1;
    } else if (languageList) {
      this.languages = languageList
      this.active = 1;
    } else {
      this.getLanguageList();
      this.active = 1;
    }
    this.main = this.appComponent.main;
    if (location.href.indexOf("/help/edit") > -1) {
      this.content_id = this.cryptoService.decryptIdValue(
        "help_module_key_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.content_id == undefined) {
        this.router.navigate(["/help"]);
      }
    }
  }

  ngOnInit() {
    if (location.href.indexOf("/help/edit") > -1) {
      this.content_id = 1;
    } else {
      this.content_id = 0;
    }
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
  }

  //language
  async getLanguageList() {
    var data = {};
    await this.settingsService.getLanguageList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach((item: any) => {
            item.sequence_no = item.language_id
            if (item.language_id == 1 || item.language_id == 2) {
              this.languages.push(item);
            }
          });
          this.active = 1;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }

  navChanged(event) {
  }

  cancelClick() {
    history.back();
  }
}


