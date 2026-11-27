
import { CommonService } from "src/app/services/common.service";
import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef,} from "@angular/core";
import { Router } from "@angular/router";
import { AppComponent } from "src/app/app.component";
import { TranslateService } from "@ngx-translate/core";
import { StoreService } from "src/app/services/store.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GoogleMapsLoader } from "src/app/services/google-maps-loader.service";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators,} from "@angular/forms";
import { crop_rectangleComponent } from "../../model/crop-rectangle/crop-rectangle.component";
import { shareURLComponent } from "../../model/share-url/share-url.component";
import { HelpInfoModelComponent } from "../../model/help-info/help-info.component";
import { BannerService } from "src/app/services/configuration/banner.service";
import { ReveiwRatingComponent } from "../../model/reveiw-rating/reveiw-rating.component";
import { StoreSetupModelComponent } from "../../model/store-setup-model/store-setup-model.component";
import { ToastrService } from "ngx-toastr";
declare var google: any;

@Component({
  selector: 'app-store-details',
  templateUrl: './store-details.component.html',
  styleUrls: ['./store-details.component.scss']
})
export class StoreDetailsComponent implements OnInit {
  @ViewChild("addressUploadFile") someInput!: ElementRef;
  @ViewChild("gstUploadFile") gstUploadFile!: ElementRef;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  setup_steps = localStorage.getItem("setup_steps");
  iseatery = this.seller_details.iseatery;
  public store_detail_mgmt: UntypedFormGroup;
  isCroppedImage = false;
  IsAddressFileUploaded = true;
  IsGSTFileUploaded = true;
  main: any = { LoggedUserInfo: {} };
  store_label: any;
  store_tax_label: any;
  myCroppedImage: string;
  myImage: string;
  ph_numbr = /^\+?\d{10}$/;
  countryList = [];
  stateList = [];
  pincode_label: any;
  pincode_length: any;
  allow_alphanumeric_pincode: number;
  use_google_map: number;
  map: any;
  infoWindow: any;
  marker: any;
  geocoder: any;
  tempLat: number;
  tempLng: number;
  default_location_lat: number;
  default_location_long: number;
  cityList: any[];
  areaList = [];
  sellerid: any;
  imageUploadType: string;
  file: any;
  address_proof: any;
  gst_certificate: any;
  sessionConfig: any;
  cropped_store_logo: any;
  myCroppedImageShow: string;
  storeid: string;
  storeManage_Behalf: string;
  storedetails: any;
  UrL: string;
  whatsappURL: string;
  @ViewChild("cursor") cursor: ElementRef;
  latitude!: any;
  longitude!: any;
  zoom!: number;
  type: any;
  croppedImages: any;
  cropFiles: any;
  item_approval_shop_type_string: any;
  help_details: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  store_detail: any;
  review_rating_module: any;
  show_review_rating: any;
  skipShow: boolean = true;
  error: boolean = false

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private storeservice: StoreService,
    public commonService: CommonService,
    private appComponent: AppComponent,
    public translate: TranslateService,
    private modalService: NgbModal,
    private mapsAPILoader: GoogleMapsLoader,
    private formBuilder: UntypedFormBuilder,
    private el: ElementRef,
    private _helpService: BannerService,
  ) {
    translate.addLangs(["it", "en", "de"]);
    translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
    } else if (this.seller_details.user_role_confirm == '0' && (!this.setup_steps || this.setup_steps<'1')) {
      this.storeSetupModel();
    }

    this.sessionConfig = this.appComponent.sessionConfig();
    this.main.LoggedUserInfo = JSON.parse(this.sessionConfig.getSessionLoginUser());
    this.store_label = this.general_setting.store_label;
    this.pincode_label = this.general_setting.pincode_label;
    this.pincode_length = this.general_setting.pincode_length;
    this.allow_alphanumeric_pincode = parseInt(
      this.general_setting.allow_alphanumeric_pincode
    );
    this.type = this.allow_alphanumeric_pincode == 1 ? "text" : "number"
    this.use_google_map = parseInt(this.general_setting.use_google_map);
    this.review_rating_module = this.general_setting.review_rating_module;
    this.show_review_rating = this.general_setting.show_review_rating;

    this.countryListRecord();
    this.loadform();
    this.getReviewRating();
    setTimeout(() => {
      this.cursor?.nativeElement.focus();
    }, 2000)

    this.editStore();
    this.geocoder = new google.maps.Geocoder();

    setTimeout(() => {
      this.mapsAPILoader.load().then(() => {
        this.initMap()
      });
    }, 2000);
    this.getHelpDetails();

  }

  loadform() {
    this.store_detail_mgmt = this.formBuilder.group({
      store_logo: new UntypedFormControl("assets/icons/no_image.svg", [Validators.required]),
      store_name: new UntypedFormControl(null, [Validators.required]),
      manager: new UntypedFormControl(null, [Validators.required]),
      phone: new UntypedFormControl(null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      category_id: new UntypedFormControl(null),
      category_name: new UntypedFormControl(null),
      store_description: new UntypedFormControl(null),
      store_address: new UntypedFormControl(null),
      store_address2: new UntypedFormControl(null),
      country_id: new UntypedFormControl(null, [Validators.required]),
      state_id: new UntypedFormControl(null, [Validators.required]),
      city_id: new UntypedFormControl(null, [Validators.required]),
      area_id: new UntypedFormControl(null),
      zipcode: new UntypedFormControl(null, [Validators.required]),
      store_cuisines: new UntypedFormControl(null),
      is_agree: new UntypedFormControl(0),
      user_id: new UntypedFormControl(0),
      LocatationData: new UntypedFormControl(null)
    });

  }

  /** For Google map */
  initMap() {
    if (this.storedetails) {
      this.getLatLongAndConvertInLocation(this.storedetails.latitude, this.storedetails.longitude)
    }

    // The map container is only rendered when Google Maps is enabled for the platform.
    const mapElement = document.getElementById("google-maps");
    if (!mapElement) {
      return;
    }

    let that = this;
    var latLng = new google.maps.LatLng(that.latitude, that.longitude);
    var mapOptions = {
      zoom: 17,
      center: latLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      draggable: true,
    };
    that.map = new google.maps.Map(mapElement, mapOptions);
    that.infoWindow = new google.maps.InfoWindow();
    that.marker = new google.maps.Marker({
      position: latLng,
      title: "Point A",
      map: that.map,
      draggable: true,
    });

    var input = document.getElementById("pac-input");
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", that.map);

    var locationButton = document.getElementById("currentLocation");

    //Work while place changed and search other location
    google.maps.event.addListener(autocomplete, "place_changed", function () {
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

      var address = "";
      if (place.address_components) {
        address = [
          (place.address_components[0] &&
            place.address_components[0].short_name) ||
          "",
          (place.address_components[1] &&
            place.address_components[1].short_name) ||
          "",
          (place.address_components[2] &&
            place.address_components[2].short_name) ||
          "",
          (place.address_components[3] &&
            place.address_components[3].short_name) ||
          "",
          (place.address_components[4] &&
            place.address_components[4].short_name) ||
          "",
          (place.address_components[5] &&
            place.address_components[5].short_name) ||
          "",
        ].join(" ");
      }

      var latLngString =
        that.marker.getPosition().lat() +
        " , " +
        that.marker.getPosition().lng();
      that.latitude = that.marker.getPosition().lat();
      that.longitude = that.marker.getPosition().lng();
    });

    //Click on button for getting current location
    locationButton.addEventListener("click", () => {
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

    google.maps.event.addListenerOnce(that.map, "idle", function () {
      google.maps.event.trigger(that.map, "resize");
    });

    //Newly added code for drag and dragend on map
    google.maps.event.addListener(that.map, "drag", function (event) {
      var center = that.map.getCenter();
      // Retrieve the latitude and longitude
      that.latitude = center.lat();
      that.longitude = center.lng();

      that.marker.setPosition(that.map.getCenter());
    });

    google.maps.event.addListener(that.map, "dragend", function () {
      // Get the updated center position of the map
      var center = that.map.getCenter();

      // Retrieve the latitude and longitude
      that.latitude = center.lat();
      that.longitude = center.lng();

      that.map.setZoom(17); // Why 17? Because it looks good.
      that.geocodePosition(that.marker.getPosition());
      that.getLatLongAndConvertInLocation(that.latitude, that.longitude)
    });

    google.maps.event.trigger(that.marker, "click");
  }

  geocodePosition(pos?) {
    let that = this;
    this.geocoder.geocode(
      {
        latLng: pos,
      },
      function (responses) {
        if (responses && responses.length > 0) {
          that.marker.formatted_address = responses[0].formatted_address;
          that.store_detail_mgmt.controls["LocatationData"].setValue(that.marker.formatted_address)
        } else {
          that.marker.formatted_address =
            "Cannot determine address at this location.";
        }
        var latLngString =
          that.marker.getPosition().lat() +
          " , " +
          that.marker.getPosition().lng();
        that.latitude = that.marker.getPosition().lat();
        that.longitude = that.marker.getPosition().lng();
      }
    );
  }

  handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(this.map);
  }

  editTimeSetLatitudeLongitude(lat, lng) {
    var latLng = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
    this.marker = new google.maps.Marker({
      map: this.map,
      position: latLng,
      animation: google.maps.Animation.DROP,
    });

    this.geocodePosition(latLng);
    this.map.setCenter(latLng);
    this.map.setZoom(17);
  }

  getLatLongAndConvertInLocation(lat, long) {
    this.latitude = lat;
    this.longitude = long;

    if (this.latitude != undefined && this.longitude != undefined) {
      this.mapsAPILoader.load().then(() => {
        const geocoder = new google.maps.Geocoder();
        const latLng = new google.maps.LatLng(this.latitude, this.longitude);

        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK') {
            if (results[0]) {
              this.store_detail_mgmt.controls["LocatationData"].setValue(results[0].formatted_address)
            } else {
              console.log("Location not found");
            }
          } else {
            console.log('Geocoder failed due to: ' + status);
          }
        });
      });
    }
  }

  fileChange(event): any {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file = fileList[0];
      this.file = fileList[0];
      if (file.name.indexOf(".") > -1) {
        var extension = file.name.split(".").pop().toLowerCase();
      } else {
        var extension = file.name.split("/").pop().toLowerCase();
      }
      if (
        $.inArray(extension, ["png", "PNG", "jpg", "jpeg"]) == -1 &&
        this.imageUploadType == "storeLogoPicture"
      ) {
        this.toastr.error(
          "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO"
        );
        return false;
      } else if (
        $.inArray(extension, [
          "png",
          "PNG",
          "jpg",
          "jpeg",
          "pdf",
          "doc",
          "docx",
          "DOC",
          "DOCX",
        ]) == -1
      ) {
        if (this.imageUploadType == "filename") {
          this.toastr.error(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_ADDRESS"
          );
          this.someInput.nativeElement.value = null;
          this.cdr.detectChanges();
        } else if (this.imageUploadType == "gstPicture") {
          this.toastr.error(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_GST"
          );
          this.gstUploadFile.nativeElement.value = null;
        } else if (this.imageUploadType == "storeLogoPicture") {
          this.toastr.error(
            "PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT_LOGO"
          );
        } else {
          this.toastr.error("PLEASE_SELECT_JPG_JPEG_PNG_PDF_DOC_DOCX_FORMAT");
        }
        return false;
      } else if (this.file.size / 1024 >= 2048) {
        this.toastr.error("IMAGE_SIZE_SHOULD_BE_LESS_THAN_2_MB");
        return false;
      } else {
        if (this.imageUploadType == "userPicture") {
        } else if (this.imageUploadType == "filename") {
          this.address_proof = this.file
        } else if (this.imageUploadType == "gstPicture") {
          this.store_detail_mgmt.controls['gst_certificate'].setValue(this.file)
        } else if (this.imageUploadType == "storeLogoPicture") {
          this.store_detail_mgmt.controls['store_logo'].setValue(this.file)
        }
      }
    }
  }

  uploadPicture = function (uploadType) {
    this.imageUploadType = uploadType;
    var fileInput;
    if (this.imageUploadType == "userPicture") {
      fileInput = document.getElementById("userUploadFile");
    } else if (this.imageUploadType == "filename") {
      fileInput = document.getElementById("addressUploadFile");
    } else if (this.imageUploadType == "gstPicture") {
      fileInput = document.getElementById("gstUploadFile");
    } else if (this.imageUploadType == "storeLogoPicture") {
      fileInput = document.getElementById("storeLogoUploadFile");
    }
  };

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

  async focusfn() {
    var data = {
      phone: this.store_detail_mgmt.value.phone,
    };
    await this.storeservice.checkSeller(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  shareUrl(sellerDetail) {
    var Url = this.general_setting.website_url;
    this.UrL = Url + "/store/" + sellerDetail.store_slug + "/" + sellerDetail.store_id;
    this.whatsappURL =
      "https://api.whatsapp.com/send/?phone&text=" + this.UrL + "&app_absent=0";
    const modalRef = this.modalService.open(shareURLComponent);
    modalRef.componentInstance.UrL = this.UrL;
    modalRef.componentInstance.whatsappURL = this.whatsappURL;
  }

  reviewModal() {
    const modalRef = this.modalService.open(ReveiwRatingComponent, {
      size: "lg",
      centered: true,
    });
    modalRef.componentInstance.review = this.store_detail.reviews;
    modalRef.componentInstance.store = this.store_detail.store;
    modalRef.componentInstance.forStore = true;

  }

  async editStore() {
    var data = {
      store_id: this.seller_details.store_id,
      checkConfirm: 1
    };

    await this.storeservice.getStoreDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.storedetails = response.data
          this.sellerid = this.storedetails.store_id;
          this.store_detail_mgmt.controls['store_name'].setValue(response.data.store_name);
          this.store_detail_mgmt.controls['manager'].setValue(response.data.manager);
          this.store_detail_mgmt.controls['phone'].setValue(response.data.phone);
          this.store_detail_mgmt.controls['store_description'].setValue(response.data.store_description);
          this.store_detail_mgmt.controls['store_address'].setValue(response.data.store_address);
          this.store_detail_mgmt.controls['store_address2'].setValue(response.data.store_address2);
          this.store_detail_mgmt.controls['store_logo'].setValue(response.data.store_logo ? response.data.store_logo : 'assets/icons/no_image.svg');
          this.store_detail_mgmt.controls['country_id'].setValue(response.data.country_id.toString());
          this.stateListRecord();
          this.store_detail_mgmt.controls['state_id'].setValue(response.data.state_id.toString());
          this.cityListRecord();
          this.store_detail_mgmt.controls['city_id'].setValue(response.data.city_id.toString());
          this.areaListRecord();
          if (response.data.area_id)
            this.store_detail_mgmt.controls['area_id'].setValue(response.data.area_id.toString());
          this.store_detail_mgmt.controls['zipcode'].setValue(response.data.zipcode);
          this.store_detail_mgmt.controls['category_name'].setValue(response.data.category_name);
          this.store_detail_mgmt.controls['store_cuisines'].setValue(response.data.store_cuisines);
          this.myCroppedImageShow = response.data.store_logo;
          if (response.data.is_verified == "0") {
            this.store_detail_mgmt.controls['is_verified'].setValue(Number(1))
          }

          this.cdr.detectChanges()
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  getReviewRating() {
    var data = {
      store_id: this.seller_details.store_id,
      user_id: "0",
      business_hours: "0",
      is_order_settings: "0",
      is_reviews: "1",
      is_cuisine: "0",
      store_business_hours: "0"

    };
    this.storeservice.getStorePageDetails(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.store_detail = response.data
        }
      },
    });
  }

  async countryListRecord() {
    await this.commonService.getCountryList().subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.countryList = [];
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
      error: (error) => { },
      complete: () => { },
    });
  }

  CountryChange() {
    this.store_detail_mgmt.controls['state_id'].reset();
    this.store_detail_mgmt.controls['city_id'].reset();
    this.store_detail_mgmt.controls['area_id'].reset();
    this.stateListRecord();
  }

  StateChange() {
    this.store_detail_mgmt.controls['city_id'].reset();
    this.store_detail_mgmt.controls['area_id'].reset();
    this.cityListRecord();
  }

  CityChange() {
    this.store_detail_mgmt.controls['area_id'].reset();
    this.areaListRecord();
  }

  async stateListRecord() {
    await this.commonService.getStateList(this.store_detail_mgmt.value.country_id).subscribe({
      next: (response: any) => {
        if (response.status == 1) {

          this.stateList = [];
          this.stateList = response.data;
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }


  async cityListRecord() {
    await this.commonService.getCityList(this.store_detail_mgmt.value.state_id).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.cityList = [];
          this.areaList = [];
          this.cityList = response.data;
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  async areaListRecord() {
    await this.commonService.getAreaList(this.store_detail_mgmt.value.city_id).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.areaList = [];
          this.areaList = response.data;
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }

  /** Open crop_rectangleComponent modal */
  openUpdateUserProfPicModal() {
    const modalRef = this.modalService.open(crop_rectangleComponent, {
      size: "lg-600"
    });
    modalRef.componentInstance.myCroppedImage = this.myCroppedImageShow;
    modalRef.componentInstance.imageChangedEvent = this.myCroppedImage
    modalRef.componentInstance.imageChangedEvent = this.croppedImages
    modalRef.componentInstance.cropFiles = this.cropFiles
    modalRef.componentInstance.newseller = this.cropped_store_logo == undefined ?
      this.store_detail_mgmt.value.store_logo : this.cropped_store_logo;
    modalRef.componentInstance.isCroppedImage = this.isCroppedImage;
    modalRef.componentInstance.cropWidth = '500';
    modalRef.componentInstance.cropHeight = '500';
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.editProfilePic(receivedEntry);
    });
  }

  onNextButton() {
      this.router.navigate([`/storebanner`])
  }

  editProfilePic(item) {
    if (item.crop_image_file != undefined) {
      this.isCroppedImage = true;
      this.cropFiles = item.cropFiles
      this.croppedImages = item.croppedImages
      this.cropped_store_logo = item.crop_image;
      this.store_detail_mgmt.controls['store_logo'].setValue(item.crop_image_file)
      this.myCroppedImage = item.full_image;
    }
    this.cdr.detectChanges();
  }

  storeSetupModel() {
    const modalRef = this.modalService.open(StoreSetupModelComponent, {
      size: "md",
      backdrop: "static",
      keyboard: false,
      centered: true,
    });
    modalRef.componentInstance.storeSetupDetails = this.general_setting;
  }

  removeLogoImage() {
    this.store_detail_mgmt.value.store_logo = "assets/icons/no_image.svg";
    this.isCroppedImage = false;
    this.myImage = "";
    this.myCroppedImage = "";
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.store_detail_mgmt.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  submitStore() {
    if (!this.store_detail_mgmt.valid) {
      this.findInvalidControls();
      const controls = this.store_detail_mgmt.controls;
      Object.keys(controls).forEach((controlName, i) => {
        if (i == 0 && controlName != 'store_logo') {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          invalidControl.focus();
        }
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
      return;
    }
    var fd = new FormData();
    fd.append('user_id', this.main.LoggedUserInfo.user_id);
    fd.append('store_id', this.seller_details.store_id);
    fd.append('contact_number', this.store_detail_mgmt.value.phone);
    fd.append('manager', this.store_detail_mgmt.value.manager);
    fd.append('store_name', this.store_detail_mgmt.value.store_name);
    fd.append('store_description', this.store_detail_mgmt.value.store_description);
    fd.append('store_address', this.store_detail_mgmt.value.store_address);
    fd.append('store_address2', this.store_detail_mgmt.value.store_address2);
    fd.append('latitude', this.latitude)
    fd.append('longitude', this.longitude)
    if (!this.store_detail_mgmt.value.store_logo) {
      fd.append('store_logo', this.store_detail_mgmt.value.store_logo == 'assets/icons/no_image.svg' ? 0 : this.store_detail_mgmt.value.store_logo);
    }
    else {
      fd.append('store_logo', '');
    }
    fd.append('category_id', this.storedetails.category_id);
    fd.append('is_confirm', this.storedetails.is_confirm);
    fd.append('country_id', this.store_detail_mgmt.value.country_id);
    fd.append('state_id', this.store_detail_mgmt.value.state_id);
    if (this.store_detail_mgmt.value.country_id == '101') {
      if (this.store_detail_mgmt.value.area_id != undefined && this.store_detail_mgmt.value.area_id != null && this.store_detail_mgmt.value.area_id != '') {
        fd.append('area_id', this.store_detail_mgmt.value.area_id);
      }
    }
    fd.append('city_id', this.store_detail_mgmt.value.city_id);
    fd.append('zipcode', this.store_detail_mgmt.value.zipcode);
    var data = fd;
    if (this.sellerid == undefined) {
      this.finalsubmit(data, 'add');
    } else {
      this.finalsubmit(data, 'edit');
    }

  }

  finalsubmit(data, label) {
    this.storeservice?.saveStoreDetails(data, label).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.sessionConfig.clearCookie('storeManage_sellerid' + this.main.LoggedUserInfo.role_id.toString());
          this.sessionConfig.clearCookie('storeManage_storeID' + this.main.LoggedUserInfo.role_id.toString());
          this.toastr.success(response.message);
          this.skipShow = false;
          localStorage.setItem('setup_steps','1');
          this.router.navigate([`/store-details`]);
          this.cdr.detectChanges();
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => { this.toastr.error(error); },
      complete: () => { },
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


  cancelClick() {
    history.back();
  }

  controlHasError(validation, controlName): boolean {
    const control = this.store_detail_mgmt.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.help_details;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1) {
      data.module_key = '91'
    }
    if (this.main.LoggedUserInfo.role_id == 6) {
      data.module_key = '91'
    }
    if (this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '91'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.help_details = response.data;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  validateDecimal(event: any) {
    var charCode = event.keyCode;
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  validationCheck() {
    if (this.store_detail_mgmt.value.phone.length < 10) {
      this.error = true
    } else {
      this.error = false
    }
  }

}
