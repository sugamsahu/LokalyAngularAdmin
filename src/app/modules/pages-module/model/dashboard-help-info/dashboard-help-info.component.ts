import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ItemCollectionService } from "src/app/services/lookup/item-collection.service";

@Component({
  selector: "app-dashboard-help-info",
  templateUrl: "./dashboard-help-info.component.html",
  styleUrls: ["./dashboard-help-info.component.scss"],
})
export class DashboardHelpInfoComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  store_label = this.generalSetting.store_label;
  khata_label = this.generalSetting.khata_label;
  deliveryboy_label = this.generalSetting.deliveryboy_label;
  platform_name = this.generalSetting.platform_name;
  @Input() collection_info: any;
  collection_info_style: any;
  selected_store_type_list = [];

  constructor(
    public modal: NgbActiveModal,
    public translate: TranslateService,
    private itemCollectionService: ItemCollectionService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
    this.collection_info_style = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }

  ngOnInit(): void {
    this.storeTypeListRecord();
  }

  async storeTypeListRecord() {
    var data = {
      token_type: 1,
    };
    await this.itemCollectionService.getStoreTypeList(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          var selected: any = [];
          var comma_separated_store_type_value = this.collection_info.store_category_type_id.split(",");
          comma_separated_store_type_value.forEach((item) => {
            response.data.forEach((element, index) => {
              if (element.category_id == item) {
                selected.push(index != 0 ? ' ' + element.category_name : element.category_name);
              }
              this.selected_store_type_list = selected.toString();
            });
          });
        }
      },
      error: (error) => { },
      complete: () => { },
    });
  }
}
