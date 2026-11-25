import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-customer-review-details',
  templateUrl: './customer-review-details.component.html',
  styleUrls: ['./customer-review-details.component.scss']
})
export class CustomerReviewdetailsComponent implements OnInit {
  @Input() review:any
  @Input() getstoredetaildata:any
  @Input() confirmStore:any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  show_rating: any;
  show_rating_different_color_code: number;
  style_obj_customer_review_details:any;
  amount_seperator: any;
  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.style_obj_customer_review_details = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font,
      "--default_rating_color_code_text": this.generalSetting.default_rating_color_code_text,
      "--default_rating_color_code_bg": this.generalSetting.default_rating_color_code_bg,
      "--alternate_color_code_text": this.generalSetting.alternate_color_code_text,
      "--alternate_color_code_bg": this.generalSetting.alternate_color_code_bg,


    }       
    this.show_rating_different_color_code = Number(
      this.generalSetting?.show_rating_different_color_code
    );
    this.show_rating = this.generalSetting.show_rating;
    this.amount_seperator = this.generalSetting?.amount_seperator;
    
  }

  timeSince(date: any) { 
    if(this.confirmStore){
      var dd: any = '';
      if (this.generalSetting.date_format_web == 'DD-MM-YYYY HH:mm:ss') {
        dd = moment.tz(date, 'DD-MM-YYYY HH:mm:ss', this.getstoredetaildata?.timezone);
      }
      if (this.generalSetting.date_format_web == 'MM-DD-YYYY HH:mm:ss') {
        dd = moment.tz(date, 'MM-DD-YYYY HH:mm:ss', this.getstoredetaildata?.timezone);
      }

      var date1: any = new Date();
      var temp: any = moment(date1 - dd);
      var temp2: any = temp / 1000;
      var seconds = Math.floor(temp2);

      var interval = seconds / 31536000;
      if (interval > 1) {
        return Math.floor(interval) + " years ago";
      }
      interval = seconds / 2592000;
      if (interval > 1) {
        return Math.floor(interval) + " months ago";
      }
      interval = seconds / 86400;
      if (interval > 1) {
        return Math.floor(interval) + " days ago";
      }
      interval = seconds / 3600;
      if (interval > 1) {
        return Math.floor(interval) + " hours ago";
      }
      interval = seconds / 60;
      if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
      }
      return Math.floor(seconds) + " seconds ago";
    }else{
      var dd: any = '';
      if (this.generalSetting.date_format_web == 'DD-MM-YYYY HH:mm:ss') {
        dd = moment.tz(date, 'DD-MM-YYYY HH:mm:ss', this.review.timezone);
      }
      if (this.generalSetting.date_format_web == 'MM-DD-YYYY HH:mm:ss') {
        dd = moment.tz(date, 'MM-DD-YYYY HH:mm:ss', this.review.timezone);
      }

      var date1: any = new Date();
      var temp: any = moment(date1 - dd);
      var temp2: any = temp / 1000;
      var seconds = Math.floor(temp2);

      var interval = seconds / 31536000;
      if (interval > 1) {
        return Math.floor(interval) + " years ago";
      }
      interval = seconds / 2592000;
      if (interval > 1) {
        return Math.floor(interval) + " months ago";
      }
      interval = seconds / 86400;
      if (interval > 1) {
        return Math.floor(interval) + " days ago";
      }
      interval = seconds / 3600;
      if (interval > 1) {
        return Math.floor(interval) + " hours ago";
      }
      interval = seconds / 60;
      if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
      }
      return Math.floor(seconds) + " seconds ago";
      }
    
  }

  getInitials(name) {
    var canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 90;
    canvas.height = 90;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");
    context.fillStyle = "#476ce8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "60px Arial";
    context.fillStyle = "#FFFFFF";
    var nameArray = name.split(" ");
    var initials = "";
    initials = initials + nameArray[0][0];
    initials = initials == "undefined" ? "U" : initials;
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 25, 65);
    } else {
      context.fillText(initials.toUpperCase(), 25, 65);
    }
    var data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }

}
