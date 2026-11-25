import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.scss']
})
export class PaymentDetailComponent implements OnInit {
  @Input() khataList : any;
  @Input() paymentList : any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  allow_khata = this.generalSetting.allow_khata;
  style_obj_payment_details: any;

  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void { 
    this.style_obj_payment_details = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }
  
  getInitials(name) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 35;
    canvas.height = 35;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    context.fillStyle = "#476ce8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "18px Arial";
    context.fillStyle = "#FFFFFF";
    context.textAlign = "center";
    var nameArray = name.split(" ");
    var initials = "";
    initials = initials + nameArray[0][0];
    initials = initials == "undefined" ? "U" : initials;
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 18, 25);
    } else {
      context.fillText(initials.toUpperCase(), 18, 25);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }

}
