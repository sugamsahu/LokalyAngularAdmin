import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';
@Component({
  selector: 'app-generate-code',
  templateUrl: './generate-code.component.html',
  styleUrls: ['./generate-code.component.scss']
})
export class GenerateCodeComponent implements OnInit {
  generateCode: FormGroup;
  @Input() receivedCodeData: any;
  @Input() SendOrderCode: any = [];
  @Input() SendexpressCode: any = [];
  @Input() SendpickupCode: any = [];
  @Input() SendPOSCode: any = [];
  @Input() SendDineINCode: any = [];
  @Input() SendpaymentCode: any = [];
  @Input() SendrefundCode: any = [];
  @Input() SendcancelCode: any = [];
  @Input() addSID: boolean = false;
  @Input() order_no_format: any;
  codeDateFormatList = [
    { label: 'DDmmyyyy', value: 1 },
    { label: 'mmDDyyyy', value: 2 },
    { label: 'yyyymmDD', value: 3 },
    { label: 'yyyyDDMM', value: 4 },
    { label: 'DDmmyy', value: 5 },
    { label: 'mmDDyy', value: 6 },
    { label: 'yymmDD', value: 7 },
    { label: 'yyDDmm', value: 8 },
  ]

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    public commonService: CommonService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.loadform();
    this.loadModelData();
  }

  loadform() {
    this.generateCode = this.formBuilder.group({
      order_text: new FormControl(null),
      selectedDateFormatOrderCode: new FormControl(null),
      store_ID: new FormControl(null),
      sequence: new FormControl(null),
      expressCodeText: new FormControl(null),
      selectedDateFormatExpressCode: new FormControl(null),
      expressCodeStore: new FormControl(null),
      expressCodeSequence: new FormControl(null),
      pickupCodeText: new FormControl(null),
      selectedDateFormatPaymentCode: new FormControl(null),
      pickupCodeStore: new FormControl(null),
      pickupCodeSequence: new FormControl(null),
      POSCodeText: new FormControl(null),
      selectedDateFormatRefundCode: new FormControl(null),
      POSCodestore: new FormControl(null),
      POSCodeSequence: new FormControl(null),
      DineINCode_text: new FormControl(null),
      selectedDateFormatCancelCode: new FormControl(null),
      DineINCodeStore: new FormControl(null),
      DineINCodeSequence: new FormControl(null),
      paymentCodetext: new FormControl(null),
      selectedDateFormatpickupCode: new FormControl(null),
      paymentCodeStore: new FormControl(null),
      paymentCodesequence: new FormControl(null),
      refundCodetext: new FormControl(null),
      selectedDateFormatPOSCode: new FormControl(null),
      refundCodestore: new FormControl(null),
      refundCodesequence: new FormControl(null),
      cancelCodetext: new FormControl(null),
      selectedDateFormatDineINCode: new FormControl(null),
      cancelCodestore: new FormControl(null),
      cancelCodesequence: new FormControl(null),

    })
  }
  /** Load generate code model data by Input decorator */
  loadModelData() {
    this.generateCode.controls['order_text'].setValue(this.SendOrderCode.order_text)
    this.generateCode.controls['store_ID'].setValue(this.SendOrderCode.store_ID)
    this.generateCode.controls['sequence'].setValue(this.SendOrderCode.sequence)

    this.generateCode.controls['expressCodeText'].setValue(this.SendexpressCode.order_text)
    this.generateCode.controls['expressCodeStore'].setValue(this.SendexpressCode.store_ID)
    this.generateCode.controls['expressCodeSequence'].setValue(this.SendexpressCode.sequence)

    this.generateCode.controls['pickupCodeText'].setValue(this.SendpickupCode.order_text)
    this.generateCode.controls['pickupCodeStore'].setValue(this.SendpickupCode.store_ID)
    this.generateCode.controls['pickupCodeSequence'].setValue(this.SendpickupCode.sequence)

    this.generateCode.controls['POSCodeText'].setValue(this.SendPOSCode.order_text)
    this.generateCode.controls['POSCodestore'].setValue(this.SendPOSCode.store_ID)
    this.generateCode.controls['POSCodeSequence'].setValue(this.SendPOSCode.sequence)

    this.generateCode.controls['DineINCode_text'].setValue(this.SendDineINCode.order_text)
    this.generateCode.controls['DineINCodeStore'].setValue(this.SendDineINCode.store_ID)
    this.generateCode.controls['DineINCodeSequence'].setValue(this.SendDineINCode.sequence)

    this.generateCode.controls['paymentCodetext'].setValue(this.SendpaymentCode.order_text)
    this.generateCode.controls['paymentCodeStore'].setValue(this.SendpaymentCode.store_ID)
    this.generateCode.controls['paymentCodesequence'].setValue(this.SendpaymentCode.sequence)

    this.generateCode.controls['refundCodetext'].setValue(this.SendrefundCode.order_text)
    this.generateCode.controls['refundCodestore'].setValue(this.SendrefundCode.store_ID)
    this.generateCode.controls['refundCodesequence'].setValue(this.SendrefundCode.sequence)

    this.generateCode.controls['cancelCodetext'].setValue(this.SendcancelCode.order_text)
    this.generateCode.controls['cancelCodestore'].setValue(this.SendcancelCode.store_ID)
    this.generateCode.controls['cancelCodesequence'].setValue(this.SendcancelCode.sequence)
  }

  submitCodeData() {

    this.modalCodeData.emit(this.generateCode.value);
    this.activeModal.dismiss()
  }

  @Output() modalCodeData: EventEmitter<any> = new EventEmitter();

  changeDateFormatOrderCode(item: any) {
    console.log(this.generateCode.value.selectedDateFormatOrderCode)
  }

  changeDateFormatRefundCode(item: any) {

  }

  changeDateFormatDineINCode(item: any) { }

  changeDateFormatPOSCode(item: any) {
  }

  changeDateFormatpickupCode(item: any) {
  }

  changeDateFormatExpressCode(item: any) {
  }

  changeDateFormatPaymentCode(item: any) {
  }

  changeDateFormatCancelCode(item: any) {
  }

  closeAreaModel() {
  }
}
