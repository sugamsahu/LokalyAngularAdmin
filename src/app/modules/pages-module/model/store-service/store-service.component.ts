import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import * as moment from 'moment-timezone';
import { UsersService } from "src/app/services/users.service";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { ToastrService } from "ngx-toastr";
export const MY_FORMATS = {
  parse: {
    dateInput: "YYYY/MM/DD",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};
@Component({
  selector: "app-store-service",
  templateUrl: "./store-service.component.html",
  styleUrls: ["./store-service.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class StoreServiceModelComponent implements OnInit, OnDestroy {
  private remainingTimeInterval: ReturnType<typeof setInterval>;
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @Input() main: any;
  closeResult = '';
  IsData: boolean = false;
  storeServiceOpen: boolean = true;
  store_service_form: FormGroup;
  storeServiceInfo: any;
  moment: any = moment;
  serverCurrentDateTime: any;
  serverTempCurrentDateTime: any;
  timediff: any;
  style_obj_store_service: any;
  minDate: Date;
  minTime: string = '09:00';

  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.style_obj_store_service = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.loadForm();
    this.serviceModule();
    if (this.generalSetting.date_format_web == "DD-MM-YYYY HH:mm:ss") {
      MY_FORMATS.display.dateInput = "DD-MM-YYYY";
    } else {
      MY_FORMATS.display.dateInput = "MM-DD-YYYY";
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.remainingTimeInterval);
  }

  loadForm() {
    this.store_service_form = this.formBuilder.group({
      startdate: new FormControl(null),
      timepickerFrom: new FormControl(null,),
      enddate: new FormControl(null),
      timepickerTo: new FormControl(null, this.minTimeValidator.bind(this)),
    })
  }

  serviceModule() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id
    };
    this.usersService.getStoreServiceDetails(data).subscribe({
      next: (response: any) => {
        if (response.data == undefined) {
          // var endtime = moment(response.current_datetime).add(1, 'hours').format(this.DateFormateFromServerSide());

          this.store_service_form.controls['startdate'].setValue(response.current_datetime.split(' ')[0]);
          // this.store_service_form.controls['timepickerFrom'].setValue(response.current_datetime.split(' ')[1]);
          this.store_service_form.controls['timepickerFrom'].setValue(this.currentTime());
          this.store_service_form.controls['enddate'].setValue(response.current_datetime.split(' ')[0]);
          // this.store_service_form.controls['timepickerTo'].setValue(endtime.split(' ')[1]);
          this.store_service_form.controls['timepickerTo'].setValue(this.nextHourTime());

          this.storeServiceOpen = true;
        } else {
          this.storeServiceInfo = response.data;
          this.storeServiceOpen = false;

          this.calculateRemainingTime();
          clearInterval(this.remainingTimeInterval);
          this.remainingTimeInterval = setInterval(() => {
            this.calculateRemainingTime();
          }, 1000);

          this.storeServiceInfo.start_date = moment(this.storeServiceInfo.start_date, this.DateFormateFromServerSide()).format(this.DateFormateFromServerSide());
          this.storeServiceInfo.end_date = moment(this.storeServiceInfo.end_date, this.DateFormateFromServerSide()).format(this.DateFormateFromServerSide());

        }
      },
      error: (error: any) => {
        this.toastr.error(this.translate.instant(error.message));
      }
    })
  }
  submitInterval: any;
  submitStoreService(value: any) {
    this.submitInterval = true;
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
      start_date: moment(this.store_service_form.value.startdate).format(this.main.DateFormate.split(' ')[0]) + ' ' + this.store_service_form.value.timepickerFrom + ':00',
      end_date: moment(this.store_service_form.value.enddate).format(this.main.DateFormate.split(' ')[0]) + ' ' + this.store_service_form.value.timepickerTo + ':00',
      stop: value
    };
    console.log(this.store_service_form)
    console.log(this.store_service_form.valid)
    if (this.store_service_form.valid) {
      this.usersService.submitStoreServiceDetails(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.serviceModule();
            this.modal.close();

            this.toastr.success(this.translate.instant(response.message));
          }
          else {
            this.toastr.error(this.translate.instant(response.message));
            this.IsData = true;
          }
        },
        error: (error: any) => {
          this.toastr.error(this.translate.instant(error.message));
        }
      })
    } else {
      const controls = this.store_service_form.controls;
      Object.keys(controls).forEach((controlName, i) => {
        // if (i == 0) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          invalidControl.focus();
        // }
        controls[controlName].markAsTouched();
      });
    }
  }

  DateFormateFromServerSide() {
    return this.main.DateFormate;
  }
  countdown = true
  @Output() storeServiceOpenData: EventEmitter<any> = new EventEmitter();

  formatNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  calculateRemainingTime() {
    const timeZone = this.generalSetting.timezone;
    const now = moment().tz(timeZone);
    const formattedNow = now.format("YYYY-MM-DD HH:mm:ss");
    let targetDate;
    if (now.isBefore(moment(this.storeServiceInfo.start_date, this.DateFormateFromServerSide()).tz(timeZone))) {
      targetDate = moment(this.storeServiceInfo.start_date, this.DateFormateFromServerSide()).tz(timeZone);
    } else {
      targetDate = moment(this.storeServiceInfo.end_date, this.DateFormateFromServerSide()).tz(timeZone);
    }
    const duration = moment.duration(targetDate.diff(formattedNow));

    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    this.timediff = `${this.formatNumber(days)} Days ${this.formatNumber(hours)}:${this.formatNumber(minutes)}:${this.formatNumber(seconds)}`;
    if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
      this.submitStoreService(0);
      this.storeServiceOpen = true;
      this.storeServiceOpenData.emit('1');
      return;
    }
  }

  // Function to update minimum date
  updateMinDate(newMinDate: Date) {
    this.minDate = newMinDate;
  }

  updateMinTime() {
    // this.minTime = newMinTime;
    console.log(this.store_service_form.value.startdate)
    console.log(this.store_service_form.value.enddate)
    console.log(this.store_service_form.value.timepickerFrom)
    console.log(this.store_service_form.value.timepickerTo)
    this.minTime = this.store_service_form.value.timepickerFrom;
    if (this.store_service_form.controls["timepickerTo"].invalid){
      console.log('test')
      if(moment(this.store_service_form.value.startdate).format(this.main.DateFormate.split(' ')[0])< moment(this.store_service_form.value.enddate).format(this.main.DateFormate.split(' ')[0])){
        console.log("date test");
        this.store_service_form.controls["timepickerTo"].clearValidators();
        this.store_service_form.controls['timepickerTo'].updateValueAndValidity();
      }
    }
    this.cdr.detectChanges();
  }

  // Custom validator for minimum time
  minTimeValidator(control: any): { [s: string]: boolean } {
    console.log(control)
    if (!this.minTime || !control.value) return null;

    const selectedTime = control.value;
    const minTimeParts = this.minTime.split(':').map(part => parseInt(part, 10));
    const selectedTimeParts = selectedTime.split(':').map(part => parseInt(part, 10));
    
    if ((moment(this.store_service_form.value.startdate).format(this.main.DateFormate.split(' ')[0]) == moment(this.store_service_form.value.enddate).format(this.main.DateFormate.split(' ')[0])) &&
      (selectedTimeParts[0] < minTimeParts[0] ||
        (selectedTimeParts[0] === minTimeParts[0] && selectedTimeParts[1] < minTimeParts[1])
      )) {
      console.log(true)
      return { 'minTime': true };
    }
    return null;
  }

  diff(s: any) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
    return hrs + ':' + mins + ':' + secs;
  }

  closemodel() {
    this.modal.close();
  }

  currentTime() {
    var today = new Date();
    today.setHours(today.getHours());
    var day = today,
      hour = (day.getHours() < 10 ? '0' : '') + day.getHours(),
      minute = (day.getMinutes() < 10 ? '0' : '') + day.getMinutes();

    return hour + ':' + minute;
  }

  nextHourTime() {
    var today = new Date();
    today.setHours(today.getHours() + 1);
    var day = today,
      hour = (day.getHours() < 10 ? '0' : '') + day.getHours(),
      minute = (day.getMinutes() < 10 ? '0' : '') + day.getMinutes();

    return hour + ':' + minute;
  }
}
