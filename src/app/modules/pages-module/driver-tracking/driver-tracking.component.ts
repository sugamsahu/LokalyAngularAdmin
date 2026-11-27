import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { GoogleMapsLoader } from 'src/app/services/google-maps-loader.service';
import { MarkerMap } from 'src/app/utils/marker-map';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { OrderService } from 'src/app/services/order.service';
import { HelpInfoModelComponent } from '../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'src/app/services/custom/spinner.service';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-driver-tracking',
  templateUrl: './driver-tracking.component.html',
  styleUrls: ['./driver-tracking.component.scss']
})
export class DriverTrackingComponent implements OnInit {
  @ViewChild("scrollToOrder") private myScrollGroup: ElementRef;
  deliveryboy_label: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  zoom: number = 12;
  lng: any;
  lat: any;
  mapLink: string;
  deliveryboy_list: any;
  deliveryboy_order_list: any;
  selected_driver: any;
  deliveryboy_order_details: any;
  location_addresses: any = [];
  main: any;
  sessionConfig = this.appComponent.sessionConfig();
  session = this.appComponent.sessionConfig();
  selected_active_store: number = 0;
  map_center_latitude: number;
  map_center_longitude: number;
  selected_location_name: any;
  seller_details = JSON.parse(localStorage.getItem("loginUserStore"));
  count: any;
  driver_tracking_status: any;
  customer_marker: google.maps.Marker;
  map: any;
  driver_marker: google.maps.Marker;
  line: any;
  live_tracking: number;
  language_id = localStorage.getItem("select_lan_id") || "1";
  helpDetails: any;
  deliveryboy_name: any;
  elem;
  screenfull: boolean = true;

  // Map (@angular/google-maps). The map is created once index.html's Maps API is ready.
  mapsReady = false;
  @ViewChild(GoogleMap) driverMap: GoogleMap;
  @ViewChild(MapInfoWindow) driverInfoWindow: MapInfoWindow;
  @ViewChildren(MapMarker) driverMapMarkers: QueryList<MapMarker>;
  driverMarkers = new MarkerMap<any>(
    (d) => ({ lat: d.latitude, lng: d.longitude }),
    (d) => this.map_center_longitude == d.longitude ? "assets/icons/location_default2.svg" : "assets/icons/location_default1.svg",
  );
  private driverMapCenterCache: google.maps.LatLngLiteral;
  get driverMapCenter(): google.maps.LatLngLiteral {
    const lat = this.map_center_latitude == null ? 23.0225 : Number(this.map_center_latitude);
    const lng = this.map_center_longitude == null ? 72.5714 : Number(this.map_center_longitude);
    if (!this.driverMapCenterCache || this.driverMapCenterCache.lat !== lat || this.driverMapCenterCache.lng !== lng) {
      this.driverMapCenterCache = { lat, lng };
    }
    return this.driverMapCenterCache;
  }
  onDriverMapReady(map: google.maps.Map) {
    this.onMapReady(map);
    this.driverMarkers.fit(this.driverMap, this.location_addresses);
    this.driverMarkers.open(this.driverInfoWindow, this.driverMapMarkers, this.selected_active_store);
  }

  constructor(
    private mapsLoader: GoogleMapsLoader,
    private orderService: OrderService,
    private cryptoService: CryptoService,
    private appComponent: AppComponent,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fireStore: AngularFirestore,
    private _helpService: BannerService,
    private modalService: NgbModal,
    public spinner: SpinnerService,
    public translate: TranslateService,
    @Inject(DOCUMENT) private document: any,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.main = this.appComponent.main;
  }

  ngOnInit(): void {
    this.mapsLoader.load().then(() => { this.mapsReady = true; this.cdr.detectChanges(); }).catch(() => { });
    if (!this.generalSetting.livetracking) {
      this.router.navigate(['/dashboard']);
      return;
    }
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    if (window.innerWidth > 700) {
      var sidebarOpen: any = true;
      sidebarOpen = localStorage.getItem('sidebarOpen');
      if (sidebarOpen == "true") {
        $('.navbar-toggler').click();
      }
    }
    this.deliveryboy_label = this.generalSetting.deliveryboy_label;
    this.generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
    this.live_tracking = parseFloat(this.generalSetting.livetracking);
    this.getHelpDetails();
    this.getDeliveryBoyList();
    this.elem = document.documentElement;
  }

  onMapReady(map?: any) {
    this.map = map;
  }

  getDeliveryBoyList() {
    var data = {
      store_id: this.sellerDetails.store_id,
    };
    this.orderService.getDeliveryBoyList(data).subscribe({
      next: (response: any) => {
        this.deliveryboy_list = response.data
        this.selected_driver = this.deliveryboy_list[0].user_id;
        this.getDeliveryBoyOrderList();
      },
    });
  }

  getDeliveryBoyOrderList() {
    this.spinner.show()
    this.driver_tracking_status = null
    this.count = 0
    var data = {
      store_id: this.sellerDetails.store_id,
      role_id: 3,
      user_id: this.selected_driver,
    };
    this.orderService.getDeliveryBoyOrderList(data).subscribe({
      next: (response: any) => {
        this.spinner.hide()
        this.location_addresses = [];
        this.deliveryboy_order_list = response.data;
        this.count = response.count;
        this.deliveryboy_order_details = this.deliveryboy_order_list.filter((x: any) => (x.deliveryboy_id == this.selected_driver) && x.order_status == 4);
        this.deliveryboy_order_details.forEach((item: any) => {
          let marker = {
            latitude: parseFloat(item.to_latitude ? item.to_latitude : '23.0225'),
            longitude: parseFloat(item.to_longitude ? item.to_longitude : '72.5714'),
            draggable: false,
            order_no: item.order_no,
            name: item.name,
            order_id: item.order_id,
          };
          this.location_addresses.push(marker)
          this.deliveryboy_name = item.deliveryboy_name
          if (this.location_addresses != null && this.location_addresses != undefined) {
            this.selected_location_name = this.location_addresses[0].label;
            this.map_center_latitude = this.location_addresses[0].latitude;
            this.map_center_longitude = this.location_addresses[0].longitude;
          }
        })
        // Fit the map to the new markers once they have rendered (AGM did this automatically).
        setTimeout(() => {
          this.driverMarkers.fit(this.driverMap, this.location_addresses);
          this.driverMarkers.open(this.driverInfoWindow, this.driverMapMarkers, this.selected_active_store);
        });
        this.liveTrackingUpdate(this.deliveryboy_order_details[this.selected_active_store])
      },
      error(err) {
        this.spinner.hide()
      },
    });
  }

  getLiveTrackingUpdate(data: any): Observable<any> {
    return new Observable(observer => {
      this.fireStore.collection<any>('LiveTrackingCollection').snapshotChanges()
        .subscribe((doc: any) => {
          doc.forEach((change: any) => {
            if (data.order_id == change.payload.doc.id) {
              const data = change.payload.doc.data() as any;
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

  liveTrackingUpdate(order: any) {
    this.getLiveTrackingUpdate(order).subscribe({
      next: (res: any) => {
        this.driver_tracking_status = res;
        this.mockDirections();
      },
      error: (err) => {
      },
    })
  }

  mockDirections() {
    const driver = new google.maps.LatLng(Number(this.driver_tracking_status?.latitude), Number(this.driver_tracking_status?.longitude)); //driver Location
    if (this.sellerDetails.live_tracking == 1 && this.live_tracking == 1) {
      const driverIcon = {
        url: 'assets/icons/ic_map_driver.png', // Set the URL of your driver icon
        scaledSize: new google.maps.Size(35, 35), // Adjust the size as needed
      };
      this.driver_marker = new google.maps.Marker({
        position: driver,
        map: this.map,
        icon: driverIcon,
        title: this.deliveryboy_name,
      });
      if (this.driver_marker) {
        this.lat = this.driver_tracking_status?.latitude;
        this.lng = this.driver_tracking_status?.longitude;
        this.zoom = 12;
      }
    }
  }

  orderLocationClick(googleMap?: any) {
    if (this.generalSetting.use_google_map == 1) {
      this.mapLink =
        'https://www.google.com/maps/search/?api=1&query=' +
        googleMap?.latitude +
        ',' +
        googleMap?.longitude;
    }
  }

  editCustomer(cid, customerUserId) {
    this.cryptoService.encryptIdValue(
      cid.toString(),
      "customer_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    this.cryptoService.encryptIdValue(
      customerUserId?.toString(),
      "customer_User_Id" + this.main.LoggedUserInfo.role_id.toString(),
      this.main.CryptoKey
    );
    window.open('/manage-customer/edit', "_blank");
  }

  chatSupport(orderId) {
    this.sessionConfig.encryptIdValue(
      orderId.toString(),
      "ProcessOrderOrderId" + this.seller_details.store_id.toString(),
      this.main.CryptoKey
    );
    window.open('/chat-support', "_blank");
  }

  editOrderDetail(orderId) {
    this.sessionConfig.encryptIdValue(
      orderId.toString(),
      "order_id" + this.seller_details?.store_id.toString(),
      this.main.CryptoKey
    );
    window.open('/order/selller-process-order', "_blank");
  }

  focusStore(driver: any, index: any, mapValue: boolean) {
    if (this.location_addresses != null && this.location_addresses != undefined) {
      this.selected_location_name = this.location_addresses[index].label;
      this.map_center_latitude = parseFloat(this.location_addresses[index].latitude);
      this.map_center_longitude = parseFloat(this.location_addresses[index].longitude);
      this.selected_active_store = index;
      this.driverMarkers.open(this.driverInfoWindow, this.driverMapMarkers, index);
      if (mapValue)
        setTimeout(() => { this.scrollToElement() }, 1000);
    }
    this.cdr.detectChanges();
  }

  scrollToElement() {
    const element = this.myScrollGroup.nativeElement.querySelector('.active-shop');
    this.myScrollGroup.nativeElement.scrollTop = 0;
    if (element) {
      var headerOffset = 220;
      var elementPosition = element.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      try {
        this.myScrollGroup.nativeElement.scrollTop = offsetPosition;
        this.cdr.detectChanges();
      } catch (err) { }
    }
  }

  getInitials(name) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 35;
    canvas.height = 35;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    context.fillStyle = "#476ce8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "16px Arial";
    context.fillStyle = "#FFFFFF";
    var nameArray = name?.split(" ");
    var initials = "";
    initials = initials + nameArray[0][0];
    initials = initials == "undefined" ? "U" : initials;
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 13, 22);
    } else {
      context.fillText(initials.toUpperCase(), 13, 22);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '143'
    }
    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });
  }

  fullScreen() {
    this.screenfull = false;
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }

  exitFullScreen() {
    this.screenfull = true;
    if (document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
  }
}