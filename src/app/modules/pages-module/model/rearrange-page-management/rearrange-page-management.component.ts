import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";

import { PageManagementService } from "src/app/services/page-management.service";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-rearrange-page-management",
  templateUrl: "./rearrange-page-management.component.html",
  styleUrls: ["./rearrange-page-management.component.scss"],
})
export class RearrangePageManagementComponent implements OnInit {
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  pageManagementList: any;
  loginUserStore: any;
  style_obj_rearrange_page_management: any;
  constructor(
    public modal: NgbActiveModal,
    public translate: TranslateService,
    private toastr: ToastrService,
    private pageManagementService: PageManagementService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || "en");
  }

  ngOnInit() {
    this.style_obj_rearrange_page_management = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font,
      "--css_button_business_alternative": this.generalSetting.css_button_business_alternative
    }
    this.loginUserStore = JSON.parse(localStorage.getItem("LoginUserDetails"));
    this.GetPageManagementList();
  }

  GetPageManagementList(): void {
    var data = {
      sort_field: "sequence_no",
      sort_type: 1,
      is_active: "1",
      isSequence : 1
    };

    this.pageManagementService.get(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.pageManagementList = response.data;
        } else {
          this.toastr.error(response.message);
          this.pageManagementList = [];
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {},
    });
  }

  editPageManagementOrder() {
    var pages = new Array();

    for (let i = 0; i < this.pageManagementList.length; i++) {
      var dataaa = {
        page_id: this.pageManagementList[i]["page_id"],
        sequence_no: i + 1,
      };
      pages.push(dataaa);
    }

    var data = {
      user_id: this.loginUserStore.user_id,
      pages: JSON.stringify(pages),
    };

    this.pageManagementService.reorderPages(data).subscribe({
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
      complete: () => {},
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.pageManagementList,
      event.previousIndex,
      event.currentIndex
    );
  }
}
