import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { Subject, takeUntil } from "rxjs";
import { AppComponent } from "src/app/app.component";
import { UserRoles } from "src/app/enums/user-roles";
import { CommonService } from "src/app/services/common.service";
import { CryptoService } from "src/app/services/custom/crypto.service";
import { ItemService } from "src/app/services/item.service";
import { AddSelectItemComponent } from "../../model/add-select-item/add-select-item.component";
import { ToastrService } from "ngx-toastr";
import { cloneDeep } from "lodash";

@Component({
  selector: "app-item-grouping-add",
  templateUrl: "./item-grouping-add.component.html",
  styleUrls: ["./item-grouping-add.component.scss"],
})
export class ItemGroupingAddComponent implements OnInit, AfterViewInit {
  destroy$ = new Subject();
  item_group_id: any;
  main: any;
  formGroup: FormGroup;
  selecteditems: any = [];
  @ViewChild('cursor') cursor: ElementRef
  isStoreManager: boolean = false;
  AllowManageItem: boolean = false;
  UserRoleEnum = UserRoles
  customer_User_Id: any = 0;
  constructor(
    private router: Router,
    private itemService: ItemService,
    public translate: TranslateService,
    private toastr: ToastrService,
    private appComponent: AppComponent,
    private cryptoService: CryptoService,
    private formBuilder: FormBuilder,
    private el: ElementRef,
    private modalService: NgbModal,
    public commonService: CommonService
  ) {
    this.translate.addLangs(["it", "en", "de"]);
    this.translate.setDefaultLang(localStorage.getItem("select_lan") || 'en');
    this.main = this.appComponent.main;
    if (location.href.indexOf("/items/itemgroupedit") > -1) {
      this.item_group_id = this.cryptoService.decryptIdValue(
        "itemRecommandId" + this.main.LoggedUserInfo.role_id?.toString(),
        this.main.CryptoKey
      );
      if (this.item_group_id == undefined) {
        this.router.navigate(["/items/itemgroup"]);
      }
    }
  }

  ngOnInit(): void {
    this.main = this.appComponent.main;
    var superAdmin = this.main.LoggedUserInfo.role_id == 1 || this.main.LoggedUserInfo.role_id == 6 ? true : false
    if (superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadForm();
    if (this.item_group_id) {
      this.getGroupItemDataById();
    }
    if (this.main.LoggedUserStoreInfo.role_id == this.UserRoleEnum.StoreManager) {
      this.isStoreManager = true;
      this.getStoreManagerSettings();
    }
  }

  loadForm(group_name?: string, description?: string) {
    this.formGroup = this.formBuilder.group({
      group_name: [group_name ? group_name : "", Validators.required],
      description: [description ? description : ""],
    });
  }

  getGroupItemDataById() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id,
      item_recommend_id: this.item_group_id,
    };
    this.itemService.getRecommendedItems(data).subscribe({
      next: (response: any) => {
        if (response.status == 1) {
          this.loadForm(
            response.data[0].group_name,
            response.data[0].description
          );
          this.selecteditems = response.data[0].items;
          this.selecteditems.forEach(element => {
            element.quantity = 1;
          });
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => { },
    });
  }

  getStoreManagerSettings() {
    var data = {
      store_id: this.main.LoggedUserStoreInfo.store_id
    }

    this.commonService.getStoreSetting(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.data.manage_item == 1) {
          this.AllowManageItem = true;
        } else {
          this.AllowManageItem = false;
        }
      },
      error: (error) => {
        // handle error
      },
      complete: () => {
      },
    })
  }

  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  openSelectItem() {
    const modalRef = this.modalService.open(AddSelectItemComponent, {
      size: "w-1300",
    });
    modalRef.componentInstance.main = this.main;
    modalRef.componentInstance.foritemgrouping = true;
    modalRef.componentInstance.item_recommend_id = this.item_group_id;
    modalRef.componentInstance.initialSelectedItems = cloneDeep(this.selecteditems);
    modalRef.componentInstance.selectedPopupItems.subscribe((items) => {
      this.selecteditems = items;
    });
  }

  cancelClick() {
    history.back();
  }

  ngAfterViewInit(): void {
    this.cursor?.nativeElement?.focus();
  }

  
  onSubmit() {
    if (
      this.selecteditems == null ||
      this.selecteditems == undefined ||
      this.selecteditems == 0
    ) {
      this.toastr.error(
        this.translate.instant("PLEASE_SELECT_ATLEAST_ONE_ITEM")
      );
      return;
    }
    if (!this.formGroup.valid) {
      const controls = this.formGroup.controls;

      Object.keys(controls).forEach((controlName, i) => {
        if (i == 0) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + controlName + '"]'
          );
          invalidControl.focus();
        }
        controls[controlName].markAsTouched();
      });
    } else {
      var itemIdlist = "";
      if (this.selecteditems.length > 1) {
        this.selecteditems.forEach((value) => {
          itemIdlist += value["item_id"] + ",";
        });
      } else {
        itemIdlist = this.selecteditems[0]["item_id"];
      }

      if (this.selecteditems.length > 1) {
        itemIdlist = itemIdlist.substring(0, itemIdlist.length - 1);
      }
      var fd = new FormData();
      if (this.item_group_id != undefined) {
        fd.append("item_recommend_id", this.item_group_id);
      }
      fd.append("user_id", this.main.LoggedUserInfo.user_id);
      fd.append("store_id", this.main.LoggedUserStoreInfo.store_id);
      fd.append("group_name", this.formGroup.value.group_name);
      fd.append("description", this.formGroup.value.description);
      fd.append("item_ids", itemIdlist);
      this.itemService.addEditStoreItemGroup(fd).subscribe({
        next: (response: any) => {
          if (response.status == 1) {
            this.toastr.success(response.message);
            this.router.navigate(["/items/itemgroup"]);
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error) => {
          // handle error
        },
        complete: () => { },
      });
    }
  }
}
