import {
  Component,
  OnInit,
  Output,
  EventEmitter,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { CryptoService } from "src/app/services/custom/crypto.service";


@Component({
  selector: "app-offer-add",
  templateUrl: "./offer-add.component.html",
  styleUrls: ["./offer-add.component.scss"],
})
export class offerAddComponent implements OnInit {
  @Output() offerAdd: EventEmitter<any> = new EventEmitter();
  offerdisplay = 1;
  offerId = 0;
  subofferId = 0;
  DefaultOfferType
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  offername: any;
  subofferdisplay: any[];
  suboffername: string;
  SubOfferTypes: any;
  isDeliveryModelPlatForm
  main: any;
  style_obj_offer_add: any;
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private toastr: ToastrService,
    private router: Router,
    private cryptoService: CryptoService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit() {
    // $(
    //   "<style>.modal-dialog { max-width: 1138px }</style>"
    // ).appendTo("body");
    this.style_obj_offer_add = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  selectOfferType(offerobj) {
    this.offerId = offerobj.default_offer_id;
    this.offername = offerobj.offer_name;
    this.loadSubOfferType(this.offerId);
  }

  nextAction() {
    if (this.offerId == 0) {
      this.toastr.error(this.translate.instant('SELECT_OFFER_TYPE'));
      return;
    }
    this.offerdisplay = 2;
  };

  loadSubOfferType(subid) {
    this.subofferdisplay = [];
    this.subofferId = 0;
    this.suboffername = '';
    this.SubOfferTypes.forEach(value => {

      if (value.parentId == subid) {
        if (value.parentId == 3) {
          if (this.isDeliveryModelPlatForm == false) {
            if (value.default_offer_id == 15) {

            }
            else {
              this.subofferdisplay.push(value);
            }
          }
          else {
            this.subofferdisplay.push(value);
          }
        }
        else {
          this.subofferdisplay.push(value);
        }
      }
    });
  }

  SelectSubOfferType(obj) {
    this.offerId = obj.parentId;
    this.subofferId = obj.default_offer_id;
    this.offername = obj.parentOfferName;
    this.suboffername = obj.offer_name;
  }

  setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  }

  createNewOffer() {
    if (this.subofferId != 0) {
      this.cryptoService.encryptIdValue(this.offerId.toString(), 'add_offerId' + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
      this.cryptoService.encryptIdValue(this.subofferId.toString(), 'add_subofferId' + this.main.LoggedUserInfo.role_id.toString(), this.main.CryptoKey);
      this.router.navigate(["/manage-offer/add/"]);
      this.activeModal.dismiss('Cross click')
      var offerdetail = { offer_name: this.offername, suboffer_name: this.suboffername };
      if (typeof (Storage) !== "undefined") {
        localStorage.setItem('offerdetail', JSON.stringify(offerdetail));
      } else {
        this.setCookie('offerdetail', offerdetail, 365);
      }
    }
    else {
      this.toastr.error(this.translate.instant('SELECT_SUBOFFER_TYPE'));
    }
  }

  backoffer() {
    this.offerdisplay = 1
  }

}
