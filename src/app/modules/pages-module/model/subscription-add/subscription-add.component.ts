import {
  Component,
  OnInit,
  Output,
  ChangeDetectorRef,
  EventEmitter,
  Input,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

import { StoreService } from "src/app/services/store.service";
import { CommonService } from "src/app/services/common.service";
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
  selector: "app-subscription-add",
  styleUrls: ["./subscription-add.component.scss"],
  templateUrl: "./subscription-add.component.html",
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class subscriptionAddComponent implements OnInit {
  @Output() subscriptionData: EventEmitter<any> = new EventEmitter();
  @Output() passSubscription: EventEmitter<any> = new EventEmitter();
  @Output() fees: EventEmitter<any> = new EventEmitter();
  @Output() durationId: EventEmitter<any> = new EventEmitter();

  @Input() EditsubscriptionDetails: any;
  @Input() subscriptionsList: any = null;
  @Input() isSubscriptionDesabled: any = null;
  @Input() isSubscriptionEndDateChnage: any = null;
  @Input() isStartDateDisable: any = null;
  @Input() subscriptionDurationList = [];
  @Input() subscriptionPayTypeList: any = [];
  @Input() subscriptionHistoryList: any;
  @Input() sellerid: any;
  @Input() storeid: any;
  @Input() main: any = null;
  @Input() adminDetails: any;
  @Input() subscriptionDetail: any = null;
  @Input() editdetails: any
  public users: any;
  public store_subscription: FormGroup;
  public UrL: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting.store_label;
  global_currency = this.generalSetting.currency_symbol;
  newseller: any;
  storeManage_Behalf: string;
  dateOptions = {
    minDate: new Date(),
    maxDate: new Date(), // restrict maximum date to today
  };

  startDateOptions = {
    minDate: new Date(),
    maxDate: new Date(),
  };

  totalDays: number;
  mindate: any;
  maxdate: any;
  startFirstData: any
  datepickerOpts: {
    // startDate: new Date(2016, 5, 10),
    autoclose: boolean;
    todayBtn: string;
    todayHighlight: boolean;
    assumeNearbyYear: boolean;
    format: any;
  };

  subscriptionD: any;
  subscriptionStartDateString: string;
  subscriptionEndDateString: string;
  allowForEdit = 0;
  startDateData: any;
  enableEndDate: boolean = false;
  enableStartDate: boolean = false;
  style_obj_subsciption_add: any;
  sessionConfig: any;

  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private storeservice: StoreService,
    public commonService: CommonService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit() {    
    console.log(this.storeManage_Behalf);
    
    this.style_obj_subsciption_add = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.mindate = new Date();
    this.maxdate = new Date();
    this.subscriptionDurationList = this.getSubscruptionList()
    this.subscriptionPayTypeList = [
      { id: 1, name: this.translate.instant("FLAT") },
      { id: 2, name: this.translate.instant("PERCENTAGE") },
    ];
        
    this.subscriptionsList = this.subscriptionsList.filter(x => x.is_active == 1)
    if (this.generalSetting.date_format_web == "DD-MM-YYYY HH:mm:ss") {
      MY_FORMATS.display.dateInput = "DD-MM-YYYY";
    } else {
      MY_FORMATS.display.dateInput = "MM-DD-YYYY";
    }
    this.loadform();
    this.cdr.detectChanges();
  }

  getSubscruptionList() {
    return [
      { id: 1, name: this.translate.instant("MONTHLY") },
      { id: 2, name: this.translate.instant("QUARTERLY") },
      { id: 3, name: this.translate.instant("HALFYEARLY") },
      { id: 4, name: this.translate.instant("ANNUALLY") },
      { id: 5, name: this.translate.instant("CUSTOM") },
    ];
  }

  DateFormateFromServerSideOnlyDateReturn() {
    return this.generalSetting.date_format_web.split(" ")[0];
  }
  //load form
  loadform() {
    this.store_subscription = this.formBuilder.group({
      subscription: new FormControl(this.subscriptionsList[0].subscription_id, [
        Validators.required,
      ]),
      subscription_duration: new FormControl(
        this.subscriptionDurationList[0].id
      ),
      pay_type: new FormControl(this.subscriptionPayTypeList[0].id),
      subscription_startdatee: new FormControl(new Date()),
      subscription_enddate: new FormControl(null),
      subscription_fees: new FormControl(null),
      user_id: new FormControl(0),
    });

    this.store_subscription.get("subscription_startdatee").valueChanges.subscribe((val) => {
      this.changeDate(val);
    });

    if (this.EditsubscriptionDetails) {      
      if (
        new Date(this.EditsubscriptionDetails.subscription_startdate) >
        new Date()
      ) {
        this.allowForEdit = 1;
      }
      this.store_subscription.controls["subscription"].setValue(
        this.EditsubscriptionDetails.subscription_id
      );
      this.subscriptionChange();
      this.store_subscription.controls["subscription_startdatee"].setValue(moment(this.EditsubscriptionDetails.subscription_startdate, this.DateFormateFromServerSideOnlyDateReturn()).toDate());
      if (this.EditsubscriptionDetails.pay_type) {
        this.store_subscription.controls["pay_type"].setValue(
          Number(this.EditsubscriptionDetails.pay_type)
        );
      }
      if (this.EditsubscriptionDetails.subscription_fees) {
        this.store_subscription.controls["subscription_fees"].setValue(
          this.EditsubscriptionDetails.subscription_fees
        );
      }
      var endDateData = moment(this.EditsubscriptionDetails.subscription_enddate, this.DateFormateFromServerSide()).toDate()
      this.store_subscription.controls["subscription_enddate"].setValue(new Date(endDateData));
      this.store_subscription.controls['subscription_duration'].setValue(
        this.subscriptionDurationList.find((x) => x.id === this.EditsubscriptionDetails.subscription_duration).id
      )
    }
    else {      
      if (this.subscriptionHistoryList[0] == undefined) {
        this.store_subscription.controls["subscription_startdatee"].setValue(moment(new Date(), this.DateFormateFromServerSide().split(" ")[0]));        
        var endLastData = moment(new Date(), this.DateFormateFromServerSide()).add(1, "month").toDate()
        this.store_subscription.controls["subscription_enddate"].setValue(new Date(endLastData));
      }
      else {
        this.startDateData = this.subscriptionHistoryList[0].subscription_enddate != null ?
          this.subscriptionHistoryList[0].subscription_enddate : this.subscriptionHistoryList[0].subscription_startdate
        if(this.editdetails?.is_expired == 1 || this.storeManage_Behalf == 'true'){
          this.startFirstData = moment(new Date(), this.DateFormateFromServerSide())
          this.store_subscription.controls["subscription_startdatee"].setValue(new Date());
        } else {
          this.startFirstData = moment(this.startDateData, this.DateFormateFromServerSide()).add(1, "day").toDate()
          this.store_subscription.controls["subscription_startdatee"].setValue(new Date(this.startFirstData));
          this.mindate = this.startFirstData
        }
        var endLastData = moment(this.startFirstData, this.DateFormateFromServerSide()).add(1, "month").toDate()
        this.store_subscription.controls["subscription_enddate"].setValue(new Date(endLastData));
      }

    }

  }
  //change date according to Subscription Duration
  changeDate(item) {
    const date = new Date(item);
    if (this.store_subscription.value.subscription_duration == 1) {
      var month = moment(date).add(1, "month").toString();
      this.store_subscription.controls["subscription_enddate"].setValue(
        new Date(month)
      );
    } else if (this.store_subscription.value.subscription_duration == 2) {
      var month = moment(date).add(3, "month").toString();
      this.store_subscription.controls["subscription_enddate"].setValue(
        new Date(month)
      );
    } else if (this.store_subscription.value.subscription_duration == 3) {
      var month = moment(date).add(6, "month").toString();
      this.store_subscription.controls["subscription_enddate"].setValue(
        new Date(month)
      );
    } else if (this.store_subscription.value.subscription_duration == 4) {
      var month = moment(date).add(1, "year").toString();
      this.store_subscription.controls["subscription_enddate"].setValue(
        new Date(month)
      );
    }
  }

  //change duration
  changeDuration() {
    this.enableEndDate = false;
    this.enableStartDate = false;
    if (this.store_subscription.get('subscription').value === "1" && this.store_subscription.get('subscription_duration').value === 5) {
      this.enableEndDate = true;
      this.enableStartDate = true;
    }

    this.changeDate(this.store_subscription.value.subscription_startdatee);
  }

  subscriptionChange() {
    if (this.store_subscription.value.subscription != 1) {
      this.subscriptionDurationList = this.subscriptionDurationList.filter((x) => x.id !== 5);
      this.store_subscription.controls['subscription_duration'].setValue(this.subscriptionDurationList[0].id)
    } 
    if (this.store_subscription.get('subscription').value === "1") {
      this.subscriptionDurationList = this.getSubscruptionList();
    }

  }

  validateFloatNumber() {
    if (
      this.store_subscription.value.subscription_fees.split(".").length > 1 &&
      this.store_subscription.value.subscription_fees.split(".")[0] == ""
    ) {
      this.store_subscription.controls["subscription_fees"].setValidators(null);
    }
    if (this.store_subscription.value.subscription_fees.split(".").length > 2) {
      this.store_subscription.controls["subscription_fees"].setValue(
        Number(
          this.store_subscription.value.subscription_fees.split(".")[0] +
          "." +
          this.store_subscription.value.subscription_fees.split(".")[1]
        )
      );
    }

    if (
      this.store_subscription.value.subscription_fees.split(".").length > 1 &&
      this.store_subscription.value.subscription_fees.split(".")[1] > 99
    ) {
      this.store_subscription.controls["subscription_fees"].setValue(
        Number(this.store_subscription.value.subscription_fees).toFixed(2)
      );
    }
  }

  async addSubscription() {
    if (
      this.store_subscription.value.subscription == 5 ||
      this.store_subscription.value.subscription == 6
    ) {
      if (
        this.store_subscription.value.subscription_fees == undefined ||
        this.store_subscription.value.subscription_fees <= 0
      ) {
        this.toastr.error(
          this.translate.instant("SUBSCRIPTION_FEE_CANNOT_BE_0")
        );
        return;
      }
    }
    if (this.sellerid != undefined) {
      var AddSubscriptionData = {
        user_id: parseInt(this.sellerid),
        subscription_id: this.store_subscription.value.subscription,
        subscription_startdate: moment(
          this.store_subscription.value.subscription_startdatee
        ).format(MY_FORMATS.display.dateInput),
        created_by: this.adminDetails.user_id,
        store_id: parseInt(this.storeid),
        seller_subscription_id: null,
        subscription_enddate: null,
        subscription_duration: null,
        pay_type: null,
        subscription_fees: null,
      };

      if (this.EditsubscriptionDetails) {
        AddSubscriptionData.seller_subscription_id =
          this.EditsubscriptionDetails.seller_subscription_id;
      }

      if (this.store_subscription.value.subscription == 1) {
        AddSubscriptionData.subscription_enddate = moment(
          this.store_subscription.value.subscription_enddate
        ).format(MY_FORMATS.display.dateInput);
        AddSubscriptionData.subscription_duration =
          this.store_subscription.value.subscription_duration;
      } else if (this.store_subscription.value.subscription == 5) {
        AddSubscriptionData.pay_type = this.store_subscription.value.pay_type;
        AddSubscriptionData.subscription_fees =
          this.store_subscription.value.subscription_fees;
      } else if (this.store_subscription.value.subscription == 6) {        
        AddSubscriptionData.subscription_fees =
          this.store_subscription.value.subscription_fees;
        AddSubscriptionData.subscription_duration =
          this.store_subscription.value.subscription_duration;
      }
      await this.storeservice.addSubscription(AddSubscriptionData).subscribe({
        next: (response: any) => {
          if (response.status == 1) {            
            this.store_subscription.value.subscription = null;
            this.subscriptionData.emit();
            this.activeModal.dismiss();
          }
        },
        error: (error) => {
          // handle error
        },
        complete: () => {

        },
      });
    } else {
      if (this.store_subscription.value.subscription != 5) {
        this.store_subscription.controls["pay_type"].setValue(null);
      }
      if (this.store_subscription.value.subscription) {
        if (this.store_subscription.value.subscription == 1) {
          this.subscriptionStartDateString = moment(
            this.store_subscription.value.subscription_startdatee
          ).format(this.DateFormateFromServerSideOnlyDateReturn());
          this.subscriptionEndDateString = moment(
            this.store_subscription.value.subscription_enddate
          ).format(this.DateFormateFromServerSideOnlyDateReturn());
        } else if (this.store_subscription.value.subscription == 5) {
          this.subscriptionStartDateString = moment(
            this.store_subscription.value.subscription_startdatee
          ).format(this.DateFormateFromServerSideOnlyDateReturn());
        } else if (this.store_subscription.value.subscription == 6) {
          this.subscriptionStartDateString = moment(
            this.store_subscription.value.subscription_startdatee
          ).format(this.DateFormateFromServerSideOnlyDateReturn());
        }
        //date
        var date = [];
        if (
          this.subscriptionStartDateString &&
          !this.subscriptionEndDateString
        ) {
          date.push({ start_date: this.subscriptionStartDateString });
          this.subscriptionData.emit(date);
        }
        if (
          this.subscriptionStartDateString &&
          this.subscriptionEndDateString
        ) {
          date.push({
            start_date: this.subscriptionStartDateString,
            end_date: this.subscriptionEndDateString,
          });
          this.subscriptionData.emit(date);
        }
        //other details
        var details = [];
        if (this.store_subscription.value.subscription == 5) {
          details.push({
            nameID: this.store_subscription.value.pay_type,
            subscriptionFees: this.store_subscription.value.subscription_fees,
          });
          this.fees.emit(details);
        }
        if (this.store_subscription.value.subscription == 6) {
          this.subscriptionDurationList.forEach((element) => {
            if (
              element.id == this.store_subscription.value.subscription_duration
            ) {
              details.push({
                duration: element.name,
                subscriptionFees:
                  this.store_subscription.value.subscription_fees,
              });
            }
          });
          this.fees.emit(details);
        }
        this.passSubscription.emit(this.store_subscription.value.subscription);
        if (this.store_subscription.value.subscription_duration) {
          this.durationId.emit(
            this.store_subscription.value.subscription_duration
          );
        }
      }
      this.activeModal.dismiss(this);
    }
  }

  DateFormateFromServerSide() {
    return this.main.DateFormate;
  }

  validatePercentage() {
    this.validateFloatNumber();
    if (this.store_subscription.value.subscription_fees > 100) {
      this.store_subscription.controls["subscription_fees"].setValue(
        100
      );
    }
  }

  controlHasError(validation, controlName): boolean {
    const control = this.store_subscription.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }
  subscriptionDetailChange() {
    this.store_subscription.controls["subscription_fees"].setValue('')
  }
}
