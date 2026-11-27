import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnInit, AfterViewInit, ViewChild
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { CommonService } from "src/app/services/common.service";
import { ContactListService } from "src/app/services/campaign-management/contact-list.service";
import { NotificationTemplateService } from "src/app/services/campaign-management/notification-template.service";
import * as moment from "moment";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-add-notification",
  templateUrl: "./add-notification.component.html",
  styleUrls: ["./add-notification.component.scss"],
})
export class AddNotificationComponent implements OnInit, AfterViewInit {
  public formGroup: UntypedFormGroup;
  main: any = { LoggedUserInfo: {} };
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  business_model = this.platform_setting.business_model;
  sms_campaign_id: any = 0;
  user_id: any;
  state_list: any[];
  city_list: any[];
  area_list: any[];
  user_type_list: any = [];
  store_type_list: any = [];
  user_list: any = [];
  //for condition
  allow_khata: any;
  platform_name: any;
  khata_label: any;
  is_displayis_eatery: any;
  is_allow_wholeseller: any;
  store_label: any;
  //date
  subscription_end_date: any = 0;
  registration_date: any = 0;
  schedular_type: any = [];
  mindate: any;
  weekly: any = [];
  monthly: any = [];
  details: any;
  state_Ids = [];
  city_Ids = [];
  area_ids = [];
  store_typeIds = [];
  sendDate: any;
  endDate: any;
  yearDate: any;
  tempState: any = [];
  selectedState: any = [];
  tempCity: any = [];
  selectedCity: any = [];
  selectedusertype: any;
  tempArea: any = [];
  selectedArea: any = [];
  selectedStoreType: any = [];
  tempStoreType: any = [];
  selectedStore_ids: any = [];
  selectedUser: any = [];
  tempUser: any = [];
  state: any = [];
  city: any = [];
  area: any = [];
  default_cat_id: any = [];
  Ids: any = [];
  selectedSchedulerType: any;
  @ViewChild('cursor') cursor: ElementRef;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private cryptoService: CryptoService,
    private toastr: ToastrService,
    private spinner: SpinnerService,
    private commonService: CommonService,
    private ContactListService: ContactListService,
    private NotificationTemplateService: NotificationTemplateService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
    if (location.href.indexOf("/notification-template/edit") > -1) {
      this.sms_campaign_id = this.cryptoService.decryptIdValue(
        "campaign_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.sms_campaign_id == undefined) {
        this.router.navigate(["/notification-template"]);
      }
    }
  }

  ngOnInit(): void {
    this.mindate = new Date();
    this.getCondition();
    this.stateListRecord();
    this.loadForm();
    this.changeDate(this.formGroup.value.senddate);
    if (this.sms_campaign_id) {
      this.details = JSON.parse(localStorage.getItem("notificationDetail"));
      this.state_Ids = this.details.state_id.split(",");
      this.city_Ids = this.details.city_id.split(",");
      this.area_ids = this.details.area_id.split(",");
      this.cityListRecord();
      this.areaListRecord();
      this.getDetails();
    }
    this.cdr.detectChanges();
  }
  /** Get general settings data by it's local storage */
  //conditions
  getCondition() {
    this.general_setting = JSON.parse(
      localStorage.getItem("LoggedUserSettings")
    );
    if (this.general_setting) {
      this.platform_name = this.general_setting.platform_name;
      this.is_displayis_eatery = parseFloat(this.general_setting.eatery_module);
      this.is_allow_wholeseller = parseFloat(
        this.general_setting.allow_wholeseller
      );
      this.store_label = this.general_setting.store_label;
      this.store_label = this.general_setting.store_label;
      this.allow_khata = parseInt(this.general_setting.allow_khata);
      this.khata_label = this.general_setting.khata_label;
    } else {
      this.platform_name = this.main.platform_name;
      this.is_displayis_eatery = parseFloat(this.main.eatery_module);
      this.is_allow_wholeseller = parseFloat(this.main.allow_wholeseller);
      this.store_label = this.main.store_label;
      this.store_label = this.main.store_label;
      this.allow_khata = parseInt(this.main.allow_khata);
      this.khata_label = this.main.khata_label;
    }
    //list for user
    if (this.allow_khata == 1) {
      this.translate.get(["CUSTOMER", "BUSINESS"]).subscribe((translations) => {
        this.user_type_list = [
          {
            label: translations.CUSTOMER,
            value: 1,
          },
          {
            label: this.platform_name + " " + this.khata_label,
            value: 2,
          },
          {
            label: this.platform_name + " " + translations.BUSINESS,
            value: 3,
          },
        ];
      });
    } else {
      this.translate.get(["CUSTOMER", "BUSINESS"]).subscribe((translations) => {
        this.user_type_list = [
          {
            label: translations.CUSTOMER,
            value: 1,
          },
          {
            label: this.platform_name + " " + translations.BUSINESS,
            value: 3,
          },
        ];
      });
    }
    this.translate.get(["ONETIME", "RECURSIVE"]).subscribe((translations) => {
      this.schedular_type = [
        {
          label: translations.ONETIME,
          value: 1,
        },
        {
          label: translations.RECURSIVE,
          value: 2,
        },
      ];
    });
    this.translate
      .get(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])
      .subscribe((translations) => {
        this.weekly = [
          {
            label: translations.MON,
            value: 0,
          },
          {
            label: translations.TUE,
            value: 1,
          },
          {
            label: translations.WED,
            value: 2,
          },
          {
            label: translations.THU,
            value: 3,
          },
          {
            label: translations.FRI,
            value: 4,
          },
          {
            label: translations.SAT,
            value: 5,
          },
          {
            label: translations.SUN,
            value: 6,
          },
        ];
      });

    //month
    this.translate
      .get([
        "JANUARY",
        "FEBRUARY",
        "MARCH",
        "APRIL",
        "MAY",
        "JUNE",
        "JULY",
        "AUGUST",
        "SEPTEMBER",
        "OCTOBER",
        "NOVEMBER",
        "DECEMBER",
      ])
      .subscribe((translations) => {
        this.monthly = [
          {
            label: translations.JANUARY,
            value: 1,
          },
          {
            label: translations.FEBRUARY,
            value: 2,
          },
          {
            label: translations.MARCH,
            value: 3,
          },
          {
            label: translations.APRIL,
            value: 4,
          },
          {
            label: translations.MAY,
            value: 5,
          },
          {
            label: translations.JUNE,
            value: 6,
          },
          {
            label: translations.JULY,
            value: 7,
          },
          {
            label: translations.AUGUST,
            value: 8,
          },
          {
            label: translations.SEPTEMBER,
            value: 9,
          },
          {
            label: translations.OCTOBER,
            value: 10,
          },
          {
            label: translations.NOVEMBER,
            value: 11,
          },
          {
            label: translations.DECEMBER,
            value: 12,
          },
        ];
      });
  }

  //load form
  loadForm() {
    this.formGroup = this.formBuilder.group({
      campaign_name: [null, Validators.required],
      state_id: new UntypedFormControl(null),
      city_id: new UntypedFormControl(null),
      area_id: new UntypedFormControl(null),
      user: new UntypedFormControl(null),
      storeType: new UntypedFormControl(null),
      user_list: new UntypedFormControl(null),
      messagetype: ["1"],
      msg_title: [null],
      sms_text: [null],
      notification_title: [null],
      notification_text: [null],
      sendtype: ["1"],
      schedulerType: ["0"],
      //date
      selectedShcedulartype: [null],
      selectedrecursive: ["1"],
      senddate: new UntypedFormControl(new Date()),
      sendtime: new UntypedFormControl(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      ),
      enddate: new UntypedFormControl(new Date()),
      endtime: new UntypedFormControl(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      ),
      yeardate: new UntypedFormControl(new Date()),
      yeartime: new UntypedFormControl(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      ),
      //day
      weekday: new UntypedFormControl(0),
      monthday: new UntypedFormControl(1),
    });

    this.formGroup.get("senddate").valueChanges.subscribe((val) => {
      this.changeDate(val);
    });
  }

  changeDate(item) {
    const date = new Date(item);
    if (this.formGroup.value.selectedrecursive == 1) {
      var endDate = moment(date).add(1, "day").toString();
      this.formGroup.controls["enddate"].setValue(new Date(endDate));
    } else if (this.formGroup.value.selectedrecursive == 2) {
      var enddate = moment(date).add(7, "day").toString();
      this.formGroup.controls["enddate"].setValue(new Date(enddate));
    } else if (this.formGroup.value.selectedrecursive == 3) {
      var month = moment(date).add(1, "month").toString();
      this.formGroup.controls["enddate"].setValue(new Date(month));
    } else if (this.formGroup.value.selectedrecursive == 4) {
      var month = moment(date).add(1, "year").toString();
      this.formGroup.controls["enddate"].setValue(new Date(month));
      var yearday: any = new Date();
      yearday = yearday.setDate(yearday.getDate() + 1);
      this.yearDate = moment(yearday).format("MM-DD");
    }

    this.sendDate = moment(this.formGroup.value.senddate).format("YYYY-MM-DD");
    this.endDate = moment(this.formGroup.value.enddate).format("YYYY-MM-DD");
  }

  //get state
  async stateListRecord() {
    await this.commonService.getStateList(101).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.state_list = [];
          this.state_list = [{ name: "All", id: 0 }];
          response.data.forEach((value) => {
            this.state_list.push({ id: value.id, name: value.name });
          });

          //geting users from user list
          if (this.selectedusertype) {
            this.userListRecord();
          }

          if (this.sms_campaign_id) {
            var states = [];
            this.state_list.forEach((element) => {
              this.state_Ids.forEach((id) => {
                if (element.id == id) {
                  states.push(element);
                  this.selectedState.push(element.id);
                }
              });
            });
            this.formGroup.controls["state_id"].setValue(states);
            this.stateChange(states);
          }
        } else {
          this.state_list = [];
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //get city
  async cityListRecord() {
    await this.commonService.getCityList(this.selectedState).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.city_list = [];
          this.area_list = [];
          this.city_list = [{ name: "All", id: 0 }];
          response.data.forEach((value) => {
            this.city_list.push({ id: value.id, name: value.name });
          });

          //geting users from user list
          if (this.selectedusertype) {
            this.userListRecord();
          }

          if (this.sms_campaign_id) {
            var citis = [];
            this.city_list.forEach((element) => {
              this.city_Ids.forEach((id) => {
                if (element.id == id) {
                  citis.push(element);
                  this.selectedCity.push(element.id);
                }
              });
            });
            this.formGroup.controls["city_id"].setValue(citis);
            this.cityChange(citis);
          }
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //get area
  async areaListRecord() {
    await this.commonService.getAreaList(this.selectedCity).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.area_list = [];
          this.area_list = [{ name: "All", id: 0 }];
          response.data.forEach((value) => {
            this.area_list.push({ id: value.id, name: value.name });
          });

          if (this.selectedusertype) {
            this.userListRecord();
          }

          if (this.sms_campaign_id) {
            var areas = [];
            this.area_list.forEach((element) => {
              this.area_ids.forEach((id) => {
                if (element.id == id) {
                  areas.push(element);
                  this.selectedArea.push(element.id);
                }
              });
            });
            this.formGroup.controls["area_id"].setValue(areas);
          }
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //change state
  stateChange(item) {
    this.selectedState = [];
    item.forEach((element) => {
      if (element.id == 0) {
        var temp: any = [];
        this.state_list.forEach((data) => {
          if (data.id != 0) {
            temp.push(data.name);
            this.selectedState.push(data.id);
          }
        });
        this.formGroup.controls["state_id"].setValue(temp);
      } else {
        this.selectedState = [];
        this.formGroup.controls["state_id"].setValue(item);
        item.forEach((data) => {
          this.selectedState.push(data.id);
        });
      }
    });
    this.formGroup.controls["city_id"].reset();
    this.formGroup.controls["area_id"].reset();
    this.formGroup.controls["user_list"].reset();
    this.cityListRecord();
  }

  //change  city
  cityChange(item) {
    this.selectedCity = [];
    item.forEach((element) => {
      if (element.id == 0) {
        var temp: any = [];
        //it should be commented when api eroor will fixx
        this.city_list.forEach((item) => {
          if (item.id == 0) {
            temp.push(item);
            this.selectedCity.push(item.id);
          }
        });
        this.formGroup.controls["city_id"].setValue(temp);
      } else {
        this.selectedCity = [];
        this.formGroup.controls["city_id"].setValue(item);
        item.forEach((data) => {
          this.selectedCity.push(data.id);
        });
      }
    });
    this.formGroup.controls["area_id"].reset();
    this.formGroup.controls["user_list"].reset();
    this.areaListRecord();
  }

  //change area
  areaChange(item) {
    this.selectedArea = [];
    item.forEach((element) => {
      if (element.id == 0) {
        var temp: any = [];
        this.area_list.forEach((data) => {
          if (data.id != 0) {
            temp.push(data);
            this.selectedArea.push(data.id);
          }
        });
        this.formGroup.controls["area_id"].setValue(temp);
      } else {
        this.selectedArea = [];
        this.formGroup.controls["area_id"].setValue(item);
        item.forEach((data) => {
          this.selectedArea.push(data.id);
        });
      }
    });

    this.formGroup.controls["user_list"].reset();

    //geting users from user list
    if (this.selectedusertype) {
      this.userListRecord();
    }
  }

  //change user type
  changeUserType() {
    this.selectedusertype = this.formGroup.value.user.value;
    this.formGroup.controls["user_list"].reset();
    this.userListRecord();
    if (this.selectedusertype == 3) {
      this.storeTypeListRecord();
    }
  }

  //get store type list
  async storeTypeListRecord() {
    this.spinner.show();
    var data = {
      token_type: 1,
    };
    await this.commonService.getMasterCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.store_type_list = [{ name: "All", id: 0 }];
          response.data.forEach((value) => {
            this.store_type_list.push({
              id: value.category_id,
              name: value.category_name,
            });
          });
          if (this.sms_campaign_id) {
            var types = [];
            this.store_type_list.forEach((element) => {
              this.store_typeIds.forEach((id) => {
                if (element.id == id) {
                  types.push(element);
                  this.selectedStoreType.push(element.id);
                }
              });
            });
            this.formGroup.controls["storeType"].setValue(types);
            this.changeStoreType(types);
          }
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  //change store type
  changeStoreType(item) {
    this.selectedStoreType = [];
    item.forEach((element) => {
      if (element.id == 0) {
        this.store_type_list.forEach((data) => {
          if (data.id != 0) {
            this.selectedStoreType.push(data.id);
            this.tempStoreType.push(data);
          }
        });
        this.formGroup.controls["storeType"].setValue(this.tempStoreType);
      } else {
        this.selectedStoreType = [];
        this.formGroup.controls["storeType"].setValue(item);
        item.forEach((data) => {
          this.selectedStoreType.push(data.id);
        });
      }
    });

    this.formGroup.controls["user_list"].reset();

    // geting users from user list
    if (this.selectedusertype) {
      this.userListRecord();
    }
  }

  //get store/user list
  async userListRecord() {
    this.spinner.show();
    var data = {
      user_type: this.selectedusertype,
      city_id: this.selectedCity,
      area_id: this.selectedArea,
      store_type: this.selectedStoreType.toString(),
    };
    await this.ContactListService.getCampaignUserList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.user_list = [];
          this.user_list = [{ name: "All", id: 0 }];
          response.data.forEach((value) => {
            this.user_list.push({
              id: Number(value.user_id),
              name: value.name,
            });
          });
          if (this.selectedusertype == 2 || this.selectedusertype == 3) {
            this.user_list = [];
            this.user_list = [{ name: "All", id: 0, store_id: 0 }];
            response.data.forEach((value) => {
              if (value.store_name) {
                this.user_list.push({
                  id: Number(value.user_id),
                  name: value.name + " " + "(" + value.store_name + ")",
                  store_id: Number(value.store_id),
                });
              } else {
                this.user_list.push({
                  id: Number(value.user_id),
                  name: value.name,
                  store_id: Number(value.store_id),
                });
              }
            });
          }
          if (this.sms_campaign_id) {
            //for customer
            if (this.selectedusertype == 1) {
              this.selectedUser = [];
              this.user_list.forEach((element) => {
                this.Ids.forEach((id) => {
                  if (element.id == id) {
                    this.selectedUser.push(element.id);
                  }
                });
              });
              this.formGroup.controls["user_list"].setValue(this.selectedUser);
            } else {
              this.selectedUser = [];
              this.selectedStore_ids = [];
              this.user_list.forEach((element) => {
                this.Ids.forEach((id) => {
                  if (element.store_id == id) {
                    this.selectedUser.push(element.id);
                    this.selectedStore_ids.push(element.store_id);
                  }
                });
              });
              this.formGroup.controls["user_list"].setValue(
                this.selectedStore_ids
              );
            }
          }

          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }
  /** Select user form user list */
  //select user from user list
  selectUser(item) {
    this.selectedUser = [];
    if (this.selectedusertype == 1) {
      item.forEach((element) => {
        if (element == 0) {
          this.user_list.forEach((data) => {
            if (data.id != 0) {
              this.selectedUser.push(data.id);
              this.tempUser.push(data);
            }
          });
          this.formGroup.controls["user_list"].setValue(this.selectedUser);
        } else {
          this.selectedUser = [];
          this.formGroup.controls["user_list"].setValue(item);
          item.forEach((data) => {
            this.selectedUser.push(data);
          });
        }
      });
    } else {
      item.forEach((element) => {
        if (element == 0) {
          this.user_list.forEach((data) => {
            if (data.store_id != 0) {
              this.selectedStore_ids.push(data.store_id);
              this.selectedUser.push(data.id);
              this.tempUser.push(data);
            }
          });
          this.formGroup.controls["user_list"].setValue(this.selectedStore_ids);
        } else {
          this.selectedUser = [];
          this.selectedStore_ids = [];
          this.formGroup.controls["user_list"].setValue(item);
          item.forEach((data) => {
            this.selectedStore_ids.push(data);
            this.user_list.forEach((data1) => {
              if (data == data1.store_id) {
                this.selectedUser.push(data1.id);
              }
            });
          });
        }
      });
    }
  }

  // subscription
  subscriptionDecrement() {
    if (this.subscription_end_date > 0) {
      this.subscription_end_date--;
    }
  }

  subscriptionIncrement() {
    this.subscription_end_date++;
  }

  //registration
  registrationDecrement() {
    if (this.registration_date > 0) {
      this.registration_date--;
    }
  }

  registrationIncrement() {
    this.registration_date++;
  }

  //select shedular
  selectShcedularType(item) {
    this.selectedSchedulerType = item.value;
  }

  //get details
  async getDetails() {
    var data = {
      campaign_id: this.sms_campaign_id,
    };
    await this.NotificationTemplateService.getSMSNotificationsList(
      data
    ).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.formGroup.controls["campaign_name"].setValue(
            response.data[0].campaign_name
          );
          this.user_id = response.data[0].user_id;
          this.Ids = response.data[0].user_id.split(",");
          if (response.data[0].criteria == 1) {
            this.formGroup.controls["user"].setValue(this.user_type_list[0]);
            this.selectedusertype = this.user_type_list[0].value;
            this.userListRecord();
          } else if (response.data[0].criteria == 2) {
            this.Ids = [];
            this.Ids = response.data[0].store_id.split(",");
            this.formGroup.controls["user"].setValue(this.user_type_list[1]);
            this.selectedusertype = this.user_type_list[1].value;
            this.userListRecord();
          } else if (response.data[0].criteria == 3) {
            this.Ids = [];
            this.Ids = response.data[0].store_id.split(",");
            if (response.data[0].store_type) {
              this.store_typeIds = response.data[0].store_type.split(",");
            }
            this.formGroup.controls["user"].setValue(this.user_type_list[2]);
            this.storeTypeListRecord();
            this.selectedusertype = this.user_type_list[2].value;
            this.userListRecord();
          } else {
            this.selectedusertype = this.user_type_list[0].value;
          }
          if (response.data[0].schedule == 1) {
            this.formGroup.controls["sendtype"].setValue("1");
          } else {
            this.formGroup.controls["sendtype"].setValue("2");
          }

          this.formGroup.controls["messagetype"].setValue(
            response.data[0].notify_type
          );
          if (this.formGroup.value.messagetype == "2") {
            this.formGroup.controls["notification_title"].setValue(
              response.data[0].title
            );
            this.formGroup.controls["notification_text"].setValue(
              response.data[0].message
            );
          }
          if (this.formGroup.value.messagetype == "1") {
            this.formGroup.controls["msg_title"].setValue(
              response.data[0].title
            );
            this.formGroup.controls["sms_text"].setValue(
              response.data[0].message
            );
          }

          if (response.data[0].schedule_type) {
            this.formGroup.controls["selectedShcedulartype"].setValue(
              this.schedular_type[1].label
            );
            this.selectedSchedulerType = 2;
            this.formGroup.controls["selectedrecursive"].setValue(
              response.data[0].schedule_type
            );
          } else {
            this.formGroup.controls["selectedShcedulartype"].setValue(
              this.schedular_type[0].label
            );
            this.selectedSchedulerType = 1;
          }

          this.formGroup.controls["schedulerType"].setValue(
            response.data[0].type
          );
          if (this.formGroup.value.schedulerType == 2) {
            this.registration_date = response.data[0].days;
          } else {
            this.subscription_end_date = response.data[0].days;
          }
        }
      },
      error: (error) => {
        this.spinner.hide();
        this._snackbarService.error(error);
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }
  /** Submit  notification details */
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
      if (this.sms_campaign_id) {
        formData.append("campaign_id", this.sms_campaign_id);
      }
      formData.append("campaign_name", this.formGroup.value.campaign_name);
      formData.append("user_id", this.selectedUser);
      formData.append("schedule", this.formGroup.value.sendtype);
      formData.append("criteria", this.selectedusertype);
      formData.append("notify_type", this.formGroup.value.messagetype);
      if (this.formGroup.value.messagetype == "1") {
        formData.append("title", this.formGroup.value.msg_title);
        formData.append("message", this.formGroup.value.sms_text);
      }
      if (this.formGroup.value.messagetype == "2") {
        formData.append("title", this.formGroup.value.notification_title);
        formData.append("message", this.formGroup.value.notification_text);
      }
      formData.append("state_id", this.selectedState);
      formData.append("city_id", this.selectedCity);
      formData.append("area_id", this.selectedArea);
      //doubt
      if (this.selectedusertype != 1) {
        formData.append("store_id", this.selectedStore_ids);
      }
      if (this.selectedusertype == 3) {
        formData.append("store_type", this.selectedStoreType);
      }
      //
      if (this.selectedSchedulerType == 2) {
        formData.append("start_date", this.sendDate);
        formData.append("end_date", this.endDate);
        if (this.formGroup.value.selectedrecursive == "2") {
          formData.append("weekday", this.formGroup.value.weekday);
        }
        if (this.formGroup.value.selectedrecursive == "3") {
          formData.append("monthday", this.formGroup.value.monthday);
        }
        if (this.formGroup.value.selectedrecursive == "4") {
          formData.append("yearday", this.yearDate);
        }
        formData.append(
          "schedule_type",
          this.formGroup.value.selectedrecursive
        );
        var current_time = new Date();
        formData.append("current_time", moment(current_time).format("HH:mm"));
      } else {
        formData.append("date", this.sendDate);
        var current_time = new Date();
        formData.append("current_time", moment(current_time).format("HH:mm"));
      }

      var data = formData;
      this.NotificationTemplateService.manageSMSNotification(
        data
      ).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/notification-template`]);
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

  cancelClick() {
    history.back();
  }

  ngAfterViewInit(): void {
    this.cursor.nativeElement.focus();
  }
}
