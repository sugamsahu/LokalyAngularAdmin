import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { RegionMasterService } from "src/app/services/lookup/region-master.service";
import { find, pull } from "lodash";
import { CommonService } from "src/app/services/common.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-region-master-add",
  templateUrl: "./region-master-add.component.html",
  styleUrls: ["./region-master-add.component.scss"],
})
export class RegionMasterAddComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  table_size: number = environment.tableSize;
  tableSizes: any = [3, 6, 9, 12];
  no_data = true;
  search = "";
  main;
  regionId: any;
  addRegonForm: UntypedFormGroup;
  country_list: any = [];
  state_list: any = [];
  comma_separated_states_list: string[] = [];
  multi_city: boolean = false;
  city_list: any = [];
  comma_separated_cities_list: string[] = [];
  comma_separated_area_list: string[] = [];
  regionList: any = [];
  multi_country: boolean = false;
  multi_state: boolean = false;
  state_hide: boolean = false;
  country_hide: boolean = false;
  city_hide: boolean = false;
  @ViewChild("tagInput") tagInputRef: ElementRef;
  cityID: any;
  stateID: any;
  countryID: this;
  stateBindData: string = "";
  cityBindData: boolean = false;
  regionName: any;
  regionType: any;
  @ViewChild("searchevt", { static: false }) searchbox: ElementRef;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private toastr: ToastrService,
    private cryptoService: CryptoService,
    private regionMasterService: RegionMasterService,
    private appComponent: AppComponent,
    private formBuilder: UntypedFormBuilder,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;

    if (location.href.indexOf("/region-master/edit") > -1) {
      this.regionId = this.cryptoService.decryptIdValue(
        "lookup_regionMaster_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.regionId == undefined) {
        this.router.navigate(["/region-master"]);
      }
    }
  }

  ngOnInit(): void {
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.loadForm();

    this.countryListRecord();
    if (!this.regionId) {
    }

    if (this.regionId) {
      this.regionName = JSON.parse(localStorage.getItem("regionDetail"));
      this.regionType = Number(this.regionName.regionType) + 1;
      this.countryID = this.regionName.regionType.id;
      this.GetRegionList(this.page);
    }
  }

  loadForm() {
    this.addRegonForm = this.formBuilder.group({
      country_id: [null],
      state_id: [null],
      stateCheck: [false],
      city_id: [null],
      cityCheck: [false],
      area_id: [null],
      comma_separated_state_id: new UntypedFormControl(),
      comma_separated_city_id: new UntypedFormControl(),
      comma_separated_area_id: new UntypedFormControl(),
      name: [""],
      is_active: [false],
      search: [""],
    });
  }

  async countryListRecord() {
    await this.regionMasterService.getCountryList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.country_list = response.data;
          if (this.addRegonForm.value.country_id) {
            this.stateListRecord();
          }
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {
        //request complete
      },
    });
  }

  CountryChange(event) {
    if (event != 101) {
      this.multi_city = true;
    } else {
      this.multi_city = false;
    }
    this.addRegonForm.controls["state_id"].setValue(null);
    this.addRegonForm.controls["city_id"].setValue(null);
    this.city_list = [];
    this.stateListRecord();
  }
  StateChange(event) {
    if (
      this.addRegonForm.value.country_id != 101 &&
      this.addRegonForm.value.state_id != ""
    ) {
      this.multi_city = true;
    }
    this.addRegonForm.controls["city_id"].setValue(null);
    this.cityListRecord();
  }

  cityChangeData;
  CityChange(event) {
    this.cityChangeData = event;
  }

  CommaSeparatedStateChanged(label, value) {
    this.addRegonForm.controls["stateCheck"].setValue(value.target.checked);
    if (label == "State" && value.target.checked == true) {
      this.multi_state = true;
    } else {
      this.multi_state = false;
      this.addRegonForm.controls.state_id.setValue(null);
      this.comma_separated_states_list = [];
    }
  }

  CommaSeparatedCityChanged(label, value) {
    this.addRegonForm.controls["cityCheck"].setValue(value.target.checked);
    if (label == "City" && value.target.checked == true) {
      this.multi_city = true;
    } else {
      this.multi_city = false;
      this.addRegonForm.controls.city_id.setValue(null);
      this.comma_separated_cities_list = [];
    }
  }

  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }

  onKeyUp(event: KeyboardEvent, label): void {
    const inputValue: string =
      this.addRegonForm.controls.comma_separated_state_id.value ||
      this.addRegonForm.controls.comma_separated_city_id.value ||
      this.addRegonForm.controls.comma_separated_area_id.value;

    if (event.code === "Backspace" && !inputValue) {
      this.removeTag();
      return;
    } else {
      if (
        event.code === "Comma" ||
        event.code === "NumpadEnter" ||
        event.code === "Enter"
      ) {
        this.addTag(inputValue, label);
        this.addRegonForm.controls.comma_separated_state_id.setValue("");
        this.addRegonForm.controls.comma_separated_city_id.setValue("");
        this.addRegonForm.controls.comma_separated_area_id.setValue("");
      }
    }
  }

  addTag(tag: any, label): void {
    if (tag[tag.length - 1] === "," || tag[tag.length - 1] === " ") {
      tag = tag.slice(0, -1);
    }

    if (label == "State") {
      if (tag.length > 0 && !find(this.comma_separated_states_list, tag)) {
        var duplicateState = this.comma_separated_states_list.includes(tag)
          ? true
          : false;
        if (duplicateState == false) {
          this.comma_separated_states_list.push(tag);
        }
      }
    } else if (label == "City") {
      if (tag.length > 0 && !find(this.comma_separated_cities_list, tag)) {
        var duplicateCity = this.comma_separated_cities_list.includes(tag)
          ? true
          : false;
        if (duplicateCity == false) {
          this.comma_separated_cities_list.push(tag);
        }
      }
    } else if (label == "Area") {
      if (tag.length > 0 && !find(this.comma_separated_area_list, tag)) {
        var duplicateArea = this.comma_separated_area_list.includes(tag)
          ? true
          : false;
        if (duplicateArea == false) {
          this.comma_separated_area_list.push(tag);
        }
      }
    }
  }

  removeTag(tag?: string, label?: string): void {
    if (label == "State") {
      if (!!tag) {
        pull(this.comma_separated_states_list, tag);
      } else {
        this.state_list.splice(-1);
      }
    } else if (label == "City") {
      if (!!tag) {
        pull(this.comma_separated_cities_list, tag);
      } else {
        this.city_list.splice(-1);
      }
    } else if (label == "Area") {
      if (!!tag) {
        pull(this.comma_separated_area_list, tag);
      } else {
        this.city_list.splice(-1);
      }
    }
  }

  async stateListRecord() {
    await this.commonService
      .getStateList(this.addRegonForm.value.country_id)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.state_list = [];
            this.state_list = response.data;

            if (this.stateBindData == "3") {
              this.state_list.forEach((el) => {
                if (Number(el.id) == this.regionName.id) {
                  this.addRegonForm.controls["state_id"].setValue(el.id);
                }
              });
            }
            if (this.stateBindData == "4") {
              this.state_list.forEach((el) => {
                if (Number(el.id) == this.regionName.state_id) {
                  this.addRegonForm.controls["state_id"].setValue(el.id);
                }
              });
            }
            this.stateBindData = "";
            if (this.cityBindData == true) {
              this.cityListRecord();
            }
          }
        },
        error: (error) => {
          this.toastr.error(error);
        },
        complete: () => {
          //request complete
        },
      });
  }

  async cityListRecord() {
    await this.commonService
      .getCityList(this.addRegonForm.value.state_id)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.city_list = response.data;

            if (this.cityBindData == true) {
              this.city_list.forEach((el) => {
                if (Number(el.id) == this.regionName.id) {
                  this.addRegonForm.controls["city_id"].setValue(el.id);
                }
              });
            }
            this.cityBindData = false;
          }
        },
        error: (error) => {
          this.toastr.error(error);
        },
        complete: () => {
          //request complete
        },
      });
  }

  //Add Region in Edit Conditions For OPening AddForm
  add_region_edit(region_type) {
    this.country_hide = true;

    this.countryListRecord();

    setTimeout(() => {
      if (region_type == 2) {
        this.country_list.forEach((element) => {
          this.cdr.detectChanges();
          if (Number(element.id) == this.regionName.id) {
            this.addRegonForm.controls["country_id"].setValue(element.id);
          }
        });
        this.regionId = undefined;

        this.state_hide = true;
        this.addRegonForm.controls["stateCheck"].setValue(true);
        this.multi_state = true;
        this.cdr.detectChanges();
      }

      if (region_type == 3) {
        this.country_list.forEach((element) => {
          this.cdr.detectChanges();

          if (Number(element.id) == this.regionName.country_id) {
            this.addRegonForm.controls["country_id"].setValue(element.id);
          }
        });
        this.regionId = undefined;
        this.state_hide = true;
        this.city_hide = true;
        this.addRegonForm.controls["cityCheck"].setValue(true);
        this.multi_city = true;
        this.stateBindData = "3";
        this.stateListRecord();
      }

      if (region_type == 4) {
        if (this.regionName.country_id == undefined) {
          this.country_list.forEach((element) => {
            this.cdr.detectChanges();
            if (Number(element.id) == Number(this.countryID)) {
              this.addRegonForm.controls["country_id"].setValue(element.id);
            }
          });
        } else {
          this.country_list.forEach((element) => {
            this.cdr.detectChanges();
            if (Number(element.id) == this.regionName.country_id) {
              this.addRegonForm.controls["country_id"].setValue(element.id);
            }
          });
        }

        this.regionId = undefined;
        this.stateBindData = "4";
        this.cityBindData = true;
        this.state_hide = true;
        this.city_hide = true;
        this.stateListRecord();
      }
    }, 1000);
  }

  GetRegionList(page) {
    var search = "";
    if (this.search != "" && this.search != undefined && this.search != null) {
      search = this.search;
    }
    this.page = page;

    var data: any = {
      type_list: this.regionType,
      sort_field: this.sortKey,
      sort_type: this.isOrderBy ? 1 : 2,
      page: this.page,

    };

    if (this.main.LoggedUserInfo.role_id == 1) {
      data.is_config = 1;
    } else {
      data.is_config = 0;
    }

    if (this.regionType == 2) {
      data.country_id = this.regionId;
      data.search_query = search;
    }

    if (this.regionType == 3) {
      data.state_id = this.regionId;
      data.search_query = search;
    }

    if (this.regionType == 4) {
      data.city_id = this.regionId;
      data.search_query = search;
    }

    this.addRegonForm.patchValue({
      name: this.regionName.name,
      is_active: this.regionName.is_active == 1 ? true : false,
    });


    this.regionMasterService.getRegionList(data).subscribe({
      next: (response: any) => {
        if (response?.status == 1) {
          this.count = response.count;
          this.regionList = response.data;

          if (this.regionType == 3) {
            this.countryID = this.regionList[0].country_id;
          }

          if (this.regionType == 4) {
            this.stateID = this.regionList[0].state_id;
            this.countryID = this.regionList[0].country_id;
          }

          if (this.regionType == 5) {
            this.cityID = this.regionList[0].city_id;
            this.stateID = this.regionList[0].state_id;
            this.countryID = this.regionList[0].country_id;
          }
        } else {
          if (response?.message)
            this.toastr.error(response?.message)
          this.regionList = []
          this.count = 0;
          //if there is no data for the first time cityID stateID & countryID is assigned from regionName
          if (this.regionType == 5) {
            this.cityID = this.regionName.city_id;
          }
          if (this.regionType == 4) {
            this.stateID = this.regionName.state_id;
          }
        }
      },
    });
  }

  SearchRegionInEdit(srch) {
    this.search = srch;
    setTimeout(() => {
      this.GetRegionList(1);
    }, environment.search_time);
  }

  editRegionDetail(item) {
    this.regionName = item;
    this.search = "";
    this.regionId = item.id;

    this.addRegonForm.patchValue({
      name: this.regionName.name,
      is_active: this.regionName.is_active == 1 ? true : false,
    });

    var data: any = {
      type_list: Number(this.regionType) + 1,
      page: this.page,
      sortKey: this.sortKey,
      isOrderBy: this.isOrderBy,
    };

    if (Number(this.regionType) + 1 == 2) {
      data.country_id = this.regionId;
    }

    if (Number(this.regionType) + 1 == 3) {
      data.state_id = this.regionId;
    }

    if (Number(this.regionType) + 1 == 4) {
      data.city_id = this.regionId;
    }

    this.regionMasterService.getRegionList(data).subscribe({
      next: (response: any) => {
        this.regionType = this.regionType + 1;
        if (response.status == 1) {
          this.count = response.count;

          this.regionList = response.data;

          if (this.regionType == 4) {
            this.cityID = this.regionList[0].city_id;
            this.stateID = this.regionList[0].state_id;
            this.countryID = this.regionList[0].country_id;
          }

          if (this.regionType == 3) {
            this.stateID = this.regionList[0].state_id;
            this.countryID = this.regionList[0].country_id;
          }

          if (this.regionType == 2) {
            this.countryID = this.regionList[0].country_id;
          }

          if (this.regionList[0].country_id != 101 && this.regionType == 4) {
            this.regionList = [];
            this.count = 0;
          }
        } else {
          if (this.regionType == 5) {
            this.countryID = this.regionName.country_id;
            this.stateID = this.regionName.state_id;
            this.cityID = this.regionName.city_id;
          }

          if (this.regionType == 4) {
            this.stateID = this.regionName.state_id;
          }

          this.regionList = [];
          this.count = 0;
          if (this.regionType != 5) {
            this.toastr.error(response.message);
          }
        }
      },
    });
    this.getPlaceHolderValue();
  }
  /** while level change get region list using service */
  async LevelChange(regionType) {
    this.addRegonForm.controls["search"].setValue(null);
    var data: any = {
      type_list: Number(regionType) - 1,
      page: this.page,
    };

    if (Number(regionType) - 1 == 2) {
      data.country_id = this.countryID;
    }
    if (Number(regionType) - 1 == 3) {
      data.state_id = this.stateID;
    }
    if (Number(regionType) - 1 == 4) {
      data.city_id = this.cityID;
    }
    if (Number(regionType) == 4) {
      data.city_id = this.cityID;
    }

    await this.regionMasterService.getRegionList(data).subscribe({
      next: (response: any) => {
        this.regionType = this.regionType - 1;
        if (response.status == 1) {
          this.count = response.count;
          this.regionList = response.data;

          if (this.regionType == 2) {
            this.countryID = this.regionList[0]?.id;
            if (this.regionList[0].country_id)
              this.countryID = this.regionList[0].country_id
            this.regionId = this.countryID;
          }
          if (this.regionType == 3) {
            this.stateID = this.regionList[0].id;
            if (this.regionList[0].state_id) {
              this.stateID = this.regionList[0].state_id
            }
            this.countryID = this.regionList[0].country_id;
            this.regionId = this.stateID;
          }
          if (this.regionType == 4) {
            this.cityID = this.regionList[0].id;
            if (this.regionList[0].city_id) {
              this.cityID = this.regionList[0].city_id
            }
            this.stateID = this.regionList[0].state_id;
            this.countryID = this.regionList[0].country_id;
            this.regionId = this.cityID;
          }
          this.getBackDetails();
        } else {
          this.count = 0;
          this.regionList = [];
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {
        //request complete
      },
    });
    this.getPlaceHolderValue();
  }

  getBackDetails() {
    var data: any = {
      type_list: Number(this.regionType - 1),
    };
    if (Number(this.regionType) == 2) {
      data.region_id = this.countryID;
    }
    if (Number(this.regionType) == 3) {
      data.region_id = this.stateID;
    }
    if (Number(this.regionType) == 4) {
      data.region_id = this.cityID;
    }

    this.regionMasterService.getRegionList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.regionName = response.data;
          this.addRegonForm.controls["name"].setValue(response.data.name)
          this.addRegonForm.controls["is_active"].setValue(response.data.is_active)
        } else {
          this.toastr.error(response.message);
        }
      },
    });
  }

  cancelClick() {
    history.back();
  }

  // Add Submit
  SubmitAddForm(): void {
    var data: any = {};
    if (this.multi_country == true) {
      if (
        this.addRegonForm.value.country_id == null &&
        this.regionId == undefined
      ) {
        this.toastr.error(this.translate.instant("ALL_FIELDS_ARE_MANDATORY"));
        return;
      }
    } else if (this.multi_state == true) {
      if (this.comma_separated_states_list.length == 0) {
        this.toastr.error(this.translate.instant("ALL_FIELDS_ARE_MANDATORY"));
        return;
      }

      data.country_id = this.addRegonForm.value.country_id;
      data.states = this.comma_separated_states_list.toString();
      data.type_list = 2;
    } else if (this.multi_city == true) {
      if (this.comma_separated_cities_list.length == 0 && this.addRegonForm.controls.comma_separated_city_id.value.length < 3) {
        this.toastr.error(this.translate.instant("ALL_FIELDS_ARE_MANDATORY"));
        return;
      }

      data.cities = this.comma_separated_cities_list.toString() + ',' + this.addRegonForm.controls.comma_separated_city_id.value;
      data.state_id = this.addRegonForm.value.state_id;
      data.type_list = 3;
    } else {
      if (this.comma_separated_cities_list.length == 0 && this.addRegonForm.value.comma_separated_city_id == null && this.cityChangeData == null) {
        this.toastr.error(this.translate.instant("ALL_FIELDS_ARE_MANDATORY"));
        return;
      }

      if (this.comma_separated_area_list.length == 0 && this.addRegonForm.value.comma_separated_area_id == null) {
        this.toastr.error(this.translate.instant("ALL_FIELDS_ARE_MANDATORY"));
        return;
      }

      var areaData = this.comma_separated_area_list.length == 0 ? this.addRegonForm.value.comma_separated_area_id : this.comma_separated_area_list.toString();

      data.areas = areaData;
      data.city_id = this.addRegonForm.value.city_id;
      data.type_list = 4;
    }
    this.regionMasterService.manageRegion(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(response.message);
          this.router.navigate([`/region-master`]);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
      complete: () => {
        //request complete
      },
    });
  }

  //Edit Submit
  editRegionRecord() {
    let data = {
      type_list: Number(this.regionType) - 1,
      region_id: this.regionName.id,
      name: this.addRegonForm.value.name,
      is_active: this.addRegonForm.value.is_active == true ? 1 : 0,
      is_deleted: 0,
    };

    this.regionMasterService.manageRegion(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.regionList.forEach(element => {
            if (element.id == data.region_id) {
              element.name = data.name
            }
          });
          this.toastr.success(response.message);
          this.cdr.detectChanges()
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
    });
  }
  deleteRegion(item) {
    Swal.fire({
      title: this.translate.instant("ARE_YOU_SURE"),
      text: this.translate.instant("DELETE_REGION"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: this.translate.instant("OK"),
      cancelButtonText: this.translate.instant("CANCEL"),
    }).then((result) => {
      if (result.value) {
        this.deleteRegionData(item);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    });
  }

  deleteRegionData(item) {
    var data = {
      is_active: item.is_active,
      is_deleted: true,
      name: item.name,
      region_id: item.id,
      type_list: this.regionType,
    };

    this.regionMasterService.manageRegion(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.GetRegionList(this.page);
          this.toastr.success(response.message);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        this.toastr.error(error);
      },
    });
  }

  placeholderText: string = '';
  getPlaceHolderValue() {
    this.placeholderText = '';
    if (this.regionType == 2) {
      this.placeholderText = this.translate.instant('COUNTRY');
    } else if (this.regionType == 3) {
      this.placeholderText = this.translate.instant('STATE');
    } else if (this.regionType == 4) {
      this.placeholderText = this.translate.instant('CITY');
    } else if (this.regionType == 5 || this.regionType == 6) {
      this.placeholderText = this.translate.instant('AREA');
    } else {
      this.placeholderText = '';
    }
  }

  sortKey: any = "";
  isOrderBy: boolean = true;

  sortAPISide(columnName) {
    this.sortKey = columnName;
    this.isOrderBy = !this.isOrderBy;
    this.GetRegionList(this.page);
  }

  clearSearch() {
    if (this.search !== '') {
      this.search = '';
      this.GetRegionList(1);
    }
  }
}
