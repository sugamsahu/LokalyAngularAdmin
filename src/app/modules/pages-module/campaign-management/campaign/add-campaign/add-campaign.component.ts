import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { CampaignService } from "src/app/services/campaign-management/campaign.service";
import { TemplateService } from "src/app/services/campaign-management/template.service";
import { ContactListService } from "src/app/services/campaign-management/contact-list.service";
import * as moment from "moment";
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-add-campaign",
  templateUrl: "./add-campaign.component.html",
  styleUrls: ["./add-campaign.component.scss"],
})
export class AddCampaignComponent implements OnInit, AfterViewInit {
  public formGroup: FormGroup;
  main: any = { LoggedUserInfo: {} };
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  business_model = this.platform_setting.business_model;
  campaign_id: any = 0;
  template_list: any = [];
  contact_list: any = [];
  repeat_list: any = [];
  min_date: any;
  do_not_repeat = 0;
  @ViewChild('cursor') cursor: ElementRef;
  is_duplicate: string;
  is_active: any;
  date_format: any;
  is_executed: any = 0;
  filter_on: any;
  week_no: any;
  send_date: any;
  repeat: any;
  tmplate_id: any;
  contact_id: any;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private CampaignService: CampaignService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private toastr: ToastrService,
    private TemplateService: TemplateService,
    private ContactListService: ContactListService,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    this.date_format = this.general_setting.date_format_web?.split(" ")[0]
    if (location.href.indexOf("/campaign/edit") > -1) {
      this.campaign_id = this.cryptoService.decryptIdValue(
        "campaign_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.is_duplicate = this.cryptoService.decryptIdValue(
        "campaign_id_duplicate" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.campaign_id == undefined) {
        this.router.navigate(["/campaign"]);
      }
    }
  }

  ngOnInit(): void {
    var filterObject: any;
    if (
      localStorage.getItem("seller_Order_obj") != null &&
      localStorage.getItem("seller_Order_obj") != undefined
    ) {
      filterObject = JSON.parse(localStorage.getItem("seller_Order_obj"));
    }
    if (filterObject) {
      this.filter_on = filterObject.isActive.toString();
    }
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.min_date = new Date();
    this.loadForm();
    this.templateListRecord();
    if (this.campaign_id > 0) {
      this.editDetails();
    }
  }
  //load form
  loadForm() {
    this.formGroup = this.formBuilder.group({
      campaign_name: [null, Validators.required],
      Type: ["1"],
      Subject: [null],
      selectedTemplate: [null],
      selectedContactList: [null],
      sendtype: ["1"],
      senddate: new FormControl(null),
      enddate: new FormControl(null),
      selectedRepeat: [null],
      is_active: [true],
      send_on_time: new FormControl(null)
    });
    this.formGroup.get("senddate").valueChanges.subscribe((val) => {
      this.onDateChange(val);
    });
  }

  //template list
  templateListRecord() {
    this.formGroup.controls["Subject"].setValue(null);
    this.formGroup.controls["selectedTemplate"].setValue(null);
    this.formGroup.controls["selectedContactList"].setValue(null);
    var data = {};
    this.TemplateService.getCampaignTemplate(data).subscribe({
      next: (response: any) => {
        this.contactListRecord();
        if (response.status == 1) {
          this.template_list = [];
          response.data.forEach((item) => {
            if (
              item.is_active == 1 &&
              item.templates_type == this.formGroup.value.Type
            ) {
              this.template_list.push(item);
            }
          });
          if (this.campaign_id > 0) {
            this.template_list.forEach((element) => {
              if (element.campaign_templates_id == this.tmplate_id) {
                this.formGroup.controls["selectedTemplate"].setValue(element);
              }
            });
          }
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => { this.contactListRecord(); },
      complete: () => { },
    });
  }

  //contact list
  contactListRecord() {
    var data = {};
    this.ContactListService.getContactList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.contact_list = [];
          response.data.forEach((item) => {
            if (item.is_active == 1) {
              this.contact_list.push(item);
            }
          });

          if (this.campaign_id > 0) {
            this.contact_list.forEach((element) => {
              if (element.campaign_contacts_id == this.contact_id) {
                this.formGroup.controls["selectedContactList"].setValue(
                  element
                );
              }
            });
            if (this.is_duplicate) {
              this.campaign_id = 0
            }
          }
        } else {
          if (this.is_duplicate) {
            this.campaign_id = 0
          }
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //get edit details by id
  editDetails() {
    var data = {
      campaign_id: this.campaign_id,
    };
    this.CampaignService.getCampaignList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.is_executed = this.is_duplicate ? 0 : response.data.is_executed;
          this.tmplate_id = response.data.campaign_templates_id;
          this.contact_id = response.data.campaign_contacts_id;
          this.is_active = response.data.is_active
          this.formGroup.controls["is_active"].setValue(
            response.data.is_active == 1 ? true : false
          );
          this.formGroup.controls["campaign_name"].setValue(
            response.data.campaign_name
          );
          this.formGroup.controls["Type"].setValue(response.data.campaign_type);
          this.formGroup.controls["Subject"].setValue(response.data.subject);
          this.formGroup.controls["sendtype"].setValue(response.data.send_type.toString());
          if (this.general_setting.date_format_web == 'DD-MM-YYYY HH:mm:ss') {
            let dateString = response.data.start_date_time?.split(" ")[0]
            let [day, month, year] = dateString.split('-')
            var dateObj = new Date(+year, +month - 1, +day)
            this.formGroup.controls["senddate"].setValue(
              dateObj
            );
          } else {
            let dateString = response.data.start_date_time?.split(" ")[0]
            let [month, day, year] = dateString.split('-')
            var dateObj = new Date(+year, +month - 1, +day)
            this.formGroup.controls["senddate"].setValue(
              new Date(response.data.start_date_time)
            );
          }
          var send_on_timeData = response.data.start_date_time?.split(" ")[1]
          this.formGroup.controls["send_on_time"].setValue((send_on_timeData));

          this.onDateChange(this.formGroup.value.senddate);
          if (this.general_setting.date_format_web == 'DD-MM-YYYY HH:mm:ss') {
            let dateString = response.data.end_date_time?.split(" ")[0]
            let [day, month, year] = dateString.split('-')
            var dateObj = new Date(+year, +month - 1, +day)
            this.formGroup.controls["enddate"].setValue(
              dateObj
            );
          } else {
            let dateString = response.data.end_date_time?.split(" ")[0]
            let [month, day, year] = dateString.split('-')
            var dateObj = new Date(+year, +month - 1, +day)
            this.formGroup.controls["enddate"].setValue(
              new Date(response.data.end_date_time)
            );
          }
          if (this.formGroup.value.sendtype == 2) {
            this.do_not_repeat = 1;
            var SendType = Number(response.data.repeat_type);
            this.formGroup.controls["selectedRepeat"].setValue(SendType);
            this.repeatFormData();
          }
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //send date
  onDateChange(item) {
    if (item) {
      var date;
      if (item._d) {
        date = item._d;
      } else {
        date = item;
      }
      this.send_date = moment(date).format(this.date_format);
      var fulldate = this.send_date.split("-");
      var onlyday = fulldate[0];
      var onlymomth = fulldate[1];

      var daynameNO;
      daynameNO = date.getDay();

      var monthname;
      var dayname;
      var getYearData = date.getFullYear();
      var lastday = (y, m) => {
        return new Date(y, m, 0).getDate();
      }
      var lastDateData = lastday(getYearData, onlymomth)

      this.translate
        .get([
          "SUN",
          "MON",
          "TUE",
          "WED",
          "THU",
          "FRI",
          "SAT",
          "DO_NOT_REPEAT",
          "DAILY",
          "WEEKLY_ON",
          "MONTHLY_ON",
          "EVERY_END_MONTH",
          "ANNUALY_ON",
          "EVRY_WEEKDAY_MONDAY_TO_FRIDAY",
          "JAN",
          "FEB",
          "MAR",
          "APR",
          "MAY",
          "JUN",
          "JUL",
          "AUG",
          "SEPT",
          "OCT",
          "NOV",
          "DEC",
        ])
        .subscribe((translations) => {
          if (daynameNO) {
            if (daynameNO == 0) {
              dayname = translations.SUN;
            }

            if (daynameNO == 1) {
              dayname = translations.MON;
            }

            if (daynameNO == 2) {
              dayname = translations.TUE;
            }

            if (daynameNO == 3) {
              dayname = translations.WED;
            }

            if (daynameNO == 4) {
              dayname = translations.THU;
            }

            if (daynameNO == 5) {
              dayname = translations.FRI;
            }

            if (daynameNO == 6) {
              dayname = translations.SAT;
            }
          }

          if (onlymomth) {
            if (onlymomth == 1) {
              monthname = translations.JAN;
            }

            if (onlymomth == 2) {
              monthname = translations.FEB;
            }

            if (onlymomth == 3) {
              monthname = translations.MAR;
            }

            if (onlymomth == 4) {
              monthname = translations.APR;
            }

            if (onlymomth == 5) {
              monthname = translations.MAY;
            }

            if (onlymomth == 6) {
              monthname = translations.JUN;
            }

            if (onlymomth == 7) {
              monthname = translations.JUL;
            }

            if (onlymomth == 8) {
              monthname = translations.AUG;
            }

            if (onlymomth == 9) {
              monthname = translations.SEPT;
            }

            if (onlymomth == 10) {
              monthname = translations.OCT;
            }

            if (onlymomth == 11) {
              monthname = translations.NOV;
            }

            if (onlymomth == 12) {
              monthname = translations.DEC;
            }
          }

          this.repeat_list = [
            { value: 0, label: translations.DO_NOT_REPEAT },
            { value: 1, label: translations.DAILY },
            { value: 2, label: translations.WEEKLY_ON + " " + dayname },
            { value: 3, label: translations.MONTHLY_ON + " " + onlyday },
            {
              value: 4,
              label: translations.ANNUALY_ON + " " + onlyday + " " + monthname,
            },
            { value: 5, label: translations.EVRY_WEEKDAY_MONDAY_TO_FRIDAY },
          ];

          if (onlyday == lastDateData) {
            this.repeat_list[6] = {
              value: 6, label: this.translate.instant("EVERY_END_MONTH")
            }
          }

        });

      this.week_no = date.getDay();
    }
  }

  //repeat
  repeatFormData() {
    if (
      this.formGroup.value.selectedRepeat ||
      this.formGroup.value.selectedRepeat == 0
    ) {
      this.repeat = this.formGroup.value.selectedRepeat;
      if (this.formGroup.value.selectedRepeat == 0) {
        this.formGroup.controls["enddate"].setValue(
          this.formGroup.value.senddate
        );
      } else if (this.do_not_repeat != 1) {
        this.formGroup.controls["enddate"].setValue(null);
      }
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

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  cancelClick() {
    history.back();
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }

  //submit
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
      this.toastr.error(this.translate.instant("ENTER_ALL_REQUIRED_FIELDS"));
      return;
    } else {
      let formData = new FormData();
      formData.append("user_id", this.main.LoggedUserInfo.user_id);
      formData.append("campaign_name", this.formGroup.value.campaign_name);
      formData.append("campaign_type", this.formGroup.value.Type);
      if (this.campaign_id) {
        formData.append("campaign_id", this.is_duplicate ? 0 : this.campaign_id);
      }
      formData.append("subject", this.formGroup.value.Subject ? this.formGroup.value.Subject : '');
      formData.append(
        "campaign_templates_id",
        this.formGroup.value.selectedTemplate.campaign_templates_id
      );
      formData.append(
        "campaign_contacts_id",
        this.formGroup.value.selectedContactList.campaign_contacts_id
      );
      formData.append(
        "is_active",
        this.formGroup.value.is_active == true ? "1" : "0"
      );
      formData.append("send_type", this.formGroup.value.sendtype);

      if (this.formGroup.value.sendtype == 2) {
        if (this.formGroup.value.send_on_time.split(":").length == 3) {
          formData.append(
            "start_date_time",
            moment(this.formGroup.value.senddate).format(this.date_format) + " " + this.formGroup.value.send_on_time
          );
        } else {
          formData.append(
            "start_date_time",
            moment(this.formGroup.value.senddate).format(this.date_format) + " " + this.formGroup.value.send_on_time + ":" + "00"
          );
        }

        formData.append(
          "end_date_time",
          moment(this.formGroup.value.enddate).format(this.date_format)
        );

        formData.append("repeat_type", this.repeat);

        formData.append("day_of_week", this.week_no);

        formData.append(
          "monthly_date",
          moment(new Date()).format(this.date_format)
        );
      }

      var data = formData;

      this.CampaignService.manageCampaigns(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/campaign`]);
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {
          this._snackbarService.error(error);
        },
        complete: () => { },
      });
    }
  }
}
