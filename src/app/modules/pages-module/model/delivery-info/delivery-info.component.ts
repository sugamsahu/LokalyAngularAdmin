import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";


@Component({
  selector: "app-delivery-info",
  templateUrl: "./delivery-info.component.html",
  styleUrls: ["./delivery-info.component.scss"],
})
export class DeliveryInfoModelComponent implements OnInit {
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  closeResult = '';
  style_obj_delivery_info:any;
  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    public translate: TranslateService,
  ) { 
    this.translate.addLangs(["it","en","de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan")||'en');    
  }

  ngOnInit(): void {
    this.style_obj_delivery_info = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }

  }

}
