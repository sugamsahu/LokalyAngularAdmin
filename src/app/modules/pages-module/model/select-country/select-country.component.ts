import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
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
  selector: "app-select-country",
  templateUrl: "./select-country.component.html",
  styleUrls: ["./select-country.component.scss"],
})
export class SelectCountryComponent implements OnInit {
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  @Input() sendCountry: any;
  public formGroup: UntypedFormGroup;
  countryList: any = [];
  SelectedCountry: any = [];
  tempSelectedCountry: any = [];
  country_id_obj: any = [];
  //trail
  countryIds: any = [];
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_select_country: any;

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
    this.style_obj_select_country = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    if (this.sendCountry.length > 0) {
      this.sendCountry.forEach((element) => {
        var tempobj = {
          id: element.country_id || element.id,
          name: element.country_name || element.name,
        };
        this.SelectedCountry.push(tempobj);
      });
    }
    this.loadForm();
    this.CountryListRecord();
  }

  loadForm() {
    this.formGroup = this.formBuilder.group({
      country: [""],
    });
  }

  countryChange(country) {
    if (this.formGroup.value.country[0].id == 0) {
      this.country_id_obj = [];
      this.countryList.forEach((element) => {
        if (element.id != 0) {
          this.country_id_obj.push(element);
        }
      });
    } else {
      this.country_id_obj = [];
      this.formGroup.value.country.forEach((element) => {
        if (element.id != 0) {
          this.country_id_obj.push(element);
        }
      });
    }

    this.formGroup.controls["country"].setValue(this.country_id_obj);
  }

  // get country list
  async CountryListRecord() {
    this.spinner.show();
    await this.CommonService.getCountryList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.countryList = [{ id: 0, name: "All" }];
          var commonCountry = this.generalSetting.country != undefined ? this.generalSetting.country.split(',') : null;
          if (commonCountry) {
            commonCountry.forEach(country => {
              var objCountry = response.data.filter((x) => x.id == country.toString())[0]
              this.countryList.push(objCountry)
            })
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
  /** Submit selectedCountry */
  onSubmit() {
    this.countryIds = [];

    this.country_id_obj.forEach((element) => {
      this.countryIds.push(element.id);
    });

    if (this.countryIds.length == 0) {
      this.toastr.error(this.translate.instant("SELECT_COUNTRY"));
      return this.formGroup;
    }

    this.countryIds.forEach((idName) => {
      var filterData;
      var duplicate;

      this.SelectedCountry.forEach((element) => {
        if (element.id == idName) {
          duplicate = true;
        }
      });

      if (duplicate == true) {
        this.toastr.error(this.translate.instant("COUNTRY_ALREADY_ADDED"));
      } else {
        this.countryList.forEach((item) => {
          if (item.id == idName) {
            filterData = item;
          }
        });
      }

      if (filterData) {
        var data = {
          id: filterData.id,
          name: filterData.name,
        };

        this.SelectedCountry.push(data);

        this.toastr.success(this.translate.instant("COUNTRY_ADD_SUCCESSFUL"));
      }
    });
    this.country_id_obj = [];
    this.formGroup.controls["country"].setValue("");
    this.passEntry.emit(this.SelectedCountry);
  }

  removetax(item) {
    if (item != undefined) {
      this.SelectedCountry.splice(
        $.inArray(item, this.SelectedCountry || this.sendCountry),
        1
      );
    }
    this.passEntry.emit(this.SelectedCountry);
  }

  //removeall
  removeAllValue() {
    if (this.SelectedCountry.length > 0) {
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
          // console.log("cancelled");
        }
      });
    } else {
      this.toastr.error(this.translate.instant("NO_REGION_EXIST_FOR_DELETE"));
    }
  }

  removeAllValueConfirm() {
    this.SelectedCountry.length = 0;
    this.passEntry.emit(this.SelectedCountry);
  }
}
