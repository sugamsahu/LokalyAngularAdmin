import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-picker-order-details",
  templateUrl: "./picker-order-details.component.html",
  styleUrls: ["./picker-order-details.component.scss"],
})
export class PickerOrderDetailsComponent implements OnInit {
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  global_currency = this.generalSetting.currency_symbol;
  delivery_model = this.PlatformSetting.delivery_model;
  refund_module = this.generalSetting.refund_module;
  business_model = this.PlatformSetting.business_model;
  subscription_model = this.PlatformSetting.subscription_model;
  add_refund_module = false;
  view_refund_module: any;
  show_customer_details_to_store =
    this.generalSetting.show_customer_details_to_store == "1" ? true : false;
  @Input() orderdetail: any;
  @Input() main: any;
  @Input() session: any;
  @Output() OrderId: EventEmitter<any> = new EventEmitter();
  closeResult = "";
  show_price_same_font = this.generalSetting.show_price_same_font;
  orderitemdetail: any = [];
  printCurrantDateTime: Date;
  viewRefundDetail: any;
  packing_note: any;
  pick_completed: string;
  number_of_box: any;
  style_obj_picker_order_details: any;
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslateService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.style_obj_picker_order_details = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    if (this.sellerDetails) {
      this.sellerDetails.fullAddress = [
        this.sellerDetails.address1,
        this.sellerDetails.address2,
        this.sellerDetails.area_name,
        this.sellerDetails.city_name,
        this.sellerDetails.state_name,
        this.sellerDetails.country_name,
      ]
        .filter(Boolean)
        .join(", ");
    }
    this.sellerDetails.fullAddress = [
      this.orderdetail.store.store_address,
      this.orderdetail.store.store_address2,
      this.orderdetail.store.area_name,
      this.orderdetail.store.city_name,
      this.orderdetail.store.state_name,
      this.orderdetail.store.zipcode,
      this.orderdetail.store.country_name,
    ]
      .filter(Boolean)
      .join(", ");

    this.packing_note = this.orderdetail.picker_remarks;
    this.pick_completed =
      this.orderdetail.is_picker_complete == 1 ? "yes" : "No";
    this.number_of_box = this.orderdetail.no_of_box_packed;
    var itemdetails = [];
    this.orderdetail.items.forEach((Item: any) => {
      Item.item_variants.forEach((variant: any) => {
        if (variant.is_added == 1) {
          var item_data: any = {
            item_name: Item.item_name,
            location: Item.location,
            item_remark: Item.item_remark,
            brand_name: Item.brand_name,
            packaging_name: variant.packaging_name,
            unit_name: variant.unit_name,
            quantity: variant.quantity,
            picker_quantity: variant.picker_quantity,
            item_pickup_status: variant.item_pickup_status,
            is_picker_add: variant.is_picker_add,
            referance_item_id: variant.referance_item_id,
            unit_quantity: variant.unit_quantity,
            discounted_price: variant.discounted_price,
            item_price: variant.item_price,
            packaging: variant.packaging,
            category_name: Item.category_name,
            sub_category_name: Item.sub_category_name,
            display_id: Item.display_id,
          };
          if (variant.choices_addons != null) {
            item_data.choices_addons = variant.choices_addons;
          } else {
            item_data.choices_addons = null;
          }

          var choices_addons = [];
          if (Item.combo_variants != null) {
            item_data.combo_variants = Item.combo_variants;
            if (item_data.combo_variants) {
              item_data.combo_variants.forEach((combo: any) => {
                choices_addons = [];
                if (combo.choices) {
                  combo.choices.forEach((choice: any) => {
                    choice.choice_prices.forEach((choicePrice: any) => {
                      if (choicePrice.is_added == true) {
                        choices_addons.push(
                          choice.variant_choice_name +
                            " : " +
                            choicePrice.variant_sub_choice_name
                        );
                      }
                    });
                  });
                }
                if (combo.addons) {
                  combo.addons.forEach((addon: any) => {
                    var addonName = "";
                    addon.addon_prices.forEach((addonsPrice) => {
                      if (addonsPrice.is_added == true) {
                        addonName =
                          addonName == ""
                            ? addonsPrice.variant_sub_addon_name
                            : addonName +
                              ", " +
                              addonsPrice.variant_sub_addon_name;
                      }
                    });
                    if (addonName != "") {
                      choices_addons.push(
                        addon.variant_addon_name + " : " + addonName
                      );
                    }
                  });
                }
                combo.choices_addons = choices_addons;
              });
            }
          }

          itemdetails.push(item_data);
        }
      });
    });
    this.orderitemdetail = itemdetails;
  }

  PrintDIV(divId: any) {
    this.printCurrantDateTime = new Date();
    var contents = document.getElementById(divId).innerHTML;
    var body = document.getElementsByTagName("BODY")[0];

    //Create a dynamic IFRAME.
    var frame1: any = document.createElement("IFRAME");
    frame1.name = "frame1";
    frame1.setAttribute("style", "position:absolute;top:-1000000px");
    body.appendChild(frame1);

    //Create a Frame Document.
    var frameDoc = frame1.contentWindow
      ? frame1.contentWindow
      : frame1.contentDocument.document
      ? frame1.contentDocument.document
      : frame1.contentDocument;
    frameDoc.document.open();

    //Create a new HTML document.
    frameDoc.document.write("<html><head><title></title>");
    frameDoc.document.write("</head><body>");
    frameDoc.document.write(
      "<style>.profile-media {display: -ms-flexbox;display: flex;-ms-flex-align: start;align-items: flex-start;}.profile-body {-ms-flex: 1;flex: 1;padding-left: 15px;border-left: 1px solid #ddd;}.profile-media .profile-box {width: 90px;height: 90px;overflow: hidden;border-radius: 50%;margin-right: 15px;}.prcess-circle {width: 120px;height: 120px;display: inline-block;border: 2px solid #e0e0e0;border-radius: 50%;background-color: #ffffff;}.profile-media .profile-box img {width: 100%;}.profile-media .dt-row {margin-bottom: 10px;}.account-process {text-align: center;width: 100%;}.prcess-circle .title-box {margin-top: 22px;margin-left: auto;margin-right: auto;width: 90px;text-align: center;font-size: 14px;line-height: 18px}.prcess-circle .profile-box img {width: 100%;}.orderDetail {padding: 15px 0;}.orderDetail .control-label {margin: 0;}.modal-content tr:nth-child(even) {background: #CCC}.modal-content tr:nth-child(odd) {background: #FFF}.schaduleDiv{background-color:#24c9fcc7;padding: 10px 10px;margin-left: 12px;margin-top: 10px;}.table{border-collapse: inherit;} ul { padding-left: 0rem !important; list-style: none; }</style>"
    );
    frameDoc.document.write(
      "<style>@media print{.col-md-6{width:50%; float:left;} .col-sm-4 {width: 33.33333333%;float:left;} .col-md-8 {width: 66.66666667%;} .form-group label {margin-bottom: 5px;color: #666666;font-weight: 400;font-size: 13px; th {background-color: #d8d4d4;font-size: 13px; }}}.table > tbody > tr > td{font-size: 13px;} ul { padding-left: 0rem !important; list-style: none; }</style>"
    );
    if (divId == "PrintPackSlip") {
      frameDoc.document.write("<style>@page{size:Statement;}</style>");
    } else {
      frameDoc.document.write("<style>@page{size:A4;}</style>");
    }

    //Append the external CSS file.
    frameDoc.document.write(
      '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">'
    );

    //Append the DIV contents.
    frameDoc.document.write(contents);
    frameDoc.document.write("</body></html>");
    frameDoc.document.close();

    window.setTimeout(function () {
      window.frames["frame1"].focus();
      window.frames["frame1"].print();
      body.removeChild(frame1);
    }, 1000);
  }

  editOrderDetail(orderId) {
    this.OrderId.emit(orderId);
    this.activeModal.dismiss();
  }
}
