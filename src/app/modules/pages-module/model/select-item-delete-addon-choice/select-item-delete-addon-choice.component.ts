import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-select-item-delete-addon-choice',
  templateUrl: './select-item-delete-addon-choice.component.html',
  styleUrls: ['./select-item-delete-addon-choice.component.scss']
})
export class SelectItemDeleteAddonChoiceComponent implements OnInit {

  @Input() selectedItemAddonChoicesLst: any;

  @Output() receivedItemToDelete: EventEmitter<any> = new EventEmitter()
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  global_currency = this.generalSetting.currency_symbol;
  style_obj_select_item_delete_addon_choice: any;
  amount_seperator = this.generalSetting.amount_seperator;
  show_price_same_font = this.generalSetting.show_price_same_font;
  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.style_obj_select_item_delete_addon_choice = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    $(
      "<style>.modal-content{ overflow: auto; max-height: 550px;}</style>"
    ).appendTo("body");
  }

  deleteAddOnChoices(select, i) {
    select.index = i;
    this.activeModal.dismiss()
    this.receivedItemToDelete.emit(select);
  }

  closeDeleteAddOn() {
    this.activeModal.dismiss();
  }

  getselectedSubChoice = function (ch2) {
    var choices = ch2.choice_prices.filter(function (ch) {
      return ch.is_added == 1;
    });
    if (choices.length > 0) {
      return choices[0].variant_sub_choice_name;
    }
    return "";
  }
  
  ngOnDestroy(): void {
    $(
      "<style>.modal-content{ overflow: hidden; max-height: 550px;}</style>"
    ).appendTo("body");
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
