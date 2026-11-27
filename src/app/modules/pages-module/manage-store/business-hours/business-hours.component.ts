import {
  Component,
  OnInit,
  ElementRef,
  ChangeDetectorRef,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { ManageStoreService } from "src/app/services/manage-store.service";
import { BusinessHoursInfoComponent } from "../../model/business-hours-info/business-hours-info.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BusinessHoursService } from "src/app/services/store-management/business-hours.service";
import { Router } from "@angular/router";
import { SortPipe } from "../../util/sort.pipe";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-business-hours",
  templateUrl: "./business-hours.component.html",
  styleUrls: ["./business-hours.component.scss"],
})
export class BusinessHoursComponent implements OnInit {
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  deliveryboy_label = this.general_setting.deliveryboy_label;
  store_label = this.general_setting.store_label;
  khata_label = this.general_setting.khata_label;
  allow_khata = this.general_setting.allow_khata;
  global_currency = this.general_setting.currency_symbol;
  allow_wallet = this.general_setting.allow_wallet;
  offers_module = this.general_setting.offers_module;
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  subscription_model = this.PlatformSetting.subscription_model;
  iseatery = this.seller_details.iseatery;
  formGroup: UntypedFormGroup;
  main: any;
  hourList: any = [];
  business_hours_id: any;
  days: any;
  selectedDay = 0;
  mondis = false;
  tuedis = false;
  weddis = false;
  thrudis = false;
  fridis = false;
  satdis = false;
  sundis = false;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  skipShow: boolean = true;
  total_count: any = 0;
  addNewDay = 0;
  morningBusinessHoursId: any;
  eveningBusinessHoursId: any;

  constructor(
    private router: Router,
    public translate: TranslateService,
    public manageStoreService: ManageStoreService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private modalService: NgbModal,
    public BusinessHoursService: BusinessHoursService,
    private sortPipe: SortPipe,
    private _helpService: BannerService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    this.hourList = [];
    this.selectedDay = 0;
    this.mondis = false;
    this.tuedis = false;
    this.weddis = false;
    this.thrudis = false;
    this.fridis = false;
    this.satdis = false;
    this.sundis = false;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    if (this.general_setting) {
      this.store_label = this.general_setting.store_label;
    } else {
      this.store_label = this.main.store_label;
    }
    this.DineInSettingRecord();
    this.loadform();
    this.getHelpDetails();
  }

  //LOAD FORM
  loadform() {
    this.formGroup = this.formBuilder.group({
      mon: new UntypedFormControl(true),
      tue: new UntypedFormControl(true),
      wed: new UntypedFormControl(true),
      thru: new UntypedFormControl(true),
      fri: new UntypedFormControl(true),
      sat: new UntypedFormControl(true),
      sun: new UntypedFormControl(true),
      isopened: new UntypedFormControl("0"),
      timepickerMorningFrom: new UntypedFormControl(null),
      timepickerMorningTo: new UntypedFormControl(null),
      isDeliveryMorning: new UntypedFormControl(false),
      isExpressDeliveryMorning: new UntypedFormControl(false),
      isPickUpMorning: new UntypedFormControl(false),
      timepickerEveningFrom: new UntypedFormControl(null),
      timepickerEveningTo: new UntypedFormControl(null),
      isDeliveryEvening: new UntypedFormControl(false),
      isExpressDeliveryEvening: new UntypedFormControl(false),
      isPickUpEvening: new UntypedFormControl(false),
    });
  }

  //modal
  /** Open BusinessHoursInfoComponent modal */
  openinfo() {
    const modalRef = this.modalService.open(BusinessHoursInfoComponent, {
      size: "lg",
    });
    modalRef.componentInstance.StoreLabel = this.store_label;
  }

  //get business hours
  async DineInSettingRecord() {
    var data = {
      store_id: this.seller_details.store_id,
    };
    await this.BusinessHoursService.getBusinessHourDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.hourList = response.data;
          this.hourList.forEach((item) => {
            item.time_slots = this.sortPipe.transform(
              item.time_slots,
              "asc",
              "day_slots"
            );
          });
          this.total_count = this.hourList.length;
          this.formGroup.controls["mon"].setValue(false);
          this.formGroup.controls["tue"].setValue(false);
          this.formGroup.controls["wed"].setValue(false);
          this.formGroup.controls["thru"].setValue(false);
          this.formGroup.controls["fri"].setValue(false);
          this.formGroup.controls["sat"].setValue(false);
          this.formGroup.controls["sun"].setValue(false);
          var days = [];
          this.hourList.forEach((element) => {
            days.push(element.days);
          });          
          var temp = [];
          var temp1 = [];
          days.forEach((el) => {
            if (el.length == 1) {
              temp.push(el);
            }
            if (el.length > 1) {
              temp1 = el.split(",");
            }
          });
          temp1.forEach((data) => {
            temp.push(data);
          });
          temp.forEach((element) => {
            if (element == 0) {
              this.formGroup.controls["mon"].setValue(true);
              this.addNewDay = 1;
            }
            if (element == 1) {
              this.formGroup.controls["tue"].setValue(true);
              this.addNewDay = 1;
            }
            if (element == 2) {
              this.formGroup.controls["wed"].setValue(true);
              this.addNewDay = 1;
            }
            if (element == 3) {
              this.formGroup.controls["thru"].setValue(true);
              this.addNewDay = 1;
            }
            if (element == 4) {
              this.formGroup.controls["fri"].setValue(true);
              this.addNewDay = 1;
            }
            if (element == 5) {
              this.formGroup.controls["sat"].setValue(true);
              this.addNewDay = 1;
            }
            if (element == 6) {
              this.formGroup.controls["sun"].setValue(true);
              this.addNewDay = 1;
            }
          });
          if (this.formGroup.value.mon == false) {
            this.mondis = true;
          }
          if (this.formGroup.value.tue == false) {
            this.tuedis = true;
          }
          if (this.formGroup.value.wed == false) {
            this.weddis = true;
          }
          if (this.formGroup.value.thru == false) {
            this.thrudis = true;
          }
          if (this.formGroup.value.fri == false) {
            this.fridis = true;
          }
          if (this.formGroup.value.sat == false) {
            this.satdis = true;
          }
          if (this.formGroup.value.sun == false) {
            this.sundis = true;
          }
          this.cdr.detectChanges();
        }
        if (this.hourList.length == 0) {
          this.formGroup.controls["mon"].setValue(false);
          this.formGroup.controls["tue"].setValue(false);
          this.formGroup.controls["wed"].setValue(false);
          this.formGroup.controls["thru"].setValue(false);
          this.formGroup.controls["fri"].setValue(false);
          this.formGroup.controls["sat"].setValue(false);
          this.formGroup.controls["sun"].setValue(false);
          this.formGroup.controls["isopened"].setValue(null);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  onPreviousButton() {
    this.router.navigate([`/storebanner`])
  }

  onNextButton() {
    this.router.navigate([`/payment-setting`]);
  }

  //edit
  editDay(item) {
    this.selectedDay = 1;
    this.business_hours_id = item.business_hours_id;
    this.formControls(item); //control checkboxes and form open
    this.editTime(item); //time binding and time edit
    this.days;
    if (item.days.length > 1) {
      var dayno: any = [];
      dayno = item.days.split(",");
      this.days = dayno.toString();
    } else {
      this.days = Number(item.days);
    }
  }

  //control checkboxes and form open
  formControls(item) {
    var dayNo: any = [];
    this.mondis = false;
    this.tuedis = false;
    this.weddis = false;
    this.thrudis = false;
    this.fridis = false;
    this.satdis = false;
    this.sundis = false;
    if (item.days.length > 1) {
      var day = item.days.split(",");
      dayNo = day;
      dayNo.forEach((day) => {
        if (day == 0) {
          this.mondis = true;
        }
        if (day == 1) {
          this.tuedis = true;
        }
        if (day == 2) {
          this.weddis = true;
        }
        if (day == 3) {
          this.thrudis = true;
        }
        if (day == 4) {
          this.fridis = true;
        }
        if (day == 5) {
          this.satdis = true;
        }
        if (day == 6) {
          this.sundis = true;
        }
      });
    } else {
      if (item.days == 0) {
        this.mondis = true;
      }
      if (item.days == 1) {
        this.tuedis = true;
      }
      if (item.days == 2) {
        this.weddis = true;
      }
      if (item.days == 3) {
        this.thrudis = true;
      }
      if (item.days == 4) {
        this.fridis = true;
      }
      if (item.days == 5) {
        this.satdis = true;
      }
      if (item.days == 6) {
        this.sundis = true;
      }
    }
    //form open and close control
    if (item.is_open == 1) {
      this.formGroup.controls["isopened"].setValue("1");
    } else {
      this.formGroup.controls["isopened"].setValue("0");
    }
  }

  //time binding and time edit
  editTime(item) {
    this.resetMorningTime();
    this.resetEveningTime();
    if (item.time_slots.length == 2) {
      //morning
      if (item.time_slots[0]) {
        this.morningBusinessHoursId = item.time_slots[0].business_hours_id;
        this.formGroup.controls["timepickerMorningFrom"].setValue(
          item.time_slots[0].from_time == "00:00" ? null : item.time_slots[0].from_time
        );
        this.formGroup.controls["timepickerMorningTo"].setValue(
          item.time_slots[0].to_time == "00:00" ? null : item.time_slots[0].to_time
        );
        this.formGroup.controls["isDeliveryMorning"].setValue(
          item.time_slots[0].is_deliver
        );
        this.formGroup.controls["isExpressDeliveryMorning"].setValue(
          item.time_slots[0].is_express_delivery
        );
        this.formGroup.controls["isPickUpMorning"].setValue(
          item.time_slots[0].is_pickup
        );
      }
      //evening
      if (item.time_slots[1]) {
        this.eveningBusinessHoursId = item.time_slots[1].business_hours_id;
        this.formGroup.controls["timepickerEveningFrom"].setValue(
          item.time_slots[1].from_time == "00:00" ? null : item.time_slots[1].from_time
        );
        this.formGroup.controls["timepickerEveningTo"].setValue(
          item.time_slots[1].to_time == "00:00" ? null : item.time_slots[1].to_time
        );
        this.formGroup.controls["isDeliveryEvening"].setValue(
          item.time_slots[1].is_deliver
        );
        this.formGroup.controls["isExpressDeliveryEvening"].setValue(
          item.time_slots[1].is_express_delivery
        );
        this.formGroup.controls["isPickUpEvening"].setValue(
          item.time_slots[1].is_pickup
        );
      }
    }
    if (item.time_slots.length == 1) {
      //morning
      if (item.time_slots[0].day_slots == 1) {
        this.morningBusinessHoursId = item.time_slots[0].business_hours_id;
        this.formGroup.controls["timepickerMorningFrom"].setValue(
          item.time_slots[0].from_time == "00:00" ? null : item.time_slots[0].from_time
        );
        this.formGroup.controls["timepickerMorningTo"].setValue(
          item.time_slots[0].to_time == "00:00" ? null : item.time_slots[0].to_time
        );
        this.formGroup.controls["isDeliveryMorning"].setValue(
          item.time_slots[0].is_deliver
        );
        this.formGroup.controls["isExpressDeliveryMorning"].setValue(
          item.time_slots[0].is_express_delivery
        );
        this.formGroup.controls["isPickUpMorning"].setValue(
          item.time_slots[0].is_pickup
        );
      }
      //evening
      if (item.time_slots[0].day_slots == 2) {
        this.eveningBusinessHoursId = item.time_slots[0].business_hours_id;
        this.formGroup.controls["timepickerEveningFrom"].setValue(
          item.time_slots[0].from_time == "00:00" ? null : item.time_slots[0].from_time
        );
        this.formGroup.controls["timepickerEveningTo"].setValue(
          item.time_slots[0].to_time == "00:00" ? null : item.time_slots[0].to_time
        );
        this.formGroup.controls["isDeliveryEvening"].setValue(
          item.time_slots[0].is_deliver
        );
        this.formGroup.controls["isExpressDeliveryEvening"].setValue(
          item.time_slots[1].is_express_delivery
        );
        this.formGroup.controls["isPickUpEvening"].setValue(
          item.time_slots[0].is_pickup
        );
      }
    }
  }

  //reset morning
  resetMorningTime() {
    this.formGroup.controls["timepickerMorningFrom"].setValue(null);

    this.formGroup.controls["timepickerMorningTo"].setValue(null);

    this.formGroup.controls["isDeliveryMorning"].setValue(false);

    this.formGroup.controls["isExpressDeliveryMorning"].setValue(false);

    this.formGroup.controls["isPickUpMorning"].setValue(false);
  }

  //reset evenung
  resetEveningTime() {
    this.formGroup.controls["timepickerEveningFrom"].setValue(null);

    this.formGroup.controls["timepickerEveningTo"].setValue(null);

    this.formGroup.controls["isDeliveryEvening"].setValue(false);
    this.formGroup.controls["isExpressDeliveryEvening"].setValue(false);

    this.formGroup.controls["isPickUpEvening"].setValue(false);
  }
  /** Submit business hours data */
  //submit
  onSubmit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      if (this.addNewDay == 1) {
        this.selectedDay = 1;

        //get day no
        var days: any = [];
        if (this.formGroup.value.mon == true && this.mondis == true) {
          days.push(0);
        }
        if (this.formGroup.value.tue == true && this.tuedis == true) {
          days.push(1);
        }
        if (this.formGroup.value.wed == true && this.weddis == true) {
          days.push(2);
        }
        if (this.formGroup.value.thru == true && this.thrudis == true) {
          days.push(3);
        }
        if (this.formGroup.value.fri == true && this.fridis == true) {
          days.push(4);
        }
        if (this.formGroup.value.sat == true && this.satdis == true) {
          days.push(5);
        }
        if (this.formGroup.value.sun == true && this.sundis == true) {
          days.push(6);
        }

        if (days.length == 0) {
          this.toastr.error(
            this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_DAY")
          );
          return;
        }
        this.days = days.toString();
      }
      if (this.hourList.length == 0) {
        this.selectedDay = 1;

        //get day no
        var days: any = [];
        if (this.formGroup.value.mon == true) {
          days.push(0);
        }
        if (this.formGroup.value.tue == true) {
          days.push(1);
        }
        if (this.formGroup.value.wed == true) {
          days.push(2);
        }
        if (this.formGroup.value.thru == true) {
          days.push(3);
        }
        if (this.formGroup.value.fri == true) {
          days.push(4);
        }
        if (this.formGroup.value.sat == true) {
          days.push(5);
        }
        if (this.formGroup.value.sun == true) {
          days.push(6);
        }

        if (days.length == 0) {
          this.toastr.error(
            this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_DAY")
          );
          return;
        }
        this.days = days.toString();
      }
      if (this.selectedDay == 0) {
        this.toastr.error(
          this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_DAY")
        );

        return;
      }

      if (
        this.formGroup.value.isopened == 1 &&
        this.formGroup.value.timepickerMorningFrom == null &&
        this.formGroup.value.timepickerMorningTo == null &&
        this.formGroup.value.timepickerEveningFrom == null &&
        this.formGroup.value.timepickerEveningTo == null
      ) {
        this.toastr.error(
          this.translate.instant(
            "PLEASE_SELECT_AT_LEAST_ONE_TIME_BUSINESS_HOURS"
          )
        );
        return;
      }

      if (
        (this.formGroup.value.timepickerMorningFrom != null &&
          this.formGroup.value.timepickerMorningTo == null) ||
        (this.formGroup.value.timepickerEveningFrom != null &&
          this.formGroup.value.timepickerEveningTo == null) ||
        (this.formGroup.value.timepickerMorningTo != null &&
          this.formGroup.value.timepickerMorningFrom == null) ||
        (this.formGroup.value.timepickerEveningTo != null &&
          this.formGroup.value.timepickerEveningFrom == null)
      ) {
        this.toastr.error(
          this.translate.instant(
            "PLEASE_SELECT_AT_LEAST_ONE_TIME_BUSINESS_HOURS"
          )
        );
        return;
      }

      if (
        this.formGroup.value.timepickerMorningFrom != null &&
        this.formGroup.value.timepickerMorningTo != null &&
        this.formGroup.value.isopened == 1 &&
        this.formGroup.value.timepickerMorningFrom >=
        this.formGroup.value.timepickerMorningTo
      ) {
        this.toastr.error(this.translate.instant("PLEASE_SELECT_VALID_TIME"));
        return;
      }

      if (
        this.formGroup.value.timepickerEveningFrom != null &&
        this.formGroup.value.timepickerEveningTo != null &&
        this.formGroup.value.isopened == 1 &&
        this.formGroup.value.timepickerEveningFrom >=
        this.formGroup.value.timepickerEveningTo
      ) {
        this.toastr.error(this.translate.instant("PLEASE_SELECT_VALID_TIME"));
        return;
      }

      if (
        this.formGroup.value.timepickerMorningFrom <=
        this.formGroup.value.timepickerEveningTo &&
        this.formGroup.value.timepickerMorningTo >
        this.formGroup.value.timepickerEveningFrom
      ) {
        this.toastr.error(
          this.translate.instant("OVERLAPPING_OF_BUSINESS_HOURS_IS_NOT_ALLOWED")
        );
        return;
      }

      if (
        this.formGroup.value.isopened == 1 &&
        this.formGroup.value.timepickerMorningFrom &&
        this.formGroup.value.isDeliveryMorning == false &&
        this.formGroup.value.isPickUpMorning == false && this.formGroup.value.isExpressDeliveryMorning == false
      ) {
        this.toastr.error(
          this.translate.instant(
            "PLEASE_SELECT_AT_LEAST_ONE_OPTION_FROM_DELIVERY_AND_PICKUP"
          )
        );
        return;
      }

      if (
        this.formGroup.value.isopened == 1 &&
        this.formGroup.value.timepickerEveningFrom &&
        this.formGroup.value.isDeliveryEvening == false &&
        this.formGroup.value.isPickUpEvening == false && this.formGroup.value.isExpressDeliveryEvening == false
      ) {
        this.toastr.error(
          this.translate.instant(
            "PLEASE_SELECT_AT_LEAST_ONE_OPTION_FROM_DELIVERY_AND_PICKUP"
          )
        );
        return;
      }

      //validate time slot
      var time_slots: any = [];
      if (this.business_hours_id != undefined && this.business_hours_id != 0) {
        if (this.formGroup.value.timepickerMorningFrom) {
          var morningTime = {
            business_hours_id:
              this.morningBusinessHoursId != undefined
                ? this.morningBusinessHoursId
                : 0,

            day_slots: 1,

            from_time: this.formGroup.value.timepickerMorningFrom,

            is_deliver:
              this.formGroup.value.isDeliveryMorning != undefined
                ? this.formGroup.value.isDeliveryMorning
                : false,

            is_express_delivery: this.formGroup.value.isExpressDeliveryMorning != undefined
              ? this.formGroup.value.isExpressDeliveryMorning
              : false,

            is_pickup:
              this.formGroup.value.isPickUpMorning != undefined
                ? this.formGroup.value.isPickUpMorning
                : false,

            to_time: this.formGroup.value.timepickerMorningTo,
          };
          time_slots.push(morningTime);
        }
        if (this.formGroup.value.timepickerEveningFrom) {
          var eveningTime = {
            business_hours_id:
              this.eveningBusinessHoursId != undefined
                ? this.eveningBusinessHoursId
                : 0,

            day_slots: 2,

            from_time: this.formGroup.value.timepickerEveningFrom,

            is_deliver:
              this.formGroup.value.isDeliveryEvening != undefined
                ? this.formGroup.value.isDeliveryEvening
                : false,
            is_express_delivery: 
              this.formGroup.value.isExpressDeliveryEvening != undefined
                ? this.formGroup.value.isExpressDeliveryEvening
                : false,
            is_pickup:
              this.formGroup.value.isPickUpEvening != undefined
                ? this.formGroup.value.isPickUpEvening
                : false,

            to_time: this.formGroup.value.timepickerEveningTo,
          };          
          time_slots.push(eveningTime);
        }
      } else {
        if (this.formGroup.value.timepickerMorningFrom) {
          var morningTimeNew = {
            business_hours_id: 0,
            day_slots: 1,
            from_time: this.formGroup.value.timepickerMorningFrom,

            is_deliver:
              this.formGroup.value.isDeliveryMorning != undefined
                ? this.formGroup.value.isDeliveryMorning
                : false,

            is_express_delivery: this.formGroup.value.isExpressDeliveryMorning != undefined
              ? this.formGroup.value.isExpressDeliveryMorning
              : false,

            is_pickup:
              this.formGroup.value.isPickUpMorning != undefined
                ? this.formGroup.value.isPickUpMorning
                : false,

            to_time: this.formGroup.value.timepickerMorningTo,
          };
          time_slots.push(morningTimeNew);
        } else {
          var morningTimeNew2 = {
            business_hours_id: 0,
            day_slots: 1,
            from_time: "00:00",
            is_deliver:
              this.formGroup.value.isDeliveryMorning != undefined
                ? this.formGroup.value.isDeliveryMorning
                : false,

            is_express_delivery: this.formGroup.value.isExpressDeliveryMorning != undefined
              ? this.formGroup.value.isExpressDeliveryMorning
              : false,

            is_pickup:
              this.formGroup.value.isPickUpMorning != undefined
                ? this.formGroup.value.isPickUpMorning
                : false,

            to_time: "00:00",
          };
          time_slots.push(morningTimeNew2);
        }

        if (this.formGroup.value.timepickerEveningFrom) {
          var eveningTimeNew = {
            business_hours_id: 0,

            day_slots: 2,

            from_time: this.formGroup.value.timepickerEveningFrom,

            is_deliver:
              this.formGroup.value.isDeliveryEvening != undefined
                ? this.formGroup.value.isDeliveryEvening
                : false,

            is_express_delivery:
              this.formGroup.value.isExpressDeliveryEvening != undefined
                ? this.formGroup.value.isExpressDeliveryEvening
                : false,

            is_pickup:
              this.formGroup.value.isPickUpEvening != undefined
                ? this.formGroup.value.isPickUpEvening
                : false,

            to_time: this.formGroup.value.timepickerEveningTo,
          };
          time_slots.push(eveningTimeNew);
        } else {
          var eveningTimeNew2 = {
            business_hours_id: 0,
            day_slots: 2,
            from_time: "00:00",

            is_deliver:
              this.formGroup.value.isDeliveryEvening != undefined
                ? this.formGroup.value.isDeliveryEvening
                : false,

            is_express_delivery:
              this.formGroup.value.isExpressDeliveryEvening != undefined
                ? this.formGroup.value.isExpressDeliveryEvening
                : false,

            is_pickup:
              this.formGroup.value.isPickUpEvening != undefined
                ? this.formGroup.value.isPickUpEvening
                : false,

            to_time: "00:00",
          };
          time_slots.push(eveningTimeNew2);
        }
      }
      let formData = new FormData();
      formData.append("user_id", this.main.LoggedUserInfo.user_id);
      formData.append("store_id", this.seller_details.store_id);
      formData.append(
        "business_hours_id",
        this.business_hours_id != undefined ? this.business_hours_id : 0
      );
      formData.append("days", this.days);
      formData.append("is_open", this.formGroup.value.isopened);
      formData.append("time_slots", JSON.stringify(time_slots));

      var data = formData;
      this.BusinessHoursService.saveBusinessHourDetails(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            // this.DineInSettingRecord();
            this.ngOnInit();
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
      data.module_key = '93'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '93'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '93'
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