import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AppComponent } from 'src/app/app.component';
import { CryptoService } from 'src/app/services/custom/crypto.service';
import { ItemTagService } from 'src/app/services/lookup/item-tag.service';
import { CommonService } from 'src/app/services/common.service';
import { ItemService } from 'src/app/services/item.service';
@Component({
  selector: 'app-change-price',
  templateUrl: './change-price.component.html',
  styleUrls: ['./change-price.component.scss']
})
export class ChangePriceComponent implements OnInit {

  itemId: any = 0;
  main: any;
  categoryItem: any;
  item_type = [
    { label: "None", value: 0 },
    { label: "Veg", value: 1 },
    { label: "Non-Veg", value: 2 },
    { label: "Egg", value: 3 },
  ];
  tag_item_list: any = [];
  selectedItemTag: any = [];
  collection_list: any = [];
  selectedAutoCollection: any = [];
  selectedItemCollectionManual: any = [];
  masterAddOnList: any = [];
  varientItem: any = [];
  masterChoiceList: any = [];
  SelectedVariant: any = {};
  itemDescription: string = '';
  manufacturerDetails: string = '';
  howToUse: string = '';
  features: string = '';
  benefits: string = '';
  ingredients: string = '';
  nutritionalInformation: string = '';
  productInformation: string = '';
  otherInformation: string = '';
  counter: number = 0;
  general_setting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  global_currency: any;
  show_price_same_font: any;
  selectedItemVariantId: any;
  store_label = this.general_setting.store_label;

  constructor(
    private appComponent: AppComponent,
    public translate: TranslateService,
    private router: Router,
    private itemTagService: ItemTagService,
    private itemService: ItemService,
    private cryptoService: CryptoService,
    private toastr: ToastrService,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit(): void {
    this.setCss();
    this.main = this.appComponent.main;
    this.show_price_same_font = this.general_setting.show_price_same_font;
    this.global_currency = this.general_setting.currency_symbol;
    this.itemId = this.cryptoService.decryptIdValue(
      "ItemList_item_id" + this.main.LoggedUserInfo.role_id?.toString(),
      this.main.CryptoKey
    );
    this.selectedItemVariantId = Number(this.cryptoService.decryptIdValue(
      "Selected_Item_variant_Id" + this.main.LoggedUserInfo.role_id?.toString(),
      this.main.CryptoKey
    ));
    if (Number(this.itemId) > 0) {
      this.getItemListById();
    } else {
      this.router.navigate(["/items"]);
    }
  }

  setCss() {
    $(
      "<style>.mat-tab-label-container{  background-color: #F0F3F4 !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-tab-group.mat-primary .mat-ink-bar{  background-color: #FFCD3E !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-ink-bar{ top: 0px !important; height: 3px !important;} .mat-tab-label:focus,.mat-tab-label:active{ background-color: white !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-tab-body.mat-tab-body-active{ z-index: 0 !important;}</style>"
    ).appendTo("body");
    $(
      "<style>.mat-tab-header{ z-index: 0 !important;}</style>"
    ).appendTo("body");
  }

  async getItemListById() {
    var fd = new FormData();
    fd.append("item_id", this.itemId);
    await this.itemService.getItemDetails(fd).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.categoryItem = response.data;
        }
        this.itemDescription = this.categoryItem.item_description;
        this.manufacturerDetails = this.categoryItem.manufacturer_details;
        this.howToUse = this.categoryItem.how_to_use;
        this.features = this.categoryItem.features;
        this.benefits = this.categoryItem.benefits;
        this.ingredients = this.categoryItem.ingredients;
        this.nutritionalInformation = this.categoryItem.nutritional_information;
        this.productInformation = this.categoryItem.product_information;
        this.otherInformation = this.categoryItem.other_information;
        this.getItemTagList();
        this.getCollectionList();
        this.getMasterAddOnList();
      },
      error: (error) => {
      },
      complete: () => { }
    })
  }

  getItemTagList() {
    this.tag_item_list = [];
    var data = {
      category_id: Number(this.main.LoggedUserStoreInfo.category_id),
    };
    this.itemTagService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.tag_item_list = response.data;
        }
        this.selectedItemTag = this.categoryItem.item_tag.item_tags.toString().split(",");
      },
      error: (error) => {
      },
      complete: () => { },
    });
  }

  getCollectionList() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo?.store_id,
      collection_type: 1,
    };
    this.itemService.getCollectionMasterData(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.collection_list = response.data;
          if (this.categoryItem.automatic_collection.item_collection_id != "") {
            this.selectedAutoCollection = this.categoryItem.automatic_collection.map(
              (x) => x.collection_name
            );
          }
          if (this.categoryItem.item_collection.item_collection_id != "") {
            this.selectedItemCollectionManual = this.categoryItem.item_collection.item_collection_id.split(",")
              .map((x) => Number(x));
          }
        }
      },
    });
  }

  getMasterAddOnList() {
    var data = {};
    this.itemService.getMasterAddOnList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.masterAddOnList = response.data;

          for (let i = 0; i < this.masterAddOnList.length; i++) {
            const field1 = `selectedSubAddOn${this.masterAddOnList[i].addon_id.toString()}`;
            this[field1] = { selected: undefined };

            for (let j = 0; j < this.masterAddOnList[i].addons_prices.length; j++) {
              this.masterAddOnList[i].addons_prices[j].addon_id = this.masterAddOnList[i].addon_id;
              this.masterAddOnList[i].addons_prices[j].addon_name = this.masterAddOnList[i].addon_name;
            }
          }

          this.getMasterChoiceList()

        }
      },
      error: (error: any) => {
      },
    });
  }

  getMasterChoiceList() {
    var data = {};
    this.itemService.getMasterChoiceList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.masterChoiceList = response.data;

          this.varientItem = [];
          this.categoryItem.item_variants.forEach((value: any, key: any) => {
            var obj: any = {};

            obj.packaging_name =
              value.packaging_name != null ? value.packaging_name : "-";
            obj.packaging_name =
              obj.packaging_name == "Packaging" ? "-" : obj.packaging_name;
            obj.unit_quantity = parseFloat(value.unit_quantity);
            obj.opening_stock = parseFloat(value.opening_stock).toFixed(1);
            obj.reorder_quantity = parseFloat(value.reorder_quantity).toFixed(
              1
            );
            obj.unit_name = value.unit_name;
            obj.item_price = value.item_price;
            obj.discounted_price = value.discounted_price;
            obj.unit_id = value.unit_id;
            obj.packaging_id =
              value.packaging_id == 0 ? 0 : value.packaging_id;
            obj.tax_group_id =
              value.tax_group_id == 0 ? 0 : value.tax_group_id;
            obj.packaging = value.packaging == 0 ? 0 : value.packaging;
            obj.sku = value.sku == 0 ? 0 : value.sku;
            obj.location = value.location == "" ? "" : value.location;
            obj.max_qty = value.max_qty;
            obj.min_qty = value.min_qty;
            obj.choices = value.choices;
            obj.addons = value.addons;
            obj.tax = value.tax;
            obj.external_item_id = value.external_item_id;
            obj.item_variants_id = value.item_variants_id;
            obj.sub_category_id = ++this.counter;
            obj.unit_conversation_id = value.unit_conversation_id;

            var addedChoices = [];
            if (value.choices !== null) {
              value.choices.forEach((value1: any, key: any) => {
                var adchoice = {
                  choice_id: value1.default_choice_id,
                  choice_name: value1.variant_choice_name,
                  choice_price_id: value1.default_choice_price_id,
                  sub_choice_name: value1.variant_sub_choice_name,
                  choice_price: value1.price,
                  variant_choice_id: value1.variant_choice_id,
                  variant_choice_price_id: value1.variant_choice_price_id,
                };
                addedChoices.push(adchoice);
              });
            }


            var addMasterChoice = [];
            this.masterChoiceList.forEach((value1: any, key1: any) => {
              addedChoices.forEach((value2, key2) => {
                if (value1.choice_id == value2.choice_id) {
                  var found = addMasterChoice.filter((x) => x.choice_id == value2.choice_id)[0]
                  if (found == null || found == undefined) {
                    var ch = {
                      choice_id: value1.choice_id,
                      choice_name: value1.choice_name,
                      description: value1.description,
                      choice_prices: value1.choice_prices,
                      is_allready_added: true,
                    };
                    addMasterChoice.push(ch);
                  }
                }
              });
            });
            obj.addedChoiceList = addedChoices;
            obj.selectedChoicePriceList = addMasterChoice;
            obj.displayChoiceList = addedChoices;

            var addedAdd = [];
            if (value.addons != null) {
              value.addons.forEach((value1: any, key: any) => {
                var ad = {
                  addon_id: value1.default_addon_id,
                  addon_name: value1.variant_addon_name,
                  addon_price_id: value1.default_addon_price_id,
                  sub_addon_name: value1.variant_sub_addon_name,
                  addon_price: value1.price,
                  variant_addon_id: value1.variant_addon_id,
                  variant_addon_price_id: value1.variant_addon_price_id,
                };
                addedAdd.push(ad);
              });
            }


            var addMasterAddOn = [];
            this.masterAddOnList.forEach((value1: any, key1: any) => {
              addedAdd.forEach((value2, key2) => {
                if (value1.addon_id == value2.addon_id) {
                  var found = addMasterAddOn.filter((x) => x.addon_id == value2.addon_id)[0]
                  if (found == null || found == undefined) {
                    var ad = {
                      addon_id: value1.addon_id,
                      addon_name: value1.addon_name,
                      description: value1.description,
                      addons_prices: value1.addons_prices,
                      is_allready_added: true,
                    };
                    addMasterAddOn.push(ad);
                  }
                }
              });
            });
            obj.addedAddOnList = addedAdd;
            obj.selectedAddOnPriceList = addMasterAddOn;
            obj.displayAddOnList = addedAdd;
            obj.item_attribute = value.item_attribute;
            this.varientItem.push(obj);

            this.SelectedVariant = this.varientItem.filter((item) => item.item_variants_id == this.selectedItemVariantId)[0];
          });
        }
      },
      error: (error: any) => {
      },
    });
  }

  CheckChoices(item) {
    if (item.choices && item.choices != null && item.choices.length != 0) {
      return item.choices
    } else {
      return []
    }
  }

  CheckAddons(item) {
    if (item.addons && item.addons != null && item.addons.length != 0) {
      return item.addons
    } else {
      return []
    }
  }

  updateItemPice() {
    const data = {
      addons: this.SelectedVariant.addons != null ? this.setAddonData() : null,
      choices: this.SelectedVariant.choices != null ? this.setChoicesData() : null,
      discounted_price: this.SelectedVariant.discounted_price,
      item_id: Number(this.itemId),
      item_price: this.SelectedVariant.item_price,
      item_variants_id: this.SelectedVariant.item_variants_id,
      store_id: this.main.LoggedUserStoreInfo.store_id,
      user_id: this.main.LoggedUserInfo.user_id
    }

    this.itemService.changeItemPrice(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
      },
      complete: () => { }
    })
  }

  setAddonData(): any[] {
    const groupedData: any[] = [];
    const groupedMap = new Map<number, any>();

    this.SelectedVariant.addons.forEach(addon => {
      addon.addon_prices = [];
      const variantAddonId = addon.variant_addon_id;
      let addon_prices = {
        default_addon_price_id: addon.default_addon_price_id,
        is_added: !addon.is_added ? 0 : addon.is_added,
        price: addon.price,
        variant_addon_id: addon.variant_addon_id,
        variant_addon_price_id: addon.variant_addon_price_id,
        variant_sub_addon_name: addon.variant_sub_addon_name
      }
      if (groupedMap.has(variantAddonId)) {
        const existingAddon = groupedMap.get(variantAddonId);
        existingAddon.addon_prices.push(addon_prices);
      } else {
        const newAddon = { ...addon };
        newAddon.addon_prices.push(addon_prices);
        groupedMap.set(variantAddonId, newAddon);
      }
    });

    groupedMap.forEach((addon: any) => {
      delete addon.default_addon_price_id;
      delete addon.price;
      delete addon.variant_addon_price_id;
      delete addon.variant_sub_addon_name;
      groupedData.push(addon);
    });

    return groupedData;
  }

  cancelClick() {
    history.back();
  }

  setChoicesData() {
    const groupedData: any[] = [];
    const groupedMap = new Map<number, any>();

    this.SelectedVariant.choices.forEach(choice => {
      choice.choice_prices = [];
      const variantChoiceId = choice.variant_choice_id;
      let choice_prices = {
        default_choice_price_id: choice.default_choice_price_id,
        is_added: !choice.is_added ? 0 : choice.is_added,
        price: choice.price,
        variant_choice_id: choice.variant_choice_id,
        variant_choice_price_id: choice.variant_choice_price_id,
        variant_sub_choice_name: choice.variant_sub_choice_name
      }
      if (groupedMap.has(variantChoiceId)) {
        const existingChoice = groupedMap.get(variantChoiceId);
        existingChoice.choice_prices.push(choice_prices);
      } else {
        const newAddon = { ...choice };
        newAddon.choice_prices.push(choice_prices);
        groupedMap.set(variantChoiceId, newAddon);
      }
    });

    groupedMap.forEach((choice: any) => {
      delete choice.default_choice_price_id
      delete choice.price
      delete choice.variant_choice_price_id
      delete choice.variant_sub_choice_name
      groupedData.push(choice);
    });

    return groupedData;
  }

}
