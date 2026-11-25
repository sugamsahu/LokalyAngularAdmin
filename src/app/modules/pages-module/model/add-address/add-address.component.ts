import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AgmMap, MapsAPILoader } from '@agm/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';
import { CustomerService } from 'src/app/services/customer.service';
import { ToastrService } from 'ngx-toastr';
declare var google: any;

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.component.html',
  styleUrls: ['./add-address.component.scss']
})
export class AddAddressComponent implements OnInit {
  @ViewChild('search')
  public searchElementRef: ElementRef;
  formGroup: FormGroup;
  latitude: any;
  longitude: any;
  map: any;
  info_window: any;
  marker: any = {};
  geocoder: any;
  user_lat: any;
  user_long: any;
  default_location_lat: any;
  default_location_long: any;
  user: any = localStorage.getItem('user');
  @ViewChild(AgmMap, { static: true }) public agmMap: AgmMap;
  global_setting: any = localStorage.getItem('LoggedUserSettings');
  country_list: any = [];
  state_list: any = [];
  city_list: any = [];
  area_list: any = [];
  business_model: any;
  allow_alphanumeric_pincode: any;
  pincode_length: any;
  use_google_map: any;
  loading: boolean = false;
  change_tag_option: any = 'home';
  data: any;
  is_first_load = 0;
  add_address: any;
  @Input() user_id: any;
  @Output() new_adddress: EventEmitter<any> = new EventEmitter();
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private mapsAPILoader: MapsAPILoader,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private commonService: CommonService,
    private el: ElementRef,
    private toastr: ToastrService,
    private customerService: CustomerService,
  ) {
    this.global_setting = JSON.parse(this.global_setting);
    this.business_model = this.global_setting?.business_model;
    this.allow_alphanumeric_pincode =
      this.global_setting.allow_alphanumeric_pincode;
    this.pincode_length = this.global_setting.pincode_length;
    this.use_google_map = this.global_setting.use_google_map;
  }

  ngOnInit(): void {
    this.add_address = {
      "--css_button_business_default": this.global_setting.css_button_business_default,
      "--css_button_business_font": this.global_setting.css_button_business_font
    }

    this.loadForm();
    this.default_location_lat = parseFloat(this.global_setting?.default_location_lat);
    this.default_location_long = parseFloat(this.global_setting?.default_location_long);
    if (this.use_google_map) {
      this.mapsAPILoader.load().then(() => {
        this.getLocation();
        this.autoComplete();
      });
      setTimeout(() => {
        this.mapsAPILoader.load().then(() => {
          this.initMap();
        });
      }, 2000);
    } else {
      this.getCountries();
    }
  }

  /**
   * To initialize the formcontrol name
   */
  loadForm() {
    this.formGroup = this.formBuilder.group({
      locationData: new FormControl(null),
      house_address: new FormControl("", Validators.required),
      street_address: new FormControl(""),
      country: new FormControl(null, Validators.required),
      state: new FormControl(null, Validators.required),
      city: new FormControl(null, Validators.required),
      area: new FormControl(null, Validators.required),
      pincode: new FormControl(null, [Validators.required, Validators.maxLength(this.pincode_length)]),
      location_value: new FormControl(null),
      tag: new FormControl(null),
    });
  }

  /**
   * To saw the google map
   */
  initMap() {
    let that = this;
    var latLng: any = new google.maps.LatLng(that.latitude, that.longitude);

    var mapOptions: any = {
      zoom: 17,
      center: latLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      draggable: true,
    };
    var temp: any = document.getElementById('google-maps-add');
    that.map = new google.maps.Map(temp, mapOptions);
    that.info_window = new google.maps.InfoWindow();
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

    var input: any = document.getElementById('pac-input');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', that.map);
    var locationButton: any = document.getElementById('currentLocation');
    // Work while place changed and search other location
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
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

      var address: any = '';
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
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            that.info_window.setPosition(pos);
            that.map.setCenter(pos);
            that.map.setZoom(17); // Why 17? Because it looks good.
            that.marker.setPosition(pos);
            that.geocodePosition(pos);
          },
          () => {
            that.handleLocationError(
              true,
              that.info_window,
              that.map.getCenter()
            );
          }
        );
      } else {
        // Browser doesn't support Geolocation
        that.handleLocationError(false, that.info_window, that.map.getCenter());
      }
    });

    google.maps.event.addListenerOnce(that.map, 'idle', function () {
      google.maps.event.trigger(that.map, 'resize');
    });
    google.maps.event.trigger(that.marker, 'click');
  }

  /**
* Restriction for not entered the number
*/
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
          var data: any = {
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
            // that.setAddress(responses, 1);
            that.setAddress(responses, isAllow);
            // that.getCountries();
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

  /**
  * Show the error message in the google map
  */
  handleLocationError(browserHasGeolocation: any, infoWindow: any, pos: any) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? 'Error: Location Permission Not Allowed.'
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(this.map);
  }

  /**
   * To get the current location from the google map
   */
  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: any) => {
          if (position) {
            this.user_lat = position.coords.latitude;
            this.user_long = position.coords.longitude;

            var data: any

            this.latitude = this.user_lat;
            this.longitude = this.user_long;
            data = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            this.geocodePosition(data, 1);
          }
        },
        (error: any) => {
          this.latitude = this.default_location_lat;
          this.longitude = this.default_location_long;
          var data = {
            lat: this.default_location_lat,
            lng: this.default_location_long,
          };
          this.geocodePosition(data, 1);
        }
      );
    } else {
      alert(this.translate.instant('GEOLOCATION_IS_NOT_SUPPORTED_BY_THIS_BROWSER.'));
    }
  }

  /**
   * To change the tag
   */
  changeTag(label: any) {
    label == "Other" ? this.formGroup.controls['tag'].setValidators([Validators.required]) : this.formGroup.controls['tag'].clearValidators();
    this.formGroup.controls['tag'].updateValueAndValidity();
    this.change_tag_option = label;
  }

  /**
* For Form validation when the form invalid
*/
  controlHasError(validation: any, controlName: any): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  /**
   * To change the coutry from list
   */
  countryChange(event: any) {
    this.state_list = [];
    this.city_list = [];
    this.area_list = [];
    this.formGroup.controls['state'].setValue(null);
    this.formGroup.controls['city'].setValue(null);
    this.formGroup.controls['area'].setValue(null);
    this.getStates(event);
  }

  /**
   * To change the state from list
   */
  stateChange(event: any) {
    this.city_list = [];
    this.area_list = [];
    this.formGroup.controls['city'].setValue(null);
    this.formGroup.controls['area'].setValue(null);
    this.getCities(event);
  }

  /**
   * To change the city from list
   */
  cityChange(event: any) {
    this.area_list = [];
    this.formGroup.controls['area'].setValue(null);
    this.getAreas(event);
  }

  /**
   * To saw the country list
   */
  getCountries() {
    this.commonService
      .getCountryList()
      .subscribe((response) => {
        var commonCountry = this.global_setting.country != undefined ? this.global_setting.country.split(',') : null;
        if (commonCountry) {
          commonCountry.forEach(country => {
            var objCountry = response.data.filter((x) => x.id == country.toString())[0]
            this.country_list.push(objCountry)
          })
        }

        var temp_stateID: any = this.country_list.filter(
          (x: any) => x.name.toLowerCase() == this.data?.country.toLowerCase()
        )[0];
        this.formGroup.controls['country'].setValue(temp_stateID?.id);
        this.getStates(temp_stateID?.id);
      });
  }

  /**
   * To saw the state list
   */
  getStates(countryID: any) {
    this.commonService.getStateList(countryID).subscribe((response) => {
      this.state_list = response.data;
      var stateID = this.state_list?.filter(
        (x: any) => x.name.toLowerCase() == this.data?.state_name.toLowerCase()
      )[0];
      this.formGroup.controls['state'].setValue(stateID?.id);
      this.getCities(stateID?.id);
    });
  }

  /**
   * To saw the city list
   */
  getCities(StateID: any) {
    this.commonService.getCityList(StateID).subscribe((response) => {
      this.city_list = response.data;
      var cityID = this.city_list?.filter(
        (x: any) => x.name.toLowerCase() == this.data?.address.toLowerCase()
      )[0];

      this.formGroup.controls['city'].setValue(cityID?.id);
      this.getAreas(cityID?.id);
    });
  }

  /**
   * To saw the area list
   */
  getAreas(cityID: any) {
    this.commonService.getAreaList(cityID).subscribe((response) => {
      this.area_list = response.data;
      if (this.data?.area_name) {
        var areaID = this.area_list?.filter(
          (x: any) => x.name.toLowerCase() == this.data?.area_name.toLowerCase()
        )[0];
        this.formGroup.controls['area'].setValue(areaID?.id);
      }
    });
  }

  /**
  * To set the address in the form
  */
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
    this.data = {
      address: formatted_address,
      country: country,
      customer_address_id: '',
      lat: address.geometry.location.lat(),
      lng: address.geometry.location.lng(),
      zipcode: zipcode,
      fullAddress: address.formatted_address,
      street_add: street_address,
      state_name: state,
      area_name: area
    };

    this.formGroup.controls['pincode'].setValue(zipcode);
    this.getCountries();

  }

  /**
  * Load the form data when open first time
  */
  loadLocationData(data: any) {
    this.formGroup.controls['street_address'].setValue(data.street_add);
    this.formGroup.controls['country'].setValue(data.country);
    this.formGroup.controls['state'].setValue(data.state_name);
    this.formGroup.controls['city'].setValue(data.address);
    this.formGroup.controls['area'].setValue(data.area_name);
    this.formGroup.controls['pincode'].setValue(data.zipcode);
    this.cdr.detectChanges();
  }


  /**
   * To add a new address
   */
  addAddress() {
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      const data: any = {
        user_id: this.user_id,
        is_default: '0',
        address1: this.formGroup.get('house_address')?.value,
        address2: this.formGroup.get('street_address')?.value,
        country_id: this.formGroup.get('country')?.value,
        state_id: this.formGroup.get('state')?.value,
        city_id: this.formGroup.get('city')?.value,
        area_id: this.formGroup.get('area')?.value,
        zipcode: this.formGroup.get('pincode')?.value,
        latitude: this.use_google_map ? this.data.lat : this.default_location_lat,
        longitude: this.use_google_map ? this.data.lng : this.default_location_long,
      };
      if (
        this.change_tag_option == 'Other' &&
        this.formGroup.get('tag')?.value != ''
      ) {
        data.alias = this.formGroup.get('tag')?.value;
      } else {
        data.alias = this.change_tag_option;
      }
      if (this.change_tag_option == 'Other') {
        data.alias_code = '2';
      } else if (this.change_tag_option == 'home') {
        data.alias_code = '0';
      } else {
        data.alias_code = '1';
      }
      this.customerService.managecustomeraddrs(data).subscribe((response) => {
        this.toastr.success(this.translate.instant('address_added'));
        this.new_adddress.emit('address');
        this.activeModal.dismiss();
      });
    }
  }

  /**
 * For Form validation when the form invalid
 */
  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement =
      this.el.nativeElement.querySelector("form .ng-invalid");
    window.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: "smooth",
    });
  }

  /**
* For Form validation when the form invalid
*/
  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    if (typeof controlEl === 'object' && controlEl !== null && 'getBoundingClientRect' in controlEl) {
      return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
    } else {
      return 50
    }

  }
}
