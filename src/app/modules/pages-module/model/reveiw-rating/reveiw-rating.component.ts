import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import { CustomerReviewdetailsComponent } from '../customer-review-details/customer-review-details.component';

@Component({
  selector: 'app-reveiw-rating',
  templateUrl: './reveiw-rating.component.html',
  styleUrls: ['./reveiw-rating.component.scss']
})
export class ReveiwRatingComponent implements OnInit {
  @Input() review:any = [];
  @Input() store:any;
  @Input() forStore:any;
  @Input() itemRating:any;
  @Input() timeZone:any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  show_rating_different_color_code: number;
  review_rating_module: any;
  show_review_rating: any;
  show_rating: any;
  moment: any = moment;
  style_obj_review_rating: any;
  amount_seperator: any;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private modalService: NgbModal,
  ) { 
    {
      this.translate.addLangs(["it", "en", "de"]);
      this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    }
  }

  ngOnInit(): void { 
    this.style_obj_review_rating = {
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
    this.review_rating_module = this.generalSetting.review_rating_module;
    this.show_review_rating = this.generalSetting.show_review_rating;
    this.show_rating = this.generalSetting.show_rating;   
    this.amount_seperator = this.generalSetting?.amount_seperator;
  }

  readReview(item: any) {
    const modalRef = this.modalService.open(CustomerReviewdetailsComponent, {
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.review = item;
    modalRef.componentInstance.getstoredetaildata = this.store;
    modalRef.componentInstance.confirmStore = this.forStore;
  }

  timeSince(date: any) { 
    if(this.forStore){
      var dd: any = '';
    if (this.generalSetting.date_format_web == 'DD-MM-YYYY HH:mm:ss') {
      dd = moment.tz(
        date,
        'DD-MM-YYYY HH:mm:ss',
        this.store?.timezone
      );
    }
    if (this.generalSetting.date_format_web == 'MM-DD-YYYY HH:mm:ss') {
      dd = moment.tz(
        date,
        'MM-DD-YYYY HH:mm:ss',
        this.store?.timezone
      );
    }

    var date1: any = new Date();
    var temp: any = moment(date1 - dd);
    var temp2: any = temp / 1000;
    var seconds = Math.floor(temp2);

    var interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + ' years ago';
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + ' months ago';
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + ' days ago';
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + ' hours ago';
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + ' minutes ago';
    }
    return Math.floor(seconds) + ' seconds ago';
    }else{
      var dd: any = '';
    if (this.generalSetting.date_format_web == 'DD-MM-YYYY HH:mm:ss') {
      dd = moment.tz(
        date,
        'DD-MM-YYYY HH:mm:ss',
        this.timeZone
      );
    }
    if (this.generalSetting.date_format_web == 'MM-DD-YYYY HH:mm:ss') {
      dd = moment.tz(
        date,
        'MM-DD-YYYY HH:mm:ss',
        this.timeZone
      );
    }

    var date1: any = new Date();
    var temp: any = moment(date1 - dd);
    var temp2: any = temp / 1000;
    var seconds = Math.floor(temp2);

    var interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + ' years ago';
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + ' months ago';
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + ' days ago';
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + ' hours ago';
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + ' minutes ago';
    }
    return Math.floor(seconds) + ' seconds ago';
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
