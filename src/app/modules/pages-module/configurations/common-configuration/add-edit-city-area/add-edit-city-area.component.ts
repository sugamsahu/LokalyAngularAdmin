import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-add-edit-city-area',
  templateUrl: './add-edit-city-area.component.html',
  styleUrls: ['./add-edit-city-area.component.scss']
})
export class AddEditCityAreaComponent implements OnInit {
  AreaCityForm: FormGroup;
  countryList: any[];
  @Output() locationModal: EventEmitter<any> = new EventEmitter();
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  latitude: any = parseFloat(this.general_setting.default_location_lat);
  longitude: any = parseFloat(this.general_setting.default_location_long);
  use_google_map = parseInt(this.general_setting.use_google_map);
  userData = JSON.parse(localStorage.getItem('loginUser'));
  main: any = { LoggedUserInfo: {} };
  cityList: any[];
  areaList: any[];
  stateList: any[];
  style_obj_add_city_area: any;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    public commonService: CommonService,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_add_city_area = {
      "--css_button_business_default": this.general_setting.css_button_business_default,
      "--css_button_business_font": this.general_setting.css_button_business_font
    }
    this.loadForm();
    this.countryListRecord();
  }

  loadForm() {
    this.AreaCityForm = this.formBuilder.group({
      country_id: new FormControl(null, [Validators.required]),
      state_id: new FormControl(null, [Validators.required]),
      city_id: new FormControl(null, [Validators.required]),
      area_id: new FormControl(null),
    })
  }

  countryListRecord() {
    this.commonService.getCountryList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.countryList = [];
          var commonCountry = this.general_setting.country != undefined ? this.general_setting.country.split(",") : null;
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
    await this.commonService.getStateList(this.AreaCityForm.value.country_id).subscribe({
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
      .getCityList(this.AreaCityForm.value.state_id)
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
      .getAreaList(this.AreaCityForm.value.city_id.id)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.areaList = [];
            this.areaList = response.data;
          }
        },
        error: (error) => {
        },
        complete: () => {
        },
      });
  }

  countryChange() {
    this.stateListRecord();
    this.AreaCityForm.controls["state_id"].reset();
    this.AreaCityForm.controls["city_id"].reset();
    this.AreaCityForm.controls["area_id"].reset();
  }

  stateChange() {
    this.AreaCityForm.controls["city_id"].reset();
    this.AreaCityForm.controls["area_id"].reset();
    this.cityListRecord();
  }

  cityChange() {
    this.AreaCityForm.controls["area_id"].reset();
    this.areaListRecord();
  }

  controlHasError(validation, controlName): boolean {
    const control = this.AreaCityForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  submitAreaDetails() {
    this.locationModal.emit(this.AreaCityForm.value);
    this.activeModal.dismiss();
  }
}
