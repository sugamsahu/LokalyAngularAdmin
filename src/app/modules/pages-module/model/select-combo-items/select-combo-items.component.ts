import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject, takeUntil } from "rxjs";
import { ItemService } from "src/app/services/item.service";
import { SortPipe } from "../../util/sort.pipe";
import { SelectAddonChoicesComponent } from "../select-addon-choices/select-addon-choices.component";
import { cloneDeep } from "lodash";
import * as $ from "jquery";

@Component({
  selector: "app-select-combo-items",
  templateUrl: "./select-combo-items.component.html",
  styleUrls: ["./select-combo-items.component.scss"],
})
export class SelectComboItemsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  @Input() SelectedItems: any;
  @Input() main: any;
  @Output() SelectedComboItems: EventEmitter<any> = new EventEmitter();

  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  global_currency = this.generalSetting.currency_symbol;
  global_timezone = this.generalSetting.timezone;
  sellerDetails = JSON.parse(localStorage.getItem("loginUserStore"));
  search = "";
  page1 = 1;
  ItemsDetails: any = [];
  comboItemsMenu: any = [];
  selectedCombo: any = [];
  selectedComboItemIndex: number = 0;
  AllowManageItem: boolean = true;
  style_obj_select_combo_items: any;

  constructor(
    public modal: NgbActiveModal,
    private itemService: ItemService,
    private sortPipe: SortPipe,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.style_obj_select_combo_items = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
    this.GetItemDetailById();
    $(
      "<style>.modal-content{ overflow: auto; max-height: 550px;}</style>"
    ).appendTo("body");
  }

  GetItemDetailById() {
    const data = {
      item_id: this.SelectedItems.item_id,
    };
    var fd = new FormData();
    fd.append("item_id", this.SelectedItems.item_id);

    this.itemService
      .getComboItemData(fd)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            var index = 1;
            this.ItemsDetails = response.data;
            this.SelectedItems.item_variants = response.data.item_variants;

            this.ItemsDetails.combo_items.forEach((item) => {
              item.combo_variants.forEach((varient) => {
                varient.is_available_choice_addon =
                  varient.is_choice_addon == 0
                    ? "Choices/Addons Available"
                    : varient.is_choice_addon == 1
                      ? "Choices Available"
                      : varient.is_choice_addon == 2
                        ? "Addons Available"
                        : "";
              });

              if (item.quantity > 1) {
                for (var i = 0; i < item.quantity; i++) {
                  var data = {
                    id: index,
                    comboDetailName: item.combo_item_name + " ( 1 of 1 )",
                    comboVarients: item.combo_variants,
                    selectedCategoryItem: false,
                    maxQuantity: item.quantity,
                    comboItemId: item.combo_item_id,
                  };
                  var abc = {};
                  abc = cloneDeep(data);
                  this.comboItemsMenu.push(abc);
                  index++;
                }
              } else {
                var datas = {
                  id: index,
                  comboDetailName: item.combo_item_name + " ( 1 of 1 )",
                  comboVarients: item.combo_variants,
                  selectedQuantity: false,
                  selectedCategoryItem: false,
                  maxQuantity: item.quantity,
                  comboItemId: item.combo_item_id,
                };
                this.comboItemsMenu.push(datas);
                index++;
              }
            });
            this.setlocation(this.comboItemsMenu[0], 1);
          }
        },
        error: (err) => { },
        complete: () => { },
      });
  }

  setlocation(selectCombo, index) {
    this.selectedComboItemIndex = index == undefined ? 0 : index;
    this.selectedCombo = selectCombo;
  }

  editItemDetail(itemDetail) {
    var filterData: any = []
    filterData = this.selectedCombo.comboVarients.filter(
      (item) => item.quantity === 1
    );

    if (filterData.length > 0) {
      if (filterData[0].item_variants_id == itemDetail.item_variants_id) {
        itemDetail.quantity = 0;
        itemDetail.is_added = 0;
        this.selectedCombo.selectedCategoryItem = false;
      } else {
        this.selectedCombo.comboVarients.filter((item) => {
          item.quantity = 0;
          item.is_added = 0;
          return item;
        });
        if (itemDetail.is_choice_addon != null) {
          this.openSelectAddonChoices(itemDetail);
        }
        itemDetail.quantity =
          (itemDetail.quantity == 0 || itemDetail.quantity == undefined) ? 1 : 0;
        itemDetail.is_added = true;
        this.selectedCombo.selectedCategoryItem = true;
        this.selectedCombo.comboVarients = this.sortPipe.transform(
          this.selectedCombo.comboVarients,
          "desc",
          "quantity"
        );
      }
    } else {
      if (itemDetail.is_choice_addon != null) {
        this.openSelectAddonChoices(itemDetail);
      }

      itemDetail.quantity =
        (itemDetail.quantity == 0 || itemDetail.quantity == undefined) ? 1 : 0;
      itemDetail.is_added = true;
      this.selectedCombo.selectedCategoryItem = true;
      this.selectedCombo.comboVarients = this.sortPipe.transform(
        this.selectedCombo.comboVarients,
        "desc",
        "quantity"
      );
    }

    var menuData: any = []
    menuData = this.comboItemsMenu.filter(
      (x) => x.selectedCategoryItem == false
    )[0];

    if (menuData) {
      this.AllowManageItem = true;
    } else {
      this.AllowManageItem = false;
    }
  }
  /** func for total price. */
  func(item) {
    item.total_Price = 0;
    if (item.choices != null) {
      if (item.choices.length > 0) {
        item.choices.forEach((choice) => {
          for (var i = 0; i < choice.choice_prices.length; i++) {
            if (i == 0) {
              choice.choice_prices[i].is_added = true;
              item.total_Price = Number(
                Number(item.total_Price) + Number(choice.choice_prices[i].price)
              ).toFixed(2);
            } else {
              choice.choice_prices[i].is_added = 0;
            }
          }
        });
      }
    }
    if (item.addons != null) {
      if (item.addons.length > 0) {
        item.addons.forEach((addon) => {
          for (var i = 0; i < addon.addon_prices.length; i++) {
            addon.addon_prices[i].is_added = 0;
          }
        });
      }
    }
    return item;
  }
  /** Open SelectAddonChoicesComponent modal */
  openSelectAddonChoices(item) {
    const modalRef = this.modalService.open(SelectAddonChoicesComponent, {
      size: "lg",
      centered: true,
      animation: true,
    });
    modalRef.componentInstance.SelectedItems = this.func(item);

    modalRef.componentInstance.SelectedAddonChoicesItem.subscribe((item1) => {
      item1.SelectedQty = 1;
      item1.addons?.forEach((addon) => {
        addon.addon_prices.filter((e) => e.is_added === true);
      });
      item1.choices?.forEach((choice) => {
        choice.choice_prices = choice.choice_prices.filter(
          (e) => e.is_added === true
        );
      });
    });
  }
  /** For selected item  combo variants */
  okCombo() {
    var filterData = this.comboItemsMenu.filter(
      (item) => item.selectedCategoryItem == false
    )[0];
    if (filterData) {
      this.SelectedItems.combo_variants = [];
      this.SelectedComboItems.emit(this.SelectedItems);
      this.modal.close();
    } else {
      this.SelectedItems.combo_variants = [];
      this.comboItemsMenu.forEach((comboItem) => {
        var filterData = comboItem.comboVarients.filter(
          (item) => item.is_added === true
        )[0];

        var data = {
          combo_variant_name:
            filterData.quantity + " X " + filterData.item_name,
          combo_item_id: comboItem.comboItemId,
          combo_item_detail_id: filterData.combo_item_detail_id,
          item_variants_id: filterData.item_variants_id,
          packaging_id: filterData.packaging_id,
          packaging_name: filterData.packaging_name,
          unit_id: filterData.unit_id,
          unit_name: filterData.unit_name,
          max_qty: filterData.max_qty,
          min_qty: filterData.min_qty,
          unit_quantity: filterData.unit_quantity,
          discounted_price: filterData.discounted_price,
          item_price: filterData.item_price,
          quantity: filterData.quantity,
          choices: filterData.choices,
          addons: filterData.addons,
        };
        this.SelectedItems.combo_variants.push(data);
      });
      this.SelectedComboItems.emit(this.SelectedItems);
      this.modal.close();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    $(
      "<style>.modal-content{ overflow: hidden; max-height: 550px;}</style>"
    ).appendTo("body");
  }

}
