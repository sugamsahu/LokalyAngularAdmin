import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-proof-of-delivery',
  templateUrl: './proof-of-delivery.component.html',
  styleUrls: ['./proof-of-delivery.component.scss']
})
export class ProofOfDeliveryComponent implements OnInit {

  @Input() receivedData: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_proof_of_delivery: any;


  constructor(
    public activeModal: NgbActiveModal,
  ) { }

  ngOnInit(): void {
    this.style_obj_proof_of_delivery = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  getImageName(path){
    let Arr = path.split('/');
    let len = Arr.length - 1;
    return Arr[len];
  }

  openimage(imgUrl){
    window.open(imgUrl)
  }
}
