import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss']
})
export class OfferDetailComponent implements OnInit {

  @Input() OfferDetail: any;
  @Input() pos: boolean = false;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_offer_detail:any;

  constructor(
    public activeModal: NgbActiveModal ,
    private toastr: ToastrService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.style_obj_offer_detail = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    // $(
    //   "<style>.modal-content{ overflow-y: auto; max-height: 550px;}</style>"
    // ).appendTo("body");
  }

  copyOfferCode(offerCode) {
    navigator.clipboard.writeText(offerCode);
    this.toastr.success(this.translate.instant('COPY_SUCCESSFUL'))
  }

}
