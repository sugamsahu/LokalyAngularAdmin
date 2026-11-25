import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "src/environments/environment";
@Component({
  selector: "app-proof-of-delivery-list",
  templateUrl: "./proof-of-delivery-list.component.html",
  styleUrls: ["./proof-of-delivery-list.component.scss"],
})
export class proofOfDeliveryListComponent implements OnInit {
  page: number = 1;
  count: number = 0;
  tableSize = environment.tableSize;
  no_data = true;
  orderdetail:any
  @Input() details: any;
  @Input() fromDate: any;
  @Input() toDate: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_proof_of_delivery: any;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
  ) {
    translate.addLangs(["en"]);
    translate.setDefaultLang("en");
  }

  ngOnInit(): void {
    this.style_obj_proof_of_delivery = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    console.log(this.page);
    if(this.orderdetail.pod_images){
      this.no_data = false;
    }
  }

 getImageName(url){
    return url.substring(url.lastIndexOf('/') + 1);
}

openimage(url) {
  window.open(url, '_blank');
}
  
}
