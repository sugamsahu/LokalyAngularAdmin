import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonService } from "src/app/services/common.service";

@Component({
  selector: "app-select-addon-choices",
  templateUrl: "./select-addon-choices.component.html",
  styleUrls: ["./select-addon-choices.component.scss"],
})
export class SelectAddonChoicesComponent implements OnInit {
  @Input() SelectedItems: any;
  @Output() SelectedAddonChoicesItem: EventEmitter<any> = new EventEmitter();
  @Input() picker;
  generalSetting: any = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  global_currency: any = this.generalSetting.currency_symbol;
  style_obj_select_addon_choices: any;
  amount_seperator = this.generalSetting.amount_seperator;
  show_price_same_font = this.generalSetting.show_price_same_font;
  constructor(
    public activeModal: NgbActiveModal,
    public commonService: CommonService,
    ) { }
  ngOnInit(): void {
    this.style_obj_select_addon_choices = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  updateChoiceSelection(position, choices, event) {
    var flag = false;

    choices.forEach((subscription, index) => {
      if (position != index) {
        if (subscription.is_added == true) {
          this.SelectedItems.total_Price = Number(
            Number(this.SelectedItems.total_Price) - Number(subscription.price)
          ).toFixed(2);
        }
        subscription.is_added = false;
      } else {
        flag = true;
        if (event.currentTarget.checked == false) {
          subscription.is_added = true;
        }
        if (event.currentTarget.checked == true) {
          this.SelectedItems.total_Price = Number(
            Number(this.SelectedItems.total_Price) + Number(subscription.price)
          ).toFixed(2);
        }
      }
    });
  }

  updateAddonSelection(position, addOns) {
    addOns.forEach((subscription, index) => {
      if (position == index) {
        if (subscription.is_added == false) {
          this.SelectedItems.total_Price = Number(
            Number(this.SelectedItems.total_Price) + Number(subscription.price)
          ).toFixed(2);
        } else {
          this.SelectedItems.total_Price = Number(
            Number(this.SelectedItems.total_Price) - Number(subscription.price)
          ).toFixed(2);
        }
      }
    });
  }

  Add() {
    this.SelectedAddonChoicesItem.emit(this.SelectedItems);
    this.activeModal.dismiss();
  }
}
