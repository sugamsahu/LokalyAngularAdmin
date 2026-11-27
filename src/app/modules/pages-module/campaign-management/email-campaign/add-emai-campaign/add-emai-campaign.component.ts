import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
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
import { EmailCampaignService } from "src/app/services/campaign-management/email-campaign.service";
import { CommonService } from "src/app/services/common.service";
import { ContactListService } from "src/app/services/campaign-management/contact-list.service";
import { AngularEditorConfig } from "@kolkov/angular-editor";
import * as moment from "moment";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-add-emai-campaign",
  templateUrl: "./add-emai-campaign.component.html",
  styleUrls: ["./add-emai-campaign.component.scss"],
})
export class AddEmaiCampaignComponent implements OnInit, AfterViewInit {
  public formGroup: UntypedFormGroup;
  main: any = { LoggedUserInfo: {} };
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  business_model = this.platform_setting.business_model;
  //for email campaign
  email_campaign_id: any = 0;
  campaign_detail_id: any;
  country_list: any = [];
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
  is_display_is_eatery: any;
  is_allow_wholeseller: any;
  store_label: any;
  //date and time
  min_date: any;
  date_type: any = "1";
  days: any;
  registration_date: any = 0;
  subscription_end_date: any = 0;
  end_date: any;
  sendDateTime: any;
  currentTime: any;
  endDateTime: any;
  tempState: any = [];
  selectedState: any = [];
  tempCity: any = [];
  selectedCity: any = [];
  tempArea: any = [];
  selectedArea: any = [];
  selectedusertype: any;
  selectedStoreType: any = [];
  tempStoreType: any = [];
  selectedUser: any = [];
  tempUser: any = [];
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: "250px",
    minHeight: "0",
    maxHeight: "auto",
    width: "750px",
    minWidth: "0",
    translate: "no",
    defaultParagraphSeparator: "p",
    defaultFontName: "Arial",
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: "redText",
        class: "redText",
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ],
    toolbarHiddenButtons: [
      [
        "fontSize",
        "textColor",
        "backgroundColor",
        "customClasses",
        "link",
        "unlink",
        "insertImage",
        "insertVideo",
        "insertHorizontalRule",
        "removeFormat",
        "toggleEditorMode",
      ],
    ],
  };
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
    private EmailCampaignService: EmailCampaignService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/email-campaign/edit") > -1) {
      this.email_campaign_id = this.cryptoService.decryptIdValue(
        "campaign_id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.email_campaign_id == undefined) {
        this.router.navigate(["/email-campaign"]);
      }
    }
  }

  ngOnInit(): void {
    this.min_date = new Date();
    this.getCondition();
    this.loadForm();
    this.changeSendTime();
    if (this.formGroup.value.selectedSheduler == 1) {
      this.end_date = new Date();
      this.end_date.setDate(this.end_date.getDate() + 7);
      this.formGroup.controls["enddate"].setValue(this.end_date);
    }
    this.changeEndTime();
    if (this.general_setting) {
      this.formGroup.controls["footer"].setValue(
        this.general_setting.email_footer_customer
      );
      this.formGroup.controls["header"].setValue(
        this.general_setting.email_header
      );
    } else {
      this.formGroup.controls["footer"].setValue(
        this.main.email_footer_customer
      );
      this.formGroup.controls["header"].setValue(this.main.email_header);
    }
    this.countryListRecord();

    if (this.email_campaign_id) {
      this.getDetails();
    }
    this.cdr.detectChanges();
  }

  //conditions
  getCondition() {
    this.general_setting = JSON.parse(
      localStorage.getItem("LoggedUserSettings")
    );
    if (this.general_setting) {
      this.platform_name = this.general_setting.platform_name;
      this.is_display_is_eatery = parseFloat(this.general_setting.eatery_module);
      this.is_allow_wholeseller = parseFloat(
        this.general_setting.allow_wholeseller
      );
      this.store_label = this.general_setting.store_label;
      this.store_label = this.general_setting.store_label;
      this.allow_khata = parseInt(this.general_setting.allow_khata);
      this.khata_label = this.general_setting.khata_label;
    } else {
      this.platform_name = this.main.platform_name;
      this.is_display_is_eatery = parseFloat(this.main.eatery_module);
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
  }
  //load form
  loadForm() {
    this.formGroup = this.formBuilder.group({
      campaign_name: [null, Validators.required],
      country_id: new UntypedFormControl(null),
      state_id: new UntypedFormControl(null),
      all_state: false,
      city_id: new UntypedFormControl(null),
      all_city: false,
      area_id: new UntypedFormControl(null),
      all_area: false,
      user: new UntypedFormControl(null),
      storeType: new UntypedFormControl(null),
      all_storeType: false,
      user_list: new UntypedFormControl(null),
      all_user: false,
      Subject: [null],
      header: [null],
      content: [null],
      footer: [null],
      sendtype: ["1"],
      selectedSheduler: ["1"],
      senddate: new UntypedFormControl(new Date()),
      sendtime: new UntypedFormControl(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      ),
      enddate: new UntypedFormControl(null),
      endtime: new UntypedFormControl(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      ),
    });
    this.formGroup.get("senddate").valueChanges.subscribe((val) => {
      this.changeDate(val);
    });

    this.formGroup.get("sendtime").valueChanges.subscribe(() => {
      this.changeSendTime();
    });

    this.formGroup.get("endtime").valueChanges.subscribe(() => {
      this.changeEndTime();
    });
  }

  //change date according to shedular type
  changeDate(item) {
    if (this.formGroup.value.selectedSheduler == 1) {
      this.formGroup.controls["enddate"].setValue(new Date());
      this.formGroup.controls["enddate"].setValue(new Date());
      var enddate = this.formGroup.value.enddate.setDate(
        this.formGroup.value.enddate.getDate() + 7
      );
      this.formGroup.controls["enddate"].setValue(new Date(enddate));
    } else if (this.formGroup.value.selectedSheduler == 2) {
      var month = moment().add(1, "month").toString();
      this.formGroup.controls["enddate"].setValue(new Date(month));
    } else if (this.formGroup.value.selectedSheduler == 3) {
      var month = moment().add(3, "month").toString();
      this.formGroup.controls["enddate"].setValue(new Date(month));
    } else if (this.formGroup.value.selectedSheduler == 4) {
      var month = moment().add(6, "month").toString();
      this.formGroup.controls["enddate"].setValue(new Date(month));
    } else if (this.formGroup.value.selectedSheduler == 5) {
      var month = moment().add(1, "year").toString();
      this.formGroup.controls["enddate"].setValue(new Date(month));
    }
  }

  //set send date and time
  changeSendTime() {
    var Ctime = new Date();
    var splitTime = Ctime.toString().split(" ");
    this.currentTime = splitTime[4];
    var date;
    var time;

    if (this.formGroup.value.senddate._d) {
      date = this.formGroup.value.senddate._d.toString();
    } else {
      date = this.formGroup.value.senddate.toString();
    }

    time = this.formGroup.value.sendtime;

    var separate_date = date.split(" ");
    var splitsecond = separate_date[4].split(":");
    var second = splitsecond[2];
    this.sendDateTime =
      separate_date[0] +
      " " +
      separate_date[1] +
      " " +
      separate_date[2] +
      " " +
      separate_date[3] +
      " " +
      time +
      ":" +
      second +
      " " +
      separate_date[5] +
      " " +
      separate_date[6] +
      " " +
      separate_date[7] +
      " " +
      separate_date[8];
  }

  //set end time
  changeEndTime() {
    var date;
    var time;

    if (this.formGroup.value.enddate._d) {
      date = this.formGroup.value.enddate._d.toString();
    } else {
      date = this.formGroup.value.enddate.toString();
    }

    time = this.formGroup.value.endtime;

    var separate_date = date.split(" ");
    var splitsecond = separate_date[4].split(":");
    var second = splitsecond[2];
    this.endDateTime =
      separate_date[0] +
      " " +
      separate_date[1] +
      " " +
      separate_date[2] +
      " " +
      separate_date[3] +
      " " +
      time +
      ":" +
      second +
      " " +
      separate_date[5] +
      " " +
      separate_date[6] +
      " " +
      separate_date[7] +
      " " +
      separate_date[8];
  }
  //get country
  async countryListRecord() {
    this.spinner.show();
    var data = {
      token_type: 1,
    };
    await this.commonService.getCountryList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          var commonCountry = this.general_setting.country != undefined ? this.general_setting.country.split(',') : null;
          if (commonCountry) {
            commonCountry.forEach(country => {
              var objCountry = response.data.filter((x) => x.id == country.toString())[0]
              this.country_list.push(objCountry)
            })
          }
          //geting users from user list
          if (this.selectedusertype) {
            this.userListRecord();
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

  //get state
  async stateListRecord() {
    await this.commonService.getStateList(
      this.formGroup.value.country_id
    ).subscribe({
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

          //geting users from user list
          if (this.selectedusertype) {
            this.userListRecord();
          }
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }
  //change country
  countryChange() {
    this.stateListRecord();
    this.formGroup.controls["state_id"].reset();
    this.formGroup.controls["all_state"].reset();
    this.formGroup.controls["city_id"].reset();
    this.formGroup.controls["all_city"].reset();
    this.formGroup.controls["area_id"].reset();
    this.formGroup.controls["all_area"].reset();
    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
  }

  //change state
  stateChange(item) {
    this.selectedState = [];
    item.forEach((element) => {
      if (element.id == 0) {
        var temp: any = [];
        temp.push(element);
        this.formGroup.controls["state_id"].setValue(temp);
        this.state_list.forEach((data) => {
          if (data.id != 0) {
            this.selectedState.push(data.id);
          }
        });
        this.formGroup.controls["all_state"].setValue(true);
      } else {
        this.selectedState = [];
        this.formGroup.controls["state_id"].setValue(item);
        item.forEach((data) => {
          this.selectedState.push(data.id);
        });
        this.formGroup.controls["all_state"].setValue(false);
      }
    });
    this.formGroup.controls["city_id"].reset();
    this.formGroup.controls["all_city"].reset();
    this.formGroup.controls["area_id"].reset();
    this.formGroup.controls["all_area"].reset();
    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
    this.cityListRecord();
  }

  //select all state
  selectAllState() {
    if (this.formGroup.value.all_state == true) {
      this.state_list.forEach((element) => {
        if (element.id == 0) {
          this.tempState.push(element);
          this.formGroup.controls["state_id"].setValue(this.tempState);

          this.state_list.forEach((item) => {
            if (item.id != 0) {
              this.selectedState.push(item.id);
            }
          });
        }
      });
    } else {
      this.formGroup.controls["state_id"].setValue(null);
      this.selectedState = [];
    }
    this.formGroup.controls["city_id"].reset();
    this.formGroup.controls["all_city"].reset();
    this.formGroup.controls["area_id"].reset();
    this.formGroup.controls["all_area"].reset();
    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
    this.cityListRecord();
  }

  //change  city
  cityChange(item) {
    this.selectedCity = [];
    item.forEach((element) => {
      if (element.id == 0) {
        var temp: any = [];
        temp.push(element);
        this.formGroup.controls["city_id"].setValue(temp);

        //it should be commented when api eroor will fixx
        this.city_list.forEach((item) => {
          if (item.id == 0) {
            this.selectedCity.push(item.id);
          }
        });

        this.formGroup.controls["all_city"].setValue(true);
      } else {
        this.selectedCity = [];
        this.formGroup.controls["city_id"].setValue(item);
        item.forEach((data) => {
          this.selectedCity.push(data.id);
        });
        this.formGroup.controls["all_city"].setValue(false);
      }
    });
    this.formGroup.controls["area_id"].reset();
    this.formGroup.controls["all_area"].reset();
    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
    this.areaListRecord();
  }

  //select all city
  selectAllCity() {
    if (this.formGroup.value.all_city == true) {
      this.city_list.forEach((element) => {
        if (element.id == 0) {
          this.tempCity.push(element);
          this.formGroup.controls["city_id"].setValue(this.tempCity);
          //it should be commented when api eroor will fixx
          this.city_list.forEach((item) => {
            if (item.id == 0) {
              this.selectedCity.push(item.id);
            }
          });
        }
      });
    } else {
      this.formGroup.controls["city_id"].setValue(null);
      this.selectedCity = [];
    }
    this.formGroup.controls["area_id"].reset();
    this.formGroup.controls["all_area"].reset();
    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
    this.areaListRecord();
  }

  //change area
  areaChange(item) {
    this.selectedArea = [];
    item.forEach((element) => {
      if (element.id == 0) {
        var temp: any = [];
        temp.push(element);
        this.formGroup.controls["area_id"].setValue(temp);
        this.area_list.forEach((data) => {
          if (data.id != 0) {
            this.selectedArea.push(data.id);
          }
        });
        this.formGroup.controls["all_area"].setValue(true);
      } else {
        this.selectedArea = [];
        this.formGroup.controls["area_id"].setValue(item);
        item.forEach((data) => {
          this.selectedArea.push(data.id);
        });
        this.formGroup.controls["all_area"].setValue(false);
      }
    });

    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();

    //geting users from user list
    if (this.selectedusertype) {
      this.userListRecord();
    }
  }

  //select all area
  selectAllArea() {
    if (this.formGroup.value.all_area == true) {
      this.state_list.forEach((element) => {
        if (element.id == 0) {
          this.tempArea.push(element);
          this.formGroup.controls["area_id"].setValue(this.tempArea);

          this.state_list.forEach((item) => {
            if (item.id != 0) {
              this.selectedArea.push(item.id);
            }
          });
        }
      });
    } else {
      this.formGroup.controls["area_id"].setValue(null);
      this.selectedArea = [];
    }

    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();

    //geting users from user list
    if (this.selectedusertype) {
      this.userListRecord();
    }
  }

  //change user type
  changeUserType() {
    this.selectedusertype = this.formGroup.value.user.value;
    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
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
        this.formGroup.controls["all_storeType"].setValue(true);
      } else {
        this.selectedStoreType = [];
        this.formGroup.controls["storeType"].setValue(item);
        item.forEach((data) => {
          this.selectedStoreType.push(data.id);
        });
        this.formGroup.controls["all_storeType"].setValue(false);
      }
    });

    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
    // geting users from user list
    if (this.selectedusertype) {
      this.userListRecord();
    }
  }

  //select all store type
  selectAllStoreType() {
    if (this.formGroup.value.all_storeType == true) {
      this.store_type_list.forEach((element) => {
        if (element.id == 0) {
          this.store_type_list.forEach((data) => {
            if (data.id != 0) {
              this.selectedStoreType.push(data.id);
              this.tempStoreType.push(data);
            }
          });
          this.formGroup.controls["storeType"].setValue(this.tempStoreType);
        }
      });
    } else {
      this.formGroup.controls["storeType"].setValue(null);
      this.selectedStoreType = [];
    }

    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
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
      country_id: this.formGroup.value.country_id,
      city_id: this.selectedCity,
      area_id: this.selectedArea,
      store_type: this.selectedStoreType.toString(),
    };
    await this.ContactListService.getCampaignUserList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.user_list = [];
          this.user_list = [{ name: "All", id: 0 }];
          response.data.forEach((value) => {
            this.user_list.push({
              id: Number(value.user_id),
              name: value.name,
            });
          });
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

  //select user from user list
  selectUser(item) {
    this.selectedUser = [];
    item.forEach((element) => {
      if (element.id == 0) {
        this.user_list.forEach((data) => {
          if (data.id != 0) {
            this.selectedUser.push(data.id);
            this.tempUser.push(data);
          }
        });
        this.formGroup.controls["user_list"].setValue(this.tempUser);
        this.formGroup.controls["all_user"].setValue(true);
      } else {
        this.selectedUser = [];
        this.formGroup.controls["user_list"].setValue(item);
        item.forEach((data) => {
          this.selectedUser.push(data.id);
        });
        this.formGroup.controls["all_user"].setValue(false);
      }
    });
  }

  //select all user from userlist
  selectAllUser() {
    if (this.formGroup.value.all_user == true) {
      this.user_list.forEach((element) => {
        if (element.id == 0) {
          this.user_list.forEach((data) => {
            if (data.id != 0) {
              this.selectedUser.push(data.id);
              this.tempUser.push(data);
            }
          });
          this.formGroup.controls["user_list"].setValue(this.tempUser);
        }
      });
    } else {
      this.formGroup.controls["user_list"].setValue(null);
      this.selectedUser = [];
    }
  }
  /** Get campaign details using service  */
  //get details
  getDetails() {
    var data = {
      campaign_id: this.email_campaign_id,
    };
    this.EmailCampaignService.getCampaingnListById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data.forEach((value) => {
            if (value.criteria == "customer") {
              this.formGroup.controls["user"].setValue(this.user_type_list[0]);
              this.selectedusertype = this.user_type_list[0].value;
              this.userListRecord();
            } else if (value.criteria == "lokalyKhata") {
              this.formGroup.controls["user"].setValue(this.user_type_list[1]);
              this.selectedusertype = this.user_type_list[1].value;
              this.userListRecord();
            } else if (value.criteria == "loklayBussiness") {
              this.formGroup.controls["user"].setValue(this.user_type_list[2]);
              this.selectedusertype = this.user_type_list[2].value;
              this.userListRecord();
            }

            if (value.schedule == 0) {
              this.formGroup.controls["sendtype"].setValue("1");
            } else {
              this.formGroup.controls["sendtype"].setValue("0");
            }
            this.formGroup.controls["Subject"].setValue(value.msg_subject);
            this.formGroup.controls["header"].setValue(value.msg_header);
            this.formGroup.controls["footer"].setValue(value.msg_footer);
            this.formGroup.controls["content"].setValue(value.msg_body);
            this.formGroup.controls["campaign_name"].setValue(
              value.campaign_name
            );
            this.campaign_detail_id = value.campaign_detail_id;

            this.formGroup.controls["selectedSheduler"].setValue(
              value.schedule_type
            );
            localStorage.setItem("IdforEdit", value.user_id);
          });
        }
      },
      error: (error) => {
        this._snackbarService.error(error);
      },
      complete: () => {

      },
    });
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

  /** Submit email template edit detail  */
  //submit
  onSubmit() {
    if (this.email_campaign_id != 0) {
      this.submitEmailTemplateEditDetail();
    } else {
      this.submit();
    }
  }

  /** Submit Send Campaign Email details */
  //submit new
  submit() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
      this.toastr.error(this.translate.instant("ENTER_ALL_REQUIRED_FIELDS"));
      return;
    } else {
      if (this.formGroup.value.sendtype == "1") {
        this.sendDateTime = null;
        this.endDateTime = null;
        this.currentTime = null;
        this.formGroup.controls["selectedSheduler"].setValue(null);
        this.days = null;
      } else if (this.formGroup.value.sendtype == "0") {
        this.formGroup.controls["sendtype"].setValue(2);

        if (this.date_type == "1") {
          this.days = this.registration_date;
          this.date_type = "2";
        } else if (this.date_type == "0") {
          this.date_type = "1";
          this.days = this.subscription_end_date;
        }
      }
      let formData = new FormData();
      formData.append("user_id", this.selectedUser);

      formData.append("schedule", this.formGroup.value.sendtype);

      formData.append("msg_subject", this.formGroup.value.Subject);

      formData.append("msg_header", this.formGroup.value.header);

      formData.append("msg_body", this.formGroup.value.content);

      formData.append("msg_footer", this.formGroup.value.footer);

      formData.append("campaign_name", this.formGroup.value.campaign_name);

      formData.append("start_date", this.sendDateTime);

      formData.append("end_date", this.endDateTime);

      formData.append("current_time", this.currentTime);

      formData.append("date", null);

      formData.append("days", this.days);

      formData.append("schedule_type", this.formGroup.value.selectedSheduler);

      formData.append("select_type", this.date_type);

      formData.append("daily", null);

      var data = formData;

      this.EmailCampaignService.sendCampaignEmail(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
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

  //edit
  submitEmailTemplateEditDetail() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
      this.toastr.error(this.translate.instant("ENTER_ALL_REQUIRED_FIELDS"));
      return;
    } else {
      if (this.formGroup.value.sendtype == "1") {
        this.sendDateTime = null;
        this.endDateTime = null;
        this.currentTime = null;
      } else if (this.date_type == "1" && this.formGroup.value.sendtype == "2") {
        this.days = this.registration_date;
      } else if (this.date_type == "0" && this.formGroup.value.sendtype == "2") {
        this.days = this.subscription_end_date;
      }
      let formData = new FormData();
      formData.append("id", this.campaign_detail_id);

      formData.append("user_type", this.selectedusertype);

      formData.append("send_now", this.formGroup.value.sendtype);

      formData.append("user_id", this.selectedUser);

      formData.append("msg_subject", this.formGroup.value.Subject);

      formData.append("msg_header", this.formGroup.value.header);

      formData.append("msg_footer", this.formGroup.value.footer);

      formData.append("msg_body", this.formGroup.value.content);

      formData.append("campaign_name", this.formGroup.value.campaign_name);

      formData.append("start_date", this.sendDateTime);

      formData.append("end_date", this.endDateTime);

      formData.append("schedule_type", this.formGroup.value.selectedSheduler);

      formData.append("days", this.days);

      var data = formData;

      this.EmailCampaignService.editCampaignEmail(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
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
}
