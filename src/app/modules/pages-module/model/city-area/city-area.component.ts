import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "src/app/services/common.service";
import Swal from "sweetalert2";
import { ManageStoreService } from "src/app/services/manage-store.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-city-area",
  templateUrl: "./city-area.component.html",
  styleUrls: ["./city-area.component.scss"],
})
export class CityAreaModelComponent implements OnInit {
  area_form: UntypedFormGroup;
  @Input() deliveryareas: any;
  @Input() expressDeliveryAreas: any;
  @Input() areaCityPopupType: any;
  @Input() store_id: any;
  @Input() isSuperAdmin: any;
  @Output() totalareacitycount: EventEmitter<any> = new EventEmitter();
  @Output() totalexpressAreaCityCount: EventEmitter<any> = new EventEmitter();
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  latitude: any = parseFloat(this.generalSetting.default_location_lat);
  longitude: any = parseFloat(this.generalSetting.default_location_long);
  use_google_map = parseInt(this.generalSetting.use_google_map);
  userData = JSON.parse(localStorage.getItem('loginUser'));
  main: any = { LoggedUserInfo: {} };
  closeResult = '';
  countryList = [];
  areainfo = {};
  stateList = [];
  cityList = [];
  areaList = [];
  areaIds: any[] = [];
  cityIds: any[] = [];
  filterData: any[] = [];
  areacitycount: number = 0;
  expressAreaCityCount: number = 0;
  submitedarea: boolean = false;
  style_obj_city_area: any;

  constructor(
    private toastr: ToastrService,
    public translate: TranslateService,
    public commonService: CommonService,
    public manageStoreService: ManageStoreService,
    private formBuilder: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    $(
      "<style>.modal-dialog { max-width: 1138px }</style>"
    ).appendTo("body");
    this.style_obj_city_area = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.GetDeliveryAreaList(this.areaCityPopupType);
    this.loadForm();
    this.countryListRecord();
  }

  loadForm() {
    this.area_form = this.formBuilder.group({
      country_id: new UntypedFormControl(null, [Validators.required]),
      state_id: new UntypedFormControl(null, [Validators.required]),
      city_id: new UntypedFormControl(null, [Validators.required]),
      area_id: new UntypedFormControl(null),
    })
  }

  countryListRecord() {
    this.commonService.getCountryList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.countryList = [];
          var commonCountry = this.generalSetting.country != undefined ? this.generalSetting.country.split(",") : null;
          if (commonCountry) {
            commonCountry.forEach((country) => {
              var objCountry = response.data.filter((s) =>
                s.id.includes(country.toString())
              );
              if (objCountry) {
                this.countryList.push(objCountry[0]);
              }
            });
          } else {
            this.main.country.split(",").forEach((country) => {
              var objCountry = response.data.filter((s) =>
                s.id.includes(country.toString())
              );
              if (objCountry) {
                this.countryList.push(objCountry);
              }
            });
          }
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }

  async stateListRecord() {
    await this.commonService.getStateList(this.area_form.value.country_id).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.stateList = [];
          this.stateList = response.data;
        }
        else {
          this.stateList = [];
        }
      },
      error: (error) => {

      },
      complete: () => {

      },
    });
  }

  async cityListRecord() {
    await this.commonService
      .getCityList(this.area_form.value.state_id)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.cityList = [];
            this.areaList = [];
            this.cityList = response.data;
          }
        },
        error: (error) => {
        },
        complete: () => {
        },
      });
  }

  async areaListRecord() {
    await this.commonService
      .getAreaList(this.area_form.value.city_id)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.areaList = [];
            this.areaList = response.data;
          }
        },
        error: (error) => {
        }
      });
  }

  CountryChange() {
    this.stateListRecord();
    this.area_form.controls["state_id"].reset();
    this.area_form.controls["city_id"].reset();
    this.area_form.controls["area_id"].reset();
  }

  StateChange() {
    this.area_form.controls["city_id"].reset();
    this.area_form.controls["area_id"].reset();
    this.cityListRecord();
  }

  CityChange() {
    this.area_form.controls["area_id"].reset();
    this.areaListRecord();
  }

  submitAreaDetails() {
    this.areaIds = [];
    this.cityIds = [];

    if (this.area_form.value.country_id == '101') {
      if (this.area_form.value.area_id == '' || this.area_form.value.city_id == undefined
        || this.area_form.value.state_id == undefined) {
        this.toastr.error(this.translate.instant('PLEASE_ENTER_STATE_CITY_AREA'));
        return;
      }

      for (var i = 0; i < this.area_form.value.area_id.length; i++) {
        this.areaIds.push(parseInt(this.area_form.value.area_id[i]));
      }

      if (this.hasDuplicates(this.areaIds)) {
        this.toastr.error(this.translate.instant('PLEASE_ENTER_DIFFERENT_AREA'));
        return;
      }
    }
    else {
      if (this.area_form.value.city_id == ''
        || this.area_form.value.state_id == undefined) {
        this.toastr.error(this.translate.instant('PLEASE_ENTER_STATE_CITY_AREA'));
        return;
      }

      for (var i = 0; i < this.area_form.value.city_id.length; i++) {
        this.cityIds.push(parseInt(this.area_form.value.city_id[i]));
      }


      if (this.hasDuplicates(this.cityIds)) {
        this.toastr.error(this.translate.instant('PLEASE_ENTER_DIFFERENT_AREA'));
        return;
      }
    }
    if (this.area_form.valid) {
      var data1 = {
        country_id: this.area_form.value.country_id,
        store_id: this.store_id,
        state_id: this.area_form.value.state_id,
        city_id: this.area_form.value.country_id == '101' ? this.area_form.value.city_id : this.cityIds.toString(),
        delivery_type: this.areaCityPopupType,
        area_ids: ''
      };

      if (this.area_form.value.country_id == '101') {
        data1.area_ids = this.areaIds.toString()
      }
      if (this.isSuperAdmin == true) {
        if (this.area_form.value.country_id == '101') {
          this.areaIds.forEach((idName: any) => {
            this.filterData = [];
            if (this.area_form.value.country_id == '101') {
              if (this.areaCityPopupType == 1) {
                this.deliveryareas.filter((s: any) => s.area_id);
                if (this.deliveryareas.filter((s: any) => s.area_id.toString().includes(idName.toString())).length > 0) {

                } else {
                  this.filterData = this.areaList.filter((s: any) => s.id == idName.toString());
                }
              }
              else {
                if (this.expressDeliveryAreas.filter((e: any) => e.area_id.toString().includes(idName.toString())).length > 0) {

                } else {
                  this.filterData = this.areaList.filter((e: any) => e.id == idName.toString())
                }
              }
            } else {
              if (this.areaCityPopupType == 1) {
                if (this.deliveryareas.filter((a: any) => a.city_id.toString().includes(idName.toString())).length > 0) {

                } else {
                  this.filterData = this.cityList.filter((c: any) => c.id == idName.toString());
                }
              } else {
                if (this.expressDeliveryAreas.filter((e: any) => e.city_id.toString().includes(idName.toString())).length > 0) {

                } else {
                  this.filterData = this.cityList.filter((c: any) => c.id == idName.toString());
                }
              }
            }

            if (this.filterData.length > 0) {
              var data = {
                state_id: this.area_form.value.state_id,
                state_name: this.area_form.value.state_id,
                city_id: this.area_form.value.country_id == '101' ? this.area_form.value.city_id : this.filterData[0].id,
                city_name: this.area_form.value.country_id == '101' ? this.cityList.filter((c: any) => c.id == this.area_form.value.city_id)[0].name : this.filterData[0].name,
                area_id: this.filterData[0].id,
                area_name: this.filterData[0].name,
                country_id: this.area_form.value.country_id,
                country_name: this.countryList.filter((c: any) => c.id == this.area_form.value.country_id)[0].name,
                country_code: this.countryList.filter((c: any) => c.id == this.area_form.value.country_id)[0].sortname
              }
              if (this.areaCityPopupType == 1) {
                this.deliveryareas.push(data);
              }
              else {
                this.expressDeliveryAreas.push(data);
              }
            }
          })

        } else {
          this.cityIds.forEach((idName: any) => {
            this.filterData = [];
            if (this.area_form.value.country_id == '101') {
              if (this.areaCityPopupType == 1) {

                if (this.deliveryareas.filter((s: any) => s.area_id.toString().includes(idName.toString()))) {

                } else {
                  this.filterData = this.areaList.filter((s: any) => s.id == idName.toString());
                }
              }
              else {
                if (this.expressDeliveryAreas.filter((e: any) => e.area_id.toString().includes(idName.toString()))) {

                } else {
                  this.filterData = this.areaList.filter((e: any) => e.id == idName.toString())
                }
              }
            }
            else {
              if (this.areaCityPopupType == 1) {
                if (this.deliveryareas.filter((a: any) => a.city_id.toString().includes(idName.toString()))) {

                } else {
                  this.filterData = this.cityList.filter((c: any) => c.id == idName.toString());
                }
              } else {
                if (this.expressDeliveryAreas.filter((e: any) => e.city_id.toString().includes(idName.toString()))) {

                } else {
                  this.filterData = this.cityList.filter((c: any) => c.id == idName.toString());
                }
              }
            }

            if (this.filterData.length > 0) {
              var data = {
                state_id: this.area_form.value.state_id,
                state_name: this.area_form.value.state_id,
                city_id: this.area_form.value.country_id == '101' ? this.area_form.value.city_id : this.filterData[0].id,
                city_name: this.area_form.value.country_id == '101' ? this.area_form.value.city_id : this.filterData[0].name,
                area_id: this.filterData[0].id,
                area_name: this.filterData[0].name,
                country_id: this.area_form.value.country_id,
                country_name: this.area_form.value.country_id,
                country_code: this.area_form.value.country_id
              }
              if (this.areaCityPopupType == 1) {
                this.deliveryareas.push(data);
              }
              else {
                this.expressDeliveryAreas.push(data);
              }

            }
          })
        }
        if (this.area_form.value.country_id == '101') {
          this.area_form.controls["area_id"].reset();
        }
        else {
          this.area_form.controls["city_id"].reset();
        }
        if (this.areaCityPopupType == 1) {
          this.areacitycount = this.deliveryareas.length;
        }
        else {
          this.expressAreaCityCount = this.expressDeliveryAreas.length;
        }
      } else {

        this.manageStoreService.manageStoreDeliveryArea(data1).subscribe({
          next: (response: any) => {
            if (response.status == 1) {
              this.submitedarea = true;
              this.GetDeliveryAreaList(this.areaCityPopupType);
              this.toastr.success(response.message);
              if (this.area_form.value.country_id == '101') {
                this.area_form.value.area_id = '';
              }
              else {
                this.area_form.value.city_id = '';
              }
            }
            else {

            }
          },
          error: (error: any) => {
          }
        })
      }
    }
  }

  hasDuplicates(arr: any) {
    return arr.some((x: any) => arr.indexOf(x) !== arr.lastIndexOf(x));
  }

  deleteAllCityArea() {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_ALL_CONTACT_RECORD"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteCityArea(0);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        console.log("cancelled");
      }
    });
  }


  deleteCityArea(deliveryarea: any) {
    if (this.isSuperAdmin == true) {
      if (deliveryarea == 0) {
        if (this.areaCityPopupType == 1) {
          this.deliveryareas = [];
          this.areacitycount = 0;
        }
        else {
          this.expressDeliveryAreas = [];
          this.expressAreaCityCount = 0;
        }
      } else {
        if (this.areaCityPopupType == 1) {
          this.deliveryareas = this.deliveryareas.filter(item => item !== deliveryarea);
          this.areacitycount = this.deliveryareas.length;
        }
        else {
          this.expressDeliveryAreas = this.expressDeliveryAreas.filter(item => item !== deliveryarea);
          this.expressAreaCityCount = this.expressDeliveryAreas.length;
        }
      }
    } else {
      var data = {
        store_id: this.loginUserStore.store_id,
        delivery_type: this.areaCityPopupType,
        is_delete: 1,
        area_ids: deliveryarea.area_id ? deliveryarea.area_id : '',
        city_id: deliveryarea.city_id
      };

      this.manageStoreService.manageStoreDeliveryArea(data).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.GetDeliveryAreaList(this.areaCityPopupType);
          }
          else {
            if (this.areaCityPopupType == 1) {
              this.deliveryareas = [];
            }
            else {
              this.expressDeliveryAreas = [];
            }
          }
        },
        error: (error: any) => {
          if (this.areaCityPopupType == 1) {
            this.deliveryareas = [];
          }
          else {
            this.expressDeliveryAreas = [];
          }
        }
      })

    }
  }

  GetDeliveryAreaList(deliveryType: any) {
    var data1 = {
      store_id: this.loginUserStore.store_id,
      delivery_type: deliveryType
    };
    this.manageStoreService.getStoreDeliveryAreaList(data1).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.loadForm()
          if (deliveryType == 1) {
            this.deliveryareas = response.data;
            this.areacitycount = response.data.length;
          }
          else {
            this.expressDeliveryAreas = response.data;
            this.expressAreaCityCount = response.data.length;
          }
        }
        else {
          if (deliveryType == 1) {
            this.deliveryareas = [];
            this.areacitycount = 0;
          }
          else {
            this.expressDeliveryAreas = [];
            this.expressAreaCityCount = 0;
          }
        }
      },
      error: (error: any) => {
        if (deliveryType == 1) {
          this.deliveryareas = [];
          this.areacitycount = 0;
        }
        else {
          this.expressDeliveryAreas = [];
          this.expressAreaCityCount = 0;
        }
      }
    })
  }

  closemodel() {
    this.areainfo = {};
    this.totalareacitycount.emit(this.deliveryareas);
    this.totalexpressAreaCityCount.emit(this.expressDeliveryAreas);
    this.activeModal.dismiss();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.generalSetting, event.previousIndex, event.currentIndex);
  }
}
