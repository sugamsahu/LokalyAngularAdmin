import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ItemService } from 'src/app/services/item.service';

@Component({
  selector: 'app-export-item-dl',
  templateUrl: './export-item-dl.component.html',
  styleUrls: ['./export-item-dl.component.scss']
})
export class ExportItemDlModelComponent implements OnInit {
  @Input() data: any;
  @Input() main: any;
  generalSetting = JSON.parse(localStorage.getItem("LoggedUserSettings"));
  style_obj_export_item_dl:any;

  constructor(
    public modal: NgbActiveModal,
    public translate: TranslateService,
    private itemService: ItemService,
    private toastr: ToastrService

  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
  }

  ngOnInit(): void {
    this.style_obj_export_item_dl = {
      "--css_button_business_default": this.generalSetting.css_button_business_default,
      "--css_button_business_font": this.generalSetting.css_button_business_font
    }
  }
  
  downLoadItemList() {
    this.itemService.itemExport(this.data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.toastr.success(this.translate.instant(response.message));
        } else {
          this.toastr.error(this.translate.instant(response.message));
        }
      },
      error: (error) => {
      },
      complete: () => { },
    });

  }

  downLoadItemImages() {
    var imgStoreId = {
      store_id: this.data.store_id,
      user_id: this.main.LoggedUserInfo.user_id,
    }
    this.itemService.downloadExportItemImage(imgStoreId).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
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
