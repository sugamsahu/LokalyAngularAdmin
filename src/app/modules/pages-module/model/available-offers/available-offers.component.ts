import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { OfferDetailComponent } from "../offer-detail/offer-detail.component";
import * as $ from "jquery";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-available-offers",
  templateUrl: "./available-offers.component.html",
  styleUrls: ["./available-offers.component.scss"],
})
export class AvailableOffersComponent implements OnInit {
  @Input() offerList: any;
  @Input() pos: boolean = false;
  @Output() offerCode: EventEmitter<any> = new EventEmitter();
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_available_offer:any;


  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void { 
    this.style_obj_available_offer = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    $(
      "<style>.modal-content{ overflow-y: auto; max-height: 550px;}</style>"
    ).appendTo("body");
  }

  openOfferDetailsModel(offer) {
    const modalRef = this.modalService.open(OfferDetailComponent, {
      size: "lg",
      centered: true,
    });

    modalRef.componentInstance.OfferDetail = offer;
    modalRef.componentInstance.pos = this.pos;
  }

  applyOfferCode(offerCode) {
    this.offerCode.emit(offerCode);
    this.activeModal.dismiss();
  }

  copyOfferCode(discount) {
    navigator.clipboard.writeText(discount);
    this.toastr.success(this.translate.instant("COPY_SUCCESSFUL"));
  }

  closeOfferList() {
    this.activeModal.dismiss();
  }

  ngOnDestroy(): void {
    $(
      "<style>.modal-content{ overflow: hidden; max-height: 550px;}</style>"
    ).appendTo("body");

  }
}
