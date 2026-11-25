import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as $ from "jquery";
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-repeat-addon-choice',
  templateUrl: './repeat-addon-choice.component.html',
  styleUrls: ['./repeat-addon-choice.component.scss']
})
export class RepeatAddonChoiceComponent implements OnInit {

  @Input() last_used_addon_choice: any;
  @Output() repeatOrAdd: EventEmitter<any> = new EventEmitter();
  generalSetting: any = JSON.parse(localStorage.getItem('LoggedUserSettings'));
  global_currency: any = this.generalSetting.currency_symbol;
  style_obj_repeat_addon_choice: any;
  amount_seperator = this.generalSetting.amount_seperator;
  show_price_same_font = this.generalSetting.show_price_same_font;
  constructor(
    public activeModal: NgbActiveModal,
    public commonService: CommonService,

  ) { }

  ngOnInit(): void {
    this.last_used_addon_choice.price = Number(this.last_used_addon_choice.price).toFixed(2)
    this.style_obj_repeat_addon_choice = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    $(
      "<style>.modal-content{ overflow: hidden; max-height: 550px;}</style>"
    ).appendTo("body");
  }

  addNewAddOnChoice() {
    this.repeatOrAdd.emit(1);
    this.activeModal.dismiss();
  }

  repeatAddOnChoice(last_used_addon_choice) {
    this.repeatOrAdd.emit(last_used_addon_choice);
    this.activeModal.dismiss();
  }

  priceFormatter(value: any) {
    if (value) {
      var price = value.toString().split(".")[0];
      var decimal = value.toString().split(".")[1];
      if (this.show_price_same_font == 1) {
        return this.global_currency + price + this.amount_seperator + decimal;
      } else {
        return this.global_currency + price + "<span class='price-decimal'><small>" + this.amount_seperator + decimal + "</small></span>";
      }
    } else {
      return '0';
    }
  }
}
