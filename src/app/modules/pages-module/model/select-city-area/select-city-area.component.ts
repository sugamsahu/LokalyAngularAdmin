import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { TranslateService } from "@ngx-translate/core";
import { CommonService } from "src/app/services/common.service";
import Swal from "sweetalert2";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-select-city-area",
  templateUrl: "./select-city-area.component.html",
  styleUrls: ["./select-city-area.component.scss"],
})
export class SelectCityAreaComponent implements OnInit {
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  public formGroup: UntypedFormGroup;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  countryList = [];
  SelectedCountry: any = [];
  tempSelectedCountry: any = [];
  country_id_obj: any = [];
  main: any;
  //trail
  countryIds: any = [];
  offerZone: number;
  stateList = [];
  cityList = [];
  areaList = [];
  cityIds: string;
  areaIds: string;
  deliveryareas = [];
  style_obj_select_city_area: any;
  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: UntypedFormBuilder,
    private toastr: ToastrService,
    public CommonService: CommonService,
    private spinner: SpinnerService,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.style_obj_select_city_area = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.loadForm();
    this.countryListRecord();
  }

  loadForm() {
    if (this.offerZone == 2) {
      this.formGroup = this.formBuilder.group({
        country: [""],
        state: [""],
        city: [""],
        area: [""],
      });
    } else {
      this.formGroup = this.formBuilder.group({
        country: [""],
        state: [""],
        city: [""],
      });
    }
  }

  CountryChange(country) {
    this.formGroup.controls["state"].setValue("");
    this.stateListRecord();
  }

  StateChange() {
    this.formGroup.controls["city"].setValue("");
    if (this.offerZone == 2) {
      this.formGroup.controls["area"].setValue("");
    }
    this.cityListRecord();
  }

  CityChange(item) {
    if (this.offerZone == 2) {
      this.formGroup.controls["area"].setValue("");
      this.areaListRecord();
    } else {
      if (item[item.length - 1].value == 0) {
        var list = [];
        this.formGroup.controls["city"].setValue(null);
        this.cityList.forEach((status) => {
          if (status.value != 0) {
            list.push(status);
          }
        });
        this.formGroup.controls["city"].setValue(list);
      }
    }
  }

  ChangeArea(item) {
    if (item[item.length - 1].value == 0) {
      var list = [];
      this.formGroup.controls["area"].setValue(null);
      this.areaList.forEach((status) => {
        if (status.value != 0) {
          list.push(status);
        }
      });
      this.formGroup.controls["area"].setValue(list);
    }
  }

  async countryListRecord() {
    this.spinner.show();
    await this.CommonService.getCountryList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.countryList = [];
          var commonCountry =
            this.generalSetting.country != undefined
              ? this.generalSetting.country.split(",")
              : null;
          if (commonCountry) {
            commonCountry.forEach((country) => {
              var objCountry = response.data.filter((s) =>
                s.id.includes(country)
              )[0];
              if (this.offerZone == 2) {
                if (country == "101") {
                  this.countryList.push(objCountry);
                }
              } else {
                if (objCountry) {
                  this.countryList.push(objCountry);
                }
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
          this.formGroup.controls["country"].setValue(this.countryList[0].id);
          if (this.formGroup.value.country) {
            this.stateListRecord();
          }
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        // handle error
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  async stateListRecord() {
    await this.CommonService.getStateList(
      this.formGroup.value.country
    ).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.stateList = [];
          this.stateList = response.data;
          if (this.formGroup.value.state > 0) {
            this.formGroup.controls["state"].setValue(
              this.stateList.filter(
                (x) => x.id == this.formGroup.value.state.id
              )[0]
            );
          } else {
            this.formGroup.controls["state"].setValue(
              this.stateList.filter(
                (x) => x.id == this.sellerDetails.state_id
              )[0]
            );
          }
          if (this.formGroup.value.state) {
            this.cityListRecord();
          } else {
            this.formGroup.controls["state"].setValue(this.stateList[0]);
            this.cityListRecord();
          }
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => { },
    });
  }

  async cityListRecord() {

    await this.CommonService.getCityList(
      this.formGroup.value.state.id
    ).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.cityList = [];
          this.areaList = [];
          if (this.offerZone == 2) {
            this.cityList = response.data;
            if (this.formGroup.value.city > 0) {
              this.formGroup.controls["city"].setValue(
                this.cityList.filter(
                  (x) => x.id == this.formGroup.value.city.id
                )[0]
              );
            } else {
              this.formGroup.controls["city"].setValue(
                this.cityList.filter(
                  (x) => x.id == this.sellerDetails.city_id
                )[0]
              );
            }
            if (this.formGroup.value.city) {
              this.areaListRecord();
            }
          } else {
            this.cityList = [{ label: "All", value: 0 }];
            response.data.forEach((city) => {
              var data = { label: city.name, value: city.id };
              this.cityList.push(data);
            });
          }
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => { },
    });
  }

  async areaListRecord() {

    await this.CommonService.getAreaList(
      this.formGroup.value.city.id
    ).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.areaList = [{ label: "All", value: 0 }];
          response.data.forEach((area) => {
            var data = { label: area.name, value: area.id };
            this.areaList.push(data);
          });
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => { },
    });
  }

  submitAreaDetails() { }
  /** Submit city area */
  onSubmit() {
    var areaIds = [];
    var cityIds = [];

    if (this.offerZone == 2) {
      if (
        this.formGroup.value.area.length == 0 ||
        this.formGroup.value.city == undefined ||
        this.formGroup.value.state == undefined
      ) {
        this.toastr.error(
          this.translate.instant("PLEASE_ENTER_STATE_CITY_AREA")
        );
        return;
      }
      for (var i = 0; i < this.formGroup.value.area.length; i++) {
        areaIds.push(parseInt(this.formGroup.value.area[i].value));
      }

    } else {
      if (
        this.formGroup.value.city.length == 0 ||
        !this.formGroup.value.state
      ) {
        this.toastr.error(
          this.translate.instant("PLEASE_ENTER_STATE_CITY_AREA")
        );
        return;
      }
      for (var i = 0; i < this.formGroup.value.city.length; i++) {
        cityIds.push(parseInt(this.formGroup.value.city[i].value));
      }
    }

    this.cityIds = cityIds.toString();
    this.areaIds = areaIds.toString();

    if (!(this.offerZone == 2)) cityIds.forEach((idName) => {
        var filterData;
        if (this.offerZone == 2) {
          if (
            this.deliveryareas.length > 0 ||
            this.deliveryareas?.filter(
              (elem) => elem.area_id == idName.toString()
            )[0]
          ) {
          } else {
            filterData = this.areaList.filter(
              (elem) => elem.value == idName.toString()
            )[0];
          }
        } else {
          if (
            this.deliveryareas?.filter(
              (elem) => elem.city_id == idName.toString()
            )[0]
          ) {
          } else {
            filterData = this.cityList.filter(
              (elem) => elem.value == idName.toString()
            )[0];
          }
        }

        if (filterData) {
          var data: any = {
            state_id: this.formGroup.value.state.id,
            state_name: this.formGroup.value.state.name,
            city_id:
              this.offerZone == 2
                ? this.formGroup.value.city.id
                : filterData.value,
            city_name:
              this.offerZone == 2
                ? this.formGroup.value.city.name
                : filterData.label,
            country_id: this.formGroup.value.country.id,
            country_name: this.formGroup.value.country.name,
            country_code: this.formGroup.value.country.sortname,
          };

          if (this.offerZone == 2) {
            data.area_id = filterData.value;
            data.area_name = filterData.label;
          }
          else {
            data.area_id = '';
            data.area_name = '';
          }

          this.deliveryareas.push(data);
        }
      });

    if (this.offerZone == 2) {
      areaIds.forEach((idName) => {
        var filterData;
        if (
          this.deliveryareas?.filter(
            (elem) => elem.area_id == idName.toString()
          )[0]
        ) {
        } else {
          filterData = this.areaList.filter(
            (elem) => elem.value == idName.toString()
          )[0];
        }

        if (filterData) {
          var data = {
            state_id: this.formGroup.value.state.id,
            state_name: this.formGroup.value.state.name,
            city_id:
              this.offerZone == 2
                ? this.formGroup.value.city.id
                : filterData.value,
            city_name:
              this.offerZone == 2
                ? this.formGroup.value.city.name
                : filterData.label,
            area_id: filterData.value,
            area_name: filterData.label,
            country_id: this.formGroup.value.country.id,
            country_name: this.formGroup.value.country.name,
            country_code: this.formGroup.value.country.sortname,
          };
          this.deliveryareas.push(data);
        }
      });
    }

    this.toastr.success(
      (this.offerZone == 2 ? "Area" : "City") + " Add Successful"
    );

    if (this.offerZone == 2) {
      this.formGroup.controls["area"].setValue("");
    } else {
      this.formGroup.controls["city"].setValue("");
    }
    this.passEntry.emit(this.deliveryareas);
  }

  deleteCityArea(event) {
    this.deliveryareas = this.deliveryareas.filter((item) => item !== event);
    this.passEntry.emit(this.deliveryareas);
  }

  //removeall
  removeAllValue() {
    if (this.deliveryareas.length > 0) {
      Swal.fire({
        title: this.translate.instant("ARE_YOU_SURE"),
        text: this.translate.instant("DELETE"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        cancelButtonText: this.translate.instant("CANCEL"),
        confirmButtonText: this.translate.instant("OK"),
      }).then((result) => {
        if (result.value) {
          this.removeAllValueConfirm();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
    } else {
      this.toastr.error(this.translate.instant("NO_AREA_EXIST_FOR_DELETE"));
    }
  }

  removeAllValueConfirm() {
    this.deliveryareas = [];
    this.passEntry.emit(this.deliveryareas);
  }
}
