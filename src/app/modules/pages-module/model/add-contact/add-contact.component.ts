import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ElementRef,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl
} from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { TranslateService } from "@ngx-translate/core";
import { ContactListService } from "src/app/services/campaign-management/contact-list.service";
import { CommonService } from "src/app/services/common.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-add-contact",
  templateUrl: "./add-contact.component.html",
  styleUrls: ["./add-contact.component.scss"],
})
export class AddContactComponent implements OnInit {
  public formGroup: FormGroup;
  countryList: any = [];
  stateList: any[];
  cityList: any[];
  areaList: any[];
  userTypeList: any = [];
  storeTypelist: any = [];
  //for condition
  main: any;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));;
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  allow_khata: any;
  platform_name: any;
  khata_label: any;
  isDisplayisEatery: any;
  isAllow_wholeseller: any;
  store_label: any;
  contactListId: any;
  style_obj_add_contact:any;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  @Output() passData: EventEmitter<any> = new EventEmitter();
  @Input() main1: any;
  @Input() contactListname: any;
  @Input() id: any;
  @Input() active: any;
  @Input() isDuplicate: any;
  userList: any = [];
  @ViewChild('dropdown') dropdown: ElementRef;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    public CommonService: CommonService,
    private spinner: SpinnerService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private ContactListService: ContactListService,
    private el: ElementRef,
    private _snackbarService: ToastrService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.condition();
    this.loadForm();
    this.countryListRecord();
    if (this.id) {
      this.contactListId = this.id;
    }
    this.cdr.detectChanges();
    this.style_obj_add_contact = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }
  //conditions
  /** condition for local storage setting and display by default data on form.  */

  condition() {
    if (this.main1) {
      this.main = this.main1;
    }
    if (this.generalSetting) {
      this.platform_name = this.generalSetting.platform_name;
      this.isDisplayisEatery = parseFloat(this.generalSetting.eatery_module);
      this.isAllow_wholeseller = parseFloat(
        this.generalSetting.allow_wholeseller
      );
      this.store_label = this.generalSetting.store_label;
      this.store_label = this.generalSetting.store_label;
      this.allow_khata = parseInt(this.generalSetting.allow_khata);
      this.khata_label = this.generalSetting.khata_label;
    } else {
      this.platform_name = this.main.platform_name;
      this.isDisplayisEatery = parseFloat(this.main.eatery_module);
      this.isAllow_wholeseller = parseFloat(this.main.allow_wholeseller);
      this.store_label = this.main.store_label;
      this.store_label = this.main.store_label;
      this.allow_khata = parseInt(this.main.allow_khata);
      this.khata_label = this.main.khata_label;
    }
    //list for user
    if (this.allow_khata == 1) {
      this.translate.get(["CUSTOMER", "BUSINESS"]).subscribe((translations) => {
        this.userTypeList = [
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
        this.userTypeList = [
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
      country_id: new FormControl(null),
      state_id: new FormControl(null),
      all_state: false,
      city_id: new FormControl(null),
      all_city: false,
      area_id: new FormControl(null),
      all_area: false,
      user: new FormControl(null),
      storeType: new FormControl(null),
      all_storeType: false,
      user_list: new FormControl(null),
      all_user: false,
      all_user_with_name: false,
      store_list: new FormControl(null),
      all_store: false,
    });
  }

  //get country
  async countryListRecord() {
    this.spinner.show();
    var data = {
      token_type: 1,
    };
    await this.CommonService.getCountryList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          var commonCountry = this.generalSetting.country != undefined ? this.generalSetting.country.split(',') : null;
          if (commonCountry) {
            commonCountry.forEach(country => {
              var objCountry = response.data.filter((x) => x.id == country.toString())[0]
              this.countryList.push(objCountry)
            })
          }
          //geting users from user list
          if (this.selectedusertype) {
            this.usersListRecord();
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
    await this.CommonService.getStateList(
      this.formGroup.value.country_id
    ).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.stateList = [];
          this.stateList = [{ name: "All", id: 0 }];
          response.data.forEach((value) => {
            this.stateList.push({ id: value.id, name: value.name });
          });

          //geting users from user list
          if (this.selectedusertype) {
            this.usersListRecord();
          }
        } else {
          this.stateList = [];
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //get city
  async cityListRecord() {
    await this.CommonService.getCityList(this.selectedState).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.cityList = [];
          this.areaList = [];
          this.cityList = [{ name: "All", id: 0 }];
          response.data.forEach((value) => {
            this.cityList.push({ id: value.id, name: value.name });
          });

          //geting users from user list
          if (this.selectedusertype) {
            this.usersListRecord();
          }
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  //get area
  async areaListRecord() {
    await this.CommonService.getAreaList(this.selectedCity).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.areaList = [];
          this.areaList = [{ name: "All", id: 0 }];
          response.data.forEach((value) => {
            this.areaList.push({ id: value.id, name: value.name });
          });

          //geting users from user list
          if (this.selectedusertype) {
            this.usersListRecord();
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
    this.formGroup.controls["city_id"].reset();
    this.formGroup.controls["area_id"].reset();
    this.formGroup.controls["all_state"].reset();
    this.formGroup.controls["all_city"].reset();
    this.formGroup.controls["all_area"].reset();
    this.formGroup.controls["store_list"].reset();
    this.formGroup.controls["all_store"].reset();
    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
    this.formGroup.controls["all_user_with_name"].reset();
  }

  //change state
  tempState: any = [];
  selectedState: any = [];
  StateChange(item) {
    this.selectedState = [];
    item.forEach((element) => {
      if (element.id == 0) {
        var temp: any = [];
        temp.push(element);
        this.formGroup.controls["state_id"].setValue(temp);
        this.stateList.forEach((data) => {
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
    this.formGroup.controls["area_id"].reset();
    this.formGroup.controls["all_city"].reset();
    this.formGroup.controls["all_area"].reset();
    this.formGroup.controls["store_list"].reset();
    this.formGroup.controls["all_store"].reset();
    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
    this.formGroup.controls["all_user_with_name"].reset();
    this.cityListRecord();
  }

  //select all state
  selectAllState() {
    if (this.formGroup.value.all_state == true) {
      this.tempState = []
      this.stateList.forEach((element) => {
        if (element.id == 0) {
          this.tempState.push(element);
          this.formGroup.controls["state_id"].setValue(this.tempState);

          this.stateList.forEach((item) => {
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
    this.formGroup.controls["area_id"].reset();
    this.formGroup.controls["all_city"].reset();
    this.formGroup.controls["all_area"].reset();
    this.formGroup.controls["store_list"].reset();
    this.formGroup.controls["all_store"].reset();
    this.cityListRecord();
  }

  //change  city
  tempCity: any = [];
  selectedCity: any = [];
  CityChange(item) {
    this.selectedCity = [];
    item.forEach((element) => {
      if (element.id == 0) {
        var temp: any = [];
        temp.push(element);
        this.formGroup.controls["city_id"].setValue(temp);

        //it should be commented when api eroor will fixx
        this.cityList.forEach((item) => {
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
    this.formGroup.controls["store_list"].reset();
    this.formGroup.controls["all_store"].reset();
    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
    this.formGroup.controls["all_user_with_name"].reset();
    this.areaListRecord();
  }

  //select all city
  selectAllCity() {
    if (this.formGroup.value.all_city == true) {
      this.tempCity = []
      this.cityList.forEach((element) => {
        if (element.id == 0) {
          this.tempCity.push(element);
          this.formGroup.controls["city_id"].setValue(this.tempCity);
          
          //it should be commented when api eroor will fixx
          this.cityList.forEach((item) => {
            if (item.id != 0) {
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
    this.formGroup.controls["store_list"].reset();
    this.formGroup.controls["all_store"].reset();

    this.areaListRecord();
  }

  //change area
  tempArea: any = [];
  selectedArea: any = [];
  AreaChange(item) {
    this.selectedArea = [];
    item.forEach((element) => {
      if (element.id == 0) {
        var temp: any = [];
        temp.push(element);
        this.formGroup.controls["area_id"].setValue(temp);
        this.areaList.forEach((data) => {
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

    this.formGroup.controls["store_list"].reset();
    this.formGroup.controls["all_store"].reset();
    this.formGroup.controls["user_list"].reset();
    this.formGroup.controls["all_user"].reset();
    this.formGroup.controls["all_user_with_name"].reset();
    //geting users from user list
    if (this.selectedusertype) {
      this.usersListRecord();
    }
  }

  //select all area
  selectAllArea() {
    if (this.formGroup.value.all_area == true) {
      this.tempArea = []

      this.areaList.forEach((element) => {
        if (element.id == 0) {
          this.tempArea.push(element);
          this.formGroup.controls["area_id"].setValue(this.tempArea);

          this.areaList.forEach((item) => {
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

    this.formGroup.controls["store_list"].reset();
    this.formGroup.controls["all_store"].reset();

    //geting users from user list
    if (this.selectedusertype) {
      this.usersListRecord();
    }
  }

  //change user type
  selectedusertype: any;
  changeUserType() {
    this.selectedusertype = this.formGroup.value.user.value;
    this.formGroup.controls["store_list"].reset();
    this.formGroup.controls["all_store"].reset();
    this.usersListRecord();
    if (this.selectedusertype == 3) {
      this.StoreTypeListRecord();
    }
  }

  //get store type list
  async StoreTypeListRecord() {
    this.spinner.show();
    var data = {
      token_type: 1,
    };
    await this.CommonService.getMasterCategoryList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.storeTypelist = [{ name: "All", id: 0 }];
          response.data.forEach((value) => {
            this.storeTypelist.push({
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
  selectedStoreType: any = [];
  tempStoreType: any = [];
  changeStoreType(item) {
    this.selectedStoreType = [];
    item.forEach((element) => {
      if (element.id == 0) {
        this.storeTypelist.forEach((data) => {
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

    this.formGroup.controls["store_list"].reset();
    this.formGroup.controls["all_store"].reset();

    //geting users from user list
    if (this.selectedusertype) {
      this.usersListRecord();
    }
  }

  //select all store type
  selectAllStoreType() {
    if (this.formGroup.value.all_storeType == true) {
      this.storeTypelist.forEach((element) => {
        if (element.id == 0) {
          this.storeTypelist.forEach((data) => {
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

    this.formGroup.controls["store_list"].reset();
    this.formGroup.controls["all_store"].reset();

    //geting users from user list
    if (this.selectedusertype) {
      this.usersListRecord();
    }
  }

  //get store list
  async usersListRecord() {
    this.spinner.show();
    var data: any = {
      user_type: this.selectedusertype,
      country_id: this.formGroup.value.country_id,
      store_type: this.selectedStoreType.toString(),
    };

    this.formGroup.get('all_state').value == true ? data.state_id = 0 : data.state_id = this.selectedState.toString();
    this.formGroup.get('all_city').value == true ? data.city_id = 0 : data.city_id = this.selectedCity.toString();
    this.formGroup.get('all_area').value == true ? data.area_id = 0 : data.area_id = this.selectedArea.toString();

    await this.ContactListService.getCampaignUserList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          if (this.selectedusertype == 1) {
            this.userList = [];
            this.userList = [{ id: 0, name: "All", phone: '' }];
            response.data.forEach((value) => {
              this.userList.push({
                id: Number(value.user_id),
                name: value.name,
                phone: value.phone
              });
            });
          }
          if (this.selectedusertype == 2 || this.selectedusertype == 3) {
            this.userList = [];
            this.userList = [{ id: 0, name: "All", phone: '' }];
            response.data.forEach((value) => {
              if (
                value.store_name != "" ||
                value.store_name != undefined ||
                value.store_name != null
              ) {
                this.userList.push({
                  id: Number(value.store_id),
                  name: value.store_name,
                  phone: value.phone
                });
              }
            });
          }
          this.userList.sort((a, b) => a.name.localeCompare(b.name))
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
  selectedUser: any = [];
  tempUser: any = [];
  selectUser(item, dropdown) {
    this.selectedUser = [];

    item.forEach((element) => {
      if (element.id == 0) {
        var temp: any = [];
        temp.push(element);
        this.formGroup.controls["user_list"].setValue(temp);
        this.userList.forEach((data) => {
          if (data.id != 0) {
            this.selectedUser.push(data.id);
          }
        });
        this.formGroup.controls["all_user"].setValue(true);
        this.formGroup.controls["all_user_with_name"].setValue(false);
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
  scrolling: boolean = false;
  scrollTop: number;
  scrollHeight: number;
  elementHeight: number;
  atBottom: boolean = false;
  scrollTimeout: number = 100;

  onScroll(e: any) {
    this.scrolling = true;
    this.scrollTop = e.srcElement.scrollTop;
    this.scrollHeight = e.srcElement.scrollHeight;
    this.elementHeight = e.srcElement.clientHeight;
    this.atBottom = this.scrollHeight == this.elementHeight + this.scrollTop;
    setTimeout(() => { this.scrolling = false; }, this.scrollTimeout);

    if (this.atBottom) {
      this.atBottom = false
    }
  }

  //select all user from userlist
  selectAllUser(show) {
    this.formGroup.controls["user_list"].setValue(null);
    this.selectedUser = [];
    if (show == 1) {
      this.formGroup.controls["all_user_with_name"].setValue(false);
      if (this.formGroup.value.all_user == true) {
        this.tempUser = []
        this.userList.forEach((element) => {
          if (element.id == 0) {
            this.tempUser.push(element);
            this.formGroup.controls["user_list"].setValue(this.tempUser);

            this.userList.forEach((item) => {
              if (item.id != 0) {
                this.selectedUser.push(item.id);
              }
            });
          }
        });
      } else {
        this.formGroup.controls["user_list"].setValue(null);
        this.selectedUser = [];
      }
    } else {
      this.formGroup.controls["all_user"].setValue(false);
      if (this.formGroup.value.all_user_with_name == true) {
        this.tempUser = []
        this.userList.forEach((element) => {
          if (element.id == 0) {
            this.userList.forEach((data) => {
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

  }

  //select store
  selectedStore: any = [];
  tempStore: any = [];
  selectStore(item) {
    this.selectedStore = [];
    item.forEach((element) => {
      if (element.id == 0) {
        this.userList.forEach((data) => {
          if (data.id != 0) {
            this.selectedStore.push(data.id);
            this.tempStore.push(data);
          }
        });
        this.formGroup.controls["store_list"].setValue(this.tempStore);
        this.formGroup.controls["all_store"].setValue(true);
      } else {
        this.selectedStore = [];
        this.formGroup.controls["store_list"].setValue(item);
        item.forEach((data) => {
          this.selectedStore.push(data.id);
        });
        this.formGroup.controls["all_store"].setValue(false);
      }
    });
  }

  //select all store
  selectAllStore() {
    if (this.formGroup.value.all_store == true) {
      this.userList.forEach((element) => {
        if (element.id == 0) {
          this.userList.forEach((data) => {
            if (data.id != 0) {
              this.selectedUser.push(data.id);
              this.tempStore.push(data);
            }
          });
          this.formGroup.controls["store_list"].setValue(this.tempStore);
        }
      });
    } else {
      this.formGroup.controls["store_list"].setValue(null);
      this.selectedUser = [];
    }
  }

  //clear all
  clearAll() {
    this.loadForm();
    this.selectedState = [];
    this.selectedCity = [];
    this.selectedArea = [];
    this.selectedusertype;
    this.selectedStoreType = [];
    this.selectedUser = [];
    this.selectedStore = [];
  }
  /** Submit edit/add data by sending with event emitter */
  //submit
  onsubmit() {
    if (!this.formGroup.controls['country_id'].value) {
      this.toastr.error(this.translate.instant("SELECTCOUNTRY"));
      return;
    }
    if (!this.selectedusertype) {
      this.toastr.error(this.translate.instant("SELECT_USER_TYPE"));
      return;
    }
    if (this.selectedusertype) {
      if (!this.formGroup.value.store_list) {
        if (this.selectedusertype == 3 || this.selectedusertype == 2) {
          this.toastr.error(this.translate.instant("SELECT_STORE"));
          return;
        }
      }
      if (!this.formGroup.value.user_list) {
        if (this.selectedusertype == 1) {
          this.toastr.error(this.translate.instant("SELECT_USER"));
          return;
        }
      }
    }
    // this.spinner.show();

    let formData = new FormData();
    formData.append("contact_list_name", this.contactListname);
    formData.append(
      "campaign_contacts_id",
      this.contactListId ? this.contactListId : 0
    );
    formData.append("user_type", this.selectedusertype);

    if (this.selectedusertype == 3) {
      formData.append("store_ids", this.selectedStore.toString());
    } else if (this.selectedusertype == 2) {
      formData.append("store_ids", this.selectedStore.toString());
    } else {
      formData.append("user_ids", Array.prototype.map.call(this.formGroup.get('user_list').value, function (item) { return item.id; }).join(","));
    }
    formData.append("is_active", this.active);

    var data = formData;
      this.ContactListService.manageCampaignContacts(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            if (response.data.length == 0) {
              this._snackbarService.error(response.message);
            } else {
              this._snackbarService.success(response.message);
            }
            this.contactListId = response.data?.campaign_contacts_id;
            this.passEntry.emit(this.contactListId);
            //clear all
            this.clearAll();
            this.closeURLmodel();
          } else {
            this._snackbarService.error(response.message);
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

  closeURLmodel() {
    this.activeModal.dismiss();
  }
}
