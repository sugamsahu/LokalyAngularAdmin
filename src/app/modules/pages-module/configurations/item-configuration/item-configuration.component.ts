import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { BannerService } from 'src/app/services/configuration/banner.service';
import { HelpInfoModelComponent } from '../../model/help-info/help-info.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CommonConfigurationService } from 'src/app/services/configuration/common-configuration.service';
import { CommonService } from "src/app/services/common.service";
import { SpinnerService } from 'src/app/services/custom/spinner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-item-configuration',
  templateUrl: './item-configuration.component.html',
  styleUrls: ['./item-configuration.component.scss']
})
export class ItemConfigurationComponent implements OnInit {
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  platform_setting = JSON.parse(localStorage.getItem("_platform_setting"));
  top_tier: any = {
    name: 'Display Top Tier',
    completed: true,
    top_sub_tier: [],
  };
  bottom_tier: any = {
    name: 'Display Bottom Tier',
    completed: true,
    bottom_sub_tier: [],
  };
  allCompleteTopTier: boolean = false;
  allCompleteBottomTier: boolean = false;
  item: any = {
    item_image: "assets/icons/image-2107124199-.png",
    rating: "5.0",
    food_type: "veg",
    discount: "- 10%",
    brand_name: "Cakey Treat",
    item_name: "Tea Time Custard Cake",
    packaging_name: "null",
    unit_quantity: "500",
    unit_name: "gm",
    item_price: "360.00",
    discounted_price: "325.00",
    prescription: "Choices/Addons Available",
    favorite_icon: "",
    add_to_cart: ""
  }
  currency_symbol: any;
  language_id = localStorage.getItem("select_lan_id") || "1";
  main: any;
  helpDetails: any;
  item_block_list: any = [];
  amount_seperator: any;
  show_price_same_font = this.general_setting.show_price_same_font;
  item_image_box_shadow: any;
  item_config_list: any;

  constructor(
    public translate: TranslateService,
    private _helpService: BannerService,
    private appComponent: AppComponent,
    private modalService: NgbModal,
    private router: Router,
    private commonConfigurationServices: CommonConfigurationService,
    public commonService: CommonService,
    private spinner: SpinnerService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (!superAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.currency_symbol = this.general_setting?.currency_symbol;
    this.amount_seperator = this.general_setting?.amount_seperator;
    this.itemBlockConfig();
    this.itemConfigList();
    this.cdr.detectChanges();

    $("<style>.product-rating { background:" + this.general_setting.default_rating_color_code_bg + " !important}</style>").appendTo("body");
    $("<style>.product-rating span { color:" + this.general_setting.default_rating_color_code_text + " !important}</style>").appendTo("body");
    $("<style>.product-rating svg, rating svg { fill: " + this.general_setting.default_rating_color_code_text + " !important}</style>").appendTo("body");
    this.getHelpDetails();

  }

  setItemImageSquare(img: any) {
    this.item_image_box_shadow = this.item_block_list[0].shadow.split(' ')[0] + 'px' + ' ' + this.item_block_list[0].shadow.split(' ')[1] + 'px';
    $('.item-box-right-main').css({
      border: this.item_block_list[0].border_weight + 'px solid #ccc',
    });
    $('.item-box-right-main').css({
      'border-radius': this.item_block_list[0].rounding + 'px',
    });
    $('.item-box-right-main').css({
      'box-shadow': 'rgba(0, 0, 0, 0.04)' + this.item_image_box_shadow,
    });
    $('.item-box-right-top .item-img-right-top img').css({
      'border-top-right-radius': this.item_block_list[0].rounding + 'px',
      'border-top-left-radius': this.item_block_list[0].rounding + 'px'
    })
    if (this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length == 0) {
      $('.item-box-right-top .item-img-right-top img').css({
        'border-bottom-right-radius': this.item_block_list[0].rounding + 'px',
        'border-bottom-left-radius': this.item_block_list[0].rounding + 'px'
      })
    } else {
      $('.item-box-right-top .item-img-right-top img').css({
        'border-bottom-right-radius': '0px',
        'border-bottom-left-radius': '0px'
      })
    }
  }

  updateAllCompleteTopTier(event: any, item: any) {
    if (item.value == 1) {
      if (event == false) {
        this.top_tier.top_sub_tier.forEach(element => {
          element.completed = false;
        });
      }
    } else {
      this.top_tier.top_sub_tier[0].completed = true;
    }
    if (this.top_tier.top_sub_tier.filter(x => x.completed).length == 0 && this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length == 0) {
      $('.item-box-right-main').css({
        border: 'none'
      });
    }
    else {
      $('.item-box-right-main').css({
        border: this.item_block_list[0].border_weight + 'px solid #ccc',
      });
    }
    this.allCompleteTopTier = this.top_tier.top_sub_tier != null && this.top_tier.top_sub_tier.every(t => t.completed);
  }

  setAllTopTier(completed: boolean) {
    this.allCompleteTopTier = completed;
    if (this.top_tier.top_sub_tier[1].value != 1) {
      if (this.top_tier.top_sub_tier == null) {
        return;
      }
    }
    this.top_tier.top_sub_tier.forEach(t => (t.completed = completed));
    if (this.top_tier.top_sub_tier.filter(x => x.completed).length == 0 && this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length == 0) {
      $('.item-box-right-main').css({
        border: 'none'
      });
    }
    else {
      $('.item-box-right-main').css({
        border: this.item_block_list[0].border_weight + 'px solid #ccc',
      });
    }
  }


  updateAllCompleteBottomTier(event: any, bottom_item: any) {
    if (bottom_item.value == 9) {
      if (event == true) {
        this.bottom_tier.bottom_sub_tier[3].completed = true;
      }
    }
    if (bottom_item.value == 8) {
      if (event == false) {
        this.bottom_tier.bottom_sub_tier[4].completed = false
      }
    }
    if (this.top_tier.top_sub_tier.filter(x => x.completed).length == 0 && this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length == 0) {
      $('.item-box-right-main').css({
        border: 'none'
      });
    }
    else {
      $('.item-box-right-main').css({
        border: this.item_block_list[0].border_weight + 'px solid #ccc',
      });
    }
    if (this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length == 0) {
      $('.item-box-right-top .item-img-right-top img').css({
        'border-bottom-right-radius': this.item_block_list[0].rounding + 'px',
        'border-bottom-left-radius': this.item_block_list[0].rounding + 'px'
      })
    } else {
      $('.item-box-right-top .item-img-right-top img').css({
        'border-top-right-radius': this.item_block_list[0].rounding + 'px',
        'border-top-left-radius': this.item_block_list[0].rounding + 'px',
        'border-bottom-right-radius': '0px',
        'border-bottom-left-radius': '0px'
      })
    }
    this.allCompleteBottomTier = this.bottom_tier.bottom_sub_tier != null && this.bottom_tier.bottom_sub_tier.every(t => t.completed);
  }

  setAllBottomTier(completed: boolean) {
    this.allCompleteBottomTier = completed;
    if (this.bottom_tier.bottom_sub_tier == null) {
      return;
    }

    this.bottom_tier.bottom_sub_tier.forEach(t => (t.completed = completed));
    if (this.top_tier.top_sub_tier.filter(x => x.completed).length == 0 && this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length == 0) {
      $('.item-box-right-main').css({
        border: 'none'
      });
    } else {
      $('.item-box-right-main').css({
        border: this.item_block_list[0].border_weight + 'px solid #ccc',
      });
    }
    if (this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length == 0) {
      $('.item-box-right-top .item-img-right-top img').css({
        'border-bottom-right-radius': this.item_block_list[0].rounding + 'px',
        'border-bottom-left-radius': this.item_block_list[0].rounding + 'px'
      })
    } else {
      $('.item-box-right-top .item-img-right-top img').css({
        'border-top-right-radius': this.item_block_list[0].rounding + 'px',
        'border-top-left-radius': this.item_block_list[0].rounding + 'px',
        'border-bottom-right-radius': '0px',
        'border-bottom-left-radius': '0px'
      })
    }
  }

  getHelpDetails(): void {
    let data: any = {
      language_id: this.language_id
    };
    if (this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 || this.main.LoggedUserInfo.role_id == 2) {
      data.module_key = '147'
    }

    this._helpService.getHelpById(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.helpDetails = response.data;
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });
  }

  openHelpInfoModel(selected) {
    const modalRef = this.modalService.open(HelpInfoModelComponent, {
      size: "xxl",
      centered: true,
    });
    modalRef.componentInstance.selected = selected;
    modalRef.componentInstance.helpDetails = this.helpDetails;
  }

  itemBlockConfig() {
    this.spinner.show();
    const data: any = {
      block_id: 1
    };
    this.commonConfigurationServices.blockConfiguration(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.item_block_list = response.data;
          setTimeout(() => {
            this.item_image_box_shadow = this.item_block_list[0].shadow.split(' ')[0] + 'px' + ' ' + this.item_block_list[0].shadow.split(' ')[1] + 'px';
            $('.item-box-right-main').css({
              border: this.item_block_list[0].border_weight + 'px solid #ccc',
            });
            $('.item-box-right-main').css({
              'border-radius': this.item_block_list[0].rounding + 'px',
            });
            $('.item-box-right-main').css({
              'box-shadow': 'rgba(0, 0, 0, 0.04)' + this.item_image_box_shadow,
            });
            $('.item-box-right-top .item-img-right-top img').css({
              'border-top-right-radius': this.item_block_list[0].rounding + 'px',
              'border-top-left-radius': this.item_block_list[0].rounding + 'px'
            })
            if (this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length == 0) {
              $('.item-box-right-top .item-img-right-top img').css({
                'border-bottom-right-radius': this.item_block_list[0].rounding + 'px',
                'border-bottom-left-radius': this.item_block_list[0].rounding + 'px'
              })
            }
            this.cdr.detectChanges();
          }, 1000);
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });
  }

  commaFormatter(value: any) {
    if (value) {
      var price = value.toString().split(".")[0];
      var decimal = value.toString().split(".")[1];
      return price + this.amount_seperator + decimal;
    }
    else {
      return;
    }
  }

  itemConfigList(label?: any) {
    if (label) {
      this.top_tier = {
        name: 'Display Top Tier',
        completed: false,
        top_sub_tier: [],
      };
      this.bottom_tier = {
        name: 'Display Bottom Tier',
        completed: false,
        bottom_sub_tier: [],
      };
    }
    this.spinner.show();
    const data: any = {};
    this.commonConfigurationServices.itemConfiguaration(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.top_tier.top_sub_tier = [];
          this.bottom_tier.bottom_sub_tier = [];
          const dataArray = Object.keys(response.data[0]).map((key, index) => ({
            name: key == "item_image" ? "Item Image" : key == "rating" ? "Rating" : key == "food_type" ? "Food Type (Veg, Non-Veg, Egg)" : key == "discount" ? "Discount" : key == "brand" ? "Brand" : key == "item_name" ? "Item Name" : key == "packing" ? "Packaging.UOM" : key == "item_price" ? "Original Item Price" : key == "discount_price" ? "Item Price" : key == "addon_choices" ? "Prescription Required; Addon/ Choices" : key == "favourite_icon" ? "Favorite Icon" : key == "add_to_cart" ? "Add to Cart/ Reminder" : "",
            completed: response.data[0][key] == 1 ? true : false,
            value: index + 1,
            key: key
          }));
          dataArray.forEach(element => {
            if (element.value <= 4) {
              this.top_tier.top_sub_tier.push(element)
            } else {
              this.bottom_tier.bottom_sub_tier.push(element);
            }
          });

          var is_all_top: any = this.top_tier.top_sub_tier.filter((x) => x.completed);

          if (is_all_top?.length == this.top_tier.top_sub_tier.length) {
            this.allCompleteTopTier = true;
          }
          var is_all_bottom: any = this.bottom_tier.bottom_sub_tier.filter((x) => x.completed);

          if (is_all_bottom?.length == this.bottom_tier.bottom_sub_tier.length) {
            this.allCompleteBottomTier = true;
          }
          if (label) {
            // window.location.reload();
          }
          // this.setItemImageSquare();
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });
  }

  displayConditionwise() {
    if ((this.top_tier.top_sub_tier.filter(x => x.completed).length == 0 && this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length == 0)) {
      this.spinner.hide();
      this.toastr.error(this.translate.instant("Please select either the Item Image or Item Name in Item Configuration."));
      return;
    } else if (this.top_tier.top_sub_tier.filter(x => x.completed).length == 0 && this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length != 0 && this.bottom_tier.bottom_sub_tier[1].completed) {
      this.submit();
    } else if (this.top_tier.top_sub_tier.filter(x => x.completed).length != 0 && this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length == 0) {
      this.submit();
    } else if (!this.top_tier.top_sub_tier[0].completed && !this.bottom_tier.bottom_sub_tier[1].completed) {
      this.toastr.error(this.translate.instant("Please select either the Item Image or Item Name in Item Configuration."));
    } else if ((this.top_tier.top_sub_tier.filter(x => x.completed).length != 0 && this.bottom_tier.bottom_sub_tier.filter(x => x.completed).length != 0)) {
      this.submit();
    }
  }

  submit() {
    this.spinner.show();
    var add_list: any = [];
    this.top_tier.top_sub_tier.forEach(element => {
      if (element.completed) {
        var added: any = element.key + ':' + '1'
        add_list.push(added)
      } else {
        var added: any = element.key + ':' + '0'
        add_list.push(added)
      }
    });
    this.bottom_tier.bottom_sub_tier.forEach(element => {
      if (element.completed) {
        var added: any = element.key + ':' + '1'
        add_list.push(added)
      } else {
        var added: any = element.key + ':' + '0'
        add_list.push(added)
      }
    });
    const convertedData: { [key: string]: any } = {};
    add_list.forEach(item => {
      const [key, value] = item.split(':');
      convertedData[key] = parseInt(value, 10);
    });
    const formData = new FormData();
    for (const key in convertedData) {
      if (convertedData.hasOwnProperty(key)) {
        formData.append(key, convertedData[key]);
      }
    }
    this.commonConfigurationServices.manageItemConfiguaration(formData).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.spinner.hide();
          this.itemConfigList();
          this.toastr.success(response.message);
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {

      },
      complete: () => { },
    });
  }

}
