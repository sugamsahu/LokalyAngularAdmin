import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import {
  NgbActiveModal,
  NgbModal,
} from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { OrderRefundDetailsComponent } from "../order-refund-details/order-refund-details.component";
import { proofOfDeliveryListComponent } from "../proof-of-delivery-list/proof-of-delivery-list.component";
import { Router } from "@angular/router";
import { TooltipComponent } from "@angular/material/tooltip";
import { CommonService } from "src/app/services/common.service";
import { UserRoles } from "src/app/enums/user-roles";
import { Observable } from 'rxjs';
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { ToastrService } from "ngx-toastr";
declare var google: any;

@Component({
  selector: "app-order-details",
  templateUrl: "./order-details.component.html",
  styleUrls: ["./order-details.component.scss"],
})
export class OrderDetailsModalComponent implements OnInit {
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  sellerDetails:any = {};
  global_currency = this.generalSetting.currency_symbol;
  delivery_model = this.PlatformSetting.delivery_model;
  refund_module = this.generalSetting.refund_module;
  business_model = this.PlatformSetting.business_model;
  subscription_model = this.PlatformSetting.subscription_model;
  add_refund_module = false;
  view_refund_module: any;
  viewOrder: any;
  taxAndChargesTotalToolTip
  show_customer_details_to_store =
    this.generalSetting.show_customer_details_to_store == "1" ? true : false;
  @Input() orderdetail: any;
  @Input() main: any;
  @Input() session: any;
  @Input() forReport
  @Input() okButton
  closeResult = "";
  show_price_same_font = this.generalSetting.show_price_same_font;
  amount_seperator = this.generalSetting?.amount_seperator;
  orderitemdetail: any = [];
  printCurrantDateTime: Date;
  viewRefundDetail: any;
  showMoreStoreReview = false;
  isShowMoreRevOrder = false;
  openProcessOrder = false;
  show_rating_different_color_code: any;
  style_obj_order_details: any;
  map: any;
  // orderdetail:any;
  zoom: number = 20;
  lat: any;
  lng: any;
  store_marker: any;
  customer_marker: any;
  line: any;
  driver_marker: any;
  live_tracking: number;
  currLat: number;
  currLng: number;
  location_details: any;
  driver_tracking_status: any;
  defaultLocationLong: number;
  defaultLocationLat: number;
  deliveryboy_label: any;
  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    public translate: TranslateService,
    private modalService: NgbModal,
    private router: Router,
    public commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private fireStore: AngularFirestore
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  }
  checkAdminOrSuperAdmin(): boolean {
    return (this.main.LoggedUserInfo.role_id == UserRoles.Admin || this.main.LoggedUserInfo.role_id == UserRoles.SuperAdmin) ? false : true
  }
  ngOnInit(): void {
    this.live_tracking = parseFloat(this.generalSetting.livetracking);
    this.deliveryboy_label = this.generalSetting.deliveryboy_label;
    this.liveTrackingUpdate();
    this.defaultLocationLat = parseFloat(this.generalSetting?.default_location_lat);
    this.defaultLocationLong = parseFloat(this.generalSetting?.default_location_long);
    this.style_obj_order_details = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font,
      "--default_rating_color_code_text": this.generalSetting.default_rating_color_code_text,
      "--default_rating_color_code_bg": this.generalSetting.default_rating_color_code_bg,
      "--alternate_color_code_text": this.generalSetting.alternate_color_code_text,
      "--alternate_color_code_bg": this.generalSetting.alternate_color_code_bg
    }
    Object.defineProperty(TooltipComponent.prototype, 'message', {
      set(v: any) {
        const el = document.querySelectorAll('.mat-tooltip');

        if (el) {
          el[el.length - 1].innerHTML = v;
        }
      },
    });
    this.show_rating_different_color_code =
      this.generalSetting.show_rating_different_color_code;
    if (Number(this.refund_module) != 0) {
      if (
        this.main.LoggedUserInfo.role_id == 6 ||
        this.main.LoggedUserInfo.role_id == 1
      ) {
        this.refund_module =
          (this.subscription_model == 2 || this.subscription_model == 3) &&
            this.business_model == 1 &&
            this.main.LoggedUserInfo.role_id == 6
            ? true
            : (this.subscription_model == 2 || this.subscription_model == 3) &&
              (this.business_model == 2 || this.business_model == 3) &&
              this.main.LoggedUserInfo.role_id == 1
              ? true
              : false;
        this.add_refund_module = true;
      } else {
        this.add_refund_module = this.subscription_model == 1 ? true : false;
        this.view_refund_module = this.subscription_model != 1 ? true : false;
      }
    }
    if (this.sellerDetails) {
      this.sellerDetails.fullAddress = [
        this.sellerDetails.address1,
        this.sellerDetails.address2,
        this.sellerDetails.area_name,
        this.sellerDetails.city_name,
        this.sellerDetails.state_name,
        this.sellerDetails.country_name,
      ]
        .filter(Boolean)
        .join(", ");
    }

    if (this.forReport != 1) {
      if (this.sellerDetails=="") {
        this.sellerDetails = {};
      }
      console.log(typeof this.sellerDetails)
      console.log(this.sellerDetails)
      this.sellerDetails.fullAddress = [
        this.orderdetail.store.store_address,
        this.orderdetail.store.store_address2,
        this.orderdetail.store.area_name,
        this.orderdetail.store.city_name,
        this.orderdetail.store.state_name,
        this.orderdetail.store.zipcode,
        this.orderdetail.store.country_name,
      ]
        .filter(Boolean)
        .join(", ");
    }
    var itemdetails = [];
    this.orderdetail.items.forEach((Item: any) => {
      Item.item_variants.forEach((variant: any) => {
        if (variant.is_added == 1) {
          var item_data: any = {
            item_name: Item.item_name,
            location: Item.location,
            item_remark: variant.item_remark,
            brand_name: Item.brand_name,
            packaging_name: variant.packaging_name,
            unit_name: variant.unit_name,
            quantity: variant.quantity,
            picker_quantity: variant.picker_quantity,
            item_pickup_status: variant.item_pickup_status,
            is_picker_add: variant.is_picker_add,
            referance_item_id: variant.referance_item_id,
            unit_quantity: variant.unit_quantity,
            discounted_price: variant.discounted_price,
            item_price: variant.item_price,
            packaging: variant.packaging,
            category_name: Item.category_name,
            sub_category_name: Item.sub_category_name,
            display_id: Item.display_id,
          };
          if (variant.choices_addons != null) {
            item_data.choices_addons = variant.choices_addons;
          } else {
            item_data.choices_addons = null;
          }

          var choices_addons = [];
          if (Item.combo_variants != null) {
            item_data.combo_variants = Item.combo_variants;
            if (item_data.combo_variants) {
              item_data.combo_variants.forEach((combo: any) => {
                choices_addons = [];
                if (combo.choices) {
                  combo.choices.forEach((choice: any) => {
                    choice.choice_prices.forEach((choicePrice: any) => {
                      if (choicePrice.is_added == true) {
                        choices_addons.push(
                          choice.variant_choice_name +
                          " : " +
                          choicePrice.variant_sub_choice_name
                        );
                      }
                    });
                  });
                }
                if (combo.addons) {
                  combo.addons.forEach((addon: any) => {
                    var addonName = "";
                    addon.addon_prices.forEach((addonsPrice) => {
                      if (addonsPrice.is_added == true) {
                        addonName =
                          addonName == ""
                            ? addonsPrice.variant_sub_addon_name
                            : addonName +
                            ", " +
                            addonsPrice.variant_sub_addon_name;
                      }
                    });
                    if (addonName != "") {
                      choices_addons.push(
                        addon.variant_addon_name + " : " + addonName
                      );
                    }
                  });
                }
                combo.choices_addons = choices_addons;
              });
            }
          }

          itemdetails.push(item_data);
        }
      });
    });
    this.orderdetail.order_review?.reviewed_items?.forEach(element => {
      element.show_more = false
    });

    this.orderitemdetail = itemdetails;
  }

  isShowMore(item) {
    item.show_more = item.show_more == true ? false : true
  }

  isShowMoreRevStore(item) {
    if (item == 'store') {
      this.showMoreStoreReview = this.showMoreStoreReview == true ? false : true
    }

    if (item == 'order') {
      this.isShowMoreRevOrder = this.isShowMoreRevOrder == true ? false : true
    }
  }

  PrintDIV(divId: any) {
    this.printCurrantDateTime = new Date();
    var contents = document.getElementById(divId).innerHTML;
    var body = document.getElementsByTagName("BODY")[0];

    //Create a dynamic IFRAME.
    var frame1: any = document.createElement("IFRAME");
    frame1.name = "frame1";
    frame1.setAttribute("style", "position:absolute;top:-1000000px");
    body.appendChild(frame1);

    //Create a Frame Document.
    var frameDoc = frame1.contentWindow
      ? frame1.contentWindow
      : frame1.contentDocument.document
        ? frame1.contentDocument.document
        : frame1.contentDocument;
    frameDoc.document.open();

    //Create a new HTML document.
    frameDoc.document.write("<html><head><title></title>");
    frameDoc.document.write("</head><body>");
    frameDoc.document.write(
      "<style>.profile-media {display: -ms-flexbox;display: flex;-ms-flex-align: start;align-items: flex-start;}.profile-body {-ms-flex: 1;flex: 1;padding-left: 15px;border-left: 1px solid #ddd;}.profile-media .profile-box {width: 90px;height: 90px;overflow: hidden;border-radius: 50%;margin-right: 15px;}.prcess-circle {width: 120px;height: 120px;display: inline-block;border: 2px solid #e0e0e0;border-radius: 50%;background-color: #ffffff;}.profile-media .profile-box img {width: 100%;}.profile-media .dt-row {margin-bottom: 10px;}.account-process {text-align: center;width: 100%;}.prcess-circle .title-box {margin-top: 22px;margin-left: auto;margin-right: auto;width: 90px;text-align: center;font-size: 14px;line-height: 18px}.prcess-circle .profile-box img {width: 100%;}.orderDetail {padding: 15px 0;}.orderDetail .control-label {margin: 0;}.modal-content tr:nth-child(even) {background: #CCC}.modal-content tr:nth-child(odd) {background: #FFF}.schaduleDiv{background-color:#24c9fcc7;padding: 10px 10px;margin-left: 12px;margin-top: 10px;}.table{border-collapse: inherit;} ul { padding-left: 0rem !important; list-style: none; }</style>"
    );
    frameDoc.document.write(
      "<style>@media print{.col-md-6{width:50%; float:left;} .col-sm-4 {width: 33.33333333%;float:left;} .col-md-8 {width: 66.66666667%;} .form-group label {margin-bottom: 5px;color: #666666;font-weight: 400;font-size: 13px; th {background-color: #d8d4d4;font-size: 13px; }}}.table > tbody > tr > td{font-size: 13px;} ul { padding-left: 0rem !important; list-style: none; }</style>"
    );
    if (divId == "PrintPackSlip") {
      frameDoc.document.write("<style>@page{size:Statement;}</style>");
    } else {
      frameDoc.document.write("<style>@page{size:A4;}</style>");
    }

    //Append the external CSS file.
    frameDoc.document.write(
      '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">'
    );

    //Append the DIV contents.
    frameDoc.document.write(contents);
    frameDoc.document.write("</body></html>");
    frameDoc.document.close();

    window.setTimeout(function () {
      window.frames["frame1"].focus();
      window.frames["frame1"].print();
      body.removeChild(frame1);
    }, 1000);
  }

  viewProofOfDeliveryImageList() {
    const modalRef = this.modalService.open(proofOfDeliveryListComponent, {
      size: "lg",
    });
    modalRef.componentInstance.orderdetail = this.orderdetail;
  }

  viewRefund(item: any) {
    this.viewRefundDetail = item;
    this.viewRefundDetail.add_refund_module = this.add_refund_module;
    const modalRef = this.modalService.open(OrderRefundDetailsComponent, {
      size: "lg",
      centered: true,
    });

    modalRef.componentInstance.viewRefundDetail = this.viewRefundDetail;
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.session = this.session;
  }

  editOrderDetail(orderId) {
    this.session.encryptIdValue(
      orderId.toString(),
      "order_id" + this.orderdetail.store.store_id.toString(),
      this.main.CryptoKey
    );
    if (this.router.url == "/manage-customer") {
      window.open("/order/selller-process-order", "_blank");
    } else {
      this.router.navigate(["/order/selller-process-order"]);
      this.modal.dismiss();
    }
  }

  ratingCondition(discountPrice, price) {

    if (Number(discountPrice) <= Number(price)) {
      return true;
    }
    else {
      return false;
    }
  }

  dismiss() {
    this.modal.close();
  }

  getLiveTrackingUpdate(data: any): Observable<any> {
    return new Observable(observer => {
      this.fireStore.collection<any>('LiveTrackingCollection').snapshotChanges()
        .subscribe((doc: any) => {
          doc.forEach((change: any) => {
            if (data.order_id == change.payload.doc.id) {
              const data = change.payload.doc.data() as any;
              console.log(data);

              if (data) {
                observer.next(data);
              } else {
                observer.next(false);
              }
            }
          })
        })
    });
  }

  liveTrackingUpdate() {
    this.getLiveTrackingUpdate(this.orderdetail).subscribe((groupData) => {
      this.driver_tracking_status = groupData;
      this.mockDirections()
    });
  }

  onMapReady(map?: any) {
    this.map = map;
    this.mockDirections();
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.currLat = position.coords.latitude;
        this.currLng = position.coords.longitude;

      });
    }
    else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  /**
   * To connect the customer to store location 
   */
  async mockDirections() {
    var is_allow_map: any = true;
    var last_lang: any;
    var last_long: any;
    try {
      const PermissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      if (PermissionStatus.state == 'granted') {
        last_lang = this.currLat // pickup lat
        last_long = this.currLng //  pickup long
      } else if (PermissionStatus.state == 'prompt') {
      } else {
        is_allow_map = false;
        last_lang = this.defaultLocationLat; //default_location_lat
        last_long = this.defaultLocationLong; //default_location_long
      }

      this.cdr.detectChanges();
      await this.setMap(last_lang, last_long);
    } catch (error) {
    }
  }

  setMap(last_lang: any, last_long: any) {
    if (this.orderdetail?.delivery_type == 1 || this.orderdetail?.delivery_type == 4) {
      const start = new google.maps.LatLng(Number(this.orderdetail.to_latitude), Number(this.orderdetail.to_longitude)); //Customer Location
      const end = new google.maps.LatLng(Number(this.orderdetail.from_latitude), Number(this.orderdetail.from_longitude)); // store location
      const driver = new google.maps.LatLng(Number(this.driver_tracking_status?.latitude), Number(this.driver_tracking_status?.longitude)); //driver lat-long
      this.store_marker = new google.maps.Marker({
        position: end,
        map: this.map,
        icon: {
          url: 'assets/icons/ic_map_store.svg', // set the store icon
          scaledSize: new google.maps.Size(35, 35)
        }
      });
      this.customer_marker = new google.maps.Marker({
        position: start,
        map: this.map,
        icon: {
          url: 'assets/icons/ic_map_home.png', // set the customer icon
          scaledSize: new google.maps.Size(35, 35)
        }
      });
      if (this.orderdetail.order_status != 7 && this.orderdetail?.store?.live_tracking == 1 && this.live_tracking == 1 && this.orderdetail.deliveryboy_id != 0) {
        if (this.driver_marker) {
          this.driver_marker.setMap(null)
        }
        const driverIcon = {
          url: 'assets/icons/ic_map_driver.png', // Set the URL of your driver icon
          scaledSize: new google.maps.Size(35, 35), // Adjust the size as needed
        };
        this.driver_marker = new google.maps.Marker({
          position: driver,
          map: this.map,
          icon: driverIcon,
        });

        if (this.driver_marker) {
          if (this.driver_tracking_status) {
            this.lat = driver.lat();
            this.lng = driver.lng();
            this.zoom = 19;
            new google.maps.Map({
              zoom: 19,
            });
          } else {
            Number(this.orderdetail.to_latitude)
            this.lat = Number(this.orderdetail.to_latitude)
            this.lng = Number(this.orderdetail.to_longitude)
            this.zoom = 19;
            new google.maps.Map({
              zoom: 19,
            });
          }

        }
      }
      if (this.orderdetail.deliveryboy_id == 0 || this.orderdetail.order_status == 7) {
        if (this.line) {
          this.line.setMap(null)
        }
        const lineCoordinates = [start, end];
        this.line = new google.maps.Polyline({
          path: lineCoordinates,
          geodesic: true,
          strokeColor: this.generalSetting.css_button_customer_default,
          strokeOpacity: 1.0,
          strokeWeight: 4,
        });
        this.line.setMap(this.map);
        var bound = new google.maps.LatLngBounds()
        bound.extend(this.store_marker.getPosition())
        bound.extend(this.customer_marker.getPosition())
        this.map.fitBounds(bound)
        this.map.setCenter(bound.getCenter());
      } else {
        if (this.line) {
          this.line.setMap(null)
        }
        const lineCoordinates = [driver, start];
        this.line = new google.maps.Polyline({
          path: lineCoordinates,
          geodesic: true,
          strokeColor: "",
          strokeOpacity: 1.0,
          strokeWeight: 0,
        });
        this.lat = Number(this.driver_tracking_status?.latitude)
        this.lng = Number(this.driver_tracking_status?.longitude)
        this.line.setMap(this.map);
        var bound = new google.maps.LatLngBounds()
        bound.extend(this.driver_marker.getPosition())
        bound.extend(this.customer_marker.getPosition())
        this.map.fitBounds(bound)
        this.map.setCenter(bound.getCenter());
      }
    }

    if (this.orderdetail?.delivery_type == 2) {
      const start = new google.maps.LatLng(Number(last_lang), Number(last_long)); //customer location
      const end = new google.maps.LatLng(Number(this.orderdetail.to_latitude), Number(this.orderdetail.to_longitude)); // store location
      this.store_marker = new google.maps.Marker({
        position: end,
        map: this.map,
        icon: {
          url: 'assets/icons/ic_map_store.svg',  // Replace with the correct path to your custom icon.
          scaledSize: new google.maps.Size(35, 35)  // Set your desired width and height.
        }
      });
      this.customer_marker = new google.maps.Marker({
        position: start,
        map: this.map,
        icon: {
          url: 'assets/icons/ic_map_home.png',  // Replace with the correct path to your custom icon.
          scaledSize: new google.maps.Size(35, 35)  // Set your desired width and height.
        }
      });

      const lineCoordinates = [start, end];
      const line = new google.maps.Polyline({
        path: lineCoordinates,
        geodesic: true,
        strokeColor: this.generalSetting.css_button_customer_default,
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });
      line.setMap(this.map);
      var bound = new google.maps.LatLngBounds()
      bound.extend(this.store_marker.getPosition())
      bound.extend(this.customer_marker.getPosition())
      this.map.fitBounds(bound)
      this.map.setCenter(bound.getCenter());
    }
  }
}
