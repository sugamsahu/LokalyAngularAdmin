import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-stock-unit-management-info',
  templateUrl: './stock-unit-management-info.component.html',
  styleUrls: ['./stock-unit-management-info.component.scss']
})
export class StockUnitManagementInfoComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_stock_unit_management_info:any;
  constructor( public activeModal: NgbActiveModal,
    public translate: TranslateService) {
    this.translate.addLangs(["it","en","de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan")||'en');
  }

  ngOnInit(): void {
    this.style_obj_stock_unit_management_info = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

}
