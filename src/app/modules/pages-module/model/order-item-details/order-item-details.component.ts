import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as $ from "jquery";
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-order-item-details',
  templateUrl: './order-item-details.component.html',
  styleUrls: ['./order-item-details.component.scss']
})
export class OrderItemDetailsComponent implements OnInit {
  @Input() orderItemDetails: any
  @Output() SelectedOrder: EventEmitter<any> = new EventEmitter();
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_order_item_details:any;
  amount_seperator = this.generalSetting.amount_seperator;
  show_price_same_font = this.generalSetting.show_price_same_font;
  global_currency = this.generalSetting.currency_symbol;
  constructor(
    public activeModal: NgbActiveModal,
    public commonService: CommonService,
    ) { }

  ngOnInit(): void {
    this.style_obj_order_item_details = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    $(
      "<style>.modal-body {  overflow: auto !important; }</style>"
    ).appendTo("body");
  }

  addOrderItemInChat(){
    this.SelectedOrder.emit(this.orderItemDetails);
    this.activeModal.dismiss()
  }
  
  ngOnDestroy(): void {
    $(
      "<style>.modal-body {  overflow: hidden !important; }</style>"
    ).appendTo("body");
  }

}
