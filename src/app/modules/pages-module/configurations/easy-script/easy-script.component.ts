import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { EasyScriptModalComponent } from '../../model/easy-script/easy-script.component';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { Router } from '@angular/router';
import Swal from "sweetalert2";
import { EasyScriptService } from 'src/app/services/configuration/easy-script.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-easy-script',
  templateUrl: './easy-script.component.html',
  styleUrls: ['./easy-script.component.scss']
})
export class EasyScriptComponent implements OnInit {

  main: any;
  general_setting = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  store_tax_label = this.general_setting.store_tax_label;
  store_label = this.general_setting.store_label;
  global_currency = this.general_setting.currency_symbol;

  constructor(
    private translate: TranslateService,
    private appComponent: AppComponent,
    private modalService: NgbModal,
    private _helpService: BannerService,
    private router: Router,
    private easyscriptservice: EasyScriptService,
    private _snackbarService: ToastrService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }

    if (!this.general_setting) {
      this.store_tax_label = this.main.store_tax_label;
      this.store_label = this.main.store_label;
    }
    this.getHelpDetails();
  }

  /** Open EasyScriptModalComponent modal */
  buttonClick(value: number) {
    const modalRef = this.modalService.open(EasyScriptModalComponent, {
      size: "lg",
      centered: true
    });
    modalRef.componentInstance.buttonValue = value;
    modalRef.componentInstance.store_tax_label = this.store_tax_label;
    modalRef.componentInstance.store_label = this.store_label;
    modalRef.componentInstance.global_currency = this.global_currency
    modalRef.componentInstance.main = this.main
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
      data.module_key = '39'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '39'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '39'
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

  generateSitemap() {
    const currentDay = new Date().getUTCDate();
    const currentMonth = new Date().getUTCMonth() + 1; // January is 0, so we add 1
    const nextDayAndMonth = this.getNextDayAndMonth(currentDay, currentMonth);
    Swal.fire({
      title: this.translate.instant("The next sitemap.xml will be generated on " + nextDayAndMonth + " at 00:00 UTC!"),
      text: this.translate.instant("Do you still want to continue?"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.continueGenerateSitemap();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  getNextDayAndMonth(currentDay: number, currentMonth: number): string {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    // Check if it's the end of February and it's a leap year
    if (currentMonth === 2 && isLeapYear(new Date().getUTCFullYear())) {
      daysInMonth[currentMonth - 1] = 29;
    }
    let nextDay = currentDay + 1;
    let nextMonth = currentMonth;
    // Check if next day exceeds the current month's days
    if (nextDay > daysInMonth[currentMonth - 1]) {
      nextDay = 1;
      nextMonth++;
      // If next month is greater than 12, wrap around to January of next year
      if (nextMonth > 12) {
        nextMonth = 1;
      }
    }
    if (this.general_setting.date_format.split('-')[0] == 'dd') {
      return `${this.padZero(nextDay)}/${this.padZero(nextMonth)}`;
    } else {
      return `${this.padZero(nextMonth)}/${this.padZero(nextDay)}`;
    }
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  continueGenerateSitemap() {
    var data = {}
    this.easyscriptservice.generateEasyScript(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this._snackbarService.success(response.message);
        } else {
          this._snackbarService.error(response.message);
        }
      },
    });
  }
}
