import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/services/common.service';
import { SubscriptionReportService } from 'src/app/services/report/subscription-report.service';

@Component({
  selector: 'app-subscription-settlement',
  templateUrl: './subscription-settlement.component.html',
  styleUrls: ['./subscription-settlement.component.scss'],
})
export class SubscriptionSettlementComponent implements OnInit {

  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  subscriptionDetails: any = [];
  global_currency = this.generalSetting.currency_symbol;
  khata_label = this.generalSetting.khata_label; 
  style_obj_subscription_settlement: any; 
  show_price_same_font = this.generalSetting.show_price_same_font;
  amount_seperator = this.generalSetting?.amount_seperator;
  @Input() receivedData: any;

  constructor(
    public activeModal: NgbActiveModal,
    public subscriptionService: SubscriptionReportService,
    public toastr: ToastrService,
    public commonService : CommonService,
  ) { }

  ngOnInit(): void {
    this.style_obj_subscription_settlement = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    $(
      "<style>button.accordion-button.ng-star-inserted { background-color: " +
        this.generalSetting.css_button_business_default +
        " !important;border-color: " +
        this.generalSetting.css_button_business_default +
        " !important; }</style>"
    ).appendTo("body");
    this.getSubscriptionDetails()
  }

  getSubscriptionDetails(){
    const data = {
      store_id: this.receivedData.store_id
    }

    this.subscriptionService.viewSubscriptionDetails(data).subscribe({
      next: (response: any) => {
        if(response.status == 1){
          this.subscriptionDetails =  response.data;
        }else{
          this.toastr.error(response.message);
        }
      },
      error: (err) => {},
      complete: () => {}
    })
  }

}
