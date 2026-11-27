import { GoogleMapsLoader } from "src/app/services/google-maps-loader.service";
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
declare var google: any;

@Component({
  selector: 'share-location',
  templateUrl: './share-location.component.html',
  styleUrls: ['./share-location.component.scss'],
})
export class ShareLocationModelComponent implements OnInit {
  @ViewChild('search')
  public searchElementRef: ElementRef;
  @Output() shareLocation: EventEmitter<any> = new EventEmitter();
  formGroup: FormGroup;
  latitude: any;
  longitude: any;
  map: any;
  infoWindow: any;
  marker: any = {};
  geocoder: any;
  userLat: any;
  userLong: any;
  defaultLocationLat: any;
  defaultLocationLong: any;
  user: any = localStorage.getItem('user');
  customerAddress: any = localStorage.getItem('loginUserStore');
  @ViewChild('divClick') divClick: ElementRef;
  globalSetting: any = localStorage.getItem('LoggedUserSettings');
  defaultLocation: any;
  business_model: any;
  allow_alphanumeric_pincode: any;
  pincode_length: any;
  use_google_map: any;
  loading: boolean = false;
  getaddressdetails: any;
  changeTagOption: any = 'home';
  data: any;
  isFirstLoad = 0;
  style_obj_share_location: any;
  @ViewChild('cursor') cursor: ElementRef;
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private mapsAPILoader: GoogleMapsLoader,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    this.globalSetting = JSON.parse(this.globalSetting);
    this.business_model = this.globalSetting?.business_model;
    this.allow_alphanumeric_pincode =
      this.globalSetting.allow_alphanumeric_pincode;
    this.pincode_length = this.globalSetting.pincode_length;
    this.use_google_map = this.globalSetting.use_google_map;
  }

  ngOnInit(): void {
    this.style_obj_share_location = {
      "--css_button_business_default": this.globalSetting.css_button_business_default,
      "--css_button_business_font": this.globalSetting.css_button_business_font
    }
    $(
      '<style>#address-book .add-address-button-new button.repeat-btn{color: ' +
      this.globalSetting.css_button_customer_default_font +
      ' !important;}</style>'
    ).appendTo('body');
    $(
      '<style>#address-book .add-address-button-new button.extra-btn{color: ' +
      this.globalSetting.css_button_customer_default +
      ' !important;}</style>'
    ).appendTo('body');
    $(
      '<style>#address-book .add-address-button-new button.extra-btn:hover{color: ' +
      this.globalSetting.css_button_customer_default +
      ' !important; background-color: ' +
      this.globalSetting.css_button_customer_hover +
      ' !important;}</style>'
    ).appendTo('body');
    $(
      "<style>.checkbox-address [type='checkbox']:checked + label:before, .checkbox-address [type='checkbox']:not(:checked) + label:before { border: 1px solid" + this.globalSetting.css_button_customer_default + "}</style>"
    ).appendTo("body");
    $(
      "<style>.checkbox-address [type='checkbox']:checked + label:after, .checkbox-address [type='checkbox']:not(:checked) + label:after { background: " + this.globalSetting.css_button_customer_default + "}</style>"
    ).appendTo("body");
    this.loadForm();
    this.mapsAPILoader.load().then(() => {
      this.getLocation();
      this.autoComplete()
    });
    setTimeout(() => {
      this.mapsAPILoader.load().then(() => {
        this.initMap();
      });
    }, 2000);
    setTimeout(() => {
      this.divClick.nativeElement.click();
    }, 2000);
  }

  /**
   * To initialize the formcontrol name
   */
  loadForm() {
    this.formGroup = this.formBuilder.group({
      locationData: new FormControl(null),
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
      that.latitude = that.marker.getPosition().lat()
      that.longitude = that.marker.getPosition().lng()
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
            that.latitude = position.coords.latitude
            that.longitude = position.coords.longitude
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
            this.latitude = position.coords.latitude
            this.longitude = position.coords.longitude
            var data = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            this.geocodePosition(data, 1);
          }
        },
        (error: any) => {
          this.latitude = Number(this.globalSetting?.default_location_lat);
          this.longitude = Number(this.globalSetting?.default_location_long);
          var data = {
            lat: this.latitude,
            lng: this.longitude,
          };
          this.geocodePosition(data, 1);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  sendLocation() {
    var locationURL = 'https://maps.google.com/maps?q=' + this.latitude + ',' + this.longitude + '&hl=en&z=14&output=embed'
    this.shareLocation.emit(locationURL);
    this.activeModal.dismiss()
  }

  cancelClick(){
    this.activeModal.dismiss()
  }


  /**
   * To focus on the first field when opening the modal
   */
  ngAfterViewInit(): void {
      this.cursor.nativeElement.focus();
  }
}
