import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { UserRoles } from "src/app/enums/user-roles";

import { ItemService } from "src/app/services/item.service";

@Component({
  selector: "app-rearrange-items",
  templateUrl: "./rearrange-items.component.html",
  styleUrls: ["./rearrange-items.component.scss"],
})
export class RearrangeItemsComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  LoginUserDetails = JSON.parse(localStorage.getItem("LoginUserDetails"));

  loginUserStore: any;
  @Input() categoryList: any;
  @Input() storeId: any;
  style_obj_rearrange_items: any;
  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    public translate: TranslateService,
    private itemService: ItemService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_rearrange_items = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font,
      "--css_button_business_alternative": this.generalSetting.css_button_business_alternative
    }
    if (this.LoginUserDetails.role_id == 6 || this.LoginUserDetails.role_id == UserRoles.Admin) {
      this.loginUserStore = JSON.parse(localStorage.getItem("LoginUserDetails"));
    }
    else {
      this.loginUserStore = JSON.parse(localStorage.getItem("loginUserStore"));
    }
  }

  editCategoryOrder() {
    var categories = new Array();

    for (let i = 0; i < this.categoryList.length; i++) {
      var dataaa = {
        category_id: this.categoryList[i]["category_id"],
        display_id: i + 1,
      };
      categories.push(dataaa);
    }

    if (this.LoginUserDetails.role_id == 6) {
      var data = {
        store_id: this.storeId.store_id,
        user_id: this.loginUserStore.user_id,
        categories: JSON.stringify(categories),
      };
    } else {
      var data = {
        store_id: this.storeId?.store_id == undefined ? this.loginUserStore.store_id : this.storeId?.store_id,
        user_id: this.loginUserStore.user_id,
        categories: JSON.stringify(categories),
      };
    }
    this.itemService.categoryRearrange(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
          this.modal.close();
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {

      },
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.categoryList, event.previousIndex, event.currentIndex);
  }
}
