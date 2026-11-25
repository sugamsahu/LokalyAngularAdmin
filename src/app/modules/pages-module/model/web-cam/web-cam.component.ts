import { Component, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { BarcodeScannerLivestreamComponent } from "ngx-barcode-scanner";
@Component({
  selector: 'app-web-cam',
  templateUrl: './web-cam.component.html',
  styleUrls: ['./web-cam.component.scss']
})
export class WebCamComponent implements AfterViewInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_web_cam: any;
  constructor(public modal: NgbActiveModal) {
    this.style_obj_web_cam = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
   }

  @Output() BarCode: EventEmitter<any> = new EventEmitter();
  @ViewChild(BarcodeScannerLivestreamComponent)
  barcodeScanner: BarcodeScannerLivestreamComponent;
  barcodeValue;

  ngAfterViewInit() {
    this.barcodeScanner.start();
  }

  onValueChanges(result) {
    var sound = new Audio('assets/icons/barcode.wav');
    if (result.codeResult.code?.length >= 12) {
      sound.play();
      this.barcodeValue = result.codeResult.code;
      this.BarCode.emit(this.barcodeValue);
      this.barcodeScanner.stop();
      this.modal.dismiss();
    }
  }
}
