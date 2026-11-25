import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerService } from 'src/app/services/customer.service';

import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-pos-customer',
  templateUrl: './add-pos-customer.component.html',
  styleUrls: ['./add-pos-customer.component.scss']
})
export class AddPosCustomerComponent implements OnInit {
  public addCustomerForm: FormGroup;
  @ViewChild('cursor') cursor;
  ph_numbr = /^\+?\d{10}$/;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  pincode_label = this.generalSetting.pincode_label;
  pincode_length = this.generalSetting.pincode_length;
  zipcode = this.sellerDetails.zipcode;
  main: any;
  order_page: boolean = false;
  @Output() newCutomer: EventEmitter<any> = new EventEmitter();
  style_obj_add_pos_customer:any;
  allow_alphanumeric_pincode: any;
  
  constructor(
    private translate: TranslateService,
    public modal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private el: ElementRef,
    private customerService: CustomerService,
    private _snackbarService: ToastrService,
    private router: Router,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_add_pos_customer = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.allow_alphanumeric_pincode = this.generalSetting.allow_alphanumeric_pincode;
    this.loadForm();
  }

  loadForm() {
    this.addCustomerForm = this.formBuilder.group({
      name: new FormControl(null, [Validators.required]),
      phone: new FormControl(null, [Validators.required]),
      zipcode: new FormControl(this.zipcode, [Validators.required]),
    })
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cursor.nativeElement.focus();
    }, 100);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.addCustomerForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement =
      this.el.nativeElement.querySelector("form .ng-invalid");

    window.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: "smooth",
    });
  }

  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  /**
 * Restriction for not entered the number
 */
  restrictNumeric(event: any) {
    if (!this.allow_alphanumeric_pincode) {
      var charCode = event.keyCode;
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    }
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;

    if (inputValue.length >= this.pincode_length) {
      event.preventDefault(); // Prevent adding more characters when the maximum length is reached
    }
  }

  save(text: any) {
    if (!this.addCustomerForm.valid) {
      const controls = this.addCustomerForm.controls;

      Object.keys(controls).forEach((controlName, i) => {
        if (i == 0) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          invalidControl.focus();
        }
        controls[controlName].markAsTouched();
        this.scrollToFirstInvalidControl();
      });
    } else {
      var fd = new FormData();
      fd.append("user_id", this.main.LoggedUserInfo.user_id);
      fd.append("name", this.addCustomerForm.value.name);
      fd.append("phone", this.addCustomerForm.value.phone);
      fd.append("zipcode", this.addCustomerForm.value.zipcode);
      fd.append("store_id", this.sellerDetails.store_id);
      fd.append("is_khata", "0");
      fd.append("is_super_admin", '0');
      this.customerService.addEditCustomer(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this._snackbarService.success(response.message);
            if (!this.order_page) {
              this.modal.dismiss();
              if (text == 'save') {
                this.router.navigate([`/pos`]);
              } else {
                var response: any;
                this.addposorder(response.data);
              }
            } else {
              localStorage.setItem('customerdetails', JSON.stringify(response.data));
              this.newCutomer.emit(response.data);
              this.modal.dismiss();
            }
          } else {
            this._snackbarService.error(response.message);
          }
        },
        error: (error) => {
          this._snackbarService.error(error);
        },
        complete: () => {
          ;
        },
      });
    }
  }

  addposorder(item) {
    var oldcustomerdetails = JSON.parse(localStorage.getItem("customerdetails"));
    localStorage.setItem('customerdetails', JSON.stringify(item));
    var is_cart = false;
    localStorage.setItem('is_cart', JSON.stringify(is_cart));
    localStorage.setItem('oldcustomerdetails', JSON.stringify(oldcustomerdetails));
    this.router.navigate(["/pos/add-pos/"]);
  }
}
