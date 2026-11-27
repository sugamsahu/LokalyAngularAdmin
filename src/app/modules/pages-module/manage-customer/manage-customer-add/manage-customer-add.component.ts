import {
  ChangeDetectorRef,
  ViewChild,
  Component,
  OnInit,
  ElementRef,
  NgZone,
  AfterViewInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { StoreService } from "src/app/services/store.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { crop_rectangleComponent } from "../../model/crop-rectangle/crop-rectangle.component";
import { CommonService } from "src/app/services/common.service";
import { GoogleMapsLoader } from "src/app/services/google-maps-loader.service";
import { CustomerService } from "src/app/services/customer.service";
import { CookieService } from "ngx-cookie-service";
import { ManageStoreService } from "src/app/services/manage-store.service";
import { SpinnerService } from "src/app/services/custom/spinner.service";
import { AddressBookComponent } from "../../model/address-book/address-book.component";
import { ToastrService } from "ngx-toastr";

declare var google: any;

@Component({
  selector: "app-manage-customer-add",
  templateUrl: "./manage-customer-add.component.html",
  styleUrls: ["./manage-customer-add.component.scss"],
})
export class ManageCustomerAddComponent implements OnInit, AfterViewInit {
  main: any = { LoggedUserInfo: {} };
  package_form: any;
  ph_numbr = /^\+?\d{10}$/;
  public formGroup: FormGroup;
  my_cropped_image_show: any;
  cropped_store_logo: any;
  is_cropped_image = false;
  my_cropped_image: string;
  country_list: any[];
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  pincode_label = this.general_setting.pincode_label;
  pincode_length = this.general_setting.pincode_length;
  state_list: any[];
  city_list: any[];
  area_list: any[];
  private geoCoder;
  latitude: any = parseFloat(this.general_setting.default_location_lat);
  longitude: any = parseFloat(this.general_setting.default_location_long);
  use_google_map = parseInt(this.general_setting.use_google_map);
  zoom: number;
  address: string;
  @ViewChild("search")
  public searchElementRef: ElementRef;
  customer_User_Id: any = 0;
  isSuperAdmin: boolean;
  store_id: string | Blob;
  is_confirm: any;
  verify: any;
  exist: any = 0;
  map: any;
  infoWindow: any;
  marker: any;
  geocoder: any;
  @ViewChild('cursor') cursor;
  cropFiles: any;
  croppedImages: any;
  label_khata = this.general_setting.khata_label;
  khataSetting: any;
  durationList: any;
  customerAddress: any;
  allow_alphanumeric_pincode: any;
  userLat: any;
  userLong: any;
  defaultLocationLat: any;
  defaultLocationLong: any;
  setData: any;
  customerId: any;
  header: any;
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private customerService: CustomerService,
    private appComponent: AppComponent,
    private storeservice: StoreService,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private _snackbarService: ToastrService,
    private el: ElementRef,
    private modalService: NgbModal,
    private cryptoService: CryptoService,
    public commonService: CommonService,
    private mapsAPILoader: GoogleMapsLoader,
    private ngZone: NgZone,
    private cookieService: CookieService,
    public manageStoreService: ManageStoreService,
    private toastr: ToastrService,
    private spinner: SpinnerService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/manage-customer/edit") > -1) {
      this.customerId = this.cryptoService.decryptIdValue(
        "customer_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.customer_User_Id = this.cryptoService.decryptIdValue(
        "customer_User_Id" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      this.cookieService.deleteAll();
      if (this.customerId == undefined) {
        this.router.navigate(["/manage-customer"]);
      }
    }
  }

  ngOnInit(): void {
    this.allow_alphanumeric_pincode = this.general_setting.allow_alphanumeric_pincode;
    var session = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(session.getSessionLoginUser());
    this.isSuperAdmin = false;
    if (
      this.main.LoggedUserInfo.role_id == 6 ||
      this.main.LoggedUserInfo.role_id == 1
    ) {
      this.isSuperAdmin = true;
    }
    this.latitude = this.isSuperAdmin == true ? this.general_setting.default_location_lat : parseFloat(this.seller_details.latitude);
    this.longitude = this.isSuperAdmin == true ? this.general_setting.default_location_long : parseFloat(this.seller_details.longitude);
    this.defaultLocationLat = parseFloat(this.general_setting?.default_location_lat);
    this.defaultLocationLong = parseFloat(this.general_setting?.default_location_long);
    this.loadform();
    this.countryListRecord();
    if (this.use_google_map) {
      this.mapsAPILoader.load().then(() => {
        this.getLocation();
        this.autoComplete();
      });
      this.mapsAPILoader.load().then(() => {
        this.initMap();
      });
    }
    if (this.customerId) {
      if (this.isSuperAdmin) {
        this.getCustomerDetailsAdmin();
      } else {
        this.getCustomerDetails();
      }
    }
    this.getStoreKhataSettings();
    this.durationList = [{ unit_id: 1, Unit_name: this.translate.instant("DAY") },
    { unit_id: 2, Unit_name: this.translate.instant("WEEK") },
    { unit_id: 3, Unit_name: this.translate.instant("MONTH") },
    { unit_id: 4, Unit_name: this.translate.instant("YEAR") }];
    this.cdr.detectChanges();
  }

  loadform() {
    this.formGroup = this.formBuilder.group({
      customer_id: new FormControl(null),
      name: new FormControl(null, [Validators.required]),
      phone: new FormControl(null, [Validators.required]),
      email: new FormControl(null),
      address: new FormControl(''),
      address2: new FormControl(''),
      country_id: new FormControl(null, [Validators.required]),
      state_id: new FormControl(this.seller_details?.state_id?.toString(), [Validators.required]),
      city_id: new FormControl(this.seller_details?.city_id?.toString(), [Validators.required]),
      area_id: new FormControl(this.seller_details?.area_id?.toString()),
      zipcode: new FormControl(this.seller_details?.zipcode?.toString()),
      user_picture: new FormControl("assets/icons/no_image.svg"),
      user_id: new FormControl(this.main.LoggedUserInfo.user_id),
      add_khata: new FormControl(false),
      deposit_amount: new FormControl(null),
      overdue_amount: new FormControl(null),
      overdue_limit: new FormControl(null),
      payment_cycle_number: new FormControl(null),
      payment_cycle: new FormControl(null),
      payment_cycle_tag: new FormControl(null),
      locationData: new FormControl(null),
    });
  }

  async countryListRecord() {
    this.spinner.show();
    await this.commonService.getCountryList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.country_list = [];
          var commonCountry =
            this.general_setting.country != undefined
              ? this.general_setting.country.split(",")
              : null;
          if (commonCountry) {
            commonCountry.forEach((country) => {
              var objCountry = response.data.filter((s) =>
                s.id.includes(country.toString())
              );
              if (objCountry) {
                this.country_list.push(objCountry[0]);
              }
            });
          } else {
            this.main.country.split(",").forEach((country) => {
              var objCountry = response.data.filter((s) =>
                s.id.includes(country.toString())
              );
              if (objCountry) {
                this.country_list.push(objCountry);
              }
            });
          }
        }
        if (this.customerId == undefined) {
          if (this.isSuperAdmin) {
            var country_code = this.general_setting?.country.split(',');
            this.formGroup.controls['country_id'].setValue(country_code[0]?.toString());
          } else {
            this.formGroup.controls['country_id'].setValue(this.seller_details?.country_id?.toString());
          }
          this.stateListRecord();
        }
      },
      error: (error) => {
      },
      complete: () => {
        ;
      },
    });
  }

  async stateListRecord() {
    this.spinner.show();
    await this.commonService
      .getStateList(this.formGroup.value.country_id)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.spinner.hide();
            this.state_list = [];
            this.state_list = response.data;
            if (this.customerId == undefined && this.exist == 0) {
              this.cityListRecord();
            }
          }
        },
        error: (error) => {
        },
        complete: () => {
          ;
        },
      });
  }

  async cityListRecord() {
    this.spinner.show();
    await this.commonService
      .getCityList(this.formGroup.value.state_id)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.spinner.hide();
            this.city_list = [];
            this.area_list = [];
            this.city_list = response.data;
            if (!this.customerId && this.exist == 0 && this.setData) {
              var cityID: any = this.city_list.filter((x: any) => (x.name).toLowerCase() == (this.setData.address).toLowerCase())[0];
              if (cityID) {
                this.formGroup.controls['city_id'].setValue(cityID.id);
                if (this.formGroup.value.country_id == 101) {
                  this.areaListRecord();
                }
              } else {
                this.formGroup.controls['city_id'].setValue(null);
              }
            } else {
              if (this.formGroup.value.country_id == 101) {
                this.areaListRecord();
              }
            }
          }
        },
        error: (error) => {
        },
        complete: () => {
          ;
        },
      });
  }

  async areaListRecord() {
    this.spinner.show();
    await this.commonService
      .getAreaList(this.formGroup.value.city_id)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.spinner.hide();
            this.area_list = [];
            this.area_list = response.data;
            if (!this.customerId && this.exist == 0 && this.setData) {
              var areaID: any = this.area_list.filter((x: any) => (x.name).toLowerCase() == (this.setData.area_name).toLowerCase())[0];
              if (areaID) {
                this.formGroup.controls['area_id'].setValue(areaID.id);
              } else {
                this.formGroup.controls['area_id'].setValue(null);
              }
            }
          }
        },
        error: (error) => {
        },
        complete: () => {
          ;
        },
      });
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: any) => {
          if (position) {
            this.userLat = position.coords.latitude;
            this.userLong = position.coords.longitude;

            var data: any
            if (this.customerId) {
              this.userLat = this.latitude;
              this.userLong = this.longitude;
              data = {
                lat: Number(this.latitude),
                lng: Number(this.longitude),
              };

            } else {
              this.latitude = this.userLat;
              this.longitude = this.userLong;
              data = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
            }
            this.geocodePosition(data, 1);
          }
        },
        (error: any) => {
          if (!this.customerId) {
            var data = {
              lat: this.defaultLocationLat,
              lng: this.defaultLocationLong,
            };
            this.geocodePosition(data, 1);
          } else {
            var mapData = {
              lat: Number(this.latitude),
              lng: Number(this.longitude)
            };
            this.geocodePosition(mapData, 1)
          }
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  getCustomerDetailsAdmin() {
    this.spinner.show();
    var data: any = {};
    data.user_id = this.customerId;
    this.customerService.getStoreCustomerList(data, this.isSuperAdmin).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          response.data = response.data[0];
          this.formGroup.controls["customer_id"].setValue(
            response.data.customer_user_id
          );
          this.formGroup.controls["name"].setValue(response.data.name);
          this.formGroup.controls["phone"].setValue(
            response.data.phone
          );
          this.formGroup.controls["email"].setValue(
            response.data.email
          );
          this.formGroup.controls["address"].setValue(
            response.data.address
          );
          this.formGroup.controls["address2"].setValue(
            response.data.address2
          );
          this.formGroup.controls["user_picture"].setValue(
            response.data.user_picture == "" ? 'assets/icons/no_image.svg' : response.data.user_picture
          );
          this.formGroup.controls["zipcode"].setValue(
            response.data.zipcode
          );
          this.formGroup.controls["country_id"].setValue(
            response.data?.country_id?.toString()
          );
          this.formGroup.controls["user_id"].setValue(
            this.main.LoggedUserInfo.user_id
          );
          this.stateListRecord();
          this.formGroup.controls["state_id"].setValue(
            response.data?.state_id?.toString()
          );
          this.cityListRecord();
          this.formGroup.controls["city_id"].setValue(
            response.data?.city_id?.toString()
          );
          this.areaListRecord();
          this.formGroup.controls["area_id"].setValue(
            response.data?.area_id?.toString()
          );
          this.store_id = response.data.store_id;
          this.is_confirm = response.data.is_confirm;
          if (response.data.latitude) {
            this.latitude = response.data.latitude;
          }
          if (response.data.longitude) {
            this.longitude = response.data.longitude;
          }
          if (this.use_google_map) {
            this.editTimeSetLatitudeLongitude(
              this.latitude, this.longitude
            );
          }

          this.header = "EDIT_CUSTOMER";
          if (this.is_confirm) {
            this.header = "VIEW_CUSTOMER";
          }
        }
      },
      error: (error) => {
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  getCustomerDetails() {
    this.spinner.show();
    var data = {};
    if (
      this.customerId ||
      (this.customer_User_Id != undefined && this.customer_User_Id != 0)
    ) {
      data = {
        store_id: this.seller_details.store_id,
        customer_id: this.customerId,
        customer_user_id: this.customer_User_Id,
      };
    } else {
      data = {
        store_id: this.seller_details.store_id,
        customer_user_id: 0,
        customer_id: this.customerId,
      };
    }
    this.customerService.getStoreCustomerDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.formGroup.controls["customer_id"].setValue(
            response.data.customer.customer_id
          );
          this.formGroup.controls["name"].setValue(response.data.customer.name);
          this.formGroup.controls["phone"].setValue(
            response.data.customer.phone
          );
          this.formGroup.controls["email"].setValue(
            response.data.customer.email
          );
          this.formGroup.controls["address"].setValue(
            response.data.customer.address
          );
          this.formGroup.controls["address2"].setValue(
            response.data.customer.address2
          );
          this.formGroup.controls["user_picture"].setValue(
            response.data.customer.user_picture == "" ? 'assets/icons/no_image.svg' : response.data.customer.user_picture
          );
          this.formGroup.controls["zipcode"].setValue(
            response.data.customer.zipcode
          );
          if (response.data.customer.is_khata == 1) {
            this.formGroup.patchValue({
              add_khata: true,
              deposit_amount: response.data.customer.deposit,
              overdue_amount: response.data.customer.opening_overdue_amount,
              overdue_limit: response.data.customer.overdue_limit,
              payment_cycle_number: response.data.customer.number,
              payment_cycle: response.data.customer.unit_id == '' || null || undefined ? null : response.data.customer.unit_id,
              payment_cycle_tag: response.data.customer.tags == '' || null || undefined ? null : response.data.customer.tags,
            });
          }
          this.formGroup.controls["country_id"].setValue(response.data.customer.country_id == 0 ? "" : response.data.customer.country_id.toString());
          this.formGroup.controls["user_id"].setValue(
            this.main.LoggedUserInfo.user_id
          );
          this.stateListRecord();
          this.formGroup.controls["state_id"].setValue(response.data.customer.state_id == 0 ? "" :
            response.data.customer.state_id.toString()
          );
          this.cityListRecord();
          this.formGroup.controls["city_id"].setValue(response.data.customer.city_id == 0 ? "" :
            response.data.customer.city_id.toString()
          );
          this.areaListRecord();
          this.formGroup.controls["area_id"].setValue(response.data.customer.area_id == 0 ? "" :
            response.data.customer.area_id.toString()
          );
          this.store_id = response.data.customer.store_id;
          this.is_confirm = response.data.customer.is_confirm;
          if (response.data.customer.latitude) {
            this.latitude = response.data.customer.latitude;
          }
          if (response.data.customer.longitude) {
            this.longitude = response.data.customer.longitude;
          }
          if (this.use_google_map) {
            this.editTimeSetLatitudeLongitude(
              this.latitude, this.longitude
            );
          }

          this.header = "EDIT_CUSTOMER";
          if (this.is_confirm && this.main.LoggedUserInfo.role_id != 6) {
            this.header = "VIEW_CUSTOMER";
          }
        }
      },
      error: (error) => {
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  editTimeSetLatitudeLongitude(lat, lng) {
    var latLng = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
    this.marker = new google.maps.Marker({
      map: this.map,
      position: latLng,
    });
    this.geocodePosition(latLng);
    this.map.setCenter(latLng);
    this.map.setZoom(17);
  }

  loadformwithoutPhone() {
    this.formGroup = this.formBuilder.group({
      customer_id: new FormControl(null),
      name: new FormControl(this.formGroup.value.name, [Validators.required]),
      phone: new FormControl(this.formGroup.value.phone, [Validators.required]),
      email: new FormControl(null),
      address: new FormControl(''),
      address2: new FormControl(''),
      country_id: new FormControl(this.formGroup.value.country_id, [Validators.required]),
      state_id: new FormControl(this.formGroup.value.state_id, [Validators.required]),
      city_id: new FormControl(this.formGroup.value.city_id, [Validators.required]),
      area_id: new FormControl(this.formGroup.value.area_id),
      zipcode: new FormControl(this.formGroup.value.zipcode),
      user_picture: new FormControl("assets/icons/no_image.svg"),
      user_id: new FormControl(this.main.LoggedUserInfo.user_id),
      add_khata: new FormControl(false),
      deposit_amount: new FormControl(null),
      overdue_amount: new FormControl(null),
      overdue_limit: new FormControl(null),
      payment_cycle_number: new FormControl(null),
      payment_cycle: new FormControl(null),
      payment_cycle_tag: new FormControl(null),
      locationData: new FormControl(null),
    });
  }

  setCurrentLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 17;
      });
    }
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            this.zoom = 17;
            this.address = results[0].formatted_address;
          } else {
            window.alert("No results found");
          }
        } else {
          window.alert("Geocoder failed due to: " + status);
        }
      }
    );
  }

  /** Open crop_rectangleComponent modal */
  openUpdateUserProfPicModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.my_cropped_image_show;
    modalRef.componentInstance.imageChangedEvent = this.my_cropped_image
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.cropFiles = this.cropFiles

    modalRef.componentInstance.newseller =
      this.cropped_store_logo == undefined
        ? this.formGroup.value.user_picture
        : this.cropped_store_logo;
    modalRef.componentInstance.isCroppedImage = this.is_cropped_image;
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.editProfilePic(receivedEntry);
    });
  }

  editProfilePic(item) {
    if (item.crop_image_file != undefined) {
      this.is_cropped_image = true;
      this.cropFiles = item.cropFiles
      this.croppedImages = item.croppedImages
      this.cropped_store_logo = item.crop_image;
      this.formGroup.controls["user_picture"].setValue(item.crop_image_file);
      this.my_cropped_image = item.full_image;
    }
    this.cdr.detectChanges();
  }

  removeLogoImage() {
    this.formGroup.value.user_picture = "assets/icons/no_image.svg";
    this.is_cropped_image = false;
    this.my_cropped_image = "";
  }

  CountryChange() {
    this.formGroup.controls["state_id"].setValue(null);
    this.formGroup.controls["city_id"].setValue(null);
    this.formGroup.controls["area_id"].setValue(null);
    this.stateListRecord();
  }

  StateChange() {
    this.formGroup.controls["city_id"].setValue(null);
    this.formGroup.controls["area_id"].setValue(null);
    this.cityListRecord();
  }

  CityChange() {
    this.formGroup.controls["area_id"].setValue(null);
    this.areaListRecord();
  }

  /** Get store exist customer details using service */
  async focusfn(event) {
    if (this.formGroup.value.phone?.length < 10) {
      return;
    }
    if (event.keyCode == 65 || event.keyCode == 67 || event.keyCode == 17) {
      return
    }
    var data = {
      store_id: this.seller_details ? this.seller_details.store_id : "0",
      phone: this.formGroup.value.phone,
    };

    await this.storeservice.getStoreExistCustomerDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          if (!this.customerId) {
            this.verify = response.verify;
            this.exist = 1;
            this.formGroup.controls["customer_id"].setValue(
              response.data.customer_id
            );
            this.formGroup.controls["name"].setValue(response.data.name);
            this.formGroup.controls["phone"].setValue(response.data.phone);
            this.formGroup.controls["email"].setValue(response.data.email);
            this.formGroup.controls["address"].setValue(response.data.address);
            this.formGroup.controls["address2"].setValue(
              response.data.address2
            );
            if (response.data.user_picture) {
              this.formGroup.controls["user_picture"].setValue(
                response.data.user_picture
              );
            }
            this.formGroup.controls["zipcode"].setValue(response.data.zipcode);
            if (response.data.is_khata == 1) {
              this.formGroup.patchValue({
                add_khata: true,
                deposit_amount: response.data.deposit,
                overdue_amount: response.data.opening_overdue_amount,
                overdue_limit: response.data.overdue_limit,
                payment_cycle_number: response.data.number,
                payment_cycle: response.data.unit_id == '' || null || undefined ? null : response.data.unit_id,
                payment_cycle_tag: response.data.tags == '' || null || undefined ? null : response.data.tags,
              });
            }
            this.formGroup.controls["country_id"].setValue(
              response.data.country_id.toString()
            );
            this.formGroup.controls["user_id"].setValue(
              this.main.LoggedUserInfo.user_id
            );
            this.stateListRecord();
            this.formGroup.controls["state_id"].setValue(
              response.data.state_id.toString()
            );
            this.cityListRecord();
            this.formGroup.controls["city_id"].setValue(
              response.data.city_id.toString()
            );
            this.areaListRecord();
            this.formGroup.controls["area_id"].setValue(
              response.data.area_id.toString()
            );
            if (response.data.latitude) {
              this.latitude = response.data.latitude;
            }
            if (response.data.longitude) {
              this.longitude = response.data.longitude;
            }
          }
        } else {
          this.exist = response.exist;
          this.verify = 0;
          this.loadformwithoutPhone();
          this._snackbarService.error(response.message);
        }
      },
      error: (error) => {
        this.verify = 0;
        this.loadformwithoutPhone();
      },
      complete: () => {
        ;
      },
    });
  }

  async getStoreKhataSettings() {
    var data = { store_id: this.seller_details.store_id };
    await this.manageStoreService
      .getStoreKhataSettings(data)
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.khataSetting = response.data;
          } else {
          }
        },
        error: (error) => {
          // handle error
        },
        complete: () => {
          ;
        },
      });
  }

  setDefault(label: any) {
    if (label == 'number') {
      this.formGroup.controls['overdue_limit'].setValue(this.khataSetting.overdue_limit);
    }
    if (label == 'cycle') {
      this.formGroup.controls['payment_cycle_number'].setValue(this.khataSetting.number);
      var type = this.durationList.filter((x) => x.unit_id == this.khataSetting.unit_id)[0];
      this.formGroup.controls['payment_cycle'].setValue(type.unit_id);
    }
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  cancelClick() {
    history.back();
  }

  ngAfterViewInit(): void {



    setTimeout(() => {
      if (!this.is_confirm) {
        this.cursor.nativeElement.focus();
      }
    }, 3000);
  }

  viewAddress(): void { // Get default address of user
    let profile: any = {
      user_id: this.customer_User_Id,
    }
    this.customerService.getUserAddress(profile).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.customerAddress = response.data;
          const modalRef = this.modalService.open(AddressBookComponent, {
            size: "w-1300",
            centered: true,
          });
          modalRef.componentInstance.customerAddress = this.customerAddress;
          modalRef.componentInstance.user_id = this.customer_User_Id;
        }
      },
      error: (err: any) => {
      },
    });
  }

  restrictNumeric(event: any) {
    if (!this.allow_alphanumeric_pincode) {
      var charCode = event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    }
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;

    if (inputValue.length >= this.pincode_length) {
      event.preventDefault(); // Prevent adding more characters when the maximum length is reached
    }
  }

  initMap() {
    let that = this;
    // The store's position is not always in the stored login data; fall back to the platform default.
    let lat = parseFloat(that.latitude), lng = parseFloat(that.longitude);
    if (!isFinite(lat) || !isFinite(lng)) {
      lat = that.defaultLocationLat;
      lng = that.defaultLocationLong;
    }
    var latLng: any = new google.maps.LatLng(lat, lng);
    var mapOptions: any = {
      zoom: 17,
      center: latLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      draggable: true,
    };
    var temp: any = document.getElementById('google-maps');
    that.map = new google.maps.Map(temp, mapOptions);
    that.infoWindow = new google.maps.InfoWindow();
    that.marker = new google.maps.Marker({
      position: latLng,
      title: 'Point A',
      map: that.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });

    // marker drop event change the location
    google.maps.event.addListener(that.marker, 'dragend', function (evt: any) {
      that.map.setCenter(that.marker.position);
      that.marker.setMap(that.map);
      that.geocodePosition(that.marker.getPosition());
    });

    // This page's search box is #search (wired up in autoComplete()); #pac-input only
    // exists on the store pages this code was copied from.
    var input: any = document.getElementById('pac-input');
    var autocomplete = input ? new google.maps.places.Autocomplete(input) : null;
    if (autocomplete) autocomplete.bindTo('bounds', that.map);
    var locationButton: any = document.getElementById('currentLocation');
    // Work while place changed and search other location
    if (autocomplete) google.maps.event.addListener(autocomplete, 'place_changed', function () {
      that.marker.setVisible(false);
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      if (place.geometry.viewport) {
        that.map.fitBounds(place.geometry.viewport);
      } else {
        that.map.setCenter(place.geometry.location);
        that.map.setZoom(17); // Why 17? Because it looks good.
      }
      that.marker.setPosition(place.geometry.location);
      that.marker.setVisible(true);

      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] &&
            place.address_components[0].short_name) ||
          '',
          (place.address_components[1] &&
            place.address_components[1].short_name) ||
          '',
          (place.address_components[2] &&
            place.address_components[2].short_name) ||
          '',
          (place.address_components[3] &&
            place.address_components[3].short_name) ||
          '',
          (place.address_components[4] &&
            place.address_components[4].short_name) ||
          '',
          (place.address_components[5] &&
            place.address_components[5].short_name) ||
          '',
        ].join(' ');
      }
    });

    //Click on button for getting current location
    locationButton.addEventListener('click', () => {
      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            that.infoWindow.setPosition(pos);
            that.map.setCenter(pos);
            that.map.setZoom(17); // Why 17? Because it looks good.
            that.marker.setPosition(pos);
            that.geocodePosition(pos);
          },
          () => {
            that.handleLocationError(
              true,
              that.infoWindow,
              that.map.getCenter()
            );
          }
        );
      } else {
        // Browser doesn't support Geolocation
        that.handleLocationError(false, that.infoWindow, that.map.getCenter());
      }
    });

    google.maps.event.addListenerOnce(that.map, 'idle', function () {
      google.maps.event.trigger(that.map, 'resize');
    });
    google.maps.event.trigger(that.marker, 'click');
  }

  /**
   * Used for autocomplete address in the google map seach bar
   */
  autoComplete() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          var data = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          this.geocodePosition(data, 1);
          this.latitude = data.lat;
          this.longitude = data.lng;

          this.initMap();
          this.cdr.detectChanges();
        });
      });
    });
  }

  /**
   * To get the latitude and longitude from the map 
   */
  geocodePosition(pos?: any, isAllow?: any) {
    this.geocoder = new google.maps.Geocoder();
    let that = this;
    this.geocoder.geocode(
      {
        latLng: pos,
      },
      function (responses: any) {
        if (responses && responses.length > 0) {
          that.marker.formatted_address = responses[0].formatted_address;
          if (that.use_google_map == 1) {
            that.setAddress(responses, isAllow);
            that.countryListRecord();
          }
          that.formGroup.controls['locationData'].setValue(
            that?.marker?.formatted_address
          );

        } else {
          that.marker.formatted_address =
            'Cannot determine address at this location.';
        }
      }
    );
  }

  handleLocationError(browserHasGeolocation: any, infoWindow: any, pos: any) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? 'Error: Location Permission Not Allowed.'
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(this.map);
  }

  setAddress(element: any, isAllow: any) {
    var address = element[0];
    var formatted_address = '';
    var country = '';
    var zipcode = '';
    var street_address = '';
    var state = '';
    var area = '';
    address.address_components?.forEach((element: any) => {
      if (element.types[0] == 'landmark') {
        street_address = element.long_name;
      }
      if (element.types[0] == 'political') {
        area = element.long_name;
      }
      if (element.types[0] == 'locality') {
        formatted_address = element.long_name;
      }
      if (element.types[0] == 'country') {
        country = element.long_name;
      }
      if (element.types[0] == 'administrative_area_level_1') {
        state = element.long_name;
      }
      if (element.types[0] == 'postal_code') {
        zipcode = element.long_name;
      }
    });
    this.formGroup.controls['locationData'].setValue(formatted_address);
    this.setData = {
      address: formatted_address,
      country: country,
      lat: address.geometry.location.lat(),
      lng: address.geometry.location.lng(),
      zipcode: zipcode,
      fullAddress: address.formatted_address,
      street_add: street_address,
      state_name: state,
      area_name: area
    };
    var countryFoundInList = this.country_list?.filter(
      (item: any) => item.name.toLowerCase() == country.toLowerCase()
    )[0];
    if (!this.customerId) { // for add address
      if (countryFoundInList) {
        this.loadLocationData(this.setData);
      }
    }
  }

  /**
  * Load the form data when open first time
  */
  loadLocationData(data: any) {
    var countryID: any = this.country_list.filter((x: any) => (x.name).toLowerCase() == (data.country).toLowerCase())[0];
    var sateteID: any = this.state_list.filter((x: any) => (x.name).toLowerCase() == (data.state_name).toLowerCase())[0];
    this.formGroup.controls['address'].setValue(data.house_address);
    this.formGroup.controls['address2'].setValue(data.street_add);
    this.formGroup.controls['country_id'].setValue(countryID.id);
    if (sateteID) {
      this.formGroup.controls['state_id'].setValue(sateteID.id);
      this.cityListRecord();
    } else {
      this.formGroup.controls['state_id'].setValue(null);
    }
    this.formGroup.controls['zipcode'].setValue(data.zipcode);
    if (this.formGroup.value.country != '101') {
      this.formGroup.controls['area_id'].clearValidators();
      this.formGroup.controls['area_id'].updateValueAndValidity();
    }
    this.cdr.detectChanges();
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
  
  /** Submit method of new/edit manage customer */
  onSubmit() {
    if ((this.exist == 1 && !this.customerId) && this.verify != 1) {
      this._snackbarService.error(
        this.translate.instant("ALREADY_EXIST_STORE_PHONE")
      );
    }
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;

      Object.keys(controls).forEach((controlName, i) => {
        if (i == 0) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          if (invalidControl) {
            invalidControl.focus();
          }
        }
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      if (this.formGroup.value.add_khata == true && !this.isSuperAdmin) {
        if ((this.formGroup.get('payment_cycle_number').value == null || this.formGroup.get('payment_cycle_number').value == '') && (this.formGroup.get('payment_cycle').value == null)) {
          this.toastr.error(this.translate.instant('PAYMENT_CYCLE_VALIDATION'));
          return;
        }
        if (this.formGroup.get('payment_cycle_tag').value == null || this.formGroup.get('payment_cycle_tag').value == '') {
          this.toastr.error(this.translate.instant('PAYMENT_CYCLE_TAG_SELECT'));
          return;
        }
      }

      if (this.formGroup.get('zipcode').value == null || this.formGroup.get('zipcode').value == '') {
        this.toastr.error(this.translate.instant('PLEASE_ENTER') + ' ' + this.pincode_label);
        return;
      }

      if ((this.formGroup.get('zipcode').value.toString().length) != Number(this.pincode_length)) {
        this.toastr.error(this.translate.instant(this.pincode_label + ' length should be ' + this.pincode_length));
        return;
      }

      var fd = new FormData();
      fd.append("is_super_admin", this.isSuperAdmin ? '1' : '0');
      if (this.isSuperAdmin) {
        fd.append("customer_user_id", this.customer_User_Id == 0 ? '' : this.customer_User_Id);
      }

      fd.append("name", this.formGroup.value.name);
      fd.append("phone", this.formGroup.value.phone);
      fd.append("email", this.formGroup.value.email);
      fd.append("address", this.formGroup.value.address);
      fd.append("address2", this.formGroup.value.address2);
      fd.append(
        "store_id",
        this.isSuperAdmin == true ? 0 : this.seller_details.store_id
      );
      if (this.is_cropped_image) {
        fd.append("user_picture", this.formGroup.value.user_picture);
      } else {
        fd.append("user_picture", "undefined");
        fd.append("is_image_delete ", '1');
      }
      fd.append("user_id", this.main.LoggedUserInfo.user_id);
      fd.append("country_id", this.formGroup.value.country_id);
      fd.append("state_id", this.formGroup.value.state_id);
      fd.append("city_id", this.formGroup.value.city_id);
      if (this.formGroup.value.country_id == 101) {
        fd.append("area_id", this.formGroup.value.area_id);
      }
      fd.append("latitude", this.latitude);
      fd.append("longitude", this.longitude);

      fd.append("zipcode", this.formGroup.value.zipcode);

      if (this.customerId) {
        fd.append("customer_id", this.customerId);
      }

      if (this.formGroup.value.add_khata && !this.isSuperAdmin) {
        fd.append("is_khata", "1");
        fd.append("deposit", this.formGroup.value.deposit_amount);
        fd.append("opening_overdue_amount", this.formGroup.value.overdue_amount);
        fd.append("overdue_limit", this.formGroup.value.overdue_limit);
        fd.append("number", this.formGroup.value.payment_cycle_number);
        fd.append("unit_id", this.formGroup.value.payment_cycle);
        fd.append("tags", this.formGroup.value.payment_cycle_tag);
      } else {
        fd.append("is_khata", "0");
      }
      console.log('zipcode2')
      this.customerService.addEditCustomer(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            this.router.navigate([`/manage-customer`]);
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
