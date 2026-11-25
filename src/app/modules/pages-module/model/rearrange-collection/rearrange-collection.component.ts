import { CdkDragDrop, moveItemInArray, } from "@angular/cdk/drag-drop";
import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-rearrange-collection",
  templateUrl: "./rearrange-collection.component.html",
  styleUrls: ["./rearrange-collection.component.scss"],
})
export class RearrangeCollectionComponent implements OnInit {
  loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  @Input() collectionList: any;
  @Input() forAppPortal: any;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  PlatformSetting = JSON.parse(localStorage.getItem("_platform_setting"));
  business_model = this.PlatformSetting.business_model;
  arrangeCollectionList = [];
  style_obj_rearrange_collection: any;
  bannerColor = '#f2eb0d';
  itemColor = '#db92dd';
  storeColor = '#7dd888';
  categoryColor = '#82c2f2';
  collectionColor = '#f97185'
  otherColor = '#e5d276'
  constructor(
    public modal: NgbActiveModal,
    public translate: TranslateService,
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    console.log(this.collectionList);
    
    $(
      "<style>.modal-dialog { max-width: 500px ;}</style>"
    ).appendTo("body");
    this.style_obj_rearrange_collection = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font,
      "--css_button_business_alternative": this.generalSetting.css_button_business_alternative
    }

    this.collectionList.forEach(item => {

      if (this.business_model == 3) {
        if (item.title == 'category' || item.title == 'popular_stores' || item.title == 'cuisines' || item.title == 'sponsored_stores' || item.title == 'nearby' || item.title == 'whole_seller_stores' || item.title == 'stores') {
          item.hide = true;
        }
      }
      if (this.generalSetting.offers_module == 0) {
        if (item.title == 'offers') {
          item.hide = true;
        }
      }
      if (this.generalSetting.allow_wholeseller == 0) {
        if (item.title == 'whole_seller_stores') {
          item.hide = true;
        }
      }
      if (this.generalSetting.eatery_module == 0) {
        if (item.title == 'cuisines') {
          item.hide = true;
        }
      }
      if (this.forAppPortal) {
        if (item.title == 'shop_categories_horizontal') {
          item.hide = true;
        }
      }
      var data = {
        'created_at': item.created_at,
        'custom_title_align': item.custom_title_align,
        'description': item.description,
        'environment_for': item.environment_for,
        'is_deleted': item.is_deleted,
        'item_collection_id': item.item_collection_id,
        'show_order': item.show_order,
        'title': item.title,
        'title_label': item.title_label,
        'updated_at': item.updated_at,
        'is_active': item.is_active == 1 ? true : false,
        'is_custom_title_apply': item.is_custom_title_apply == 1 ? true : false,
        'custom_title': item.custom_title,
        'content_limit': item.content_limit == 0 ? '' : item.content_limit,
        'hide': item.hide,
        'home_configuration_settings_id': item.home_configuration_settings_id,
        'type_id': item.type_id
      }
      this.arrangeCollectionList.push(data)
    });
  }

  editCategoryOrder() {
    this.passEntry.emit(this.arrangeCollectionList);
    this.modal.close();
  }

  drop(event: CdkDragDrop<string[]>) {
    if ((event.previousIndex == 0 || event.currentIndex == 0) && !this.forAppPortal) {
      return
    }
    moveItemInArray(this.arrangeCollectionList, event.previousIndex, event.currentIndex);
  }
}
