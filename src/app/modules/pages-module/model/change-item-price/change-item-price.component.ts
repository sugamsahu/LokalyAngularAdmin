import { ItemService } from "src/app/services/item.service";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-change-item-price",
  templateUrl: "./change-item-price.component.html",
  styleUrls: ["./change-item-price.component.scss"],
})
export class ChangeItemPriceComponent implements OnInit {
  @Input() ItemDetails: any;
  @Output() changedPrices: EventEmitter<any> = new EventEmitter();
  storeLabel: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  changePriceForm: UntypedFormGroup;
  selectedFieldsArray: UntypedFormArray;
  session_store_id = localStorage.getItem("adminselectedstore");
  style_obj_change_item_price:any;

  constructor(
    public modal: NgbActiveModal,
    private formBuilder: UntypedFormBuilder,
    private toastr: ToastrService,
    public translate: TranslateService,
    private itemService: ItemService
  ) {
    this.translate.addLangs(["it","en","de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan")||'en');    
  }

  ngOnInit(): void {
    this.style_obj_change_item_price = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.storeLabel = this.generalSetting.store_label;
    this.createForm();
  }

  createForm() {
    this.changePriceForm = this.formBuilder.group({
      price: [
        this.ItemDetails.SelectedItemVarient.item_price,
        [Validators.required],
      ],
      discountedPrice: [this.ItemDetails.SelectedItemVarient.discounted_price],
    });
  }

  updateItemPrice() {
    let loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));

    let data: any = {
      user_id: loginUserStore.user_id,
      store_id: loginUserStore.store_id
        ? loginUserStore.store_id
        : this.session_store_id,

      item_id: this.ItemDetails.item_id,
      item_variants_id: this.ItemDetails.SelectedItemVarient.item_variants_id,
      item_price: this.changePriceForm.value.price,
      discounted_price: this.changePriceForm.value.discountedPrice,
      choices: this.ItemDetails.SelectedItemVarient.choices,
      addons: this.ItemDetails.SelectedItemVarient.addons,
    };

    this.itemService.changePrice(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.modal.close();
          this.toastr.success(response.message);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {},
    });
  }
}
