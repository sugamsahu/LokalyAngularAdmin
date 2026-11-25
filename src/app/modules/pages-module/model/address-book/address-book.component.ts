import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AddAddressComponent } from '../add-address/add-address.component';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent implements OnInit {
  @Input() customerAddress: any;
  @Input() user_id: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_address_book: any;

  constructor(public activeModal: NgbActiveModal,
    public translate: TranslateService,
    private modalService: NgbModal,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.style_obj_address_book = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.customerAddress.forEach(address => {
      address.map_link = 'https://maps.google.com/?q=' + address.lat + ',' + address.long;
    });
  }

  addAddress() {
    const modalRef = this.modalService.open(AddAddressComponent, {
      size: "lg",
      centered: true,
    });
    modalRef.componentInstance.user_id = this.user_id;
    modalRef.componentInstance.new_adddress.subscribe((receivedEntry) => {
      this.getUserAddress(this.user_id);
    });
  }

  getUserAddress(userId): void { // Get default address of user
    let profile: any = {
      user_id: userId,
    }
    this.customerService.getUserAddress(profile).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.customerAddress = response.data;
          this.customerAddress.forEach(address => {
            address.map_link = 'https://maps.google.com/?q=' + address.lat + ',' + address.long;
          });
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
      },
    });
  }
}
